'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), email: email.trim() }),
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('sent');
            } else {
                setErrorMsg(data.error || 'Lỗi hệ thống');
                setStatus('error');
            }
        } catch {
            setErrorMsg('Không thể kết nối máy chủ.');
            setStatus('error');
        }
    };

    return (
        <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                {status === 'sent' ? (
                    // Success state
                    <div style={{ backgroundColor: '#111', padding: '3rem', border: '1px solid #333', textAlign: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            backgroundColor: 'rgba(68, 214, 44, 0.15)',
                            border: '2px solid var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '1.8rem'
                        }}>
                            ✉️
                        </div>
                        <h2 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '1rem', letterSpacing: '1px' }}>
                            Email đã được gửi!
                        </h2>
                        <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            Chúng tôi đã gửi link đặt lại mật khẩu đến email đã đăng ký của tài khoản <strong style={{ color: '#fff' }}>{username}</strong>.
                            Vui lòng kiểm tra hộp thư (kể cả Spam).
                        </p>
                        <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '2rem' }}>
                            Link sẽ hết hạn sau 1 giờ.
                        </p>
                        <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.9rem' }}>
                            ← Quay về đăng nhập
                        </Link>
                    </div>
                ) : (
                    // Form state
                    <form onSubmit={handleSubmit} style={{ backgroundColor: '#111', padding: '3rem', border: '1px solid #333', textAlign: 'center' }}>
                        <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', border: 'none' }}>
                            Quên Mật Khẩu
                        </h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Nhập tên tài khoản và email đã đăng ký. Hệ thống sẽ xác minh và gửi link đặt lại mật khẩu.
                        </p>

                        {status === 'error' && (
                            <div style={{ color: '#ff4d4f', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '12px 16px', backgroundColor: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)', borderRadius: '4px', textAlign: 'left' }}>
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Tên Tài Khoản
                            </label>
                            <input
                                type="text"
                                placeholder="Username của bạn..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{
                                    padding: '14px 15px', backgroundColor: '#000',
                                    border: '1px solid #444', color: '#fff',
                                    width: '100%', fontSize: '1rem', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                            <label style={{ display: 'block', color: '#888', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Email Đã Đăng Ký
                            </label>
                            <input
                                type="email"
                                placeholder="Email của bạn..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    padding: '14px 15px', backgroundColor: '#000',
                                    border: '1px solid #444', color: '#fff',
                                    width: '100%', fontSize: '1rem', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={status === 'loading'}
                            style={{ width: '100%', marginBottom: '1.5rem', opacity: status === 'loading' ? 0.7 : 1 }}
                        >
                            {status === 'loading' ? 'Đang xác minh...' : 'Gửi Link Đặt Lại'}
                        </button>

                        <Link href="/login" style={{ color: '#888', fontSize: '0.9rem', textDecoration: 'none' }}>
                            ← Quay về đăng nhập
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}
