'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Eye, Bell, User, Search, CreditCard, DollarSign } from 'lucide-react';

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

    const handleAddToCart = (redirect: boolean = true) => {
        if (!acc) return;

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
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <div style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Đang tải thông tin...</div>
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
    const mainImageUrl = acc.image || '/posts/dolia.png';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0b1120', // dark navy background like shoprito
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

                    {/* Image section: Main image + left thumbnails (mocked with same image) */}
                    <div style={{
                        border: '1px solid #c7a456',
                        borderRadius: '8px',
                        padding: '1rem',
                        backgroundColor: '#111827',
                        display: 'flex',
                        gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '80px' }}>
                            <img src={mainImageUrl} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', border: '2px solid #c7a456', borderRadius: '4px', cursor: 'pointer' }} alt="Thumb 1" />
                            <img src={mainImageUrl} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', border: '2px solid transparent', borderRadius: '4px', cursor: 'pointer', opacity: 0.6 }} alt="Thumb 2" />
                            <img src={mainImageUrl} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', border: '2px solid transparent', borderRadius: '4px', cursor: 'pointer', opacity: 0.6 }} alt="Thumb 3" />
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <img src={mainImageUrl} style={{ width: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #334155' }} alt="Main Acc" />
                        </div>
                    </div>

                    {/* Service Details Box */}
                    <div style={{
                        border: '1px solid #c7a456',
                        borderRadius: '8px',
                        backgroundColor: '#111827',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{
                            fontSize: '1.1rem',
                            color: '#60a5fa',
                            borderBottom: '1px solid #1e293b',
                            paddingBottom: '0.8rem',
                            marginBottom: '1rem',
                            fontWeight: 600
                        }}>
                            Chi tiết dịch vụ
                        </h3>
                        <p style={{ color: '#60a5fa', lineHeight: 1.6, fontSize: '0.95rem' }}>
                            {acc.notes || 'Tài khoản Liên Quân sịn sò chờ chủ nhân mới. Bao lỗi 1 đổi 1.'}
                        </p>
                    </div>

                </div>

                {/* RIGHT COLUMN: ACCOUNT INFO & PURCHASE */}
                <div style={{
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    backgroundColor: '#111827',
                    padding: '1.8rem'
                }}>
                    <h1 style={{ fontSize: '1.6rem', color: '#60a5fa', fontWeight: 700, marginBottom: '0.4rem' }}>
                        Acc Liên Quân Vip
                    </h1>
                    <div style={{ color: '#e2e8f0', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                        Mã số: #{acc.gameId}
                    </div>

                    {/* Info Table */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#f8fafc', fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Thông tin acc</h4>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                                <span style={{ color: '#38bdf8' }}>Mức Rank</span>
                                <span style={{ color: '#94a3b8' }}>{acc.rank}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                                <span style={{ color: '#38bdf8' }}>Đăng Ký</span>
                                <span style={{ color: '#94a3b8' }}>{acc.loginType}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                                <span style={{ color: '#38bdf8' }}>Số Tướng</span>
                                <span style={{ color: '#94a3b8' }}>{acc.heroesCount}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                                <span style={{ color: '#38bdf8' }}>Số Skin</span>
                                <span style={{ color: '#94a3b8' }}>{acc.skinsCount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Box */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            {acc.originalPrice && (
                                <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '1.1rem' }}>
                                    {new Intl.NumberFormat('vi-VN').format(acc.originalPrice)}đ
                                </span>
                            )}
                            <span style={{ color: '#ec4899', fontSize: '2rem', fontWeight: 800 }}>
                                {new Intl.NumberFormat('vi-VN').format(acc.price)}đ
                            </span>
                            {discountPercent > 0 && (
                                <span style={{
                                    backgroundColor: '#fbcfe8',
                                    color: '#be185d',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                }}>
                                    -{discountPercent}%
                                </span>
                            )}
                        </div>
                        <div style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: 500 }}>
                            Rẻ vô đối, giá tốt nhất thị trường
                        </div>
                    </div>

                    {/* Deposit Box */}
                    <div style={{
                        border: '1px solid #c7a456',
                        borderRadius: '6px',
                        padding: '1rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }} className="hover-deposit">
                        <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                            ĐẶT CỌC ⓘ
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                            Đặt cọc chỉ từ {new Intl.NumberFormat('vi-VN').format(depositAmount)}đ
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => handleAddToCart(false)}
                            style={{
                                width: '60px',
                                border: '1px solid #c7a456',
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                color: '#c7a456',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ShoppingCart size={20} />
                        </button>
                        <button
                            onClick={() => handleAddToCart(true)}
                            style={{
                                flex: 1,
                                backgroundColor: '#fcd34d',
                                color: '#92400e',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Mua Ngay
                        </button>
                    </div>

                    {/* Separator */}
                    <div style={{ textAlign: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem', backgroundColor: '#111827', padding: '0 10px', position: 'relative', zIndex: 1 }}>
                            --- hoặc ---
                        </span>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            borderTop: '1px dashed #334155',
                            zIndex: 0
                        }}></div>
                    </div>

                    {/* ATM/Momo Purchase */}
                    <button style={{
                        width: '100%',
                        backgroundColor: '#f472b6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '14px',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        transition: 'backgroundColor 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span>Mua Bằng ATM, Momo</span>
                        <span style={{ fontSize: '0.9rem' }}>{new Intl.NumberFormat('vi-VN').format(acc.price)} Đ</span>
                    </button>

                </div>
            </div>

            <style jsx>{`
                .hover-deposit:hover {
                    background-color: rgba(199, 164, 86, 0.1);
                }
                @media (max-width: 900px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
