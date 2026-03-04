import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, accountId, isTenPull, accountIds } = body;

        const session = await getSession();
        const userId = session?.id || null;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (accountIds && Array.isArray(accountIds)) {
            // BULK ACTION
            const accounts = await prisma.gameAccount.findMany({
                where: { id: { in: accountIds } }
            });
            if (accounts.length === 0) return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });

            if (action === 'CLAIM_ALL') {
                await prisma.$transaction([
                    prisma.gameAccount.updateMany({
                        where: { id: { in: accountIds } },
                        data: { status: 'SOLD' }
                    }),
                    prisma.transaction.create({
                        data: {
                            userId,
                            amount: 0,
                            type: `NHẬN_GACHA - Nhận ${accounts.length} Acc`,
                            status: 'DONE'
                        }
                    }),
                    prisma.order.create({
                        data: {
                            userId,
                            productName: `Tài khoản Gacha (Nguyện Ước Biển Cả) x${accounts.length}`,
                            quantity: accounts.length,
                            totalAmount: accounts.length === 10 ? 90 : accounts.length * 10,
                            status: 'DONE',
                            items: {
                                create: accounts.map(acc => ({
                                    game: `Liên Quân - ${acc.rank}`,
                                    serial: `Mã: #${acc.gameId} | Đăng nhập: ${acc.loginType} (${acc.email})`,
                                    pin: `Mật khẩu: ${acc.password}`,
                                    status: 'DONE'
                                }))
                            }
                        }
                    })
                ]);
                return NextResponse.json({ success: true });
            } else if (action === 'SELL_ALL') {
                const refundAmount = accounts.length === 10 ? 54 : accounts.length * 6;

                await prisma.$transaction([
                    prisma.gameAccount.updateMany({
                        where: { id: { in: accountIds } },
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
                            type: `BÁN_GACHA - Bán ${accounts.length} Acc (Hoàn ${refundAmount} WCash)`,
                            status: 'DONE'
                        }
                    })
                ]);
                return NextResponse.json({ success: true, refund: refundAmount });
            }
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
                }),
                prisma.order.create({
                    data: {
                        userId,
                        productName: `Tài khoản Gacha (Nguyện Ước Biển Cả)`,
                        quantity: 1,
                        totalAmount: 10,
                        status: 'DONE',
                        items: {
                            create: [{
                                game: `Liên Quân - ${account.rank}`,
                                serial: `Mã: #${account.gameId} | Đăng nhập: ${account.loginType} (${account.email})`,
                                pin: `Mật khẩu: ${account.password}`,
                                status: 'DONE'
                            }]
                        }
                    }
                })
            ]);
            return NextResponse.json({ success: true });

        } else if (action === 'SELL') {
            const refundAmount = 6;

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
