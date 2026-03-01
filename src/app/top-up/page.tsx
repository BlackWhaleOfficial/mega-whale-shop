'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../../components/Modal';

export default function TopUpPage() {
    const router = useRouter();
    const [cash, setCash] = useState('100');
    const [modal, setModal] = useState({ isOpen: false, message: '' });

    const parsedCash = parseInt(cash || '0');
    const vndAmount = isNaN(parsedCash) ? 0 : parsedCash * 1000;

    const handleProceed = () => {
        if (isNaN(parsedCash) || parsedCash < 50) {
            setModal({ isOpen: true, message: 'Vui lòng Top-up ít nhất 50 WCash (50.000đ)' });
            return;
        }
        router.push(`/cart?item=topup_${cash}&qty=1`);
    };

    return (
        <div style={{ padding: '8rem 5%', backgroundColor: '#00', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="section-title" style={{ textAlign: 'center' }}>Top-Up Cash</h1>
            <p style={{ color: '#aaa', marginBottom: '4rem', fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
                Nạp Whale Cash để thanh toán nhanh chóng hơn.<br />
                <span style={{ color: '#FFD700', fontWeight: 600 }}>1 Whale Cash = 1.000 VNĐ</span>
            </p>

            <div style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#111',
                padding: '4rem',
                borderLeft: '4px solid var(--primary)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Nhập số Whale Cash cần nạp
                    </label>
                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        Top-up ít nhất <strong style={{ color: '#FFD700' }}>50 WCash (50.000đ)</strong>
                    </p>
                    <input
                        type="number"
                        min="50"
                        value={cash}
                        onChange={(e) => setCash(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '20px',
                            fontSize: '2rem',
                            backgroundColor: '#000',
                            border: `1px solid ${parsedCash < 50 ? '#e74c3c' : '#444'}`,
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: 700,
                            boxSizing: 'border-box'
                        }}
                    />
                    {parsedCash > 0 && parsedCash < 50 && (
                        <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '8px' }}>
                            ⚠ Tối thiểu 50 WCash
                        </p>
                    )}
                </div>

                <div style={{ margin: '2rem 0', padding: '1.5rem', backgroundColor: '#222', borderRadius: '8px' }}>
                    <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '10px' }}>Thành tiền VNĐ</p>
                    <p style={{ color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vndAmount)}
                    </p>
                </div>

                <button
                    onClick={handleProceed}
                    className="btn-primary"
                    style={{ display: 'block', width: '100%', padding: '20px', fontSize: '1.2rem', marginTop: '2rem', border: 'none', cursor: 'pointer' }}
                >
                    Tiến hành thanh toán
                </button>
            </div>

            <Modal
                isOpen={modal.isOpen}
                type="alert"
                message={modal.message}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
}
