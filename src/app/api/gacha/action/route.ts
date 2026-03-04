import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, accountId, isTenPull } = body;

        const session = await getSession();
        const userId = session?.id || null;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const account = await prisma.gameAccount.findUnique({ where: { id: accountId } });
        if (!account) {
            return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
        }

        if (action === 'CLAIM') {
            await prisma.$transaction([
                prisma.gameAccount.update({
                    where: { id: accountId },
                    data: { status: 'SOLD' }
                }),
                prisma.transaction.create({
                    data: {
                        userId,
                        amount: 0,
                        type: `NHẬN_GACHA - Nhận Acc #${account.gameId}`,
                        status: 'DONE'
                    }
                })
            ]);
            return NextResponse.json({ success: true });

        } else if (action === 'SELL') {
            const refundAmount = isTenPull ? Math.floor(90 * 0.6) : Math.floor(10 * 0.6);

            await prisma.$transaction([
                prisma.gameAccount.update({
                    where: { id: accountId },
                    data: { status: 'AVAILABLE' }
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: { whaleCash: { increment: refundAmount } }
                }),
                prisma.transaction.create({
                    data: {
                        userId,
                        amount: refundAmount,
                        type: `BÁN_GACHA - Bán Acc #${account.gameId} (Hoàn ${refundAmount} WCash)`,
                        status: 'DONE'
                    }
                })
            ]);
            return NextResponse.json({ success: true, refund: refundAmount });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('GACHA ACTION ERROR:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
