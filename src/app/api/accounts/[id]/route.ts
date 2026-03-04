import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const account = await prisma.gameAccount.findUnique({
            where: { id: params.id }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        return NextResponse.json(account);
    } catch (error) {
        console.error('API Account error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
