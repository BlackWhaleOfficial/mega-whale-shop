'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch('/api/user/wallet')
            .then(res => res.json())
            .then(result => {
                if (result.error) {
                    router.push('/login');
                } else {
                    setData(result);
                }
            });
    }, [router]);

    if (!data) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

    const groupedDiscounts = Object.values(data.discounts.reduce((acc: any, d: any) => {
        if (!acc[d.codeName]) {
            acc[d.codeName] = { ...d, quantity: 1 };
        } else {
            acc[d.codeName].quantity += 1;
        }
        return acc;
    }, {}));

    return (
        <div style={{ padding: '8rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
            <h1 className="section-title">Kho Đồ & Ví</h1>

            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Wallet Cash */}
                <div style={{ backgroundColor: '#111', padding: '3rem', border: '1px solid #333', textAlign: 'center' }}>
                    <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Số dư hiện tại</p>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {data.whaleCash} <span style={{ fontSize: '1.5rem', color: '#fff' }}>WCash</span>
                    </div>
                </div>

                {/* Discounts Inventory */}
                <div style={{ backgroundColor: '#111', padding: '3rem', border: '1px solid #333' }}>
                    <h2 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '2rem' }}>
                        Mã giảm giá đang có ({data.discounts.length} mã / {groupedDiscounts.length} loại)
                    </h2>

                    {data.discounts.length === 0 ? (
                        <p style={{ color: '#888' }}>Bạn chưa có mã giảm giá nào.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {groupedDiscounts.map((d: any, idx: number) => (
                                <div key={d.id || idx} style={{ padding: '1.5rem', border: '1px dashed var(--primary)', backgroundColor: '#000', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{d.codeName}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Giảm {d.discountPercent}%</span>
                                        <span style={{ color: '#aaa', textTransform: 'none' }}>Số lượng: {d.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
