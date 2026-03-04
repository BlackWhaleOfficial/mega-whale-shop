'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Modal from '../../components/Modal';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        message: string;
        onClose: () => void;
    }>({ isOpen: false, message: '', onClose: () => { } });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length <= 8) {
            setError('Mật khẩu phải dài hơn 8 ký tự.');
            return;
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        if (res.ok) {
            setModalConfig({
                isOpen: true,
                message: 'Đăng ký thành công! Chào mừng V.I.P',
                onClose: () => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    // Redirect to login with redirect param preserved
                    const loginUrl = redirectTo !== '/' ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
                    router.push(loginUrl);
                }
            });
        } else {
            setError(data.error || 'Lỗi đăng ký');
        }
    };

    return (
        <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
            <form onSubmit={handleRegister} className="glass" style={{ width: '100%', maxWidth: '420px', padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
                <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '2rem', border: 'none', justifyContent: 'center' }}>Đăng Ký Tài Khoản</h2>
                {redirectTo !== '/' && (
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1.5rem', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        Vui lòng đăng ký để tiếp tục
                    </div>
                )}
                {error && <div style={{ color: '#ff4d4f', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '10px', backgroundColor: 'rgba(255,77,79,0.1)', borderRadius: '8px' }}>{error}</div>}

                <input
                    type="text"
                    placeholder="Tên người dùng (Username)..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="glass-input"
                    style={{ marginBottom: '1rem' }}
                />

                <input
                    type="email"
                    placeholder="Email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input"
                    style={{ marginBottom: '1rem' }}
                />

                <input
                    type="password"
                    placeholder="Mật khẩu (>8 ký tự)..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-input"
                    style={{ marginBottom: '2rem' }}
                />

                <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '2rem', borderRadius: '12px' }}>Đăng Ký</button>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                    Đã có tài khoản? <Link href={redirectTo !== '/' ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'} style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>Trở về đăng nhập</Link>
                </p>
            </form>

            <Modal
                isOpen={modalConfig.isOpen}
                type="alert"
                message={modalConfig.message}
                onClose={modalConfig.onClose}
            />
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterForm />
        </Suspense>
    );
}
