'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, Info, Settings, Wallet, Menu, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const checkCart = () => {
            const globalCart = localStorage.getItem('cartQty');
            setCartCount(globalCart ? parseInt(globalCart) : 0);
        };
        checkCart();
        window.addEventListener('storage', checkCart);
        return () => window.removeEventListener('storage', checkCart);
    }, [pathname]);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            })
            .catch(() => { });
    }, [pathname]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        setMenuOpen(false);
        setMobileMenuOpen(false);
        router.push('/login');
    };

    return (
        <nav className="glass" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem 2rem',
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '1200px',
            zIndex: 100,
            borderRadius: '100px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link href="/">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        border: '2px solid var(--primary)',
                        overflow: 'hidden',
                        backgroundColor: '#000'
                    }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                </Link>

                <div className="desktop-only" style={{ alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <Link href="/nap-game" style={
                        pathname === '/nap-game' ? { backgroundColor: 'var(--primary)', color: '#000', padding: '10px 20px', borderRadius: '40px', textDecoration: 'none' }
                            : { color: '#fff', textDecoration: 'none', padding: '10px 20px' }
                    } className={pathname === '/nap-game' ? '' : 'nav-hover'}>Nạp Quân Huy</Link>

                    <Link href="/collection" style={
                        pathname === '/collection' ? { backgroundColor: 'var(--primary)', color: '#000', padding: '10px 20px', borderRadius: '40px', textDecoration: 'none' }
                            : { color: '#fff', textDecoration: 'none', padding: '10px 20px' }
                    } className={pathname === '/collection' ? '' : 'nav-hover'}>Bộ Sưu Tập</Link>

                    <Link href="/membership" style={
                        pathname === '/membership' ? { backgroundColor: 'var(--primary)', color: '#000', padding: '10px 20px', borderRadius: '40px', textDecoration: 'none' }
                            : { color: '#fff', textDecoration: 'none', padding: '10px 20px' }
                    } className={pathname === '/membership' ? '' : 'nav-hover'}>Membership</Link>

                    <Link href="/history" style={
                        pathname === '/history' ? { backgroundColor: 'var(--primary)', color: '#000', padding: '10px 20px', borderRadius: '40px', textDecoration: 'none' }
                            : { color: '#fff', textDecoration: 'none', padding: '10px 20px' }
                    } className={pathname === '/history' ? '' : 'nav-hover'}>Lịch Sử Mua</Link>

                    <a href="https://www.facebook.com/MegaWhaleAOV" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', padding: '10px 20px' }} className="nav-hover">Hỗ Trợ</a>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Link href="/top-up" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '8px 16px',
                    borderRadius: '40px',
                    fontSize: '0.85rem',
                    color: '#fff',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <Wallet size={16} color="var(--primary)" />
                    <span className="desktop-only" style={{ color: 'var(--primary)' }}>{user ? user.whaleCash : 0} WCash</span>
                    <span className="mobile-only">{user ? user.whaleCash : 0}</span>
                </Link>

                <Link href="/cart" style={{
                    position: 'relative',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: pathname === '/cart' ? 'var(--primary)' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                }}>
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            backgroundColor: '#ff4d4f',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #000'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </Link>

                <div className="desktop-only" style={{ position: 'relative' }}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: user?.activeMembership ? '2px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: user?.activeMembership ? '#FFD700' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <User size={18} />
                    </button>


                    {menuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '50px',
                            right: 0,
                            backgroundColor: '#111',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '10px 0',
                            width: '220px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            zIndex: 50
                        }}>
                            {user ? (
                                <>
                                    <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }} className="dropdown-item">
                                        <Info size={16} /> Thông tin cá nhân
                                    </Link>
                                    <Link href="/wallet" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }} className="dropdown-item">
                                        <Wallet size={16} /> Ví ({user.whaleCash} WC, {user.discountsCount} MGG)
                                    </Link>
                                    {user.isAdmin && (
                                        <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }} className="dropdown-item">
                                            <Settings size={16} /> Quản lí Web
                                        </Link>
                                    )}
                                    <div style={{ height: '1px', backgroundColor: '#333', margin: '8px 0' }}></div>
                                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#ff4444', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }} className="dropdown-item">
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }} className="dropdown-item">
                                        <User size={16} /> Đăng nhập
                                    </Link>
                                    <Link href="/register" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }} className="dropdown-item">
                                        <Info size={16} /> Đăng ký
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="mobile-only">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                            padding: 0
                        }}
                    >
                        <Menu size={28} />
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 200,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }} onClick={() => setMobileMenuOpen(false)}>
                    <div style={{
                        width: '300px',
                        height: '100vh',
                        background: 'rgba(10, 10, 10, 0.95)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '2rem 1.5rem',
                        position: 'relative',
                        boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
                        animation: 'slideInRight 0.3s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2.5rem' }}>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    color: '#fff',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ color: '#555', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Menu Điều Hướng</div>

                            {[
                                { href: '/nap-game', label: 'Nạp Quân Huy' },
                                { href: '/collection', label: 'Bộ Sưu Tập' },
                                { href: '/membership', label: 'Membership' },
                                { href: '/history', label: 'Lịch Sử Mua' },
                                { href: 'https://www.facebook.com/MegaWhaleAOV', label: 'Hỗ Trợ', isExt: true }
                            ].map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    target={item.isExt ? '_blank' : undefined}
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{
                                        color: pathname === item.href ? 'var(--primary)' : '#fff',
                                        textDecoration: 'none',
                                        fontSize: '1.2rem',
                                        fontWeight: 700,
                                        padding: '12px 15px',
                                        borderRadius: '12px',
                                        background: pathname === item.href ? 'rgba(68,214,44,0.1)' : 'transparent',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '2rem 0' }}></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {user ? (
                                <>
                                    <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', padding: '0 15px' }}>Hi, {user.username || 'User'}!</div>
                                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#888', padding: '10px 15px', fontSize: '1rem', fontWeight: 600 }}>
                                        <Info size={18} /> Thông tin cá nhân
                                    </Link>
                                    <Link href="/wallet" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#888', padding: '10px 15px', fontSize: '1rem', fontWeight: 600 }}>
                                        <Wallet size={18} /> Ví của tôi ({user.whaleCash} WC)
                                    </Link>
                                    {user.isAdmin && (
                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#888', padding: '10px 15px', fontSize: '1rem', fontWeight: 600 }}>
                                            <Settings size={18} /> Quản lí hệ thống
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            textAlign: 'left',
                                            background: 'rgba(255,77,79,0.1)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#ff4d4f',
                                            marginTop: '1.5rem',
                                            padding: '12px 20px',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <LogOut size={18} /> Đăng xuất tài khoản
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ background: 'var(--primary)', color: '#000', textAlign: 'center', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem' }}>
                                        Đăng nhập
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', padding: '14px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem' }}>
                                        Đăng ký ngay
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </nav>
    );
}
