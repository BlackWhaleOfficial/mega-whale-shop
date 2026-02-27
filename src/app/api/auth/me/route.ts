import { NextResponse } from 'next/server';
import { getSession } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const session = getSession();
        if (!session) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const maxAgeOrSomething = await prisma.user.findUnique({
            where: { id: session.id },
            include: {
                discounts: {
                    where: { isUsed: false }
                }
            }
        });

        if (!maxAgeOrSomething) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const latestMembershipOrder = await prisma.order.findFirst({
            where: {
                userId: session.id,
                status: 'DONE',
                productName: {
                    in: [
                        'Gói Cá Voi', 'Gói Cá Mập Megalodon', 'Gói Cá Mập', 'Gói Cá Con',
                        'Membership 888k', 'Membership 588k', 'Membership 100k', 'Membership 25k',
                        'Gói 888k', 'Gói 588k', 'Gói 100k', 'Gói 25k'
                    ]
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        let activeMembership = null;
        if (latestMembershipOrder) {
            let memberName = latestMembershipOrder.productName;
            if (memberName.includes('888k')) memberName = 'Gói Cá Voi';
            else if (memberName.includes('588k')) memberName = 'Gói Cá Mập Megalodon';
            else if (memberName.includes('100k')) memberName = 'Gói Cá Mập';
            else if (memberName.includes('25k')) memberName = 'Gói Cá Con';

            const durationDays = memberName.includes('Cá Voi') || memberName.includes('Megalodon') ? 45 : 30;
            const expiryDate = new Date(latestMembershipOrder.createdAt);
            expiryDate.setDate(expiryDate.getDate() + durationDays);
            const now = new Date();
            if (expiryDate > now) {
                const remainingDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                activeMembership = {
                    name: memberName,
                    remainingDays,
                    expiryDate
                };
            }
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: maxAgeOrSomething.id,
                username: maxAgeOrSomething.username,
                email: maxAgeOrSomething.email,
                openid: maxAgeOrSomething.openid,
                uid: maxAgeOrSomething.isAdmin ? maxAgeOrSomething.uid : undefined,
                isAdmin: maxAgeOrSomething.isAdmin,
                whaleCash: maxAgeOrSomething.whaleCash,
                discountsCount: maxAgeOrSomething.discounts.length,
                activeMembership: activeMembership,
            }
        });
    } catch (err) {
        console.error("ME ERROR", err);
        return NextResponse.json({ authenticated: false, error: 'Lỗi máy chủ' }, { status: 500 });
    }
}
