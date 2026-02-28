import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { grantMembershipPerks } from '../../../../../../../lib/membership';
import { verifyEmailActionToken } from '../../../../../../../lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const token = searchParams.get('token');

        // Validate inputs
        if (!action || !token || !['approve', 'reject'].includes(action)) {
            return new Response(renderPage('❌ Lỗi', 'Yêu cầu không hợp lệ.', '#ff4d4f'), {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // Verify token
        if (!verifyEmailActionToken(params.id, action, token)) {
            return new Response(renderPage('🔒 Bị Từ Chối', 'Token không hợp lệ hoặc đã hết hạn.', '#ff4d4f'), {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // Get order
        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: { user: true, items: true }
        });

        if (!order) {
            return new Response(renderPage('❌ Không Tìm Thấy', 'Đơn hàng không tồn tại.', '#ff4d4f'), {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // Check if already processed
        if (order.status !== 'PENDING') {
            const statusText = order.status === 'DONE' ? 'đã được XÁC NHẬN' : 'đã bị TỪ CHỐI';
            return new Response(renderPage('⚠️ Đã Xử Lý', `Đơn hàng này ${statusText} trước đó rồi.`, '#FFD700'), {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        const shortId = params.id.substring(0, 8).toUpperCase();

        if (action === 'approve') {
            // Update Order to DONE
            await prisma.order.update({
                where: { id: params.id },
                data: { status: 'DONE' }
            });

            // Grant membership perks
            await grantMembershipPerks(order.userId, order.productName, order.quantity);

            // Update Inventory to DONE
            if (order.items.length > 0) {
                await prisma.inventory.updateMany({
                    where: { orderId: params.id },
                    data: { status: 'DONE', outTime: new Date() }
                });
            }

            // Handle Whale Cash topup
            if (order.productName.includes('Whale Cash')) {
                const amountStr = order.productName.split(' ')[0];
                const amount = parseInt(amountStr);
                if (!isNaN(amount) && order.userId) {
                    await prisma.user.update({
                        where: { id: order.userId },
                        data: { whaleCash: { increment: amount } }
                    });
                }
            }

            return new Response(renderPage(
                '✅ Đã Xác Nhận!',
                `Đơn hàng <strong>#${shortId}</strong> của <strong>${order.user?.username || order.userId}</strong><br>
                 <strong>${order.productName}</strong> — ${new Intl.NumberFormat('vi-VN').format(order.totalAmount)}₫<br><br>
                 đã được xác nhận thành công.`,
                '#44D62C'
            ), { headers: { 'Content-Type': 'text/html' } });

        } else {
            // Reject
            await prisma.order.update({
                where: { id: params.id },
                data: { status: 'CANCELLED' }
            });

            // Release inventory
            if (order.items.length > 0) {
                await prisma.inventory.updateMany({
                    where: { orderId: params.id },
                    data: { status: 'NEW', orderId: null }
                });
            }

            return new Response(renderPage(
                '✕ Đã Từ Chối',
                `Đơn hàng <strong>#${shortId}</strong> đã bị từ chối.<br>
                 Thẻ trong kho đã được giải phóng trở lại.`,
                '#ff4d4f'
            ), { headers: { 'Content-Type': 'text/html' } });
        }

    } catch (error) {
        console.error('Email action error:', error);
        return new Response(renderPage('❌ Lỗi Server', 'Đã có lỗi xảy ra. Vui lòng vào trang quản trị để xử lý.', '#ff4d4f'), {
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// ─── HTML Response page ───────────────────────────────────────────────────────
function renderPage(title: string, message: string, color: string): string {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Mega Whale Shop</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #fff; font-family: 'Segoe UI', Arial, sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #111; border: 1px solid #222; border-radius: 16px;
            padding: 48px 40px; max-width: 480px; width: 90%; text-align: center; }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 28px; font-weight: 700; color: ${color}; margin-bottom: 16px; }
    p { color: #888; font-size: 16px; line-height: 1.7; }
    strong { color: #fff; }
    .btn { display: inline-block; margin-top: 32px; padding: 14px 28px;
           background: ${color}; color: ${color === '#44D62C' ? '#000' : '#fff'};
           border-radius: 8px; text-decoration: none; font-weight: 700;
           font-size: 15px; letter-spacing: 0.5px; }
    .brand { margin-top: 32px; color: #333; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${color === '#44D62C' ? '🐳' : color === '#FFD700' ? '⚠️' : '❌'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://megawhaleshop.vercel.app/admin" class="btn">Vào Trang Quản Trị</a>
    <p class="brand">MEGA WHALE SHOP · Admin Panel</p>
  </div>
</body>
</html>`;
}
