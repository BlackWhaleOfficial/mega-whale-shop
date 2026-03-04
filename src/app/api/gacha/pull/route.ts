import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type } = body;

        // Verify user if it's paid
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;
        let userId = null;

        if (token) {
            try {
                const decoded: any = jwt.verify(token, JWT_SECRET);
                userId = decoded.userId;
            } catch (e) {
                // ignore
            }
        }

        if (type === 'PAID') {
            if (!userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Check if user has enough WCash
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.whaleCash < 9) {
                return NextResponse.json({ error: 'Không đủ WCash' }, { status: 400 });
            }

            // Get random available account
            const accounts = await prisma.gameAccount.findMany({ where: { status: 'AVAILABLE' } });
            if (accounts.length === 0) {
                return NextResponse.json({ error: 'Kho tài khoản đã trống' }, { status: 400 });
            }

            const randomAcc = accounts[Math.floor(Math.random() * accounts.length)];

            // Perform transaction: deduct 9 WCash, change status to GACHA_PENDING
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: { whaleCash: { decrement: 9 } }
                }),
                prisma.transaction.create({
                    data: {
                        userId,
                        amount: 9,
                        type: 'GACHA_PULL',
                        status: 'DONE'
                    }
                }),
                prisma.gameAccount.update({
                    where: { id: randomAcc.id },
                    data: { status: 'GACHA_PENDING' }
                })
            ]);

            return NextResponse.json({ account: randomAcc });

        } else if (type === 'FREE') {
            const accounts = await prisma.gameAccount.findMany({ where: { status: 'AVAILABLE' } });
            if (accounts.length === 0) {
                return NextResponse.json({ error: 'Kho tài khoản đã trống' }, { status: 400 });
            }
            const randomAcc = accounts[Math.floor(Math.random() * accounts.length)];
            return NextResponse.json({ account: randomAcc });
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

    } catch (error) {
        console.error('GACHA PULL ERROR:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
