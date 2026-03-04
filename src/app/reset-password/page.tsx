'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
        } else {
            setTokenValid(true);
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (password.length <= 8) {
            setErrorMsg('Mật khẩu phải dài hơn 8 ký tự.');
            return;
        }
        if (password !== confirm) {
            setErrorMsg('Mật khẩu xác nhận không khớp.');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();
            if (res.ok) {
                setStatus('done');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setErrorMsg(data.error || 'Lỗi hệ thống');
                setStatus('error');
            }
        } catch {
            setErrorMsg('Không thể kết nối máy chủ.');
            setStatus('error');
        }
    };

    if (tokenValid === false) {
        return (
            <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="glass" style={{ padding: '3rem', border: '1px solid #333', textAlign: 'center', maxWidth: '420px', width: '100%', borderRadius: '24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ color: '#ff4d4f', marginBottom: '1rem' }}>Link Không Hợp Lệ</h2>
                    <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                    </p>
                    <Link href="/forgot-password" className="btn-primary" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: '12px' }}>
                        Yêu Cầu Link Mới
                    </Link>
                </div>
            </div>
        );
    }

    if (status === 'done') {
        return (
            <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="glass" style={{ padding: '3rem', border: '1px solid #333', textAlign: 'center', maxWidth: '420px', width: '100%', borderRadius: '24px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        backgroundColor: 'rgba(68, 214, 44, 0.15)',
                        border: '2px solid var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '1.8rem'
                    }}>✓</div>
                    <h2 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '1rem' }}>
                        Đặt Lại Thành Công!
                    </h2>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        Mật khẩu đã được cập nhật. Đang chuyển về trang đăng nhập...
                    </p>
                    <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.9rem' }}>
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
            <form onSubmit={handleSubmit} className="glass" style={{ width: '100%', maxWidth: '420px', padding: '3rem', textAlign: 'center', borderRadius: '24px' }}>
                <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem', border: 'none', justifyContent: 'center' }}>
                    Đặt Lại Mật Khẩu
                </h2>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    Nhập mật khẩu mới cho tài khoản của bạn.
                </p>

                {(errorMsg || status === 'error') && (
                    <div style={{ color: '#ff4d4f', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '12px', backgroundColor: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)', borderRadius: '12px' }}>
                        {errorMsg}
                    </div>
                )}

                <input
                    type="password"
                    placeholder="Mật khẩu mới (>8 ký tự)..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-input"
                    style={{ marginBottom: '1rem' }}
                />
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu..."
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="glass-input"
                    style={{ marginBottom: '2rem' }}
                />

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={status === 'loading'}
                    style={{ width: '100%', marginBottom: '1.5rem', opacity: status === 'loading' ? 0.7 : 1, borderRadius: '12px' }}
                >
                    {status === 'loading' ? 'Đang cập nhật...' : 'Đặt Lại Mật Khẩu'}
                </button>

                <Link href="/login" style={{ color: '#888', fontSize: '0.9rem', textDecoration: 'none' }} className="nav-hover">
                    ← Quay về đăng nhập
                </Link>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
