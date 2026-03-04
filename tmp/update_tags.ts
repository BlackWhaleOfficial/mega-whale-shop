import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const accounts = await prisma.gameAccount.findMany();

    console.log(`Đang cập nhật tag cho ${accounts.length} tài khoản...`);

    for (const acc of accounts) {
        let tag = acc.bannerTag;

        // Auto-tagging based on price if tag is not explicitly set or is default
        if (!tag || tag === 'VIP' || tag === 'Nor' || tag === 'REG') {
            if (acc.price > 10000000) tag = 'VIP';
            else if (acc.price >= 26000) tag = 'Nor';
            else tag = 'REG';
        }

        await prisma.gameAccount.update({
            where: { id: acc.id },
            data: { bannerTag: tag }
        });
    }

    // Add some SSS accounts for pity
    console.log("Thêm 5 acc 'REG có sẵn skin SSS' cho tính năng Pity...");
    const imageUrl = "https://cdn3.upanh.info/upload/server-sw3/product-acc/1669863/680d01b47809e.webp";
    for (let i = 0; i < 5; i++) {
        await prisma.gameAccount.create({
            data: {
                gameId: Math.floor(100000 + Math.random() * 900000).toString(),
                email: "sss@mail.com",
                password: "pity2026",
                rank: "Cao Thủ",
                heroesCount: 100,
                skinsCount: 150,
                loginType: "Garena",
                notes: "REG có sẵn skin SSS - Hàng Pity",
                price: 25000,
                image: imageUrl,
                bannerTag: "REG có sẵn skin SSS",
                status: "AVAILABLE"
            }
        });
    }

    console.log("Hoàn tất cập nhật!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
