import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ rolls: [] });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        const rolls = await prisma.bannerRollCount.findMany({
            where: { userId }
        });

        return NextResponse.json({ rolls });
    } catch (error) {
        return NextResponse.json({ rolls: [] });
    }
}
