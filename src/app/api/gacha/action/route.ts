import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

const GRAND_PRIZE_TAGS = ['Full Skin'];
const SSS_PREFIX = 'REG SSS banner';

const isGrandPrize = (tag: string | null) =>
    tag !== null && (GRAND_PRIZE_TAGS.includes(tag) || tag.startsWith(SSS_PREFIX));

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, accountId, isTenPull, accountIds, bannerName } = body;

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
                // Check if any grand prize in the batch — if so, reset pity for that banner
                const grandPrizeAcc = accounts.find(a => isGrandPrize(a.bannerTag));

                const ops: any[] = [
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
                ];

                // ✅ Reset pity: giữ lại số dư (count % 150)
                if (grandPrizeAcc && bannerName) {
                    const rollRecord = await prisma.bannerRollCount.findUnique({
                        where: { userId_bannerName: { userId, bannerName } }
                    });
                    if (rollRecord) {
                        const remainder = rollRecord.count % 150;
                        ops.push(
                            prisma.bannerRollCount.update({
                                where: { userId_bannerName: { userId, bannerName } },
                                data: { count: remainder }
                            })
                        );
                    }
                }

                await prisma.$transaction(ops);
                return NextResponse.json({ success: true });

            } else if (action === 'SELL_ALL') {
                // Only sell non-grand-prize accounts
                const sellableAccounts = accounts.filter(a => !isGrandPrize(a.bannerTag));
                // Bulk sell is always from a 10x pull, 60% of (90 WC / 10) = 5.4 WC per account
                const refundAmount = Math.floor(sellableAccounts.length * 5.4);
                const sellableIds = sellableAccounts.map(a => a.id);

                if (sellableIds.length === 0) {
                    return NextResponse.json({ error: 'Không có tài khoản nào có thể bán' }, { status: 400 });
                }

                await prisma.$transaction([
                    prisma.gameAccount.updateMany({
                        where: { id: { in: sellableIds } },
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
                            type: `BÁN_GACHA - Bán ${sellableAccounts.length} Acc (Hoàn ${refundAmount} WCash)`,
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
            const ops: any[] = [
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
            ];

            // ✅ Reset pity khi CLAIM grand prize — giữ số dư (count % 150)
            if (isGrandPrize(account.bannerTag) && bannerName) {
                const rollRecord = await prisma.bannerRollCount.findUnique({
                    where: { userId_bannerName: { userId, bannerName } }
                });
                if (rollRecord) {
                    const remainder = rollRecord.count % 150;
                    ops.push(
                        prisma.bannerRollCount.update({
                            where: { userId_bannerName: { userId, bannerName } },
                            data: { count: remainder }
                        })
                    );
                }
            }

            await prisma.$transaction(ops);
            return NextResponse.json({ success: true });

        } else if (action === 'SELL') {
            if (isGrandPrize(account.bannerTag)) {
                return NextResponse.json({ error: 'Không thể bán Grand Prize!' }, { status: 400 });
            }

            // If selling individually from a 10x pull, floor of 5.4 is 5 WC. Otherwise 6.
            const refundAmount = isTenPull ? 5 : 6;

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
