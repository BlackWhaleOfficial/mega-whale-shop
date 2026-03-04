import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getSession } from '../../../../../../lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id } = params;
        const { gameId, email, password, rank, heroesCount, skinsCount, loginType, notes, price, originalPrice, status, image } = body;

        const updated = await prisma.gameAccount.update({
            where: { id },
            data: {
                gameId,
                email,
                password,
                rank,
                heroesCount: parseInt(heroesCount) || 0,
                skinsCount: parseInt(skinsCount) || 0,
                loginType,
                notes,
                price: parseInt(price) || 0,
                originalPrice: originalPrice ? parseInt(originalPrice) : null,
                status,
                image
            }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        await prisma.gameAccount.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
