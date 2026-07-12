const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Categories
  const catElectronics = await prisma.assetCategory.create({
    data: { name: 'Electronics' }
  });
  const catFurniture = await prisma.assetCategory.create({
    data: { name: 'Furniture' }
  });

  // Assets
  await prisma.asset.createMany({
    data: [
      {
        tag: 'AF-0001',
        name: 'MacBook Pro 16"',
        categoryId: catElectronics.id,
        status: 'Allocated'
      },
      {
        tag: 'AF-0002',
        name: 'Dell XPS 15',
        categoryId: catElectronics.id,
        status: 'Available'
      },
      {
        tag: 'AF-0003',
        name: 'Ergonomic Office Chair',
        categoryId: catFurniture.id,
        status: 'Available'
      },
      {
        tag: 'AF-0004',
        name: 'Projector',
        categoryId: catElectronics.id,
        status: 'Reserved'
      },
      {
        tag: 'AF-0005',
        name: 'Sony A7III Camera',
        categoryId: catElectronics.id,
        status: 'Under Maintenance'
      }
    ]
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
