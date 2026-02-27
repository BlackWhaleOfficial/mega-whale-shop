'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TopUpPage() {
    const [cash, setCash] = useState('100');

    const parsedCash = parseInt(cash || '0');
    const vndAmount = isNaN(parsedCash) ? 0 : parsedCash * 1000;

    return (
        <div style={{ padding: '8rem 5%', backgroundColor: '#00', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="section-title" style={{ textAlign: 'center' }}>Top-Up Cash</h1>
            <p style={{ color: '#aaa', marginBottom: '4rem', fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
                Nạp Whale Cash để thanh toán nhanh chóng hơn. 1 Whale Cash = 1000 VNĐ.
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
                    <label style={{ display: 'block', marginBottom: '1rem', color: '#fff', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Nhập số Whale Cash cần nạp
                    </label>
                    <input
                        type="number"
                        min="10"
                        value={cash}
                        onChange={(e) => setCash(e.target.value)}
                        style={{
                            padding: '20px',
                            fontSize: '2rem',
                            backgroundColor: '#000',
                            border: '1px solid #444',
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: 700
                        }}
                    />
                </div>

                <div style={{ margin: '2rem 0', padding: '1.5rem', backgroundColor: '#222', borderRadius: '8px' }}>
                    <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '10px' }}>Thành tiền VNĐ</p>
                    <p style={{ color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vndAmount)}
                    </p>
                </div>

                <Link href={`/cart?item=topup_${cash}&qty=1`} className="btn-primary" style={{ display: 'block', padding: '20px', fontSize: '1.2rem', marginTop: '2rem' }}>
                    Tiến hành thanh toán
                </Link>
            </div>

        </div>
    );
}
