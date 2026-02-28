import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getSession } from '../../../../../../lib/auth';

export const dynamic = 'force-dynamic';
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { status, game, serial, pin, qh, cardValue, cost, price } = body;

        const dataToUpdate: any = {};
        if (status !== undefined) dataToUpdate.status = status;
        if (game !== undefined) dataToUpdate.game = game;
        if (serial !== undefined) dataToUpdate.serial = serial;
        if (pin !== undefined) dataToUpdate.pin = pin;
        if (qh !== undefined) dataToUpdate.qh = parseInt(qh) || 0;
        if (cardValue !== undefined) dataToUpdate.cardValue = parseInt(cardValue) || 0;
        if (cost !== undefined) dataToUpdate.cost = parseInt(cost) || 0;
        if (price !== undefined) dataToUpdate.price = parseInt(price) || 0;

        const item = await prisma.inventory.update({
            where: { id: params.id },
            data: dataToUpdate
        });

        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await prisma.inventory.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
