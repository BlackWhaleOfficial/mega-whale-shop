import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getSession } from '../../../../../../lib/auth';

export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find the active membership order
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

        if (!latestMembershipOrder) {
            return NextResponse.json({ error: 'Không tìm thấy gói hội viên đang hoạt động' }, { status: 400 });
        }

        // Check if it's truly active based on date
        let memberName = latestMembershipOrder.productName;
        const durationDays = memberName.includes('Cá Voi') || memberName.includes('Megalodon') || memberName.includes('888k') || memberName.includes('588k') ? 45 : 30;
        const expiryDate = new Date(latestMembershipOrder.createdAt);
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        const now = new Date();

        if (expiryDate <= now) {
            return NextResponse.json({ error: 'Gói hội viên của bạn đã hết hạn' }, { status: 400 });
        }

        // To "cancel" it without breaking order history/revenue, we append (Đã Hủy) to the product name
        // so `auth/me` won't pick it up as an active membership anymore, but it stays as a DONE order.
        await prisma.order.update({
            where: { id: latestMembershipOrder.id },
            data: {
                productName: `${latestMembershipOrder.productName} (Đã Hủy)`
            }
        });

        return NextResponse.json({ success: true, message: 'Đã hủy gói hội viên thành công' });

    } catch (error) {
        console.error('Cancel membership error:', error);
        return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
    }
}
