import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Thiếu thông tin đăng nhập.' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: username } // Allow login via email implicitly if matched, or just username. But user requested username specifically. I'll check both.
                ]
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Tài khoản không tồn tại.' }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return NextResponse.json({ error: 'Sai mật khẩu.' }, { status: 401 });
        }

        // Creating token object
        const token = signToken({
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            openid: user.openid,
            whaleCash: user.whaleCash
        });

        const response = NextResponse.json({ ok: true, message: 'Đăng nhập thành công' });

        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
