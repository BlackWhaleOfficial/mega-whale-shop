'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Package, Clock, CreditCard, Hash, Copy, Check } from 'lucide-react';

export default function HistoryPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/user/orders');
                const data = await res.json();

                if (data.error === 'Unauthorized') {
                    router.push('/login');
                    return;
                }

                if (data.orders) {
                    setOrders(data.orders);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #333', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    `}} />
                    <p>Đang tải lịch sử...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
            <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem', border: 'none' }}>Lịch Sử Mua Hàng</h1>

            <div style={{ width: '100%', maxWidth: '1000px' }}>
                {orders.length === 0 ? (
                    <div style={{ backgroundColor: '#111', padding: '4rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #333' }}>
                        <Package size={64} color="#444" style={{ margin: '0 auto 1.5rem auto' }} />
                        <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>Chưa có giao dịch nào</h3>
                        <p style={{ color: '#aaa', marginBottom: '2rem' }}>Bạn chưa thực hiện giao dịch mua hàng nào trên hệ thống.</p>
                        <button onClick={() => router.push('/')} className="btn-primary" style={{ padding: '12px 30px', fontSize: '1rem' }}>
                            Bắt đầu mua sắm ngay
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {orders.map((order) => {
                            const isExpanded = expandedOrderId === order.id;
                            let statusColor = '#888';
                            let statusText = order.status;

                            if (order.status === 'DONE') {
                                statusColor = 'var(--primary)';
                                statusText = 'Hoàn Thành';
                            } else if (order.status === 'PENDING') {
                                statusColor = '#f39c12';
                                statusText = 'Đang Xử Lý';
                            } else if (order.status === 'CANCELLED') {
                                statusColor = '#e74c3c';
                                statusText = 'Đã Hủy';
                            }

                            const itemCount = order.quantity || 1;

                            return (
                                <div key={order.id} style={{
                                    backgroundColor: '#111',
                                    borderRadius: '12px',
                                    border: `1px solid ${isExpanded ? 'var(--primary)' : '#333'}`,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {/* Order Summary Header */}
                                    <div
                                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                        style={{
                                            padding: '1.5rem 2rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            backgroundColor: isExpanded ? 'rgba(68, 214, 44, 0.05)' : 'transparent',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, minWidth: '300px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Hash size={12} /> Mã Hóa Đơn
                                                </div>
                                                <div style={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    #{order.id.substring(0, 8)}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Clock size={12} /> Ngày Mua
                                                </div>
                                                <div style={{ color: '#eee', fontSize: '1rem' }}>
                                                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                                                <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    Sản Phẩm & Tổng Tiền
                                                </div>
                                                <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
                                                    {order.productName.replace(/\s+x\d+$/i, '').trim()}
                                                    {itemCount > 1 && <span style={{ color: '#aaa', fontWeight: 'normal', fontSize: '0.9rem', marginLeft: '5px' }}>({itemCount} thẻ)</span>}
                                                </div>
                                                <div style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 700 }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    backgroundColor: `${statusColor}22`,
                                                    color: statusColor,
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {statusText}
                                                </div>
                                                {isExpanded ? <ChevronUp size={24} color={statusColor} /> : <ChevronDown size={24} color="#666" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div style={{ padding: '2rem', borderTop: '1px solid #333', backgroundColor: '#0a0a0a' }}>
                                            <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Package size={18} color="var(--primary)" /> Chi tiết sản phẩm giao dịch
                                            </h4>

                                            {order.items && order.items.length > 0 ? (
                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    {order.items.map((item: any, idx: number) => (
                                                        <div key={item.id} style={{
                                                            padding: '1.2rem',
                                                            borderRadius: '8px',
                                                            border: '1px dashed #444',
                                                            backgroundColor: '#111',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '12px'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.1rem' }}>Sản phẩm #{idx + 1}</span>
                                                                <span style={{ color: '#888', fontSize: '0.9rem' }}>Mệnh giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.cardValue)}</span>
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '10px 15px', borderRadius: '6px', border: '1px solid #222' }}>
                                                                    <span style={{ color: '#888', width: '80px', fontSize: '0.9rem' }}>Serial:</span>
                                                                    <span style={{ color: '#fff', flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '1px' }}>{item.serial}</span>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleCopy(item.serial, `serial_${item.id}`); }}
                                                                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '5px' }}
                                                                        title="Sao chép Serial"
                                                                    >
                                                                        {copiedId === `serial_${item.id}` ? <Check size={18} color="var(--primary)" /> : <Copy size={18} />}
                                                                    </button>
                                                                </div>

                                                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '10px 15px', borderRadius: '6px', border: '1px solid #222' }}>
                                                                    <span style={{ color: '#888', width: '80px', fontSize: '0.9rem' }}>Mã PIN:</span>
                                                                    <span style={{ color: '#fff', flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '1px', fontWeight: 'bold' }}>{item.pin}</span>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleCopy(item.pin, `pin_${item.id}`); }}
                                                                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '5px' }}
                                                                        title="Sao chép PIN"
                                                                    >
                                                                        {copiedId === `pin_${item.id}` ? <Check size={18} color="var(--primary)" /> : <Copy size={18} />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#111', borderRadius: '8px', border: '1px dashed #333' }}>
                                                    {order.productName.toLowerCase().includes('top-up') || order.productName.toLowerCase().includes('whale cash') ? (
                                                        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Giao dịch nạp số dư Whale Cash <br />
                                                            {order.status === 'PENDING' ? (
                                                                <strong style={{ color: '#f39c12', marginTop: '10px', display: 'inline-block' }}>Đang chờ xử lý.</strong>
                                                            ) : order.status === 'CANCELLED' ? (
                                                                <strong style={{ color: '#e74c3c', marginTop: '10px', display: 'inline-block' }}>Giao dịch đã hủy.</strong>
                                                            ) : (
                                                                <strong style={{ color: 'var(--primary)', marginTop: '10px', display: 'inline-block' }}>Đã cộng trực tiếp vào ví của bạn.</strong>
                                                            )}
                                                        </p>
                                                    ) : (
                                                        <p style={{ color: '#888' }}>Sản phẩm này không chứa thẻ cào (hoặc thẻ chưa được gửi. Vui lòng liên hệ Admin).</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
