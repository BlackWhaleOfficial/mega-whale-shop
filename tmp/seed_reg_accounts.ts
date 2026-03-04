import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const accounts = [];
    const imageUrl = "https://cdn3.upanh.info/upload/server-sw3/product-acc/1669863/680d01b47809e.webp";

    for (let i = 0; i < 20; i++) {
        // Generate random 6-digit ID
        const randomId = Math.floor(100000 + Math.random() * 900000).toString();

        accounts.push({
            gameId: randomId,
            email: "reg@mail.com",
            password: "reg2026",
            rank: "Đồng",
            heroesCount: 12,
            skinsCount: 6,
            loginType: "Garena",
            notes: "REG ngẫu nhiên",
            price: 25000,
            originalPrice: 50000,
            image: imageUrl,
            bannerTag: "REG",
            status: "AVAILABLE"
        });
    }

    console.log(`Đang thêm ${accounts.length} tài khoản REG...`);

    for (const acc of accounts) {
        await prisma.gameAccount.create({
            data: acc
        });
    }

    console.log("Đã thêm thành công 20 tài khoản REG!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
