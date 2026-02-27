'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '../../components/Modal';

export default function RegisterPage() {
    const router = useRouter();
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
                    router.push('/login');
                }
            });
        } else {
            setError(data.error || 'Lỗi đăng ký');
        }
    };

    return (
        <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
            <form onSubmit={handleRegister} style={{ width: '100%', maxWidth: '400px', backgroundColor: '#111', padding: '3rem', textAlign: 'center', border: '1px solid #333' }}>
                <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '2rem', border: 'none' }}>Đăng Ký Tài Khoản</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                <input
                    type="text"
                    placeholder="Tên người dùng (Username)..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ padding: '15px', backgroundColor: '#000', border: '1px solid #444', color: '#fff', width: '100%', marginBottom: '1rem' }}
                />

                <input
                    type="email"
                    placeholder="Email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '15px', backgroundColor: '#000', border: '1px solid #444', color: '#fff', width: '100%', marginBottom: '1rem' }}
                />

                <input
                    type="password"
                    placeholder="Mật khẩu (>8 ký tự)..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '15px', backgroundColor: '#000', border: '1px solid #444', color: '#fff', width: '100%', marginBottom: '2rem' }}
                />

                <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>Đăng Ký</button>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                    Đã có tài khoản? <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Trở về đăng nhập</Link>
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
