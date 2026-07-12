// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const assetContainer = document.getElementById('asset-container');
const kpiContainer = document.getElementById('kpi-container');

// Navigation
navItems.forEach(item => {
  item.addEventListener('click', () => {
    // Update active nav
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    // Update active view
    const targetView = item.getAttribute('data-view');
    views.forEach(v => {
      v.classList.remove('active');
      if (v.id === `view-${targetView}`) {
        v.classList.add('active');
      }
    });
  });
});

// Render logic
function createTagCard(contentHTML) {
  const card = document.createElement('div');
  card.className = 'tag-card';
  card.innerHTML = contentHTML;
  return card;
}

function createStamp(state, label) {
  return `<div class="stamp-badge stamp-${state}">${label}</div>`;
}

// Fetch and display data
async function loadDashboard() {
  // Mock KPIs for now
  const kpis = [
    { state: 'available', label: 'Available', count: 42 },
    { state: 'allocated', label: 'Allocated', count: 18 },
    { state: 'pending', label: 'Maintenance', count: 3 }
  ];

  kpiContainer.innerHTML = '';
  kpis.forEach(kpi => {
    const card = createTagCard(`
      ${createStamp(kpi.state, kpi.label)}
      <div class="number">${kpi.count}</div>
    `);
    card.classList.add('kpi-card');
    kpiContainer.appendChild(card);
  });
}

async function loadAssets() {
  try {
    const response = await fetch('/api/assets');
    const assets = await response.json();
    
    assetContainer.innerHTML = '';
    
    if (assets.length === 0) {
      assetContainer.innerHTML = '<p>No assets found.</p>';
      return;
    }

    assets.forEach(asset => {
      const stateMap = {
        'Available': 'available',
        'Allocated': 'allocated',
        'Reserved': 'reserved',
        'Under Maintenance': 'pending',
        'Lost': 'rejected',
        'Retired': 'retired'
      };
      
      const stampState = stateMap[asset.status] || 'available';

      const card = createTagCard(`
        <div class="asset-tag">
          <span>${asset.tag}</span>
        </div>
        <div class="asset-name">${asset.name}</div>
        ${createStamp(stampState, asset.status)}
      `);
      assetContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    assetContainer.innerHTML = '<p>Error loading assets. Ensure backend is running.</p>';
  }
}

// Initialize
loadDashboard();
loadAssets();
