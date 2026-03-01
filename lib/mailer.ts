import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ─── Tạo transport Gmail ──────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // 16-ký-tự App Password
    },
  });
}

// ─── Tạo token bảo mật cho nút email ─────────────────────────────────────────
export function generateEmailActionToken(orderId: string, action: 'approve' | 'reject'): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}:${action}`)
    .digest('hex')
    .slice(0, 32); // 32 ký tự là đủ
}

export function verifyEmailActionToken(orderId: string, action: string, token: string): boolean {
  const expected = generateEmailActionToken(orderId, action as 'approve' | 'reject');
  return expected === token;
}

// ─── Gửi thông báo đơn hàng mới ──────────────────────────────────────────────
interface OrderNotificationParams {
  orderId: string;
  buyerName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  createdAt: Date;
  baseUrl: string; // e.g. https://megawhaleshop.vercel.app
}

export async function sendNewOrderNotification(params: OrderNotificationParams) {
  const { orderId, buyerName, productName, quantity, totalAmount, createdAt, baseUrl } = params;

  const approveToken = generateEmailActionToken(orderId, 'approve');
  const rejectToken = generateEmailActionToken(orderId, 'reject');

  const approveUrl = `${baseUrl}/api/admin/orders/${orderId}/email-action?action=approve&token=${approveToken}`;
  const rejectUrl = `${baseUrl}/api/admin/orders/${orderId}/email-action?action=reject&token=${rejectToken}`;

  const formattedAmount = new Intl.NumberFormat('vi-VN').format(totalAmount);
  const formattedTime = new Intl.DateTimeFormat('vi-VN', {
    timeStyle: 'short',
    dateStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(createdAt));

  const shortId = orderId.substring(0, 8).toUpperCase();

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yêu Cầu Duyệt Đơn</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#111 100%);border:1px solid #333;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;color:#44D62C;font-size:12px;letter-spacing:4px;text-transform:uppercase;font-weight:600;">MEGA WHALE SHOP</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">🔔 Đơn Hàng Mới</h1>
              <p style="margin:12px 0 0 0;color:#888;font-size:14px;">Có yêu cầu cần duyệt từ khách hàng</p>
            </td>
          </tr>

          <!-- Order ID Badge -->
          <tr>
            <td style="background:#111;border-left:1px solid #333;border-right:1px solid #333;padding:20px 40px 0;">
              <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px 20px;display:inline-block;">
                <span style="color:#555;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Mã đơn hàng</span>
                <p style="margin:4px 0 0;color:#44D62C;font-size:20px;font-weight:700;letter-spacing:2px;">#${shortId}</p>
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="background:#111;border-left:1px solid #333;border-right:1px solid #333;padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                
                <!-- Buyer -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
                    <table width="100%">
                      <tr>
                        <td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;width:40%;">👤 Người Mua</td>
                        <td style="color:#ffffff;font-size:16px;font-weight:600;text-align:right;">${buyerName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Time -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
                    <table width="100%">
                      <tr>
                        <td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;width:40%;">⏰ Thời Gian</td>
                        <td style="color:#ffffff;font-size:15px;text-align:right;">${formattedTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Product -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
                    <table width="100%">
                      <tr>
                        <td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;width:40%;">📦 Sản Phẩm</td>
                        <td style="color:#ffffff;font-size:15px;text-align:right;">${productName} <span style="color:#44D62C;font-weight:700;">(x${quantity})</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Subtotal -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
                    <table width="100%">
                      <tr>
                        <td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;width:40%;">💰 Đơn Giá</td>
                        <td style="color:#aaa;font-size:15px;text-align:right;">${new Intl.NumberFormat('vi-VN').format(Math.round(totalAmount / quantity))}₫ × ${quantity}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Total -->
                <tr>
                  <td style="padding:20px 0 0;">
                    <table width="100%">
                      <tr>
                        <td style="color:#888;font-size:14px;text-transform:uppercase;letter-spacing:1px;">💵 TỔNG CỘNG</td>
                        <td style="text-align:right;">
                          <span style="color:#44D62C;font-size:28px;font-weight:800;letter-spacing:-1px;">${formattedAmount}₫</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="background:#1a0f00;border-left:1px solid #333;border-right:1px solid #333;border-top:1px solid #2a2000;padding:16px 40px;">
              <p style="margin:0;color:#FFD700;font-size:13px;">⚠️ Kiểm tra payment trước khi xác nhận. Link hành động có hiệu lực 1 lần.</p>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="background:#111;border:1px solid #333;border-top:none;border-radius:0 0 12px 12px;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 24px;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:1px;">THAO TÁC NHANH</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" width="50%" style="padding:0 8px 0 0;">
                    <a href="${approveUrl}" style="display:block;background:#44D62C;color:#000;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">
                      ✓ Xác Nhận
                    </a>
                  </td>
                  <td align="center" width="50%" style="padding:0 0 0 8px;">
                    <a href="${rejectUrl}" style="display:block;background:transparent;color:#ff4d4f;text-decoration:none;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:1px;border:2px solid #ff4d4f;">
                      ✕ Từ Chối
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#444;font-size:12px;">
                Hoặc vào <a href="${baseUrl}/admin" style="color:#44D62C;">trang quản trị</a> để xem chi tiết
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;color:#333;font-size:12px;">© Mega Whale Shop · Email tự động, vui lòng không reply</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Mega Whale Shop" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || 'blackwhalegaming@gmail.com',
    subject: `[MEGA WHALE SHOP] ${formattedAmount}đ - YÊU CẦU DUYỆT ĐƠN`,
    html: htmlContent,
  });
}

// ─── Gửi hóa đơn cho khách hàng sau khi đơn được duyệt ───────────────────────
interface OrderInvoiceParams {
  toEmail: string;
  buyerName: string;
  orderId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  approvedAt: Date;
  paymentMethod?: string; // 'bank' | 'wcash'
}

export async function sendOrderInvoice(params: OrderInvoiceParams) {
  const { toEmail, buyerName, orderId, productName, quantity, totalAmount, approvedAt, paymentMethod = 'bank' } = params;

  const shortId = orderId.substring(0, 8).toUpperCase();
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(totalAmount);
  const formattedTime = new Intl.DateTimeFormat('vi-VN', {
    timeStyle: 'short',
    dateStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(approvedAt));

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://megawhaleshop.vercel.app';
  const payMethodLabel = paymentMethod === 'wcash' ? '🟡 WCash' : '🏦 Chuyển khoản ngân hàng';

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa Đơn Mua Hàng</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#111 100%);border:1px solid #333;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;color:#44D62C;font-size:12px;letter-spacing:4px;text-transform:uppercase;font-weight:600;">MEGA WHALE SHOP</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">✅ Hóa Đơn Mua Hàng</h1>
              <p style="margin:12px 0 0 0;color:#888;font-size:14px;">Cảm ơn bạn đã mua hàng tại Mega Whale Shop!</p>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="background:#111;border-left:1px solid #333;border-right:1px solid #333;padding:24px 40px 0;">
              <div style="background:#0a2010;border:1px solid #1a4a20;border-radius:8px;padding:16px 20px;display:flex;align-items:center;gap:12px;">
                <div>
                  <p style="margin:0;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Mã đơn hàng</p>
                  <p style="margin:4px 0 0;color:#44D62C;font-size:22px;font-weight:800;letter-spacing:3px;">#${shortId}</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="background:#111;border-left:1px solid #333;border-right:1px solid #333;padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Buyer -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
                    <table width="100%"><tr>
                      <td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">👤 Khách Hàng</td>
                      <td style="color:#fff;font-size:15px;font-weight:600;text-align:right;">${buyerName}</td>
                    </tr></table>
                  </td>
                </tr>

                <!-- Product -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
                    <table width="100%"><tr>
                      <td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">📦 Sản Phẩm</td>
                      <td style="color:#fff;font-size:15px;text-align:right;">${productName} <span style="color:#44D62C;font-weight:700;">(x${quantity})</span></td>
                    </tr></table>
                  </td>
                </tr>

                <!-- Payment method -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
                    <table width="100%"><tr>
                      <td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">💳 Phương Thức</td>
                      <td style="color:#fff;font-size:15px;text-align:right;">${payMethodLabel}</td>
                    </tr></table>
                  </td>
                </tr>

                <!-- Time -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
                    <table width="100%"><tr>
                      <td style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">⏰ Thời Gian</td>
                      <td style="color:#fff;font-size:15px;text-align:right;">${formattedTime}</td>
                    </tr></table>
                  </td>
                </tr>

                <!-- Total -->
                <tr>
                  <td style="padding:20px 0 0;">
                    <table width="100%"><tr>
                      <td style="color:#888;font-size:14px;text-transform:uppercase;letter-spacing:1px;">💵 TỔNG THANH TOÁN</td>
                      <td style="text-align:right;">
                        <span style="color:#44D62C;font-size:30px;font-weight:800;letter-spacing:-1px;">${formattedAmount}₫</span>
                      </td>
                    </tr></table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#0d1a0d;border-left:1px solid #333;border-right:1px solid #333;border-top:1px solid #1a3a1a;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 16px;color:#44D62C;font-size:14px;font-weight:600;">Đơn hàng của bạn đã được xác nhận thành công!</p>
              <a href="${baseUrl}/history" style="display:inline-block;background:#44D62C;color:#000;text-decoration:none;padding:13px 28px;border-radius:6px;font-size:15px;font-weight:700;letter-spacing:0.5px;">Xem Lịch Sử Mua Hàng</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111;border:1px solid #333;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#555;font-size:12px;">Nếu bạn có thắc mắc, vui lòng liên hệ qua <a href="https://www.facebook.com/MegaWhaleAOV" style="color:#44D62C;">Facebook</a> hoặc <a href="https://zalo.me/0708309879" style="color:#44D62C;">Zalo</a>.</p>
              <p style="margin:8px 0 0;color:#333;font-size:11px;">© 2026 Mega Whale Shop · Email tự động, vui lòng không reply</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Mega Whale Shop" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `✅ Hóa đơn #${shortId} - ${formattedAmount}đ | Mega Whale Shop`,
    html,
  });
}
