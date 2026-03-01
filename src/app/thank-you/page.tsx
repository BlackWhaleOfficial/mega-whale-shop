import Link from 'next/link';
import { prisma } from '../../../lib/prisma';

export default async function ThankYouPage({ searchParams }: { searchParams: { orderId: string } }) {
    const orderId = searchParams.orderId;

    if (!orderId) {
        return (
            <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '100vh', textAlign: 'center' }}>
                <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Không tìm thấy đơn hàng</h1>
                <Link href="/" className="btn-outline">Về trang chủ</Link>
            </div>
        );
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    });

    if (!order) {
        return (
            <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '100vh', textAlign: 'center' }}>
                <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Không tìm thấy đơn hàng</h1>
                <Link href="/" className="btn-outline">Về trang chủ</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#111', padding: '4rem', border: '1px solid var(--primary)' }}>

                <h1 style={{ color: 'var(--primary)', textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                    Cảm ơn bạn đã mua hàng!
                </h1>
                <p style={{ color: '#aaa', textAlign: 'center', marginBottom: '3rem' }}>
                    Giao dịch đã được xác nhận thành công.
                </p>

                <div style={{ backgroundColor: '#000', padding: '2rem', border: '1px solid #333', marginBottom: '3rem' }}>
                    <h2 style={{ color: '#fff', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                        Thông Tin Đơn Hàng
                    </h2>

                    {order.items.length > 0 ? (
                        order.items.map((item, idx) => {
                            // Bỏ phần " x3", " x2"... vì mỗi item đã là 1 thẻ riêng
                            const cleanName = order.productName.replace(/\s+x\d+$/i, '').trim();
                            return (
                                <div key={item.id} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: idx !== order.items.length - 1 ? '1px dashed #333' : 'none' }}>
                                    {order.items.length > 1 && (
                                        <p style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                                            Thẻ {idx + 1}/{order.items.length}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                                            <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.9rem' }}>Tên Sản Phẩm:</span>
                                            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{cleanName}</strong>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                                            <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.9rem' }}>Ngày:</span>
                                            <strong style={{ color: '#fff' }}>
                                                {new Intl.DateTimeFormat('vi-VN', { timeStyle: 'short', dateStyle: 'short' }).format(new Date(order.updatedAt))}
                                            </strong>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                                            <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.9rem' }}>Serial:</span>
                                            <strong style={{ color: 'var(--primary)', letterSpacing: '2px' }}>{item.serial}</strong>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                                            <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.9rem' }}>Mã Nạp:</span>
                                            <strong style={{ color: 'var(--primary)', letterSpacing: '2px', fontSize: '1.2rem' }}>{item.pin}</strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })

                    ) : (
                        <div style={{ color: '#ccc' }}>
                            <p>Sản phẩm đã được nạp trực tiếp vào tài khoản ({order.productName}).</p>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Link href="/" className="btn-primary" style={{ padding: '16px 40px' }}>
                        Tiếp Tục Mua Sắm
                    </Link>
                </div>

            </div>
        </div>
    );
}
