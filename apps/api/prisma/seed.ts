import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const seller1Hash = await argon2.hash('password123');
  const seller2Hash = await argon2.hash('password123');
  const userHash = await argon2.hash('password123');

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@example.com' },
    create: {
      email: 'seller1@example.com',
      passwordHash: seller1Hash,
      fullName: 'Alice Seller',
      role: 'USER',
      emailVerifiedAt: new Date(),
    },
    update: {},
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@example.com' },
    create: {
      email: 'seller2@example.com',
      passwordHash: seller2Hash,
      fullName: 'Bob Vendor',
      role: 'USER',
      emailVerifiedAt: new Date(),
    },
    update: {},
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    create: {
      email: 'buyer@example.com',
      passwordHash: userHash,
      fullName: 'Charlie Buyer',
      role: 'USER',
      emailVerifiedAt: new Date(),
    },
    update: {},
  });

  await prisma.sellerProfile.upsert({
    where: { userId: seller1.id },
    create: {
      userId: seller1.id,
      displayName: "Alice's Coffee Corner",
      bio: 'Specialty coffee from my home setup. Single-origin beans, espresso and pour-over. Tel Aviv area.',
      categories: ['Specialty', 'Espresso'],
      locationText: 'Tel Aviv',
      avatarUrl: null,
      beans: ['Ethiopia Yirgacheffe', 'Colombia', 'Brazil Santos'],
      drinkTypes: ['Espresso', 'Cappuccino', 'Flat White', 'Pour Over', 'Iced Latte'],
      machineType: 'Lelit Bianca / Comandante',
      openingHours: 'Sun–Thu 08:00–14:00',
    },
    update: {
      displayName: "Alice's Coffee Corner",
      bio: 'Specialty coffee from my home setup. Single-origin beans, espresso and pour-over. Tel Aviv area.',
      categories: ['Specialty', 'Espresso'],
      beans: ['Ethiopia Yirgacheffe', 'Colombia', 'Brazil Santos'],
      drinkTypes: ['Espresso', 'Cappuccino', 'Flat White', 'Pour Over', 'Iced Latte'],
      machineType: 'Lelit Bianca / Comandante',
      openingHours: 'Sun–Thu 08:00–14:00',
    },
  });

  await prisma.sellerProfile.upsert({
    where: { userId: seller2.id },
    create: {
      userId: seller2.id,
      displayName: "Bob's Home Roast",
      bio: 'Small-batch home roasting. Espresso and filter. Jerusalem.',
      categories: ['Roaster', 'Filter'],
      locationText: 'Jerusalem',
      avatarUrl: null,
      beans: ['Guatemala', 'Kenya', 'Brazil'],
      drinkTypes: ['Espresso', 'Americano', 'Cortado', 'V60', 'AeroPress'],
      machineType: 'Profitec GO / Gaggia Classic',
      openingHours: 'Mon–Fri 07:30–12:00, 16:00–19:00',
    },
    update: {
      displayName: "Bob's Home Roast",
      bio: 'Small-batch home roasting. Espresso and filter. Jerusalem.',
      categories: ['Roaster', 'Filter'],
      beans: ['Guatemala', 'Kenya', 'Brazil'],
      drinkTypes: ['Espresso', 'Americano', 'Cortado', 'V60', 'AeroPress'],
      machineType: 'Profitec GO / Gaggia Classic',
      openingHours: 'Mon–Fri 07:30–12:00, 16:00–19:00',
    },
  });

  const menu1 = await prisma.menuItem.findFirst({ where: { sellerId: seller1.id } });
  if (!menu1) {
    await prisma.menuItem.createMany({
      data: [
        { sellerId: seller1.id, title: 'Double Espresso', description: 'Single-origin Ethiopia, 18g in, 36g out', price: 14, isAvailable: true },
        { sellerId: seller1.id, title: 'Cappuccino', description: 'House blend, oat or cow milk', price: 18, isAvailable: true },
        { sellerId: seller1.id, title: 'V60 Pour Over', description: 'Colombia or Brazil, 250ml', price: 22, isAvailable: true },
      ],
    });
  }

  const menu2 = await prisma.menuItem.findFirst({ where: { sellerId: seller2.id } });
  if (!menu2) {
    await prisma.menuItem.createMany({
      data: [
        { sellerId: seller2.id, title: 'Espresso', description: 'Home-roasted blend', price: 12, isAvailable: true },
        { sellerId: seller2.id, title: 'Cortado', description: 'Double shot, 120ml milk', price: 16, isAvailable: true },
      ],
    });
  }

  const item1 = await prisma.menuItem.findFirst({ where: { sellerId: seller1.id } });
  if (item1 && buyer) {
    const existing = await prisma.order.findFirst({
      where: { buyerId: buyer.id, menuItemId: item1.id },
    });
    if (!existing) {
      await prisma.order.create({
        data: {
          buyerId: buyer.id,
          sellerId: seller1.id,
          menuItemId: item1.id,
          status: 'PENDING',
          note: 'Please add extra napkins',
        },
      });
    }
  }

  console.log('Seed completed: 2 sellers, 1 buyer, menu items, 1 sample order.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
