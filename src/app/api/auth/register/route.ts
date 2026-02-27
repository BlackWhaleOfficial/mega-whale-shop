import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcrypt';

function pad(n: number) {
    return n < 10 ? '0' + n : n.toString();
}

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin.' }, { status: 400 });
        }

        if (password.length <= 8) {
            return NextResponse.json({ error: 'Mật khẩu phải dài hơn 8 ký tự.' }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
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

        // Generate UID: HHmm dd MM yyyy + 2 random digits
        // Date.now() or new Date() time logic
        const now = new Date();
        // Offset +7 timezone (VN) to match user logic potentially, but UTC is fine too. Let's force VN logic:
        const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const HH = pad(vnTime.getUTCHours());
        const mm = pad(vnTime.getUTCMinutes());
        const dd = pad(vnTime.getUTCDate());
        const MM = pad(vnTime.getUTCMonth() + 1);
        const yyyy = vnTime.getUTCFullYear().toString();
        const ran2 = Math.floor(Math.random() * 90 + 10).toString(); // 10-99

        const uid = `${HH}${mm}${dd}${MM}${yyyy}${ran2}`;

        // OpenID: first 4 + last 2
        const openid = uid.substring(0, 4) + uid.substring(uid.length - 2);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                uid,
                openid,
                isAdmin: false,
                whaleCash: 0,
                discounts: {
                    create: {
                        codeName: 'Welcome (1% Off)',
                        discountPercent: 1,
                    }
                }
            }
        });

        return NextResponse.json({ message: 'Đăng ký thành công', ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
