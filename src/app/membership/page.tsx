'use client';

import { useRouter } from 'next/navigation';

const memberships = [
    {
        id: 'goi_100k',
        name: 'Gói Cá Mập',
        price: 99000,
        value: 299000,
        popular: false,
        duration: '30 Ngày',
        features: [
            '1 Card Garena 100k',
            '2 TGG 1% (Tối đa 100k)'
        ]
    },
    {
        id: 'goi_588k',
        name: 'Gói Cá Mập Megalodon',
        price: 588000,
        value: 999000,
        popular: false,
        duration: '45 Ngày',
        features: [
            '1 Card Garena 100k',
            '2 TGG 5% (Tối đa 100k)',
            '3 TGG 1% (Tối đa 100k)',
            'VIP Discord Member'
        ]
    },
    {
        id: 'goi_888k',
        name: 'Gói Cá Voi',
        price: 888000,
        value: 1888000,
        popular: false,
        isGold: true,
        duration: '45 Ngày',
        features: [
            '1 Card Garena 200k',
            '2 TGG 10% (Tối đa 100k)',
            '5 TGG 5% (Tối đa 100k)',
            '10 TGG 1% (Tối đa 100k)',
            'VIP Discord Member'
        ]
    },
    {
        id: 'goi_25k',
        name: 'Gói Cá Con',
        price: 23000,
        value: 50000,
        popular: true,
        duration: '30 Ngày',
        features: [
            '10 TGG 1%'
        ]
    }
];

export default function MembershipPage() {
    const router = useRouter();

    const handleBuy = async (id: string) => {
        // Kiểm tra đăng nhập
        try {
            const authRes = await fetch('/api/auth/me');
            const authData = await authRes.json();
            if (!authData.authenticated) {
                router.push('/login?redirect=/membership');
                return;
            }
        } catch {
            router.push('/login?redirect=/membership');
            return;
        }

        // Kiểm tra giỏ hàng đã có membership chưa
        try {
            const stored = localStorage.getItem('cartItems');
            const cartItems = stored ? JSON.parse(stored) : [];
            const alreadyHasMembership = cartItems.some((i: any) => i.id.startsWith('goi_'));
            if (alreadyHasMembership) {
                alert('Giỏ hàng của bạn đã có 1 gói Membership. Vui lòng hoàn tất đơn hiện tại hoặc xóa gói cũ trước khi thêm gói mới!');
                return;
            }
        } catch (e) { }
        router.push(`/cart?item=${id}&qty=1`);
    };


    return (
        <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="section-title" style={{ border: 'none', marginBottom: '1rem' }}>Đặc Quyền Hội Viên</h1>
                <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    Trở thành hội viên VIP để nhận ngay thẻ Garena, hàng ngàn mã giảm giá và các đặc quyền độc quyền trên Discord.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                width: '100%',
                maxWidth: '1200px'
            }}>
                {memberships.map((pkg, idx) => (
                    <div
                        key={pkg.id}
                        style={{
                            backgroundColor: '#111',
                            border: pkg.isGold ? '2px solid #FFD700' : (pkg.popular ? '2px solid var(--primary)' : '1px solid #333'),
                            borderRadius: '16px',
                            padding: '2.5rem 2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: pkg.isGold ? '0 0 30px rgba(255, 215, 0, 0.15)' : (pkg.popular ? '0 0 30px rgba(68, 214, 44, 0.15)' : 'none'),
                            animation: `slideUp 0.5s ease forwards ${idx * 0.1}s`,
                            opacity: 0
                        }}
                    >
                        {(pkg.popular || pkg.isGold) && (
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '-35px',
                                backgroundColor: pkg.isGold ? '#FFD700' : 'var(--primary)',
                                color: '#000',
                                padding: '5px 40px',
                                transform: 'rotate(45deg)',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}>
                                {pkg.isGold ? 'Siêu Hời' : 'Phổ Biến'}
                            </div>
                        )}

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', color: pkg.isGold ? '#FFD700' : (pkg.popular ? 'var(--primary)' : '#fff'), marginBottom: '10px' }}>{pkg.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '5px' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{new Intl.NumberFormat('vi-VN').format(pkg.price)}đ</span>
                            </div>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>
                                Giá trị thực: <span style={{ textDecoration: 'line-through' }}>{new Intl.NumberFormat('vi-VN').format(pkg.value)}đ</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #333', borderBottom: '1px solid #333', padding: '1.5rem 0', marginBottom: '2rem', flex: 1 }}>
                            <p style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>Thời hạn: <span style={{ color: pkg.isGold ? '#FFD700' : 'var(--primary)' }}>{pkg.duration}</span></p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {pkg.features.map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', fontSize: '0.95rem' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: pkg.isGold ? 'rgba(255, 215, 0, 0.2)' : 'rgba(68, 214, 44, 0.2)', color: pkg.isGold ? '#FFD700' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>✓</div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => handleBuy(pkg.id)}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: pkg.isGold ? '#FFD700' : (pkg.popular ? 'var(--primary)' : 'transparent'),
                                border: pkg.isGold ? 'none' : (pkg.popular ? 'none' : '1px solid var(--primary)'),
                                color: pkg.isGold ? '#000' : (pkg.popular ? '#000' : 'var(--primary)'),
                                fontWeight: 700,
                                fontSize: '1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                if (!pkg.popular && !pkg.isGold) {
                                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                                    e.currentTarget.style.color = '#000';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!pkg.popular && !pkg.isGold) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--primary)';
                                }
                            }}
                        >
                            Đăng Ký Ngay
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
