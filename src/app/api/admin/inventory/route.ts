import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const items = await prisma.inventory.findMany({
            orderBy: { inTime: 'desc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { game, serial, pin, cardValue, qh, cost, price } = body;

        const item = await prisma.inventory.create({
            data: {
                game: game || 'Unknown',
                serial,
                pin,
                cardValue: parseInt(cardValue) || 0,
                qh: parseInt(qh) || 0,
                cost: parseInt(cost) || 0,
                price: parseInt(price) || 0,
                status: 'NEW'
            }
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
