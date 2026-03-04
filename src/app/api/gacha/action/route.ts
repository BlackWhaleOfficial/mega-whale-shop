import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, accountId } = body;

        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;
        let userId = null;

        if (token) {
            try {
                const decoded: any = jwt.verify(token, JWT_SECRET);
                userId = decoded.userId;
            } catch (e) { }
        }

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
            await prisma.$transaction([
                prisma.gameAccount.update({
                    where: { id: accountId },
                    data: { status: 'AVAILABLE' }
                }),
                prisma.user.update({
                    where: { id: userId },
                    data: { whaleCash: { increment: 4 } }
                }),
                prisma.transaction.create({
                    data: {
                        userId,
                        amount: 4,
                        type: `BÁN_GACHA - Bán Acc #${account.gameId} (Hoàn 4 WCash)`,
                        status: 'DONE'
                    }
                })
            ]);
            return NextResponse.json({ success: true, refund: 4 });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('GACHA ACTION ERROR:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
