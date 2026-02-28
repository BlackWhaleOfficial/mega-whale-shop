'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import Modal from '../../components/Modal';

function CartContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let items: any[] = [];
        try {
            const stored = localStorage.getItem('cartItems');
            if (stored) items = JSON.parse(stored);
        } catch (e) { }

        const itemParam = searchParams.get('item');
        const qtyParam = searchParams.get('qty');

        if (itemParam) {
            const existing = items.find((i: any) => i.id === itemParam);
            if (existing) {
                existing.qty += parseInt(qtyParam || '1');
            } else {
                items.push({ id: itemParam, qty: parseInt(qtyParam || '1') });
            }
            localStorage.setItem('cartItems', JSON.stringify(items));
            localStorage.setItem('cartQty', items.reduce((sum, i) => sum + i.qty, 0).toString());
            window.dispatchEvent(new Event('storage'));
            router.replace('/cart'); // strip params
            return;
        }

        // migrating legacy single item
        const legacyItem = localStorage.getItem('cartItem');
        const legacyQty = localStorage.getItem('cartQty');
        if (legacyItem && items.length === 0) {
            items.push({ id: legacyItem, qty: parseInt(legacyQty || '1') });
            localStorage.setItem('cartItems', JSON.stringify(items));
            localStorage.removeItem('cartItem');
        }

        setCartItems(items);
        setIsLoaded(true);
    }, [searchParams, router]);

    const [discounts, setDiscounts] = useState<any[]>([]);

    const groupedDiscounts = Object.values(discounts.reduce((acc: any, d: any) => {
        if (!acc[d.codeName]) {
            acc[d.codeName] = { ...d, quantity: 1 };
        } else {
            acc[d.codeName].quantity += 1;
        }
        return acc;
    }, {}));
    const [selectedDiscountId, setSelectedDiscountId] = useState('');
    const [isCheckout, setIsCheckout] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);
    const [whaleCash, setWhaleCash] = useState(0);
    const [walletLoaded, setWalletLoaded] = useState(false);

    // New states for order tracking
    const [orderId, setOrderId] = useState<string>('');
    const [orderStatus, setOrderStatus] = useState<'IDLE' | 'PENDING' | 'DONE' | 'CANCELLED'>('IDLE');
    const [progress, setProgress] = useState(0);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'prompt';
        message: string;
        onConfirm?: (val?: string) => void;
    }>({ isOpen: false, type: 'alert', message: '' });

    useEffect(() => {
        fetch('/api/user/wallet')
            .then(res => res.json())
            .then(data => {
                if (data.discounts) {
                    setDiscounts(data.discounts);
                }
                if (data.whaleCash !== undefined) {
                    setWhaleCash(data.whaleCash);
                }
                setWalletLoaded(true);
            })
            .catch(() => setWalletLoaded(true));
    }, []);

    useEffect(() => {
        let pollInterval: any;
        if (orderId && orderStatus === 'PENDING') {
            pollInterval = setInterval(async () => {
                const res = await fetch(`/api/orders/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'DONE') {
                        setOrderStatus('DONE');
                        setProgress(100);
                        clearInterval(pollInterval);
                        setTimeout(() => {
                            router.push(`/thank-you?orderId=${orderId}`);
                        }, 1000);
                    } else if (data.status === 'CANCELLED') {
                        setOrderStatus('CANCELLED');
                        setProgress(100);
                        clearInterval(pollInterval);
                    }
                }
            }, 2000);
        }
        return () => clearInterval(pollInterval);
    }, [orderId, orderStatus, router]);

    const getProductDetails = (id: string, quantity: number) => {
        const getMembershipName = (pid: string) => {
            switch (pid) {
                case 'goi_888k': return 'Gói Cá Voi';
                case 'goi_588k': return 'Gói Cá Mập Megalodon';
                case 'goi_100k': return 'Gói Cá Mập';
                case 'goi_25k': return 'Gói Cá Con';
                default: return 'Membership';
            }
        };

        const itemName = id.includes('topup')
            ? `${id.split('_')[1]} Whale Cash`
            : id.includes('goi')
                ? getMembershipName(id)
                : `Garena Card ${id.split('_')[1] || '50000'} VNĐ`;

        // Giá bán chiết khấu cho thẻ Garena (shop chiết khấu)
        const garenaDiscountedPrice: Record<string, number> = {
            '100000': 97000,
            '200000': 194000,
            '500000': 485000,
        };

        const itemPrice = id.includes('topup')
            ? parseInt(id.split('_')[1] || '0') * 1000
            : id.includes('goi')
                ? parseInt(id.replace('goi_', '0').replace('k', '000') || '0')
                : garenaDiscountedPrice[id.split('_')[1]] ?? parseInt(id.split('_')[1] || '50000');

        return { id, name: itemName, price: itemPrice, qty: quantity, total: itemPrice * quantity };
    };

    const detailedItems = cartItems.map(i => getProductDetails(i.id, i.qty));
    const total = detailedItems.reduce((sum, i) => sum + i.total, 0);

    const combinedItemName = detailedItems.map(i => `${i.name} x${i.qty}`).join(', ');
    const combinedQty = detailedItems.reduce((sum, i) => sum + i.qty, 0).toString();

    const activeDiscount = discounts.find(d => d.id === selectedDiscountId);
    let appliedDiscount = activeDiscount ? Math.floor(total * (activeDiscount.discountPercent / 100)) : 0;
    if (appliedDiscount > 100000) appliedDiscount = 100000;

    const finalTotal = total - appliedDiscount;

    const handleCheckout = () => {
        setIsCheckout(true);
    };

    const executeWCashPayment = async () => {
        const res = await fetch('/api/cart/pay-wcash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemName: combinedItemName, qty: combinedQty, total: finalTotal, discountId: selectedDiscountId, items: detailedItems })
        });
        const data = await res.json();
        if (res.ok && data.orderId) {
            setTimeout(() => { router.push(`/thank-you?orderId=${data.orderId}`); }, 500);
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: data.error || 'Lỗi hệ thống khi thanh toán!' });
        }
    };

    const handleWCashPayment = () => {
        const wcashCost = finalTotal / 1000;
        if (whaleCash < wcashCost) {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Bạn không đủ số dư WCash để thanh toán đơn hàng này!' });
            return;
        }

        setModalConfig({
            isOpen: true,
            type: 'confirm',
            message: `Xác nhận thanh toán ${new Intl.NumberFormat('vi-VN').format(wcashCost)} WCash cho đơn hàng này?`,
            onConfirm: executeWCashPayment
        });
    };

    const executeCancelOrder = async () => {
        const res = await fetch('/api/cart/cancel-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemName: combinedItemName, qty: combinedQty, total: finalTotal, items: detailedItems })
        });

        if (res.ok) {
            setIsCheckout(false);
            setModalConfig({ isOpen: true, type: 'alert', message: 'Đã hủy đơn hàng thành công!' });
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Lỗi khi hủy đơn hàng' });
        }
    };

    const handleCancelOrder = () => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            message: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
            onConfirm: executeCancelOrder
        });
    };

    const handleRemoveAll = () => {
        setCartItems([]);
        setIsRemoved(true);
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartItem');
        localStorage.setItem('cartQty', '0');
        window.dispatchEvent(new Event('storage'));
        router.replace('/cart');
    };

    const handleRemoveItem = (id: string) => {
        const newItems = cartItems.filter(i => i.id !== id);
        setCartItems(newItems);
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        localStorage.setItem('cartQty', newItems.reduce((sum, i) => sum + i.qty, 0).toString());
        window.dispatchEvent(new Event('storage'));
        if (newItems.length === 0) {
            handleRemoveAll();
        }
    };

    const handlePaymentDone = async () => {
        if (selectedDiscountId) {
            // we could mark it used here or in the cart/confirm API. The original logic was doing it via api/cart/checkout.
            // But now /api/cart/confirm does it.
            // We just call confirm API
        }

        const res = await fetch('/api/cart/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemName: combinedItemName,
                qty: combinedQty,
                total: finalTotal,
                discountId: selectedDiscountId,
                items: detailedItems
            })
        });
        const data = await res.json();

        if (res.ok && data.orderId) {
            setOrderId(data.orderId);
            setOrderStatus('PENDING');
            startFakeProgress();
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: data.error || 'Hệ thống đang bận. Vui lòng thử lại.' });
        }
    };

    const startFakeProgress = () => {
        setProgress(0);
        let current = 0;
        const interval = setInterval(() => {
            current += Math.floor(Math.random() * 15) + 5; // fast 0 to 90

            if (current >= 90) {
                clearInterval(interval);

                // Now slow down from 90 to 99
                let slowCurrent = 90;
                const slowInterval = setInterval(() => {
                    slowCurrent += 1;
                    if (slowCurrent >= 99) {
                        clearInterval(slowInterval);
                        setProgress(99);
                    } else {
                        setProgress(slowCurrent);
                    }
                }, 2000);
            } else {
                setProgress(current);
            }
        }, 500);
    };

    if (!isLoaded) return <div style={{ minHeight: '100vh', backgroundColor: '#000' }}></div>;

    if (isRemoved || cartItems.length === 0) {
        return (
            <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '4rem', border: 'none' }}>Giỏ Hàng Của Bạn</h1>
                <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#111', padding: '3rem', border: '1px solid #333', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '2rem' }}>Giỏ hàng của bạn đang trống.</p>
                    <Link href="/" className="btn-primary" style={{ padding: '15px 30px', fontSize: '1rem', display: 'inline-block' }}>
                        tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '4rem', border: 'none' }}>Giỏ Hàng Của Bạn</h1>

            {!isCheckout ? (
                <div style={{ width: '100%', maxWidth: '800px', backgroundColor: '#111', padding: '3rem', border: '1px solid #333' }}>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem', color: '#fff' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', color: '#888' }}>
                                <th style={{ paddingBottom: '1rem' }}>Sản phẩm</th>
                                <th style={{ paddingBottom: '1rem' }}>Số lượng</th>
                                <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Thành tiền</th>
                                <th style={{ paddingBottom: '1rem', textAlign: 'right', width: '50px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td style={{ paddingTop: '2rem', fontSize: '1.2rem', fontWeight: 500 }}>{item.name}</td>
                                    <td style={{ paddingTop: '2rem', color: '#aaa' }}>x{item.qty}</td>
                                    <td style={{ padding: '1.5rem', borderBottom: '1px solid #333', color: 'var(--primary)', fontWeight: 600, textAlign: 'right', fontSize: '1.1rem' }}>
                                        {new Intl.NumberFormat('vi-VN').format(item.total)}₫
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        <button onClick={() => handleRemoveItem(item.id)} style={{ color: '#ff4d4f', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ borderTop: '1px solid #333', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select
                                value={selectedDiscountId}
                                onChange={e => setSelectedDiscountId(e.target.value)}
                                style={{ flex: 1, padding: '15px', backgroundColor: '#000', border: '1px solid #444', color: '#fff' }}
                            >
                                <option value="">-- Chọn mã giảm giá của bạn --</option>
                                {groupedDiscounts.map((d: any) => (
                                    <option key={d.id} value={d.id}>{d.codeName} (Giảm {d.discountPercent}% - Còn: {d.quantity} mã)</option>
                                ))}
                            </select>
                        </div>

                        {appliedDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600 }}>
                                <span>Giảm giá</span>
                                <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appliedDiscount)}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #333', marginTop: '1rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 300, textTransform: 'uppercase' }}>Tổng Cộng</span>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                            </span>
                        </div>

                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <p style={{ color: '#888', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>Phương Thức Thanh Toán</p>

                        <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%', padding: '20px', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                            <CreditCard size={24} /> <span>Chuyển khoản ngân hàng</span>
                        </button>

                        <button
                            onClick={walletLoaded ? handleWCashPayment : undefined}
                            disabled={!walletLoaded}
                            style={{ width: '100%', padding: '20px', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', backgroundColor: walletLoaded ? '#FFD700' : '#999', color: '#000', border: 'none', borderRadius: '4px', cursor: walletLoaded ? 'pointer' : 'not-allowed', fontWeight: 600, transition: '0.3s' }}
                        >
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#000', color: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', border: '2px solid #000' }}>W</div>
                            <span>{walletLoaded ? `Sử dụng WCash (${new Intl.NumberFormat('vi-VN').format(whaleCash)} W)` : 'Đang tải...'}</span>
                        </button>
                    </div>

                </div>
            ) : (
                <>
                    <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#111', padding: '4rem', border: '1px solid var(--primary)', textAlign: 'center' }}>

                        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Thông tin chuyển khoản
                        </h2>
                        <p style={{ color: '#aaa', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                            Vui lòng quét mã QR bên dưới hoặc chuyển khoản theo thông tin để hoàn tất đơn hàng. Giao dịch sẽ được duyệt tự động.
                        </p>

                        <div style={{ backgroundColor: '#fff', padding: '2rem', display: 'inline-block', marginBottom: '3rem', borderRadius: '16px' }}>
                            <img src="/qr-placeholder.jpg" alt="Techcombank QR Code" style={{ width: '300px', height: 'auto', objectFit: 'contain' }} />
                        </div>

                        <div style={{ textAlign: 'left', backgroundColor: '#000', padding: '2rem', border: '1px solid #333' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ color: '#888', display: 'block', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Ngân hàng</span>
                                <strong style={{ fontSize: '1.2rem', color: '#fff' }}>Techcombank</strong>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ color: '#888', display: 'block', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Số Tài Khoản</span>
                                <strong style={{ fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '2px' }}>77 2939 9999</strong>
                            </div>
                            <div>
                                <span style={{ color: '#888', display: 'block', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Số Tiền</span>
                                <strong style={{ fontSize: '1.5rem', color: '#fff' }}>{new Intl.NumberFormat('vi-VN').format(finalTotal)} VNĐ</strong>
                            </div>
                        </div>

                        {orderStatus === 'IDLE' && (
                            <>
                                <button onClick={handlePaymentDone} className="btn-primary" style={{ display: 'flex', width: '100%', marginTop: '3rem', padding: '16px', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    Đã Thanh Toán
                                </button>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <Link href="/" className="btn-outline" style={{ display: 'block', width: '50%', boxSizing: 'border-box', textAlign: 'center' }}>
                                        Trở về trang chủ
                                    </Link>
                                    <button
                                        onClick={handleCancelOrder}
                                        style={{
                                            width: '50%',
                                            padding: '12px 24px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #ff4d4f',
                                            color: '#ff4d4f',
                                            textTransform: 'uppercase',
                                            letterSpacing: '2px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: '0.3s'
                                        }}
                                        onMouseOver={(e: any) => { e.target.style.backgroundColor = '#ff4d4f'; e.target.style.color = '#fff'; }}
                                        onMouseOut={(e: any) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#ff4d4f'; }}
                                    >
                                        Hủy đơn
                                    </button>
                                </div>
                            </>
                        )}

                        {(orderStatus === 'PENDING' || orderStatus === 'DONE' || orderStatus === 'CANCELLED') && (
                            <div style={{ marginTop: '3rem', textAlign: 'left', backgroundColor: '#000', padding: '2rem', border: `1px dashed ${orderStatus === 'CANCELLED' ? '#ff4d4f' : 'var(--primary)'}` }}>
                                <h3 style={{ color: orderStatus === 'CANCELLED' ? '#ff4d4f' : 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {orderStatus === 'PENDING' ? (
                                        <>
                                            <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(68, 214, 44, 0.3)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            Chờ Xác Nhận
                                        </>
                                    ) : orderStatus === 'DONE' ? (
                                        <>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>✓</div>
                                            Đã Xác Nhận
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ff4d4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>✕</div>
                                            Thanh toán thất bại
                                        </>
                                    )}
                                </h3>
                                <p style={{ color: orderStatus === 'CANCELLED' ? '#ff4d4f' : '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    {orderStatus === 'PENDING'
                                        ? 'Hệ thống đang chờ Admin kiểm tra và duyệt thanh toán của bạn...'
                                        : orderStatus === 'DONE'
                                            ? 'Thanh toán thành công! Sẵn sàng nhận hàng.'
                                            : 'Thanh toán không thành công. Số tiền chuyển khoản của bạn đã sai, chúng tôi không hoàn trả trong trường hợp cố tình chuyển khoản thiếu. Vui lòng chụp màn hình bill chuyển khoản gửi Admin (Zalo - 070 830 9879).'}
                                </p>

                                <div style={{ width: '100%', height: '8px', backgroundColor: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${progress}%`,
                                        height: '100%',
                                        backgroundColor: orderStatus === 'CANCELLED' ? '#ff4d4f' : 'var(--primary)',
                                        transition: 'width 0.4s ease',
                                        boxShadow: `0 0 10px ${orderStatus === 'CANCELLED' ? '#ff4d4f' : 'var(--primary)'}`
                                    }} />
                                </div>
                                <div style={{ textAlign: 'right', color: orderStatus === 'CANCELLED' ? '#ff4d4f' : 'var(--primary)', fontSize: '0.8rem', marginTop: '8px', fontWeight: 'bold' }}>
                                    {progress}%
                                </div>
                            </div>
                        )}
                    </div>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}} />

                    <Modal
                        isOpen={modalConfig.isOpen}
                        type={modalConfig.type}
                        message={modalConfig.message}
                        onConfirm={modalConfig.onConfirm}
                        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                    />
                </>
            )}

        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense fallback={<div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '100vh', color: '#fff', textAlign: 'center' }}>Loading...</div>}>
            <CartContent />
        </Suspense>
    );
}
