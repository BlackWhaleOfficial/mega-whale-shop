import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, bannerIndex, count = 1 } = body;
        const pullCount = parseInt(count);
        const bannerNames = ['Mộng Giới Thần Chủ', 'Nhật Nguyệt Thánh Linh', 'Hỗn Độn Thần Ma'];
        const bannerName = bannerNames[bannerIndex] || 'Unknown';

        const session = await getSession();
        const userId = session?.id || null;

        if (type === 'PAID') {
            if (!userId) {
                return NextResponse.json({ error: 'Vui lòng đăng nhập để tiếp tục' }, { status: 401 });
            }

            const cost = pullCount === 10 ? 90 : (pullCount * 10);
            const sssTag = `REG SSS banner ${bannerIndex + 1}`;

            // ✅ FIX 1: Load user + roll count + ALL pools SONG SONG (3 queries thay vì tối đa 20)
            const [user, currentRollRecord, regPool, sssPool, fullSkinPool] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, whaleCash: true }
                }),
                prisma.bannerRollCount.findUnique({
                    where: { userId_bannerName: { userId, bannerName } }
                }),
                // Tải toàn bộ pool AVAILABLE theo từng tag — chọn random trong bộ nhớ
                prisma.gameAccount.findMany({
                    where: { status: 'AVAILABLE', bannerTag: 'REG' },
                    select: { id: true, gameId: true, email: true, rank: true, heroesCount: true, skinsCount: true, loginType: true, notes: true, price: true, originalPrice: true, status: true, bannerTag: true, image: true, createdAt: true }
                }),
                prisma.gameAccount.findMany({
                    where: { status: 'AVAILABLE', bannerTag: sssTag },
                    select: { id: true, gameId: true, email: true, rank: true, heroesCount: true, skinsCount: true, loginType: true, notes: true, price: true, originalPrice: true, status: true, bannerTag: true, image: true, createdAt: true }
                }),
                prisma.gameAccount.findMany({
                    where: { status: 'AVAILABLE', bannerTag: 'Full Skin' },
                    select: { id: true, gameId: true, email: true, rank: true, heroesCount: true, skinsCount: true, loginType: true, notes: true, price: true, originalPrice: true, status: true, bannerTag: true, image: true, createdAt: true }
                }),
            ]);

            if (!user || user.whaleCash < cost) {
                return NextResponse.json({ error: 'Không đủ WCash' }, { status: 400 });
            }

            let baseRoll = currentRollRecord?.count || 0;
            const results: any[] = [];
            const pickedIds = new Set<string>();

            // Helper: chọn ngẫu nhiên từ pool, loại bỏ đã chọn
            const pickRandom = (pool: any[]) => {
                const available = pool.filter(a => !pickedIds.has(a.id));
                if (available.length === 0) return null;
                return available[Math.floor(Math.random() * available.length)];
            };

            // ✅ Toàn bộ logic chọn account chạy TRONG BỘ NHỚ — không thêm DB query nào
            for (let i = 1; i <= pullCount; i++) {
                const currentRollNum = baseRoll + i;
                let picked: any = null;

                if (currentRollNum % 150 === 0) {
                    // Pity: guaranteed SSS
                    picked = pickRandom(sssPool) ?? pickRandom(regPool);
                } else {
                    const r = Math.random() * 100;
                    if (r < 0.0000001) {
                        picked = pickRandom(fullSkinPool) ?? pickRandom(regPool);
                    } else if (r < 0.0000001 + 0.0001) {
                        picked = pickRandom(sssPool) ?? pickRandom(regPool);
                    } else {
                        picked = pickRandom(regPool);
                    }
                }

                if (!picked) {
                    return NextResponse.json({ error: 'Kho tài khoản hiện đang tạm hết, vui lòng quay lại sau' }, { status: 400 });
                }

                pickedIds.add(picked.id);
                results.push(picked);
            }

            // Transaction cập nhật DB (giống trước)
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: { whaleCash: { decrement: cost } }
                }),
                prisma.bannerRollCount.upsert({
                    where: { userId_bannerName: { userId, bannerName } },
                    update: { count: { increment: pullCount } },
                    create: { userId, bannerName, count: pullCount }
                }),
                prisma.transaction.create({
                    data: { userId, amount: cost, type: 'GACHA_PULL', status: 'DONE' }
                }),
                ...results.map(acc =>
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
                take: Math.max(pullCount * 5, 50),
                select: { id: true, gameId: true, email: true, rank: true, heroesCount: true, skinsCount: true, loginType: true, notes: true, price: true, originalPrice: true, status: true, bannerTag: true, image: true, createdAt: true }
            });

            if (accounts.length === 0) {
                return NextResponse.json({ error: 'Kho tài khoản trống' }, { status: 400 });
            }

            const shuffled = accounts.sort(() => 0.5 - Math.random()).slice(0, pullCount);

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
