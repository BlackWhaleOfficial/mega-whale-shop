import { NextResponse } from 'next/server';
import { getSession } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ─── 1. Supabase DB Size (qua Prisma raw query) ─────────────────────
        let dbSizeBytes = 0;
        let dbSizeGB = '0.000';
        const dbLimitGB = 0.5; // Free plan limit
        try {
            const result: any[] = await prisma.$queryRaw`
                SELECT pg_database_size(current_database()) as size_bytes
            `;
            if (result && result[0]) {
                dbSizeBytes = Number(result[0].size_bytes);
                dbSizeGB = (dbSizeBytes / (1024 * 1024 * 1024)).toFixed(3);
            }
        } catch (e) {
            console.error('DB size query error:', e);
        }

        // ─── 2. Vercel API ────────────────────────────────────────────────────
        const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
        const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
        const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

        let vercelData: any = {
            hasToken: !!VERCEL_TOKEN,
            deployments: null,
            analytics: null,
            usage: null,
        };

        if (VERCEL_TOKEN) {
            const headers: Record<string, string> = {
                Authorization: `Bearer ${VERCEL_TOKEN}`,
            };
            const teamQ = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : '';

            // 2a. Lấy deployment gần nhất
            try {
                const deplRes = await fetch(
                    `https://api.vercel.com/v6/deployments${teamQ}&projectId=${VERCEL_PROJECT_ID}&limit=5`,
                    { headers }
                );
                if (deplRes.ok) {
                    const deplData = await deplRes.json();
                    vercelData.deployments = deplData.deployments?.map((d: any) => ({
                        url: d.url,
                        state: d.readyState,
                        createdAt: d.createdAt,
                        meta: d.meta,
                    }));
                }
            } catch (e) { console.error('Deployments fetch error:', e); }

            // 2b. Usage metrics (bandwidth, functions)
            try {
                const usageRes = await fetch(
                    `https://api.vercel.com/v2/usage${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`,
                    { headers }
                );
                if (usageRes.ok) {
                    vercelData.usage = await usageRes.json();
                }
            } catch (e) { console.error('Usage fetch error:', e); }

            // 2c. Web Analytics (Hobby plan có giới hạn)
            if (VERCEL_PROJECT_ID) {
                try {
                    const now = new Date();
                    const from = new Date(now);
                    from.setDate(from.getDate() - 7); // 7 ngày gần nhất

                    const analyticsRes = await fetch(
                        `https://vercel.com/api/web-analytics/summary?projectId=${VERCEL_PROJECT_ID}&from=${from.toISOString()}&to=${now.toISOString()}&environment=production&teamId=${VERCEL_TEAM_ID || ''}`,
                        { headers }
                    );
                    if (analyticsRes.ok) {
                        vercelData.analytics = await analyticsRes.json();
                    } else {
                        // Thử endpoint khác
                        const res2 = await fetch(
                            `https://api.vercel.com/v1/web-analytics/${VERCEL_PROJECT_ID}/stats?period=day&teamId=${VERCEL_TEAM_ID}`,
                            { headers }
                        );
                        if (res2.ok) vercelData.analytics = await res2.json();
                    }
                } catch (e) { /* Analytics API có thể không available với Hobby */ }
            }
        }

        // ─── 3. App stats từ DB ──────────────────────────────────────────────
        const userCount = await prisma.user.count();
        const orderCount = await prisma.order.count({ where: { status: 'DONE' } });
        const pendingCount = await prisma.order.count({ where: { status: 'PENDING' } });
        const inventoryCount = await prisma.inventory.count({ where: { status: 'NEW' } });

        return NextResponse.json({
            supabase: {
                dbSizeBytes,
                dbSizeGB: parseFloat(dbSizeGB),
                dbLimitGB,
                dbUsedPercent: Math.min(100, (parseFloat(dbSizeGB) / dbLimitGB) * 100).toFixed(1),
                label: `${dbSizeGB} / ${dbLimitGB} GB`,
            },
            vercel: vercelData,
            app: {
                userCount,
                orderCount,
                pendingCount,
                inventoryCount, // thẻ còn trong kho
            }
        });

    } catch (error) {
        console.error('System stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
