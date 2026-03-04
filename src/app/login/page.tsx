'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        if (res.ok) {
            window.location.href = redirectTo; // Full refresh to update session
        } else {
            setError(data.error || 'Lỗi đăng nhập');
        }
    };

    return (
        <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
            <form onSubmit={handleLogin} className="glass" style={{ width: '100%', maxWidth: '420px', padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
                <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '2rem', border: 'none', justifyContent: 'center' }}>Đăng Nhập</h2>
                {redirectTo !== '/' && (
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1.5rem', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        Vui lòng đăng nhập để tiếp tục
                    </div>
                )}
                {error && <div style={{ color: '#ff4d4f', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '10px', backgroundColor: 'rgba(255,77,79,0.1)', borderRadius: '8px' }}>{error}</div>}
                <input
                    type="text"
                    placeholder="Tên truy cập hoặc Email..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="glass-input"
                    style={{ marginBottom: '1rem' }}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-input"
                    style={{ marginBottom: '1.5rem' }}
                />
                <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
                    <Link href="/forgot-password" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none' }} className="nav-hover">
                        Quên mật khẩu?
                    </Link>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '2rem', borderRadius: '12px' }}>Đăng Nhập</button>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                    Chưa có tài khoản? <Link href={`/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>Đăng ký ngay</Link>
                </p>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
