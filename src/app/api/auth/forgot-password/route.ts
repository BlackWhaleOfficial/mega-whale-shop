import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: 'Vui lòng nhập email.' }, { status: 400 });
        }

        // Tìm user theo email
        const user = await prisma.user.findUnique({ where: { email } });

        // Luôn trả về thành công để tránh dò email (security best practice)
        if (!user) {
            return NextResponse.json({ ok: true });
        }

        // Tạo token ngẫu nhiên
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

        // Lưu token vào DB (xoá token cũ cùng email trước)
        await prisma.passwordResetToken.deleteMany({ where: { email } });
        await prisma.passwordResetToken.create({
            data: { token, email, expiresAt }
        });

        // Gửi email
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://megawhaleshop.vercel.app';
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Mega Whale Shop" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: '🔐 Đặt lại mật khẩu - Mega Whale Shop',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; background: #000; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #44D62C; font-size: 24px; letter-spacing: 2px; margin: 0;">MEGA WHALE SHOP</h1>
                    </div>
                    
                    <div style="background: #111; border: 1px solid #333; padding: 32px; border-radius: 8px;">
                        <h2 style="color: #fff; font-size: 20px; margin-top: 0;">Đặt lại mật khẩu</h2>
                        <p style="color: #aaa; line-height: 1.6;">
                            Xin chào <strong style="color: #fff;">${user.username}</strong>,<br/><br/>
                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                            Nhấn nút bên dưới để tiếp tục:
                        </p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetLink}" 
                               style="background: #44D62C; color: #000; padding: 14px 32px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 1px; display: inline-block; border-radius: 4px; text-transform: uppercase;">
                                Đặt Lại Mật Khẩu
                            </a>
                        </div>
                        
                        <p style="color: #888; font-size: 0.85rem; margin-bottom: 0;">
                            Link này sẽ hết hạn sau <strong style="color: #fff;">1 giờ</strong>.<br/>
                            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                        </p>
                    </div>
                    
                    <p style="color: #555; font-size: 0.75rem; text-align: center; margin-top: 24px;">
                        © 2026 Mega Whale Shop. All rights reserved.
                    </p>
                </div>
            `,
        });

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error('FORGOT PASSWORD ERROR:', err);
        return NextResponse.json({ error: 'Lỗi hệ thống. Vui lòng thử lại.' }, { status: 500 });
    }
}
