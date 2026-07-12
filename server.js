const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Global variable to hold system user ID for logging
let systemUserId = null;

// Initialize System User + Departments
async function initSystemUser() {
  let user = await prisma.user.findFirst({ where: { email: 'system@assetflow.com' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'system@assetflow.com',
        name: 'System Admin',
        password: 'dummy',
        role: 'Admin'
      }
    });
  }
  systemUserId = user.id;

  // Seed departments if none exist
  const deptCount = await prisma.department.count();
  if (deptCount === 0) {
    await prisma.department.createMany({
      data: [
        { name: 'Engineering' },
        { name: 'Marketing' },
        { name: 'Human Resources' },
        { name: 'Finance' },
        { name: 'Operations' },
      ]
    });
  }
}

// Helper function to log activity
async function logActivity(action, entityId, details) {
  if (!systemUserId) return;
  await prisma.activityLog.create({
    data: {
      action,
      entityType: 'Asset',
      entityId,
      details,
      actorId: systemUserId
    }
  });
}

// --- API ROUTES ---

// Get ALL global activities (for notifications feed)
app.get('/api/activities', async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get all assets (include department)
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { category: true, allocatedToDept: true }
    });
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get asset activities (Timeline)
app.get('/api/assets/:id/activities', async (req, res) => {
  try {
    const activities = await prisma.activityLog.findMany({
      where: { entityId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.assetCategory.findMany();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Create new asset (with optional cost + acquisition date for depreciation)
app.post('/api/assets', async (req, res) => {
  try {
    const { name, categoryId, acquisitionCost, usefulLifeYears, departmentId } = req.body;
    
    const count = await prisma.asset.count();
    const tag = `AF-${String(count + 1).padStart(4, '0')}`;

    const data = {
      tag,
      name,
      categoryId,
      status: 'Available',
      acquisitionDate: new Date(),
    };
    if (acquisitionCost) data.acquisitionCost = parseFloat(acquisitionCost);
    // Store useful life in the 'location' field (reusing existing schema field)
    if (usefulLifeYears) data.location = `life:${usefulLifeYears}`;
    if (departmentId) data.allocatedToDeptId = departmentId;

    const newAsset = await prisma.asset.create({
      data,
      include: { category: true, allocatedToDept: true }
    });

    await logActivity('REGISTERED', newAsset.id, `Asset "${name}" registered as ${tag}${acquisitionCost ? ` | Cost: ₹${acquisitionCost}` : ''}`);
    res.status(201).json(newAsset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update asset status
app.patch('/api/assets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { status },
      include: { category: true, allocatedToDept: true }
    });

    await logActivity('STATUS_CHANGED', id, `Status updated to ${status}`);
    res.json(updatedAsset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update asset status' });
  }
});

// Transfer asset to a different department
app.patch('/api/assets/:id/transfer', async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId } = req.body;

    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { allocatedToDeptId: departmentId },
      include: { category: true, allocatedToDept: true }
    });

    await logActivity('TRANSFERRED', id, `Transferred to ${dept?.name || 'Unknown'} department`);
    res.json(updatedAsset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to transfer asset' });
  }
});

// Submit maintenance request
app.post('/api/assets/:id/maintenance', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, priority } = req.body;

    await prisma.maintenanceRequest.create({
      data: {
        assetId: id,
        reporterId: systemUserId,
        description: description || 'General maintenance',
        priority: priority || 'Low',
        status: 'Pending'
      }
    });

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { status: 'Under Maintenance' },
      include: { category: true, allocatedToDept: true }
    });

    await logActivity('MAINTENANCE', id, `Maintenance request (${priority || 'Low'} priority): ${description || 'General maintenance'}`);
    res.json(updatedAsset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit maintenance request' });
  }
});

// Get maintenance requests for an asset
app.get('/api/assets/:id/maintenance', async (req, res) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      where: { assetId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

// Start server
app.listen(PORT, async () => {
  await initSystemUser();
  console.log(`AssetFlow Server running on http://localhost:${PORT}`);
});
