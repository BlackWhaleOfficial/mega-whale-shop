import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { getSession } from '../../../../../../../lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: { items: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update Order to CANCELLED instead of REJECTED since schema.prisma comments use CANCELLED
        await prisma.order.update({
            where: { id: params.id },
            data: { status: 'CANCELLED' }
        });

        // Release Inventory items back to NEW
        if (order.items.length > 0) {
            await prisma.inventory.updateMany({
                where: { orderId: params.id },
                data: {
                    status: 'NEW',
                    orderId: null // remove association
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reject order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
