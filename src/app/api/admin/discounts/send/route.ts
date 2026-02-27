import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getSession } from '../../../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { targetId, percent, codeName, quantity = 1 } = body;

        // targetId can be uid or openid
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { uid: targetId },
                    { openid: targetId }
                ]
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Không tìm thấy người dùng với mã này' }, { status: 404 });
        }

        const discountsToCreate = [];
        for (let i = 0; i < quantity; i++) {
            discountsToCreate.push({
                userId: user.id,
                codeName: codeName,
                discountPercent: parseInt(percent),
                isUsed: false
            });
        }

        // Assign discounts
        await prisma.userDiscount.createMany({
            data: discountsToCreate
        });

        return NextResponse.json({ success: true, message: 'Đã gửi mã giảm giá thành công!' });
    } catch (error) {
        console.error('Send code error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
