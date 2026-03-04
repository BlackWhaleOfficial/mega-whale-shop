import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, bannerIndex, count = 1 } = body;
        const pullCount = parseInt(count);
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

        if (type === 'PAID') {
            if (!userId) {
                return NextResponse.json({ error: 'Vui lòng đăng nhập để tiếp tục' }, { status: 401 });
            }

            const cost = pullCount === 10 ? 90 : (pullCount * 10);

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || user.whaleCash < cost) {
                return NextResponse.json({ error: 'Không đủ WCash' }, { status: 400 });
            }

            // Get current roll count to calculate pity accurately for multiple pulls
            const currentRollRecord = await prisma.bannerRollCount.findUnique({
                where: { userId_bannerName: { userId, bannerName } }
            });
            let baseRoll = currentRollRecord?.count || 0;

            const results: any[] = [];
            const accountUpdates: any[] = [];

            for (let i = 1; i <= pullCount; i++) {
                const currentRollNum = baseRoll + i;
                let targetTag = 'REG';

                // Pity check: 150 rolls (Sao Hộ Mệnh)
                if (currentRollNum % 150 === 0) {
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

                // Explicitly get IDs already picked to avoid duplication in same 10x
                const pickedIds = accountUpdates.map(a => a.id);

                // Find an available account with this tag
                let availableAccounts: any[] = await prisma.gameAccount.findMany({
                    where: {
                        status: 'AVAILABLE',
                        bannerTag: targetTag,
                        id: { notIn: pickedIds }
                    }
                });

                // Fallback if no account with specific tag is found
                if (availableAccounts.length === 0 && targetTag !== 'REG') {
                    availableAccounts = await prisma.gameAccount.findMany({
                        where: {
                            status: 'AVAILABLE',
                            bannerTag: 'REG',
                            id: { notIn: pickedIds }
                        }
                    });
                }

                if (availableAccounts.length === 0) {
                    // Critical failure: No accounts left even in REG
                    return NextResponse.json({ error: 'Kho tài khoản hiện đang tạm hết, vui lòng quay lại sau' }, { status: 400 });
                }

                const pulledAcc = availableAccounts[Math.floor(Math.random() * availableAccounts.length)];
                results.push(pulledAcc);
                accountUpdates.push(pulledAcc);
            }

            // Perform transaction
            await prisma.$transaction([
                // Update User Balance
                prisma.user.update({
                    where: { id: userId },
                    data: { whaleCash: { decrement: cost } }
                }),
                // Update Roll Count
                prisma.bannerRollCount.upsert({
                    where: { userId_bannerName: { userId, bannerName } },
                    update: { count: { increment: pullCount } },
                    create: { userId, bannerName, count: pullCount }
                }),
                // Create Transaction record
                prisma.transaction.create({
                    data: {
                        userId,
                        amount: cost,
                        type: 'GACHA_PULL',
                        status: 'DONE'
                    }
                }),
                // Set accounts to pending
                ...accountUpdates.map(acc =>
                    prisma.gameAccount.update({
                        where: { id: acc.id },
                        data: { status: 'GACHA_PENDING' }
                    })
                )
            ]);

            return NextResponse.json({
                accounts: results,
                account: results[0],
                rollCount: baseRoll + pullCount
            });

        } else if (type === 'FREE') {
            const accounts = await prisma.gameAccount.findMany({
                where: { status: 'AVAILABLE' },
                take: pullCount
            });

            if (accounts.length === 0) {
                return NextResponse.json({ error: 'Kho tài khoản trống' }, { status: 400 });
            }

            const shuffled = accounts.sort(() => 0.5 - Math.random());

            return NextResponse.json({
                accounts: shuffled,
                account: shuffled[0]
            });
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

    } catch (error) {
        console.error('GACHA PULL ERROR:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
