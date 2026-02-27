import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getSession } from '../../../../../../lib/auth';

export const dynamic = 'force-dynamic';
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const totalSpent = user.orders
            .filter(o => o.status === 'DONE')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        return NextResponse.json({
            id: user.id,
            username: user.username,
            email: user.email,
            uid: user.uid,
            openid: user.openid,
            whaleCash: user.whaleCash,
            totalSpent: totalSpent,
            orders: user.orders
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { whaleCashDelta } = body; // the amount to add/subtract

        if (typeof whaleCashDelta !== 'number') {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: {
                whaleCash: {
                    increment: whaleCashDelta
                }
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
