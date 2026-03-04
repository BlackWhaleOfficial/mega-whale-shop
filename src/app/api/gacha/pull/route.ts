import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, bannerIndex } = body;
        const bannerNames = ['Nhật Nguyệt Thánh Linh', 'Hỗn Độn Thần Ma', 'Mộng Giới Thần Chủ'];
        const bannerName = bannerNames[bannerIndex] || 'Unknown';

        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;
        let userId: string | null = null;

        if (token) {
            try {
                const decoded: any = jwt.verify(token, JWT_SECRET);
                userId = decoded.userId;
            } catch (e) {
                // ignore
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập để tiếp tục' }, { status: 401 });
        }

        if (type === 'PAID') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.whaleCash < 9) {
                return NextResponse.json({ error: 'Không đủ WCash' }, { status: 400 });
            }

            // Get or initialize roll count
            const rollRecord = await prisma.bannerRollCount.upsert({
                where: { userId_bannerName: { userId, bannerName } },
                update: { count: { increment: 1 } },
                create: { userId, bannerName, count: 1 }
            });

            let targetTag = 'REG';
            const currentRoll = rollRecord.count;

            // Pity check: 150 rolls
            if (currentRoll % 150 === 0) {
                targetTag = 'REG có sẵn skin SSS';
            } else {
                const r = Math.random() * 100;
                if (r < 0.0000001) {
                    targetTag = 'Full Skin';
                } else if (r < 0.0000001 + 0.0001) {
                    targetTag = 'REG có sẵn skin SSS';
                } else {
                    targetTag = 'REG';
                }
            }

            // Find an available account with this tag
            let accounts = await prisma.gameAccount.findMany({
                where: {
                    status: 'AVAILABLE',
                    bannerTag: targetTag
                }
            });

            // Fallback if no account with specific tag is found (except REG which should exist)
            if (accounts.length === 0 && targetTag !== 'REG') {
                accounts = await prisma.gameAccount.findMany({
                    where: {
                        status: 'AVAILABLE',
                        bannerTag: 'REG'
                    }
                });
            }

            if (accounts.length === 0) {
                return NextResponse.json({ error: 'Kho tài khoản hiện đang tạm hết, vui lòng quay lại sau' }, { status: 400 });
            }

            const randomAcc = accounts[Math.floor(Math.random() * accounts.length)];

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

            return NextResponse.json({ account: randomAcc, rollCount: currentRoll });

        } else if (type === 'FREE') {
            // Just return a random account for preview, but don't save anything
            const accounts = await prisma.gameAccount.findMany({
                where: { status: 'AVAILABLE' },
                take: 50 // Just pick from a small batch for speed
            });

            if (accounts.length === 0) {
                return NextResponse.json({ error: 'Kho tài khoản trống' }, { status: 400 });
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
