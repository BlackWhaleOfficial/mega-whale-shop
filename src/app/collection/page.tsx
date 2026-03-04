'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

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
    bannerTag: string | null;
    image: string;
    createdAt?: string;
}

const GachaTab = ({ activeTab, banners, currentBanner, setCurrentBanner, setShowBannerInfo, handleGacha, gachaLoading }: any) => {
    if (activeTab !== 'gacha') return null;
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'clamp(250px, 35vw, 450px)',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {banners.map((src: string, index: number) => {
                        const isActive = index === currentBanner;
                        const isNext = index === (currentBanner + 1) % banners.length;

                        let style: any = {
                            position: 'absolute',
                            transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            width: isActive ? '75%' : '55%',
                            zIndex: isActive ? 10 : 1,
                            opacity: isActive ? 1 : 0.4,
                            filter: isActive ? 'none' : 'blur(3px)',
                            transform: isActive
                                ? 'translateX(0) scale(1)'
                                : (isNext ? 'translateX(90%) scale(0.85)' : 'translateX(-90%) scale(0.85)'),
                            cursor: 'pointer',
                            boxShadow: isActive ? '0 10px 40px rgba(0,0,0,0.8)' : 'none'
                        };

                        return (
                            <div key={src} style={style} onClick={() => isActive ? setShowBannerInfo(true) : setCurrentBanner(index)}>
                                <div style={{ position: 'relative', width: '100%', height: '100%', aspectRatio: '21/9' }}>
                                    <Image src={src} fill style={{ objectFit: 'cover' }} alt="Gacha Banner" priority={isActive} unoptimized />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 11 }}>
                    {banners.map((_: any, index: number) => (
                        <div
                            key={index}
                            onClick={() => setCurrentBanner(index)}
                            style={{
                                width: index === currentBanner ? '30px' : '10px',
                                height: '10px',
                                borderRadius: '5px',
                                backgroundColor: index === currentBanner ? '#00ff88' : 'rgba(255, 255, 255, 0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        />
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    onClick={() => handleGacha('FREE')}
                    disabled={gachaLoading}
                    style={{
                        padding: '1.5rem 3rem',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        backgroundColor: '#e9c46a',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: gachaLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 10px 20px rgba(233,196,106,0.3)',
                        opacity: gachaLoading ? 0.7 : 1,
                        transition: 'all 0.3s'
                    }}
                >
                    Test nhân phẩm (FREE)
                </button>
                <button
                    onClick={() => handleGacha('PAID')}
                    disabled={gachaLoading}
                    style={{
                        padding: '1.5rem 4rem',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        backgroundColor: '#e9c46a',
                        color: '#000',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: gachaLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 10px 20px rgba(233,196,106,0.3)',
                        opacity: gachaLoading ? 0.7 : 1,
                        transition: 'all 0.3s'
                    }}
                >
                    1x ( 9 WCash )
                </button>
            </div>
        </div>
    );
};

export default function CollectionPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<GameAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('price-desc');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [activeTab, setActiveTab] = useState('collection');
    const [isGachaPlaying, setIsGachaPlaying] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const [gachaResult, setGachaResult] = useState<GameAccount | null>(null);
    const [gachaVideoSrc, setGachaVideoSrc] = useState('');
    const [gachaType, setGachaType] = useState<'FREE' | 'PAID'>('FREE');
    const [gachaLoading, setGachaLoading] = useState(false);

    const banners = [
        'https://drive.google.com/uc?export=view&id=12JVrwNpcT8MEDdw3ftuKdxt9kp3YYVMf',
        'https://drive.google.com/uc?export=view&id=1rEqbvpHmzDehkK0o2PRHvDYUWda7IM-2',
        'https://drive.google.com/uc?export=view&id=1dFsjMj38r1X5H5HKEFXRutUj0uNPVxAg'
    ];
    const bannerNames = ['Nhật Nguyệt Thánh Linh', 'Hỗn Độn Thần Ma', 'Mộng Giới Thần Chủ'];
    const [currentBanner, setCurrentBanner] = useState(0);
    const [showBannerInfo, setShowBannerInfo] = useState(false);

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

    const handleGacha = async (type: 'FREE' | 'PAID') => {
        if (gachaLoading) return;
        setGachaLoading(true);
        setGachaType(type);
        setGachaResult(null);
        setVideoEnded(false);

        try {
            const res = await fetch('/api/gacha/pull', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Có lỗi xảy ra khi gacha!');
                setGachaLoading(false);
                return;
            }

            const video = Math.random() > 0.5 ? '/gacha1.mp4' : '/gacha2.mp4';
            setGachaVideoSrc(video);
            setIsGachaPlaying(true);
            setGachaResult(data.account);
        } catch (e) {
            alert('Lỗi kết nối gacha!');
        }
        setGachaLoading(false);
    };

    const handleGachaAction = async (action: 'CLAIM' | 'SELL') => {
        if (!gachaResult) return;
        try {
            const res = await fetch('/api/gacha/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, accountId: gachaResult.id })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Có lỗi xảy ra!');
                return;
            }
            if (action === 'SELL') {
                alert(`Đã bán thành công. Bạn được hoàn ${data.refund} WCash!`);
            } else {
                alert('Tài khoản Gacha đã được cập nhật vào trạng thái giao dịch của bạn thành công!');
            }
            setIsGachaPlaying(false);
            setVideoEnded(false);
            setGachaResult(null);
            window.location.reload();
        } catch (e) {
            alert('Lỗi kết nối!');
        }
    };

    const allFilteredAccounts = accounts
        .filter(acc =>
            acc.gameId.toLowerCase().includes(search.toLowerCase()) ||
            acc.rank.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'oldest') return new Date(a.createdAt as any).getTime() - new Date(b.createdAt as any).getTime();
            return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
        });

    const totalPages = Math.ceil(allFilteredAccounts.length / itemsPerPage);
    const paginatedAccounts = allFilteredAccounts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, sortBy]);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('/collection-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '10rem 5% 5rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <button onClick={() => setActiveTab('gacha')} style={{ padding: '1.5rem', fontSize: '1.4rem', fontWeight: 800, backgroundColor: activeTab === 'gacha' ? '#e9c46a' : 'transparent', color: activeTab === 'gacha' ? '#000' : '#888', border: '3px solid #e9c46a', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s ease', textTransform: 'uppercase', boxShadow: activeTab === 'gacha' ? '0 0 30px rgba(233,196,106,0.3)' : 'none' }}>NGUYỆN ƯỚC BIỂN CẢ</button>
                <button onClick={() => setActiveTab('collection')} style={{ padding: '1.5rem', fontSize: '1.4rem', fontWeight: 800, backgroundColor: activeTab === 'collection' ? '#e9c46a' : 'transparent', color: activeTab === 'collection' ? '#000' : '#888', border: '3px solid #e9c46a', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s ease', textTransform: 'uppercase', boxShadow: activeTab === 'collection' ? '0 0 30px rgba(233,196,106,0.3)' : 'none' }}>Bộ Sưu Tập</button>
            </div>

            {activeTab === 'collection' ? (
                <div>
                    <div className="glass" style={{ maxWidth: '1200px', margin: '0 auto 3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Sắp xếp theo:</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price-asc">Giá từ thấp đến cao</option>
                                <option value="price-desc">Giá từ cao đến thấp</option>
                            </select>
                        </div>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={18} />
                            <input type="text" placeholder="Tìm kiếm theo ID, Rank..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass-input" style={{ width: '100%', padding: '10px 15px 10px 40px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--primary)' }}>Đang tải danh sách...</div>
                    ) : paginatedAccounts.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                            {paginatedAccounts.map(acc => (
                                <div key={acc.id} className="glass-card img-optimize" style={{ overflow: 'hidden', padding: 0, cursor: 'pointer' }} onClick={() => router.push(`/acc/${acc.gameId}`)}>
                                    <div style={{ height: '180px', backgroundColor: '#000', position: 'relative' }}>
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Image src={acc.image || '/posts/dolia.png'} alt="Acc Preview" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" unoptimized />
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'var(--primary)', color: '#000', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>LIÊN QUÂN</div>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>Liên Quân Hàng Tuyển</h3>
                                        <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1rem', fontFamily: 'monospace' }}>ID: #{acc.gameId}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span style={{ color: '#666' }}>Mức Rank:</span><span style={{ color: '#fff', fontWeight: 600 }}>{acc.rank}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span style={{ color: '#666' }}>Số Tướng:</span><span style={{ color: '#fff', fontWeight: 600 }}>{acc.heroesCount}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span style={{ color: '#666' }}>Số Skin:</span><span style={{ color: '#fff', fontWeight: 600 }}>{acc.skinsCount}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span style={{ color: '#666' }}>Đăng ký:</span><span style={{ color: '#fff', fontWeight: 600 }}>{acc.loginType}</span></div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ color: 'var(--primary)', fontSize: '1.3rem', fontWeight: 800 }}>{new Intl.NumberFormat('vi-VN').format(acc.price)}đ</span>
                                                {acc.originalPrice && <span style={{ color: '#555', fontSize: '0.85rem', textDecoration: 'line-through' }}>{new Intl.NumberFormat('vi-VN').format(acc.originalPrice)}đ</span>}
                                            </div>
                                            {acc.originalPrice && <div style={{ backgroundColor: '#ff4d4f', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>-{Math.round((1 - acc.price / acc.originalPrice) * 100)}%</div>}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); router.push(`/acc/${acc.gameId}`); }} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: '6px' }}>MUA NGAY</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass" style={{ maxWidth: '800px', margin: '5rem auto', textAlign: 'center', padding: '4rem 2rem', border: '1px solid var(--primary)', borderRadius: '24px' }}>
                            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Khách đã săn hết Tài Khoản.</h2>
                            <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: 1.6 }}>Whale còn nhiều tài khoản lắm mà không đăng hết. <br />Nhấn <a href="https://www.facebook.com/MegaWhaleAOV" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 700 }}>Hỗ Trợ</a> để tìm acc theo yêu cầu.</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '4rem' }}>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '10px', backgroundColor: currentPage === 1 ? '#222' : 'var(--primary)', border: 'none', borderRadius: '50%', cursor: currentPage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', color: '#000' }}><ChevronLeft size={20} /></button>
                            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Trang {currentPage} / {totalPages}</div>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '10px', backgroundColor: currentPage === totalPages ? '#222' : 'var(--primary)', border: 'none', borderRadius: '50%', cursor: currentPage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', color: '#000' }}><ChevronRight size={20} /></button>
                        </div>
                    )}
                </div>
            ) : (
                <GachaTab activeTab={activeTab} banners={banners} currentBanner={currentBanner} setCurrentBanner={setCurrentBanner} setShowBannerInfo={setShowBannerInfo} handleGacha={handleGacha} gachaLoading={gachaLoading} />
            )}

            {isGachaPlaying && !videoEnded && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <video src={gachaVideoSrc} autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} onEnded={() => setVideoEnded(true)} onClick={() => setVideoEnded(true)} />
                    <button onClick={() => setVideoEnded(true)} style={{ position: 'absolute', top: '20px', right: '30px', padding: '10px 20px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #fff', borderRadius: '8px', cursor: 'pointer' }}>Bỏ qua</button>
                </div>
            )}

            {isGachaPlaying && videoEnded && gachaResult && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }}>
                    <div className="glass" style={{ width: '90%', maxWidth: '450px', padding: '2.5rem', borderRadius: '20px', border: '2px solid #e9c46a', backgroundColor: '#0a0a0a', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', boxShadow: '0 0 50px rgba(233,196,106,0.2)' }}>
                        <h2 style={{ color: '#e9c46a', fontSize: '2.2rem', margin: '0 0 1rem 0', fontWeight: 800 }}>Kết Quả Gacha</h2>
                        <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                                <Image src={gachaResult.image || '/posts/dolia.png'} fill style={{ objectFit: 'cover' }} alt="Gacha Result" unoptimized />
                            </div>
                            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'var(--primary)', color: '#000', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>Liên Quân Hàng Tuyển</div>
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>Mã Acc</span>
                            <span style={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>#{gachaResult.gameId}</span>
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>Rank</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>{gachaResult.rank}</span>
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>Tướng / Skin</span>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{gachaResult.heroesCount} / {gachaResult.skinsCount}</span>
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                            <span style={{ color: '#888', fontSize: '0.9rem' }}>Trị giá</span>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{new Intl.NumberFormat('vi-VN').format(gachaResult.price)}đ</span>
                        </div>
                        <div style={{ width: '100%', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            {gachaType === 'FREE' ? (
                                <>
                                    <button style={{ flex: 1, padding: '12px', background: '#e9c46a', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => { setIsGachaPlaying(false); handleGacha('FREE'); }}>Thử lại nữa</button>
                                    <button style={{ flex: 1, padding: '12px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => { setIsGachaPlaying(false); setVideoEnded(false); }}>Thoát ra</button>
                                </>
                            ) : (
                                <>
                                    <button style={{ flex: 1, padding: '15px', background: '#e9c46a', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleGachaAction('CLAIM')}>Nhận</button>
                                    <button style={{ flex: 1, padding: '15px', background: 'rgba(255,80,80,0.2)', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleGachaAction('SELL')}>Bán (Hoàn 4 WCash)</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showBannerInfo && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowBannerInfo(false)}>
                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', maxWidth: '600px', width: '90%', position: 'relative', border: '1px solid rgba(255,255,255,0.2)', cursor: 'default' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowBannerInfo(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Thông tin chi tiết banner</h2>
                        <h3 style={{ color: '#fff', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.4rem' }}>{bannerNames[currentBanner]}</h3>
                        <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h4 style={{ color: '#00ff88', marginBottom: '10px' }}>Thể lệ:</h4>
                            <ul style={{ color: '#ccc', lineHeight: '1.8', marginLeft: '20px' }}>
                                <li><strong>Test Nhân Phẩm (FREE):</strong> Không tốn phí đồng thời KHÔNG nhận được bất kỳ vật phẩm gì.</li>
                                <li><strong>1x (9 WCash):</strong> Tốn 9 WCash. Nhận acc ngẫu nhiên theo tỷ lệ. Có thể nhận lên đến acc Full Skin.</li>
                                <li><strong>Ước đủ 150 lần:</strong> Chắc chắn nhận 1 acc REG có sẵn Skin SSS trong banner.</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h4 style={{ color: '#ffb800', marginBottom: '10px' }}>Tỷ lệ:</h4>
                            <ul style={{ color: '#ccc', lineHeight: '1.8', marginLeft: '20px' }}>
                                <li>Acc Full Skin <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>(0.0001%)</span></li>
                                <li>Acc REG có sẵn skin SSS trong Banner <span style={{ color: '#ffb800', fontWeight: 'bold' }}>(0.9%)</span></li>
                                <li>Acc REG ngẫu nhiên <span style={{ color: 'var(--primary)' }}>(99%)</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
