import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getSession } from '../../../../../lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export async function PUT(req: Request) {
    try {
        const session = getSession();
        if (!session) {
            return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
        }

        const { username, email, password } = await req.json();

        if (!username || !email) {
            return NextResponse.json({ error: 'Username và Email không được để trống' }, { status: 400 });
        }

        // Check taken username/email
        const existingUser = await prisma.user.findFirst({
            where: {
                id: { not: session.id },
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return NextResponse.json({ error: 'Tên người dùng đã tồn tại.' }, { status: 400 });
            }
            if (existingUser.email === email) {
                return NextResponse.json({ error: 'Email đã tồn tại.' }, { status: 400 });
            }
        }

        const updateData: any = { username, email };

        if (password) {
            if (password.length <= 8) {
                return NextResponse.json({ error: 'Mật khẩu mới phải dài hơn 8 ký tự.' }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: session.id },
            data: updateData
        });

        return NextResponse.json({ ok: true, message: 'Cập nhật thành công!' });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
