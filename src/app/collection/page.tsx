'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Filter } from 'lucide-react';

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

export default function CollectionPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<GameAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('price-desc');

    useEffect(() => {
        fetch('/api/accounts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAccounts(data.filter(acc => acc.status === 'AVAILABLE'));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredAccounts = accounts
        .filter(acc =>
            acc.gameId.toLowerCase().includes(search.toLowerCase()) ||
            acc.rank.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'oldest') return new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime();
            return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime(); // newest
        });

    const handleAddToCart = (acc: GameAccount) => {
        let cartItems = [];
        try {
            const stored = localStorage.getItem('cartItems');
            if (stored) cartItems = JSON.parse(stored);
        } catch (e) { }

        const existing = cartItems.find((i: any) => i.id === acc.id);
        if (existing) {
            // Accounts are unique, usually quantity 1
            router.push('/cart');
            return;
        }

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
        router.push('/cart');
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('/collection-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '10rem 5% 5rem'
        }}>
            {/* Filter Bar */}
            <div className="glass" style={{
                maxWidth: '1200px',
                margin: '0 auto 3rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderRadius: '20px',
            }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Sắp xếp theo:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            backgroundColor: '#111',
                            color: '#fff',
                            border: '1px solid #333',
                            padding: '8px 15px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="price-asc">Giá từ thấp đến cao</option>
                        <option value="price-desc">Giá từ cao đến thấp</option>
                    </select>
                </div>

                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo ID, Rank..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="glass-input"
                        style={{
                            width: '100%',
                            padding: '10px 15px 10px 40px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--primary)' }}>Đang tải danh sách...</div>
            ) : filteredAccounts.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {filteredAccounts.map(acc => (
                        <div key={acc.id} className="glass-card" style={{
                            overflow: 'hidden',
                            cursor: 'pointer'
                        }} onClick={() => router.push(`/acc/${acc.gameId}`)}>
                            <div style={{ height: '180px', backgroundColor: '#000', position: 'relative' }}>
                                <img src={acc.image || '/posts/dolia.png'} alt="Acc Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    backgroundColor: 'var(--primary)',
                                    color: '#000',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800
                                }}>
                                    LIÊN QUÂN
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>Liên Quân Hàng Tuyển</h3>
                                <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1rem', fontFamily: 'monospace' }}>ID: #{acc.gameId}</div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#666' }}>Mức Rank:</span>
                                        <span style={{ color: '#fff', fontWeight: 600 }}>{acc.rank}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#666' }}>Số Tướng:</span>
                                        <span style={{ color: '#fff', fontWeight: 600 }}>{acc.heroesCount}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#666' }}>Số Skin:</span>
                                        <span style={{ color: '#fff', fontWeight: 600 }}>{acc.skinsCount}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#666' }}>Đăng ký:</span>
                                        <span style={{ color: '#fff', fontWeight: 600 }}>{acc.loginType}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: 'var(--primary)', fontSize: '1.3rem', fontWeight: 800 }}>
                                            {new Intl.NumberFormat('vi-VN').format(acc.price)}đ
                                        </span>
                                        {acc.originalPrice && (
                                            <span style={{ color: '#555', fontSize: '0.85rem', textDecoration: 'line-through' }}>
                                                {new Intl.NumberFormat('vi-VN').format(acc.originalPrice)}đ
                                            </span>
                                        )}
                                    </div>
                                    {acc.originalPrice && (
                                        <div style={{
                                            backgroundColor: '#ff4d4f',
                                            color: '#fff',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}>
                                            -{Math.round((1 - acc.price / acc.originalPrice) * 100)}%
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); router.push(`/acc/${acc.gameId}`); }}
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: '6px' }}
                                >
                                    MUA NGAY
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass" style={{
                    maxWidth: '800px',
                    margin: '5rem auto',
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    border: '1px solid var(--primary)',
                    borderRadius: '24px'
                }}>
                    <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Khách đã săn hết Tài Khoản.</h2>
                    <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Whale còn nhiều tài khoản lắm mà không đăng hết. <br />
                        Nhấn <a href="https://www.facebook.com/MegaWhaleAOV" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 700 }}>Hỗ Trợ</a> để tìm acc theo yêu cầu.
                    </p>
                </div>
            )}
        </div>
    );
}
