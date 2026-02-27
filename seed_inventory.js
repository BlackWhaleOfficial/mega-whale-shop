const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const data = [
        {
            id: "1500",
            game: "Liên Quân",
            serial: "795317382",
            pin: "8380900809093927",
            inTime: new Date("2026-01-01T19:39:39"),
            outTime: new Date("2026-02-17T16:35:39"),
            cardValue: 500,
            qh: 1020,
            cost: 480000,
            price: 485000,
            status: "DONE"
        },
        {
            id: "2500",
            game: "Liên Quân",
            serial: "795317383",
            pin: "8843010218888424",
            inTime: new Date("2026-01-01T19:39:39"),
            cardValue: 500,
            qh: 1020,
            cost: 480000,
            price: 485000,
            status: "NEW"
        },
        {
            id: "3500",
            game: "Liên Quân",
            serial: "795317385",
            pin: "7137130441302311",
            inTime: new Date("2026-01-01T19:39:39"),
            cardValue: 500,
            qh: 1020,
            cost: 480000,
            price: 485000,
            status: "NEW"
        },
        {
            id: "1100",
            game: "Liên Quân",
            serial: "794635737",
            pin: "2766087073062871",
            inTime: new Date("2026-01-01T19:39:39"),
            cardValue: 100,
            qh: 204,
            cost: 96000,
            price: 97000,
            status: "NEW"
        }
    ];

    for (const item of data) {
        await prisma.inventory.upsert({
            where: { id: item.id },
            update: {},
            create: item
        });
    }

    console.log('Seeded inventory');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
