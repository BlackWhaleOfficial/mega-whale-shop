'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
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
            window.location.href = '/'; // Full refresh to update Layout Context
        } else {
            setError(data.error || 'Lỗi đăng nhập');
        }
    };

    return (
        <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px', backgroundColor: '#111', padding: '3rem', textAlign: 'center', border: '1px solid #333' }}>
                <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '2rem', border: 'none' }}>Đăng Nhập</h2>
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
                    Chưa có tài khoản? <Link href="/register" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Đăng ký ngay</Link>
                </p>
            </form>
        </div>
    );
}
