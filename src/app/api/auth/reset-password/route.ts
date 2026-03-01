import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Thiếu thông tin.' }, { status: 400 });
        }

        if (password.length <= 8) {
            return NextResponse.json({ error: 'Mật khẩu phải dài hơn 8 ký tự.' }, { status: 400 });
        }

        // Tìm và validate token
        const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

        if (!resetToken) {
            return NextResponse.json({ error: 'Link không hợp lệ hoặc đã được sử dụng.' }, { status: 400 });
        }

        if (resetToken.used) {
            return NextResponse.json({ error: 'Link này đã được sử dụng. Vui lòng yêu cầu link mới.' }, { status: 400 });
        }

        if (new Date() > resetToken.expiresAt) {
            return NextResponse.json({ error: 'Link đã hết hạn (1 giờ). Vui lòng yêu cầu link mới.' }, { status: 400 });
        }

        // Hash mật khẩu mới
        const hashed = await bcrypt.hash(password, 12);

        // Cập nhật mật khẩu user
        await prisma.user.update({
            where: { email: resetToken.email },
            data: { password: hashed }
        });

        // Đánh dấu token đã dùng
        await prisma.passwordResetToken.update({
            where: { token },
            data: { used: true }
        });

        return NextResponse.json({ ok: true, message: 'Đặt lại mật khẩu thành công!' });
    } catch (err: any) {
        console.error('RESET PASSWORD ERROR:', err);
        return NextResponse.json({ error: 'Lỗi hệ thống. Vui lòng thử lại.' }, { status: 500 });
    }
}
