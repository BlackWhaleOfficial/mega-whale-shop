'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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

const GachaTab = ({ activeTab, banners, bannerNames, currentBanner, setCurrentBanner, setShowBannerInfo, handleGacha, gachaLoading, rollCounts }: any) => {
    if (activeTab !== 'gacha') return null;

    const paginate = (newDirection: number) => {
        let nextIndex = currentBanner + newDirection;
        if (nextIndex < 0) nextIndex = banners.length - 1;
        if (nextIndex >= banners.length) nextIndex = 0;
        setCurrentBanner(nextIndex);
    };

    const bannerName = bannerNames[currentBanner];
    const currentRolls = rollCounts.find((r: any) => r.bannerName === bannerName)?.count || 0;
    const rollsLeft = 150 - (currentRolls % 150);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '0 10px' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'clamp(280px, 45vw, 550px)',
                    width: '100%',
                    position: 'relative',
                    perspective: '1000px',
                    padding: '20px 0'
                }}>
                    <AnimatePresence initial={false}>
                        {banners.map((src: string, index: number) => {
                            const offset = index - currentBanner;
                            // Handle circular offset
                            let normalizedOffset = offset;
                            if (offset > 1) normalizedOffset = offset - banners.length;
                            if (offset < -1) normalizedOffset = offset + banners.length;

                            const isActive = normalizedOffset === 0;
                            const isSide = Math.abs(normalizedOffset) === 1;

                            if (!isActive && !isSide) return null;

                            return (
                                <motion.div
                                    key={src}
                                    style={{
                                        position: 'absolute',
                                        width: isActive ? 'clamp(90%, 80vw, 850px)' : 'clamp(60%, 50vw, 500px)',
                                        zIndex: isActive ? 10 : 5,
                                        borderRadius: '32px',
                                        overflow: 'hidden',
                                        cursor: isActive ? 'pointer' : 'pointer',
                                        boxShadow: isActive ? '0 20px 80px rgba(233,196,106,0.3)' : '0 10px 30px rgba(0,0,0,0.5)',
                                        border: isActive ? '2px solid rgba(233,196,106,0.5)' : '1px solid rgba(255,255,255,0.1)'
                                    }}
                                    initial={false}
                                    animate={{
                                        x: normalizedOffset * (isActive ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 85 : 95)) + '%',
                                        scale: isActive ? 1 : 0.85,
                                        rotateY: normalizedOffset * -15,
                                        opacity: isActive ? 1 : 0.4,
                                        filter: isActive ? 'none' : 'blur(4px)',
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 260,
                                        damping: 25
                                    }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x < -50) paginate(1);
                                        if (info.offset.x > 50) paginate(-1);
                                    }}
                                    onClick={() => isActive ? setShowBannerInfo(true) : setCurrentBanner(index)}
                                >
                                    <div style={{ position: 'relative', width: '100%', aspectRatio: '21/9' }}>
                                        <Image src={src} fill style={{ objectFit: 'cover' }} alt="Gacha Banner" priority={isActive} unoptimized />
                                        {isActive && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                padding: '2rem',
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-end'
                                            }}>
                                                <div style={{ color: '#fff' }}>
                                                    <div style={{ fontSize: '0.9rem', color: '#e9c46a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>BANNER HIỆN TẠI</div>
                                                    <div style={{ fontSize: 'clamp(1rem, 4vw, 1.8rem)', fontWeight: 900, textTransform: 'uppercase' }}>{bannerNames[currentBanner]}</div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 15px', borderRadius: '12px', backdropFilter: 'blur(10px)', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Chi tiết ⓘ</div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <button
                        onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                        style={{ position: 'absolute', left: '2%', zIndex: 15, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '12px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); paginate(1); }}
                        style={{ position: 'absolute', right: '2%', zIndex: 15, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '12px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 11 }}>
                    {banners.map((_: any, index: number) => (
                        <div
                            key={index}
                            onClick={() => setCurrentBanner(index)}
                            style={{
                                width: index === currentBanner ? '40px' : '12px',
                                height: '6px',
                                borderRadius: '3px',
                                backgroundColor: index === currentBanner ? '#e9c46a' : 'rgba(255, 255, 255, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        />
                    ))}
                </div>
            </div>

            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'center', width: '100%', maxWidth: '600px', backdropFilter: 'blur(10px)' }}>
                <div style={{ color: '#fff', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700 }}>Tích lũy: <span style={{ color: '#e9c46a', textShadow: '0 0 10px rgba(233,196,106,0.5)' }}>{currentRolls}</span> lượt quay</div>
                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '6px', letterSpacing: '0.5px' }}>Còn <span style={{ color: '#fff' }}>{rollsLeft}</span> lượt nữa chắc chắn nhận <span style={{ color: '#e9c46a', fontWeight: 700 }}>REG Skin SSS</span> (Sao Hộ Mệnh)</div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                <button
                    onClick={() => handleGacha('FREE', 1)}
                    disabled={gachaLoading}
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '1.3rem 1rem',
                        fontSize: 'clamp(0.85rem, 3.5vw, 1.1rem)',
                        fontWeight: 900,
                        backgroundColor: '#fff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '16px',
                        cursor: gachaLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        opacity: gachaLoading ? 0.7 : 1,
                        transition: 'all 0.3s',
                        textTransform: 'uppercase'
                    }}
                >
                    Test nhân phẩm (FREE)
                </button>
                <button
                    onClick={() => handleGacha('PAID', 1)}
                    disabled={gachaLoading}
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '1.3rem 1rem',
                        fontSize: 'clamp(0.85rem, 3.5vw, 1.1rem)',
                        fontWeight: 900,
                        backgroundColor: '#e9c46a',
                        color: '#000',
                        border: 'none',
                        borderRadius: '16px',
                        cursor: gachaLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 10px 30px rgba(233,196,106,0.3)',
                        opacity: gachaLoading ? 0.7 : 1,
                        transition: 'all 0.3s',
                        textTransform: 'uppercase'
                    }}
                >
                    1x ( 10 WCash )
                </button>
                <button
                    onClick={() => handleGacha('PAID', 10)}
                    disabled={gachaLoading}
                    style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '1.3rem 1rem',
                        fontSize: 'clamp(0.85rem, 3.5vw, 1.1rem)',
                        fontWeight: 900,
                        backgroundColor: '#000',
                        color: '#e9c46a',
                        border: '2px solid #e9c46a',
                        borderRadius: '16px',
                        cursor: gachaLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 10px 30px rgba(233,196,106,0.1)',
                        opacity: gachaLoading ? 0.7 : 1,
                        transition: 'all 0.3s',
                        textTransform: 'uppercase'
                    }}
                >
                    10x ( 90 WCash )
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
    const [gachaResults, setGachaResults] = useState<GameAccount[]>([]);
    const [gachaVideoSrc, setGachaVideoSrc] = useState('');
    const [gachaType, setGachaType] = useState<'FREE' | 'PAID'>('FREE');
    const [gachaLoading, setGachaLoading] = useState(false);
    const [imagesPreloaded, setImagesPreloaded] = useState(false);

    const banners = ['/banner1.png', '/banner2.png', '/banner3.png?v=2026'];
    const bannerNames = ['Mộng Giới Thần Chủ', 'Nhật Nguyệt Thánh Linh', 'Hỗn Độn Thần Ma'];
    const [currentBanner, setCurrentBanner] = useState(0);
    const [showBannerInfo, setShowBannerInfo] = useState(false);
    const [popupInfo, setPopupInfo] = useState<{ message: string, onOk?: () => void } | null>(null);

    const [rollCounts, setRollCounts] = useState<any[]>([]);

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

        // Fetch roll counts
        fetch('/api/gacha/rolls')
            .then(res => res.json())
            .then(data => {
                if (data.rolls) setRollCounts(data.rolls);
            })
            .catch(() => { });
    }, []);

    const handleGacha = async (type: 'FREE' | 'PAID', count: number = 1) => {
        if (gachaLoading) return;
        setGachaLoading(true);
        setGachaType(type);
        setGachaResult(null);
        setGachaResults([]);
        setVideoEnded(false);
        setImagesPreloaded(false);

        // 🎬 Phát video NGAY LẬP TỨC để act như loading screen cho siêu mượt
        const videoBase = `/gacha${currentBanner + 1}`;
        setGachaVideoSrc(videoBase);
        setIsGachaPlaying(true);

        // ⏱ Delay 2 giây để video chiếu đẹp rồi mới gọi API ngầm
        setTimeout(async () => {
            try {
                const res = await fetch('/api/gacha/pull', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, bannerIndex: currentBanner, count })
                });
                const data = await res.json();

                if (res.status === 401 && type === 'PAID') {
                    setIsGachaPlaying(false);
                    setGachaLoading(false);
                    router.push('/login');
                    return;
                }

                if (!res.ok) {
                    setIsGachaPlaying(false);
                    setPopupInfo({ message: data.error || 'Có lỗi xảy ra khi gacha!', onOk: () => setGachaLoading(false) });
                    return;
                }

                // Update roll counts if paid
                if (type === 'PAID') {
                    const updatedRolls = [...rollCounts];
                    const bannerName = bannerNames[currentBanner];
                    const idx = updatedRolls.findIndex((r: any) => r.bannerName === bannerName);
                    if (idx > -1) {
                        updatedRolls[idx].count = data.rollCount;
                    } else {
                        updatedRolls.push({ bannerName, count: data.rollCount });
                    }
                    setRollCounts(updatedRolls);
                }

                const accountList = data.accounts || (data.account ? [data.account] : []);
                if (data.accounts) {
                    setGachaResults(data.accounts);
                    setGachaResult(data.accounts[0]); // Best/First for primary display
                } else {
                    setGachaResult(data.account);
                }
                setGachaLoading(false);

                // ✅ Preload ảnh sau khi API tải xong
                const imageUrls = accountList.map((a: GameAccount) => a.image).filter(Boolean);
                if (imageUrls.length > 0) {
                    let loaded = 0;
                    const fallbackTimer = setTimeout(() => setImagesPreloaded(true), 3000);
                    imageUrls.forEach((url: string) => {
                        const img = new window.Image();
                        img.onload = img.onerror = () => {
                            loaded++;
                            if (loaded === imageUrls.length) {
                                clearTimeout(fallbackTimer);
                                setImagesPreloaded(true);
                            }
                        };
                        img.src = url;
                    });
                } else {
                    setImagesPreloaded(true);
                }
            } catch (e) {
                setIsGachaPlaying(false);
                setPopupInfo({ message: 'Lỗi kết nối gacha!', onOk: () => setGachaLoading(false) });
            }
        }, 2000);
    };

    const handleGachaAction = async (action: 'CLAIM' | 'SELL', accId?: string) => {
        const idToProcess = accId || gachaResult?.id;
        if (!idToProcess) return;

        try {
            const isTenPull = gachaResults.length > 1;
            const res = await fetch('/api/gacha/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    accountId: idToProcess,
                    isTenPull,
                    bannerName: bannerNames[currentBanner] // cho pity reset
                })
            });
            const data = await res.json();

            if (!res.ok) {
                setPopupInfo({ message: data.error || 'Có lỗi xảy ra!' });
                return;
            }

            // Helper: trở về tab gacha và re-fetch roll counts
            const returnToGacha = () => {
                setIsGachaPlaying(false);
                setVideoEnded(false);
                setGachaResult(null);
                setGachaResults([]);
                setImagesPreloaded(false);
                setActiveTab('gacha');
                // Re-fetch roll counts để cập nhật số pity mới
                fetch('/api/gacha/rolls')
                    .then(r => r.json())
                    .then(d => { if (d.rolls) setRollCounts(d.rolls); })
                    .catch(() => { });
            };

            if (gachaResults.length > 1) {
                const onOkCallback = () => {
                    setGachaResults(prev => {
                        const next = prev.filter(a => a.id !== idToProcess);
                        if (next.length <= 1) returnToGacha();
                        return next;
                    });
                };

                if (action === 'SELL') {
                    setPopupInfo({ message: `Đã bán thành công. Bạn được hoàn ${data.refund} WCash!`, onOk: onOkCallback });
                } else {
                    setPopupInfo({ message: 'Đã nhận tài khoản thành công!', onOk: onOkCallback });
                }
            } else {
                if (action === 'SELL') {
                    setPopupInfo({ message: `Đã bán thành công. Bạn được hoàn ${data.refund} WCash!`, onOk: returnToGacha });
                } else {
                    setPopupInfo({ message: 'Tài khoản Gacha đã được nhận thành công!', onOk: returnToGacha });
                }
            }
        } catch (e) {
            setPopupInfo({ message: 'Lỗi kết nối!' });
        }
    };

    const handleBulkAction = async (action: 'CLAIM_ALL' | 'SELL_ALL') => {
        if (gachaResults.length === 0) return;
        const accountIds = gachaResults.map(a => a.id);

        try {
            const res = await fetch('/api/gacha/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    accountIds,
                    bannerName: bannerNames[currentBanner] // cho pity reset
                })
            });
            const data = await res.json();

            if (!res.ok) {
                setPopupInfo({ message: data.error || 'Có lỗi xảy ra!' });
                return;
            }

            const returnToGacha = () => {
                setIsGachaPlaying(false);
                setVideoEnded(false);
                setGachaResults([]);
                setImagesPreloaded(false);
                setActiveTab('gacha');
                fetch('/api/gacha/rolls')
                    .then(r => r.json())
                    .then(d => { if (d.rolls) setRollCounts(d.rolls); })
                    .catch(() => { });
            };

            if (action === 'SELL_ALL') {
                setPopupInfo({ message: `Đã bán thành công. Bạn được hoàn ${data.refund} WCash!`, onOk: returnToGacha });
            } else {
                setPopupInfo({ message: 'Đã nhận tất cả tài khoản thành công!', onOk: returnToGacha });
            }
        } catch (e) {
            setPopupInfo({ message: 'Lỗi kết nối!' });
        }
    };

    const allFilteredAccounts = accounts
        .filter(acc => {
            // Hide REG and REG SSS from collection list
            if (acc.bannerTag === 'REG' || acc.bannerTag === 'REG có sẵn skin SSS' || acc.bannerTag?.startsWith('REG SSS banner')) return false;

            return acc.gameId.toLowerCase().includes(search.toLowerCase()) ||
                acc.rank.toLowerCase().includes(search.toLowerCase());
        })
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
            <div style={{ maxWidth: '1200px', margin: '0 auto 3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button
                    onClick={() => setActiveTab('gacha')}
                    style={{
                        padding: '1.2rem',
                        fontSize: 'clamp(0.8rem, 3vw, 1.1rem)',
                        fontWeight: 900,
                        backgroundColor: activeTab === 'gacha' ? '#e9c46a' : 'rgba(255,255,255,0.02)',
                        color: activeTab === 'gacha' ? '#000' : '#888',
                        border: activeTab === 'gacha' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: activeTab === 'gacha' ? '0 10px 40px rgba(233,196,106,0.3)' : 'none'
                    }}
                >
                    NGUYỆN ƯỚC BIỂN CẢ
                </button>
                <button
                    onClick={() => setActiveTab('collection')}
                    style={{
                        padding: '1.2rem',
                        fontSize: 'clamp(0.8rem, 3vw, 1.1rem)',
                        fontWeight: 900,
                        backgroundColor: activeTab === 'collection' ? '#e9c46a' : 'rgba(255,255,255,0.02)',
                        color: activeTab === 'collection' ? '#000' : '#888',
                        border: activeTab === 'collection' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: activeTab === 'collection' ? '0 10px 40px rgba(233,196,106,0.3)' : 'none'
                    }}
                >
                    BỘ SƯU TẬP
                </button>
            </div>

            {activeTab === 'collection' ? (
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="glass" style={{ margin: '0 auto 3rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span style={{ color: '#888', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Sắp xếp:</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ backgroundColor: '#151515', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price-asc">Giá thấp</option>
                                <option value="price-desc">Giá cao</option>
                            </select>
                        </div>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={20} />
                            <input type="text" placeholder="Tìm ID, Rank..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass-input" style={{ width: '100%', padding: '12px 20px 12px 45px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', borderRadius: '12px' }} />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem', color: '#e9c46a' }}>Đang tải danh sách...</div>
                    ) : paginatedAccounts.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                            {paginatedAccounts.map(acc => (
                                <div key={acc.id} className="glass-card img-optimize" style={{ overflow: 'hidden', padding: 0, cursor: 'pointer' }} onClick={() => router.push(`/acc/${acc.gameId}`)}>
                                    <div style={{ height: '200px', backgroundColor: '#000', position: 'relative' }}>
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Image src={acc.image || '/posts/dolia.png'} alt="Acc Preview" fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" unoptimized />
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '15px', right: '15px', backgroundColor: '#e9c46a', color: '#000', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 900 }}>LIÊN QUÂN</div>
                                    </div>
                                    <div style={{ padding: '1.8rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e9c46a', marginBottom: '4px' }}>Liên Quân Tuyển</h3>
                                                <div style={{ color: '#666', fontSize: '0.85rem', fontFamily: 'monospace' }}>ID: #{acc.gameId}</div>
                                            </div>
                                            {acc.originalPrice && <div style={{ backgroundColor: '#ff4d4f', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>-{Math.round((1 - acc.price / acc.originalPrice) * 100)}%</div>}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.8rem', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: '#555', display: 'block' }}>Rank:</span><span style={{ color: '#fff', fontWeight: 700 }}>{acc.rank}</span></div>
                                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: '#555', display: 'block' }}>Tướng:</span><span style={{ color: '#fff', fontWeight: 700 }}>{acc.heroesCount}</span></div>
                                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: '#555', display: 'block' }}>Skin:</span><span style={{ color: '#fff', fontWeight: 700 }}>{acc.skinsCount}</span></div>
                                            <div style={{ fontSize: '0.85rem' }}><span style={{ color: '#555', display: 'block' }}>Đăng ký:</span><span style={{ color: '#fff', fontWeight: 700 }}>{acc.loginType}</span></div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900 }}>{new Intl.NumberFormat('vi-VN').format(acc.price)}<span style={{ fontSize: '1rem', marginLeft: '2px' }}>đ</span></span>
                                                {acc.originalPrice && <span style={{ color: '#444', fontSize: '0.9rem', textDecoration: 'line-through' }}>{new Intl.NumberFormat('vi-VN').format(acc.originalPrice)}đ</span>}
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); router.push(`/acc/${acc.gameId}`); }} className="btn-primary" style={{ padding: '12px 25px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800 }}>MUA NGAY</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass" style={{ maxWidth: '800px', margin: '5rem auto', textAlign: 'center', padding: '4rem 2rem', border: '1px solid #e9c46a', borderRadius: '24px' }}>
                            <h2 style={{ color: '#e9c46a', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Khách đã săn hết Tài Khoản.</h2>
                            <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: 1.6 }}>Whale còn nhiều tài khoản lắm mà không đăng hết. <br />Nhấn <a href="https://www.facebook.com/MegaWhaleAOV" target="_blank" style={{ color: '#e9c46a', textDecoration: 'underline', fontWeight: 700 }}>Hỗ Trợ</a> để tìm acc theo yêu cầu.</p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '4rem' }}>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '12px', backgroundColor: currentPage === 1 ? '#111' : '#e9c46a', border: 'none', borderRadius: '50%', cursor: currentPage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', color: '#000' }}><ChevronLeft size={24} /></button>
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>{currentPage} / {totalPages}</div>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '12px', backgroundColor: currentPage === totalPages ? '#111' : '#e9c46a', border: 'none', borderRadius: '50%', cursor: currentPage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', color: '#000' }}><ChevronRight size={24} /></button>
                        </div>
                    )}
                </div>
            ) : (
                <GachaTab
                    activeTab={activeTab}
                    banners={banners}
                    bannerNames={bannerNames}
                    currentBanner={currentBanner}
                    setCurrentBanner={setCurrentBanner}
                    setShowBannerInfo={setShowBannerInfo}
                    handleGacha={handleGacha}
                    gachaLoading={gachaLoading}
                    rollCounts={rollCounts}
                />
            )}

            {isGachaPlaying && !videoEnded && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <video key={gachaVideoSrc} autoPlay preload="auto" playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} onEnded={() => setVideoEnded(true)} onClick={() => setVideoEnded(true)}>
                        <source src={`${gachaVideoSrc}.webm`} type="video/webm" />
                    </video>
                    <button onClick={() => setVideoEnded(true)} style={{ position: 'absolute', top: '30px', right: '30px', padding: '12px 25px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)', fontWeight: 700 }}>SKiP VIDEO ➔</button>
                </div>
            )}

            {isGachaPlaying && videoEnded && !imagesPreloaded && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid rgba(233,196,106,0.3)', borderTop: '4px solid #e9c46a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ color: '#e9c46a', fontWeight: 700, fontSize: '1rem', letterSpacing: '2px' }}>ĐANG TẢI KẾT QUẢ...</span>
                </div>
            )}

            {isGachaPlaying && videoEnded && imagesPreloaded && (gachaResult || gachaResults.length > 0) && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 99999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(20px)', overflowY: 'auto', padding: '20px' }}>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ width: '95%', maxWidth: gachaResults.length > 1 ? '1000px' : '500px', padding: '2.5rem', borderRadius: '32px', border: '2px solid #e9c46a', backgroundColor: '#050505', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', boxShadow: '0 0 100px rgba(233,196,106,0.2)' }}>
                        <h2 style={{ color: '#e9c46a', fontSize: '2.5rem', margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>KẾT QUẢ</h2>

                        {gachaResults.length > 1 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', width: '100%', maxHeight: '60vh', overflowY: 'auto', padding: '10px' }}>
                                {gachaResults.map((acc, idx) => {
                                    const isGrandPrize = acc.bannerTag === 'Full Skin' || (acc.bannerTag && acc.bannerTag.startsWith('REG SSS'));
                                    return (
                                        <div key={acc.id} style={{
                                            background: isGrandPrize ? 'linear-gradient(135deg, rgba(233,196,106,0.15) 0%, rgba(255,215,0,0.08) 100%)' : 'rgba(255,255,255,0.03)',
                                            borderRadius: '16px',
                                            border: isGrandPrize ? '2px solid #e9c46a' : '1px solid rgba(255,255,255,0.1)',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: isGrandPrize ? '0 0 20px rgba(233,196,106,0.4), 0 0 60px rgba(233,196,106,0.15)' : 'none',
                                            position: 'relative',
                                            transform: isGrandPrize ? 'scale(1.03)' : 'none',
                                            zIndex: isGrandPrize ? 2 : 1,
                                        }}>
                                            {/* Shimmer sweep cho Grand Prize */}
                                            {isGrandPrize && (
                                                <div style={{
                                                    position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
                                                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                                                    animation: 'shimmer 2.5s infinite',
                                                    borderRadius: '14px',
                                                }} />
                                            )}
                                            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                                                <Image src={acc.image || '/posts/dolia.png'} fill style={{ objectFit: 'cover' }} alt="Result" sizes="200px" />
                                                {isGrandPrize && (
                                                    <div style={{
                                                        position: 'absolute', top: 6, left: 6,
                                                        background: 'linear-gradient(90deg, #b8860b, #e9c46a, #ffd700, #e9c46a, #b8860b)',
                                                        backgroundSize: '200% auto',
                                                        animation: 'gold-shine 2s linear infinite',
                                                        color: '#000', fontWeight: 900, padding: '3px 8px',
                                                        borderRadius: '6px', fontSize: '0.6rem', letterSpacing: '1px',
                                                    }}>✦ GRAND PRIZE</div>
                                                )}
                                            </div>
                                            <div style={{ padding: '10px', fontSize: '0.8rem', textAlign: 'left' }}>
                                                <div style={{ color: isGrandPrize ? '#ffd700' : '#e9c46a', fontWeight: 900 }}>#{acc.gameId}</div>
                                                <div style={{ color: isGrandPrize ? '#fff' : '#ccc', fontWeight: isGrandPrize ? 700 : 600 }}>{acc.rank}</div>
                                                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                                    {!isGrandPrize && (
                                                        <button onClick={() => handleGachaAction('SELL', acc.id)} style={{ flex: 1, background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff4d4f', borderRadius: '4px', padding: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem' }}>BÁN (+{gachaResults.length > 1 ? 5 : 6} WC)</button>
                                                    )}
                                                    {isGrandPrize && (
                                                        <div style={{ flex: 1, background: 'rgba(233,196,106,0.08)', border: '1px solid rgba(233,196,106,0.2)', color: '#e9c46a', borderRadius: '4px', padding: '4px', fontWeight: 700, fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1.2 }}>✦ Không thể bán</div>
                                                    )}
                                                    <button onClick={() => handleGachaAction('CLAIM', acc.id)} style={{ flex: 1, background: isGrandPrize ? 'linear-gradient(90deg, #b8860b, #e9c46a)' : '#e9c46a', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.7rem' }}>NHẬN</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : gachaResult && (() => {
                            const isSingleGrandPrize = gachaResult.bannerTag === 'Full Skin' || (gachaResult.bannerTag && gachaResult.bannerTag.startsWith('REG SSS'));
                            return (
                                <>
                                    <div style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', border: isSingleGrandPrize ? '2px solid #e9c46a' : '1px solid rgba(255,255,255,0.1)', position: 'relative', boxShadow: isSingleGrandPrize ? '0 0 40px rgba(233,196,106,0.5), 0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.5)' }}>
                                        {isSingleGrandPrize && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)', animation: 'shimmer 2.5s infinite', zIndex: 5, pointerEvents: 'none', borderRadius: '22px' }} />}
                                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                                            <Image src={gachaResult.image || '/posts/dolia.png'} fill style={{ objectFit: 'cover' }} alt="Gacha Result" sizes="500px" />
                                            {isSingleGrandPrize ? (
                                                <div style={{ position: 'absolute', top: 15, left: 15, background: 'linear-gradient(90deg, #b8860b, #e9c46a, #ffd700, #e9c46a, #b8860b)', backgroundSize: '200% auto', animation: 'gold-shine 2s linear infinite', color: '#000', fontWeight: 900, padding: '6px 16px', borderRadius: '10px', fontSize: '0.85rem', letterSpacing: '1.5px', zIndex: 10 }}>✦ GRAND PRIZE</div>
                                            ) : (
                                                <div style={{ position: 'absolute', top: 15, left: 15, background: '#e9c46a', color: '#000', fontWeight: 900, padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>REG</div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', background: isSingleGrandPrize ? 'rgba(233,196,106,0.05)' : 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem', border: isSingleGrandPrize ? '1px solid rgba(233,196,106,0.2)' : 'none' }}>
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#666', fontWeight: 700 }}>MÃ ACC</span>
                                            <span style={{ color: '#fff', fontWeight: 800, fontFamily: 'monospace' }}>#{gachaResult.gameId}</span>
                                        </div>
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#666', fontWeight: 700 }}>HẠNG</span>
                                            <span style={{ color: '#e9c46a', fontWeight: 900 }}>{gachaResult.rank}</span>
                                        </div>
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#666', fontWeight: 700 }}>TƯỚNG / SKIN</span>
                                            <span style={{ color: '#fff', fontWeight: 800 }}>{gachaResult.heroesCount} / {gachaResult.skinsCount}</span>
                                        </div>
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
                                            <span style={{ color: '#666', fontWeight: 700 }}>GIÁ TRỊ THỰC</span>
                                            <span style={{ color: '#fff', fontWeight: 900 }}>{new Intl.NumberFormat('vi-VN').format(gachaResult.price)}đ</span>
                                        </div>
                                        {isSingleGrandPrize && (
                                            <div style={{ background: 'rgba(233,196,106,0.1)', border: '1px solid rgba(233,196,106,0.3)', borderRadius: '12px', padding: '10px 16px', color: '#e9c46a', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>✦ Đây là Grand Prize — không thể bán</div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}

                        <div style={{ width: '100%', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            {gachaType === 'FREE' ? (
                                <>
                                    <button style={{ flex: 1.5, padding: '1.2rem', background: '#e9c46a', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => { setIsGachaPlaying(false); handleGacha('FREE', gachaResults.length > 1 ? 10 : 1); }}>THỬ LẠI</button>
                                    <button style={{ flex: 1, padding: '1.2rem', background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '16px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }} onClick={() => { setIsGachaPlaying(false); setVideoEnded(false); }}>ĐÓNG</button>
                                </>
                            ) : gachaResults.length <= 1 && (() => {
                                const isSingleGrandPrize = gachaResult && (gachaResult.bannerTag === 'Full Skin' || (gachaResult.bannerTag && gachaResult.bannerTag.startsWith('REG SSS')));
                                return (
                                    <>
                                        {!isSingleGrandPrize && (
                                            <button style={{ flex: 1, padding: '1.3rem', background: 'rgba(255,80,80,0.1)', color: '#ff4d4f', border: '1px solid rgba(255,77,79,0.2)', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }} onClick={() => handleGachaAction('SELL')}>BÁN (Hoàn 6 WC)</button>
                                        )}
                                        <button style={{ flex: 1.5, padding: '1.3rem', background: '#e9c46a', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => handleGachaAction('CLAIM')}>NHẬN ACC</button>
                                    </>
                                );
                            })()}
                            {gachaResults.length > 1 && gachaType !== 'FREE' && (() => {
                                const sellableCount = gachaResults.filter(a => !(a.bannerTag === 'Full Skin' || (a.bannerTag && a.bannerTag.startsWith('REG SSS')))).length;
                                const sellWC = Math.floor(sellableCount * 5.4);
                                return (
                                    <>
                                        {sellableCount > 0 && (
                                            <button style={{ flex: 1, padding: '1.3rem', background: 'rgba(255,80,80,0.1)', color: '#ff4d4f', border: '1px solid rgba(255,77,79,0.2)', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => handleBulkAction('SELL_ALL')}>BÁN ({sellableCount} thường • +{sellWC} WC)</button>
                                        )}
                                        <button style={{ flex: 1.5, padding: '1.3rem', background: '#e9c46a', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => handleBulkAction('CLAIM_ALL')}>NHẬN TẤT CẢ</button>
                                    </>
                                );
                            })()}
                        </div>
                    </motion.div>
                </div>
            )}

            {showBannerInfo && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }} onClick={() => setShowBannerInfo(false)}>
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass" style={{ padding: '2.5rem', borderRadius: '32px', maxWidth: '650px', width: '94%', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', cursor: 'default', backgroundColor: '#0a0a0a' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowBannerInfo(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                        <h2 style={{ color: '#e9c46a', marginBottom: '0.8rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 900, fontSize: '1.8rem' }}>THÔNG TIN BANNER</h2>
                        <h3 style={{ color: '#fff', marginBottom: '2rem', textAlign: 'center', fontSize: '1.4rem', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>{bannerNames[currentBanner]}</h3>
                        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.8rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ color: '#e9c46a', marginBottom: '15px', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '4px', height: '18px', background: '#e9c46a' }}></div> Thể lệ:</h4>
                            <ul style={{ color: '#ccc', lineHeight: '2', marginLeft: '10px', listStyle: 'none' }}>
                                <li style={{ marginBottom: '10px' }}><strong style={{ color: '#fff' }}>• Test Nhân Phẩm:</strong> Miễn phí vui vẻ, không nhận vật phẩm.</li>
                                <li style={{ marginBottom: '10px' }}><strong style={{ color: '#fff' }}>• Lượt Quay (10 WC):</strong> Tỉ lệ ra Acc Full Skin cực cao.</li>
                                <li style={{ marginBottom: '10px' }}><strong style={{ color: '#fff' }}>• Gói 10 Lượt (90 WC):</strong> Tiết kiệm hơn.</li>
                                <li><strong style={{ color: '#fff' }}>• Sao Hộ Mệnh:</strong> Quay đủ 150 lần chắc chắn nổ <span style={{ color: '#e9c46a' }}>REG SSS</span>.</li>
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.8rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ color: '#e9c46a', marginBottom: '15px', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '4px', height: '18px', background: '#e9c46a' }}></div> Tỷ lệ nổ:</h4>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(255,77,79,0.05)', borderRadius: '12px', border: '1px solid rgba(255,77,79,0.1)' }}>
                                    <span style={{ color: '#fff', fontWeight: 600 }}>Acc Full Skin</span>
                                    <span style={{ color: '#ff4d4f', fontWeight: 900 }}>2%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(233,196,106,0.05)', borderRadius: '12px', border: '1px solid rgba(233,196,106,0.1)' }}>
                                    <span style={{ color: '#fff', fontWeight: 600 }}>Acc REG SSS</span>
                                    <span style={{ color: '#e9c46a', fontWeight: 900 }}>9%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(233,196,106,0.05)', borderRadius: '12px', border: '1px solid rgba(233,196,106,0.1)' }}>
                                    <span style={{ color: '#fff', fontWeight: 600 }}>Acc REG Thường</span>
                                    <span style={{ color: '#e9c46a', fontWeight: 900 }}>89%</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {popupInfo && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{
                            backgroundColor: '#111',
                            border: '1px solid rgba(233,196,106,0.5)',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(233,196,106,0.1)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        }}>
                            <div style={{ color: '#fff', fontSize: '1.2rem', lineHeight: '1.5', fontWeight: 600 }}>
                                {popupInfo.message}
                            </div>
                            <button onClick={() => {
                                if (popupInfo.onOk) popupInfo.onOk();
                                setPopupInfo(null);
                            }} style={{
                                marginTop: '1rem',
                                padding: '12px 30px',
                                backgroundColor: '#e9c46a',
                                color: '#000',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 800,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                alignSelf: 'center'
                            }}>
                                ĐỒNG Ý
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
