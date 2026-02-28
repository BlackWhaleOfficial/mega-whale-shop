import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const existingAdmin = await prisma.user.findUnique({
            where: { username: 'Mr.Whale' },
        });

        if (existingAdmin) {
            return NextResponse.json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash('Han@123', 10);

        const admin = await prisma.user.create({
            data: {
                uid: '88888888',
                openid: '888888',
                username: 'Mr.Whale',
                email: 'admin@megawhale.com',
                password: hashedPassword,
                isAdmin: true,
                whaleCash: 0,
            }
        });

        return NextResponse.json({ message: 'Admin created successfully', admin });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Unknown err' }, { status: 500 });
    }
}
