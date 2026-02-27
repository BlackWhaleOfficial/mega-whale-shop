import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ ok: true, message: 'Đã đăng xuất' });

    response.cookies.delete('session');

    return response;
}
