'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

interface GameAccount {
    id: string;
    gameId: string;
    email: string;
    rank: string;
    heroesCount: number;
    skinsCount: number;
    loginType: string;
    notes: string;
    price: number;
    originalPrice: number | null;
    status: string;
    image: string;
    createdAt?: string;
}

export default function AccountDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [acc, setAcc] = useState<GameAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [mainLoadingError, setMainLoadingError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch(`/api/accounts/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setAcc(data);
                } else {
                    setMainLoadingError(true);
                }
                setLoading(false);
            })
            .catch(() => {
                setMainLoadingError(true);
                setLoading(false);
            });
    }, [params.id]);

    const handleAddToCart = async (redirect: boolean = true) => {
        if (!acc) return;

        try {
            const authRes = await fetch('/api/auth/me');
            const authData = await authRes.json();
            if (!authData.authenticated) {
                alert('Vui lòng đăng nhập để thêm thẻ vào giỏ hàng!');
                router.push('/login');
                return;
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra đăng nhập:', error);
            return;
        }

        let cartItems = [];
        try {
            const stored = localStorage.getItem('cartItems');
            if (stored) cartItems = JSON.parse(stored);
        } catch (e) { }

        const existing = cartItems.find((i: any) => i.id === acc.id);
        if (!existing) {
            cartItems.push({
                id: acc.id,
                name: `Acc: ${acc.gameId} (${acc.rank})`,
                price: acc.price,
                qty: 1,
                type: 'ACCOUNT'
            });
            const totalQty = cartItems.reduce((sum: number, item: any) => sum + item.qty, 0);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            localStorage.setItem('cartQty', totalQty.toString());
            window.dispatchEvent(new Event('storage'));
        }

        if (redirect) {
            router.push('/cart');
        } else {
            alert('Đã thêm vào giỏ hàng!');
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('/collection-bg.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div className="glass" style={{
                    padding: '3rem 5rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(0,255,100,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid rgba(0,255,100,0.2)',
                        borderTopColor: 'var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} className="spinner" />
                    <div style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}>
                        ĐANG TẢI TRANG...
                    </div>
                </div>
                <style jsx>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (mainLoadingError || !acc) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <div style={{ color: 'red', fontSize: '1.2rem' }}>Không tìm thấy tài khoản hoặc đã bị lỗi!</div>
            </div>
        );
    }

    const discountPercent = acc.originalPrice ? Math.round((1 - acc.price / acc.originalPrice) * 100) : 0;
    const depositAmount = acc.price * 0.1; // 10% deposit
    const mainImageUrl = acc.image || '/posts/dolia.webp';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('/collection-bg.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            color: '#fff',
            padding: '8rem 5% 5rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
                gap: '2rem',
                alignItems: 'start'
            }}>
                {/* LEFT COLUMN: IMAGES & DETAILS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Image section: Main image */}
                    <div className="glass" style={{
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: '1px solid rgba(0,255,100,0.2)'
                    }}>
                        <div style={{ width: '100%', position: 'relative' }}>
                            <img
                                src={mainImageUrl}
                                style={{ width: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                                alt="Main Acc"
                                onClick={() => setIsModalOpen(true)}
                                title="Bấm để phóng to"
                            />
                        </div>
                    </div>

                    {/* Service Details Box */}
                    <div className="glass" style={{
                        borderRadius: '16px',
                        border: '1px solid rgba(0,255,100,0.2)',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{
                            fontSize: '1.2rem',
                            color: 'var(--primary)',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            paddingBottom: '0.8rem',
                            marginBottom: '1rem',
                            fontWeight: 700
                        }}>
                            Chi tiết dịch vụ
                        </h3>
                        <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: '1rem' }}>
                            {acc.notes || 'Tài khoản Liên Quân sịn sò chờ chủ nhân mới. Cày cuốc kỹ càng, chiến mượt mọi rank.'}
                        </p>
                    </div>

                </div>

                {/* RIGHT COLUMN: ACCOUNT INFO & PURCHASE */}
                <div className="glass" style={{
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid rgba(0,255,100,0.2)'
                }}>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.4rem' }}>
                        Acc Liên Quân Vip
                    </h1>
                    <div style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600, fontFamily: 'monospace' }}>
                        Mã số: #{acc.gameId}
                    </div>

                    {/* Info Table */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', fontWeight: 600 }}>Thông tin acc</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ color: '#888' }}>Mức Rank</span>
                                <span style={{ color: '#fff', fontWeight: 600 }}>{acc.rank}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ color: '#888' }}>Đăng Ký</span>
                                <span style={{ color: '#fff', fontWeight: 600 }}>{acc.loginType}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ color: '#888' }}>Số Tướng</span>
                                <span style={{ color: '#fff', fontWeight: 600 }}>{acc.heroesCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <span style={{ color: '#888' }}>Số Skin</span>
                                <span style={{ color: '#fff', fontWeight: 600 }}>{acc.skinsCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Box */}
                    <div style={{
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--primary)', fontSize: '2.2rem', fontWeight: 800 }}>
                                {new Intl.NumberFormat('vi-VN').format(acc.price)}đ
                            </span>
                            {discountPercent > 0 && (
                                <span style={{
                                    backgroundColor: 'rgba(255,50,50,0.2)',
                                    color: '#ff4444',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 700
                                }}>
                                    -{discountPercent}%
                                </span>
                            )}
                        </div>
                        {acc.originalPrice && (
                            <div style={{ color: '#666', textDecoration: 'line-through', fontSize: '1.2rem' }}>
                                {new Intl.NumberFormat('vi-VN').format(acc.originalPrice)}đ
                            </div>
                        )}
                        <div style={{ color: '#00ff88', fontSize: '0.95rem', fontWeight: 500, opacity: 0.8, marginTop: '0.5rem' }}>
                            Sản phẩm chất lượng cao, ưu đãi tuyệt đối
                        </div>
                    </div>

                    {/* Deposit Box */}
                    <div className="glass hover-deposit" style={{
                        borderRadius: '8px',
                        padding: '1.2rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        cursor: 'pointer',
                        border: '1px solid rgba(0,255,100,0.3)',
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px' }}>
                            ĐẶT CỌC ⓘ
                        </div>
                        <div style={{ color: '#aaa', fontSize: '0.95rem' }}>
                            Đặt cọc chỉ từ {new Intl.NumberFormat('vi-VN').format(depositAmount)}đ
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => handleAddToCart(false)}
                            style={{
                                width: '65px',
                                border: '1px solid var(--primary)',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(0,255,100,0.1)',
                                color: 'var(--primary)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ShoppingCart size={22} />
                        </button>
                        <button
                            onClick={() => handleAddToCart(true)}
                            className="btn-primary"
                            style={{
                                flex: 1,
                                fontSize: '1.2rem',
                                padding: '14px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 15px rgba(0, 255, 100, 0.3)'
                            }}
                        >
                            MUA NGAY
                        </button>
                    </div>

                    {/* Separator */}
                    <div style={{ textAlign: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                        <span style={{ color: '#888', fontSize: '0.95rem', backgroundColor: '#0a0a0a', padding: '0 15px', position: 'relative', zIndex: 1, borderRadius: '20px' }}>
                            --- hoặc ---
                        </span>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            borderTop: '1px dashed rgba(255,255,255,0.2)',
                            zIndex: 0
                        }}></div>
                    </div>

                    {/* WCash Purchase */}
                    <button
                        onClick={() => handleAddToCart(true)}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #111 0%, #222 100%)',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)',
                            borderRadius: '8px',
                            padding: '16px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                        }} className="wcash-btn">
                        <span>Mua Bằng WCash</span>
                        <span style={{ fontSize: '1rem', opacity: 0.9 }}>{new Intl.NumberFormat('vi-VN').format(Math.round(acc.price / 1000))} W</span>
                    </button>

                </div>
            </div>

            <style jsx>{`
                .hover-deposit:hover {
                    background-color: rgba(0, 255, 100, 0.15) !important;
                    border-color: var(--primary) !important;
                }
                .wcash-btn:hover {
                    background: rgba(0, 255, 100, 0.1) !important;
                    box-shadow: 0 0 20px rgba(0,255,100,0.2) !important;
                }
                @media (max-width: 900px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
            {/* Image Zoom Modal */}
            {isModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        zIndex: 9999,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem'
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <img
                        src={mainImageUrl}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', border: '2px solid var(--primary)', cursor: 'zoom-out' }}
                        alt="Zoomed Acc"
                    />
                    <button
                        style={{ position: 'absolute', top: '20px', right: '30px', background: 'transparent', border: 'none', color: '#fff', fontSize: '3rem', cursor: 'pointer', opacity: 0.7 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        &times;
                    </button>
                </div>
            )}
        </div>
    );
}
