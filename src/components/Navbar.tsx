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
                    right: 0,
                    width: '100%',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 200,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <div style={{
                        width: '280px',
                        height: '100%',
                        backgroundColor: '#111',
                        borderLeft: '1px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1rem',
                        animation: 'slideIn 0.3s forwards'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                            <button onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontWeight: 600, fontSize: '1.1rem', textTransform: 'uppercase' }}>
                            <Link href="/nap-game" onClick={() => setMobileMenuOpen(false)} style={{ color: pathname === '/nap-game' ? 'var(--primary)' : '#fff', textDecoration: 'none' }}>
                                Nạp Quân Huy
                            </Link>
                            <Link href="/collection" onClick={() => setMobileMenuOpen(false)} style={{ color: pathname === '/collection' ? 'var(--primary)' : '#fff', textDecoration: 'none' }}>
                                Bộ Sưu Tập
                            </Link>
                            <Link href="/membership" onClick={() => setMobileMenuOpen(false)} style={{ color: pathname === '/membership' ? 'var(--primary)' : '#fff', textDecoration: 'none' }}>
                                Membership
                            </Link>
                            <Link href="/history" onClick={() => setMobileMenuOpen(false)} style={{ color: pathname === '/history' ? 'var(--primary)' : '#fff', textDecoration: 'none' }}>
                                Lịch Sử Mua
                            </Link>
                            <a href="https://www.facebook.com/MegaWhaleAOV" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none' }}>
                                Hỗ Trợ
                            </a>
                        </div>

                        <div style={{ height: '1px', backgroundColor: '#333', margin: '2rem 0' }}></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#aaa', fontSize: '1rem' }}>
                            {user ? (
                                <>
                                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>Chào, {user.username || 'User'}</div>
                                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#aaa' }}>
                                        <Info size={18} /> Thông tin cá nhân
                                    </Link>
                                    <Link href="/wallet" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#aaa' }}>
                                        <Wallet size={18} /> Ví ({user.whaleCash} WC)
                                    </Link>
                                    {user.isAdmin && (
                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#aaa' }}>
                                            <Settings size={18} /> Quản lí Web
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', marginTop: '1rem' }}>
                                        <LogOut size={18} /> Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
                                        <User size={18} /> Đăng nhập
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
                                        <Info size={18} /> Đăng ký
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
