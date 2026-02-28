import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

// DEBUG endpoint — xóa sau khi debug xong
export async function POST(request: Request) {
    const session = await getSession();
    if (!session || !session.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardValue, qty } = body;

    const cv = parseInt(cardValue) || 500000;
    const needed = parseInt(qty) || 3;

    const cards = await prisma.inventory.findMany({
        where: { status: 'NEW', cardValue: cv },
        take: needed
    });

    const allNewCards = await prisma.inventory.findMany({
        where: { status: 'NEW' },
        select: { id: true, serial: true, cardValue: true, status: true }
    });

    const user = await prisma.user.findUnique({ where: { id: session.id } });

    return NextResponse.json({
        query: { cardValue: cv, needed },
        found: cards.length,
        cards: cards.map(c => ({ id: c.id, serial: c.serial, cardValue: c.cardValue })),
        allNewCards,
        userWhaleCash: user?.whaleCash,
        wcashCost: Math.round(1440450 / 1000),
    });
}
