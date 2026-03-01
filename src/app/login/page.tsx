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
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px', backgroundColor: '#111', padding: '3rem', textAlign: 'center', border: '1px solid #333' }}>
                <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '2rem', border: 'none' }}>Đăng Nhập</h2>
                {redirectTo !== '/' && (
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '1.5rem', padding: '10px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px' }}>
                        Vui lòng đăng nhập để tiếp tục
                    </div>
                )}
                {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                <input
                    type="text"
                    placeholder="Tên truy cập hoặc Email..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ padding: '15px', backgroundColor: '#000', border: '1px solid #444', color: '#fff', width: '100%', marginBottom: '1rem' }}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '15px', backgroundColor: '#000', border: '1px solid #444', color: '#fff', width: '100%', marginBottom: '2rem' }}
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>Đăng Nhập</button>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                    Chưa có tài khoản? <Link href={`/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Đăng ký ngay</Link>
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
