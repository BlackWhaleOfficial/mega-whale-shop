import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const accounts = await prisma.gameAccount.findMany({
            where: { status: 'AVAILABLE' },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(accounts);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
