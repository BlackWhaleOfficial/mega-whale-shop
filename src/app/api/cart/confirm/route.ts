import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { itemName, total, qty, discountId, items } = body;

        const membershipNames = [
            'Gói Cá Voi', 'Gói Cá Mập Megalodon', 'Gói Cá Mập', 'Gói Cá Con',
            'Membership 888k', 'Membership 588k', 'Membership 100k', 'Membership 25k',
            'Gói 888k', 'Gói 588k', 'Gói 100k', 'Gói 25k'
        ];

        let allAssignedItems: any[] = [];
        const cartItems = items || [{ name: itemName, qty: parseInt(qty) || 1 }];

        for (const item of cartItems) {
            if (membershipNames.includes(item.name)) {
                const latestMembershipOrder = await prisma.order.findFirst({
                    where: {
                        userId: session.id,
                        status: 'DONE',
                        productName: { contains: item.name } // simple check since we concatenated
                    },
                    orderBy: { createdAt: 'desc' }
                });

                if (latestMembershipOrder) {
                    let memberName = latestMembershipOrder.productName;
                    const durationDays = memberName.includes('Cá Voi') || memberName.includes('Megalodon') || memberName.includes('888k') || memberName.includes('588k') ? 45 : 30;
                    const expiryDate = new Date(latestMembershipOrder.createdAt);
                    expiryDate.setDate(expiryDate.getDate() + durationDays);
                    if (expiryDate > new Date()) {
                        return NextResponse.json({ error: `Bạn đang có ${item.name} chưa hết hạn. Vui lòng hủy gói cũ hoặc chờ hết hạn để mua mới.` }, { status: 400 });
                    }
                }
            }

            // Determine if it's a card OR a membership containing a card
            let cardValue = null;

            if (item.name.startsWith('Garena Card ')) {
                const valStr = item.name.replace('Garena Card ', '').replace(' VNĐ', '');
                cardValue = parseInt(valStr) / 1000;
            } else if (['Gói Cá Mập', 'Gói Cá Mập Megalodon', 'Gói 100k', 'Membership 100k', 'Gói 588k', 'Membership 588k'].includes(item.name)) {
                cardValue = 100;
            } else if (['Gói Cá Voi', 'Gói 888k', 'Membership 888k'].includes(item.name)) {
                cardValue = 200;
            }

            if (cardValue) {
                // Find available inventory
                const availableCards = await prisma.inventory.findMany({
                    where: {
                        status: 'NEW',
                        cardValue: cardValue,
                        id: { notIn: allAssignedItems.map(i => i.id) }
                    },
                    take: parseInt(item.qty) || 1
                });

                if (availableCards.length < (parseInt(item.qty) || 1)) {
                    return NextResponse.json({ error: `Hết thẻ mệnh giá để xuất cho ${item.name}!` }, { status: 400 });
                }
                allAssignedItems.push(...availableCards);
            }
        }

        // Apply discount if any
        if (discountId) {
            await prisma.userDiscount.update({
                where: { id: discountId },
                data: { isUsed: true }
            });
        }

        // Create Order
        const order = await prisma.order.create({
            data: {
                userId: session.id,
                productName: itemName,
                quantity: parseInt(qty) || 1,
                totalAmount: total,
                status: 'PENDING',
                items: {
                    connect: allAssignedItems.map((item: any) => ({ id: item.id }))
                }
            }
        });

        // Update Inventory to PENDING
        if (allAssignedItems.length > 0) {
            await prisma.inventory.updateMany({
                where: {
                    id: { in: allAssignedItems.map((item: any) => item.id) }
                },
                data: {
                    status: 'PENDING',
                    orderId: order.id
                }
            });
        }

        return NextResponse.json({ orderId: order.id, status: 'PENDING' });

    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
