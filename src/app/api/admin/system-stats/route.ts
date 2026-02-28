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
        let dbLimitGB = 0.5; // Free plan limit
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

        // ─── 2. Vercel Usage (Fast Data Transfer) ────────────────────────────
        let vercelUsage: any = null;
        const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
        const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // optional
        const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID; // optional

        if (VERCEL_TOKEN) {
            try {
                // Get current billing period usage
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const headers: Record<string, string> = {
                    Authorization: `Bearer ${VERCEL_TOKEN}`,
                };

                let usageUrl = `https://api.vercel.com/v2/usage`;
                if (VERCEL_TEAM_ID) usageUrl += `?teamId=${VERCEL_TEAM_ID}`;

                const usageRes = await fetch(usageUrl, { headers });
                if (usageRes.ok) {
                    vercelUsage = await usageRes.json();
                }
            } catch (e) {
                console.error('Vercel usage fetch error:', e);
            }
        }

        // ─── 3. Vercel Analytics — cần package @vercel/analytics + data ─────
        // Analytics visitor data không có public API cho Free plan.
        // Với Pro plan: https://vercel.com/docs/rest-api/endpoints/analytics
        let analyticsData: any = null;
        if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
            try {
                const now = new Date();
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);

                const analyticsUrl = `https://vercel.com/api/web-analytics/timeseries?projectId=${VERCEL_PROJECT_ID}&from=${yesterday.toISOString()}&to=${now.toISOString()}&environment=production&filter=%7B%7D`;
                const analyticsRes = await fetch(analyticsUrl, {
                    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
                });
                if (analyticsRes.ok) {
                    analyticsData = await analyticsRes.json();
                }
            } catch (e) {
                // Analytics API may not be available on free plan
            }
        }

        // ─── 4. User stats từ DB ─────────────────────────────────────────────
        const userCount = await prisma.user.count();
        const orderCount = await prisma.order.count({ where: { status: 'DONE' } });

        return NextResponse.json({
            supabase: {
                dbSizeBytes,
                dbSizeGB: parseFloat(dbSizeGB),
                dbLimitGB,
                dbUsedPercent: Math.min(100, (parseFloat(dbSizeGB) / dbLimitGB) * 100).toFixed(1),
                label: `${dbSizeGB} / ${dbLimitGB} GB`,
            },
            vercel: {
                hasToken: !!VERCEL_TOKEN,
                usage: vercelUsage,
                analytics: analyticsData,
            },
            app: {
                userCount,
                orderCount,
            }
        });

    } catch (error) {
        console.error('System stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
