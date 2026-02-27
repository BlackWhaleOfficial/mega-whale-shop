import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { getSession } from '../../../../../../../lib/auth';
import { grantMembershipPerks } from '../../../../../../../lib/membership';

export const dynamic = 'force-dynamic';
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

        // Update Order to DONE
        await prisma.order.update({
            where: { id: params.id },
            data: { status: 'DONE' }
        });

        // Grant membership perks
        await grantMembershipPerks(order.userId, order.productName, order.quantity);

        // Update Inventory items to DONE and set sold time
        if (order.items.length > 0) {
            await prisma.inventory.updateMany({
                where: { orderId: params.id },
                data: {
                    status: 'DONE',
                    outTime: new Date()
                }
            });
        }

        // Check if this was a Whale Cash topup
        if (order.productName.includes('Whale Cash')) {
            const amountStr = order.productName.split(' ')[0];
            const amount = parseInt(amountStr);
            if (!isNaN(amount) && order.userId) {
                await prisma.user.update({
                    where: { id: order.userId },
                    data: {
                        whaleCash: { increment: amount }
                    }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Approve order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
