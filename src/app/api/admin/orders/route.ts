import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                user: true,
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Admin get orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
