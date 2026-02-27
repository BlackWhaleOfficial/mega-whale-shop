import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function GET() {
    try {
        const session = getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const maxAge = await prisma.user.findUnique({
            where: { id: session.id },
            include: {
                discounts: {
                    where: { isUsed: false }
                }
            }
        });

        if (!maxAge) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            whaleCash: maxAge.whaleCash,
            discounts: maxAge.discounts
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
