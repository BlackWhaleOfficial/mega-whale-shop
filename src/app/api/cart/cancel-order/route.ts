import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { itemName, total, qty } = body;

        // Create Order
        const order = await prisma.order.create({
            data: {
                userId: session.id,
                productName: itemName,
                quantity: parseInt(qty) || 1,
                totalAmount: total,
                status: 'CANCELLED'
            }
        });

        return NextResponse.json({ success: true, orderId: order.id });
    } catch (error) {
        console.error('Cancel order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
