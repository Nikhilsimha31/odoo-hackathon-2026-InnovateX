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

// --- API ROUTES ---

// Get all assets
app.get('/api/assets', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
      }
    });
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch assets' });
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

// Create new asset
app.post('/api/assets', async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    
    // Generate a simple tag (e.g., AF-XXXX)
    const count = await prisma.asset.count();
    const tag = `AF-${String(count + 1).padStart(4, '0')}`;

    const newAsset = await prisma.asset.create({
      data: {
        tag,
        name,
        categoryId,
        status: 'Available'
      },
      include: {
        category: true
      }
    });
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
    const { status } = req.body; // 'Available', 'Allocated', 'Under Maintenance'

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { status },
      include: { category: true }
    });
    res.json(updatedAsset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update asset status' });
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`AssetFlow Server running on http://localhost:${PORT}`);
});
