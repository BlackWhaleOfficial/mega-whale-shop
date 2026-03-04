import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const accounts = await prisma.gameAccount.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(accounts);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { gameId, email, password, rank, heroesCount, skinsCount, loginType, notes, price, originalPrice, image } = body;

        // Strict numeric parsing
        const parsedPrice = parseInt(price?.toString().replace(/\D/g, '') || "0") || 0;
        const parsedHeroes = parseInt(heroesCount?.toString().replace(/\D/g, '') || "0") || 0;
        const parsedSkins = parseInt(skinsCount?.toString().replace(/\D/g, '') || "0") || 0;

        let parsedOriginalPrice: number | null = null;
        if (originalPrice !== undefined && originalPrice !== null && originalPrice !== '') {
            const val = parseInt(originalPrice.toString().replace(/\D/g, '') || "0");
            if (!isNaN(val)) parsedOriginalPrice = val;
        }

        const dataToSave = {
            gameId: String(gameId || ""),
            email: String(email || ""),
            password: String(password || ""),
            rank: String(rank || "Đồng"),
            heroesCount: parsedHeroes,
            skinsCount: parsedSkins,
            loginType: String(loginType || "Garena"),
            notes: String(notes || ""),
            price: parsedPrice,
            originalPrice: parsedOriginalPrice,
            image: String(image || ""),
            status: 'AVAILABLE'
        };

        const account = await prisma.gameAccount.create({ data: dataToSave });
        return NextResponse.json(account);

    } catch (error: any) {
        console.error('--- ACCOUNT CREATION FAILED ---', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error?.message || 'Prisma record creation failed',
            code: error?.code || 'UNKNOWN_PRISMA_ERROR'
        }, { status: 500 });
    }
}
