import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';

export async function POST(req: Request) {
    try {
        const session = getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { discountId } = await req.json();

        if (discountId) {
            // mark it as used
            await prisma.userDiscount.updateMany({
                where: { id: discountId, userId: session.id, isUsed: false },
                data: { isUsed: true }
            });
        }

        return NextResponse.json({ ok: true, message: 'Thanh toán thành công' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
