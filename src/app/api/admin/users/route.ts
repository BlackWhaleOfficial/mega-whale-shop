import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const users = await prisma.user.findMany({
            include: {
                orders: {
                    where: { status: 'DONE' },
                    select: { totalAmount: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const usersWithTotal = users.map(user => {
            const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                uid: user.uid,
                openid: user.openid,
                whaleCash: user.whaleCash,
                totalSpent: totalSpent
            };
        });

        return NextResponse.json(usersWithTotal);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
