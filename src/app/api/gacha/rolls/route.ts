import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const session = await getSession();
        const userId = session?.id || null;

        if (!userId) {
            return NextResponse.json({ rolls: [] });
        }

        const rolls = await prisma.bannerRollCount.findMany({
            where: { userId }
        });

        return NextResponse.json({ rolls });
    } catch (error) {
        return NextResponse.json({ rolls: [] });
    }
}
