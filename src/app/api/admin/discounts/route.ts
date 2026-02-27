import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const templates = await prisma.discountTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error('Fetch templates error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { code, discountPercent } = body;

        const template = await prisma.discountTemplate.create({
            data: {
                code: code.toUpperCase(),
                discountPercent: parseInt(discountPercent),
                isActive: true
            }
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Create template error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
