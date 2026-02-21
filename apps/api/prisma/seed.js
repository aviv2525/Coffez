"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const prisma = new client_1.PrismaClient();
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
            displayName: "Alice's Kitchen",
            bio: 'Homemade meals and pastries.',
            categories: ['Food', 'Pastries'],
            locationText: 'Tel Aviv',
            avatarUrl: null,
        },
        update: {},
    });
    await prisma.sellerProfile.upsert({
        where: { userId: seller2.id },
        create: {
            userId: seller2.id,
            displayName: "Bob's Crafts",
            bio: 'Handmade crafts and art.',
            categories: ['Crafts', 'Art'],
            locationText: 'Jerusalem',
            avatarUrl: null,
        },
        update: {},
    });
    const menu1 = await prisma.menuItem.findFirst({ where: { sellerId: seller1.id } });
    if (!menu1) {
        await prisma.menuItem.createMany({
            data: [
                { sellerId: seller1.id, title: 'Croissant', description: 'Fresh butter croissant', price: 12.5, isAvailable: true },
                { sellerId: seller1.id, title: 'Salad Bowl', description: 'Seasonal salad', price: 28, isAvailable: true },
            ],
        });
    }
    const menu2 = await prisma.menuItem.findFirst({ where: { sellerId: seller2.id } });
    if (!menu2) {
        await prisma.menuItem.createMany({
            data: [
                { sellerId: seller2.id, title: 'Handmade Vase', description: 'Ceramic vase', price: 85, isAvailable: true },
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
//# sourceMappingURL=seed.js.map