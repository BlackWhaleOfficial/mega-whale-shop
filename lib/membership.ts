import { prisma } from './prisma';

export const MEMBERSHIP_DISCOUNTS: Record<string, { codeName: string, percent: number, count: number }[]> = {
    'Gói Cá Tôm': [],
    'Gói Cá Con': [
        { codeName: 'TGG 1% (Gói Cá Con)', percent: 1, count: 10 }
    ],
    'Gói Cá Mập': [
        { codeName: 'TGG 1% (Gói Cá Mập)', percent: 1, count: 2 }
    ],
    'Gói Cá Mập Megalodon': [
        { codeName: 'TGG 5% (Gói Cá Mập Megalodon)', percent: 5, count: 2 },
        { codeName: 'TGG 1% (Gói Cá Mập Megalodon)', percent: 1, count: 3 }
    ],
    'Gói Cá Voi': [
        { codeName: 'TGG 10% (Gói Cá Voi)', percent: 10, count: 2 },
        { codeName: 'TGG 5% (Gói Cá Voi)', percent: 5, count: 5 },
        { codeName: 'TGG 1% (Gói Cá Voi)', percent: 1, count: 10 }
    ]
};

export async function grantMembershipPerks(userId: string, productName: string, quantity: number = 1) {
    const perks = MEMBERSHIP_DISCOUNTS[productName];
    if (!perks) return;

    const discountsToCreate: any[] = [];
    for (let i = 0; i < quantity; i++) {
        for (const perk of perks) {
            for (let c = 0; c < perk.count; c++) {
                discountsToCreate.push({
                    userId,
                    codeName: perk.codeName,
                    discountPercent: perk.percent,
                    isUsed: false
                });
            }
        }
    }

    if (discountsToCreate.length > 0) {
        await prisma.userDiscount.createMany({
            data: discountsToCreate
        });
    }
}
