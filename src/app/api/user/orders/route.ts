import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orders = await prisma.order.findMany({
            where: { userId: session.id },
            include: {
                items: true // This gets the Inventory items linked to the order
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
