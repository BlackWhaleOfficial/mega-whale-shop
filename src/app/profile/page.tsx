'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown } from 'lucide-react';
import Modal from '../../components/Modal';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'prompt';
        message: string;
        onConfirm?: (val?: string) => void;
        onClose?: () => void;
    }>({ isOpen: false, type: 'alert', message: '' });

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.authenticated) {
                    router.push('/login');
                } else {
                    setUser(data.user);
                    setUsername(data.user.username);
                    setEmail(data.user.email);
                }
            });
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const res = await fetch('/api/auth/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password: password || undefined })
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error);
        } else {
            setSuccess('Cập nhật thành công!');
            setPassword('');
        }
    };

    const executeCancelMembership = async () => {
        const res = await fetch('/api/user/membership/cancel', {
            method: 'POST'
        });
        const data = await res.json();

        if (res.ok) {
            setModalConfig({
                isOpen: true,
                type: 'alert',
                message: 'Hủy gói thành công!',
                onClose: () => window.location.reload()
            });
        } else {
            setModalConfig({
                isOpen: true,
                type: 'alert',
                message: data.error || 'Lỗi hệ thống'
            });
        }
    };

    const handleCancelMembership = () => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            message: 'Bạn có chắc chắn muốn hủy gói hội viên hiện tại không? Tất cả quyền lợi sẽ bị thu hồi ngay lập tức.',
            onConfirm: executeCancelMembership
        });
    };

    if (!user) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

    return (
        <div style={{ padding: '8rem 5%', display: 'flex', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#111', padding: '3rem', border: '1px solid #333' }}>
                <h1 className="section-title" style={{ fontSize: '1.8rem', border: 'none', textAlign: 'center' }}>Thông Tin Cá Nhân</h1>

                <div style={{ display: 'grid', gridTemplateColumns: user.activeMembership ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '1.5rem',
                        backgroundColor: '#222',
                        borderRadius: '8px',
                        border: user.activeMembership ? '1px solid #FFD700' : '1px solid #333',
                        boxShadow: user.activeMembership ? '0 0 15px rgba(255, 215, 0, 0.1)' : 'none'
                    }}>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase' }}>Membership</p>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: user.activeMembership ? '#FFD700' : 'var(--primary)',
                            letterSpacing: '1px',
                            wordBreak: 'break-word',
                            textTransform: 'uppercase'
                        }}>
                            {user.activeMembership ? `Hạng ${user.activeMembership.name.replace('Gói ', '')}` : `Hạng Thành Viên`}
                        </div>
                        <small style={{ color: '#aaa', marginTop: '8px', display: 'block' }}>
                            {user.isAdmin ? `UID: ${user.uid}` : `OpenID: ${user.openid}`}
                        </small>
                    </div>

                    {user.activeMembership && (
                        <div style={{
                            textAlign: 'center',
                            padding: '1.5rem',
                            backgroundColor: user.activeMembership.name.includes('Cá Voi') ? 'rgba(255, 215, 0, 0.1)' : 'rgba(68, 214, 44, 0.1)',
                            borderRadius: '8px',
                            border: `1px solid ${user.activeMembership.name.includes('Cá Voi') ? '#FFD700' : 'var(--primary)'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: user.activeMembership.name.includes('Cá Voi') ? '#FFD700' : 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                <Crown size={16} /> MEMBER VIP
                            </div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '5px' }}>
                                {user.activeMembership.name}
                            </div>
                            <div style={{ color: user.activeMembership.name.includes('Cá Voi') ? '#FFD700' : 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>
                                Còn lại {user.activeMembership.remainingDays} ngày
                            </div>
                            <button
                                onClick={handleCancelMembership}
                                style={{
                                    padding: '5px 15px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #ff4d4f',
                                    color: '#ff4d4f',
                                    borderRadius: '5px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Hủy Gói
                            </button>
                        </div>
                    )}
                </div>

                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                {success && <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{success}</div>}

                <form onSubmit={handleUpdate}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Tên người dùng</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', color: '#aaa', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Mật khẩu mới (bỏ trống nếu không đổi)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Nhập > 8 ký tự..."
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Lưu Thay Đổi</button>
                </form>
            </div>
            <Modal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onClose={() => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    if (modalConfig.onClose) modalConfig.onClose();
                }}
            />
        </div>
    );
}
