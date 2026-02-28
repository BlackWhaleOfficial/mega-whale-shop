import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';
import { grantMembershipPerks } from '../../../../../lib/membership';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { itemName, total, qty, discountId, items } = body;

        const wcashCost = total / 1000;

        // Verify user has enough WCash
        const user = await prisma.user.findUnique({
            where: { id: session.id }
        });

        if (!user || user.whaleCash < wcashCost) {
            return NextResponse.json({ error: 'Không đủ số dư WCash' }, { status: 400 });
        }

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
                        productName: { contains: item.name }
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

            // Determine if it's a card
            let cardValue: number | null = null;
            if (item.name.startsWith('Garena Card ')) {
                const valStr = item.name.replace('Garena Card ', '').replace(/\s*VN[ĐD]$/i, '').trim();
                cardValue = parseInt(valStr); // DB lưu 100000, 200000, 500000
            } else if (['Gói Cá Mập', 'Gói Cá Mập Megalodon', 'Gói 100k', 'Membership 100k', 'Gói 588k', 'Membership 588k'].includes(item.name)) {
                cardValue = 100000;
            } else if (['Gói Cá Voi', 'Gói 888k', 'Membership 888k'].includes(item.name)) {
                cardValue = 200000;
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

        // Make transaction
        await prisma.$transaction([
            // Deduct WCash
            prisma.user.update({
                where: { id: session.id },
                data: { whaleCash: { decrement: wcashCost } }
            }),
            // Create Order
            prisma.order.create({
                data: {
                    userId: session.id,
                    productName: itemName,
                    quantity: parseInt(qty) || 1,
                    totalAmount: total,
                    status: 'DONE',
                    items: {
                        connect: allAssignedItems.map((item: any) => ({ id: item.id }))
                    }
                }
            }),
            // Update Inventory status
            ...(allAssignedItems.length > 0 ? [
                prisma.inventory.updateMany({
                    where: { id: { in: allAssignedItems.map((item: any) => item.id) } },
                    data: { status: 'DONE', outTime: new Date() }
                })
            ] : [])
        ]);

        const order = await prisma.order.findFirst({
            where: { userId: session.id, productName: itemName },
            orderBy: { createdAt: 'desc' }
        });

        for (const item of cartItems) {
            if (membershipNames.includes(item.name)) {
                await grantMembershipPerks(session.id, item.name, parseInt(item.qty) || 1);
            }
        }

        return NextResponse.json({ orderId: order?.id, status: 'DONE' });

    } catch (error) {
        console.error('WCash Checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
