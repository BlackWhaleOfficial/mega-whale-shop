'use client';

import { useRouter } from 'next/navigation';

const THANG_PACKAGES = [
    { id: 'goi_23k', name: 'Gói Sinh Tồn', price: 23000, desc: 'Phù hợp người mới chơi. Tích lũy cơ hội nhận trang phục bậc S.' },
    { id: 'goi_100k', name: 'Sổ Sứ Mệnh', price: 100000, desc: 'Cấp thiết cho mọi game thủ. Nhận trang phục xịn xò và ưu đãi mỗi ngày.', highlight: true },
    { id: 'goi_588k', name: 'Đại Gia Cá Voi', price: 588000, desc: 'Vượt mọi giới hạn cấp bậc. Quà tặng VIP độc quyền hàng tháng.' },
];

export default function GoiThangPage() {
    const router = useRouter();

    const handleBuy = (e: React.MouseEvent, id: string) => {
        e.preventDefault();

        let cartItems = [];
        try {
            const stored = localStorage.getItem('cartItems');
            if (stored) cartItems = JSON.parse(stored);
        } catch (e) { }

        const existing = cartItems.find((i: any) => i.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cartItems.push({ id: id, qty: 1 });
        }

        const totalQty = cartItems.reduce((sum: number, item: any) => sum + item.qty, 0);

        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('cartQty', totalQty.toString());
        localStorage.removeItem('cartItem'); // clean up legacy

        window.dispatchEvent(new Event('storage'));
        router.push('/cart');
    };

    return (
        <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '80vh' }}>
            <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem', border: 'none' }}>Gói Thuê Bao Hàng Tháng</h1>
            <p style={{ color: '#aaa', marginBottom: '5rem', fontSize: '1.2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }}>
                Tối ưu hoá nguồn lực với các gói tháng siêu tốc. Lựa chọn đẳng cấp, xứng tầm game thủ.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '3rem',
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {THANG_PACKAGES.map((pkg) => (
                    <div key={pkg.id} style={{
                        backgroundColor: '#111',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        position: 'relative',
                        border: pkg.highlight ? `2px solid var(--primary)` : '2px solid #222',
                        transition: 'transform 0.4s ease',
                        cursor: 'pointer'
                    }}>
                        {pkg.highlight && (
                            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--primary)', color: '#000', padding: '8px 20px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Khuyên Dùng
                            </div>
                        )}
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', color: pkg.highlight ? 'var(--primary)' : '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {pkg.name}
                        </h3>
                        <div style={{ fontSize: '3rem', fontWeight: 300, marginBottom: '2rem' }}>
                            {new Intl.NumberFormat('vi-VN').format(pkg.price)}₫
                            <span style={{ fontSize: '1rem', color: '#888', display: 'block' }}>/ tháng</span>
                        </div>
                        <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: 1.6, marginBottom: '3rem' }}>
                            {pkg.desc}
                        </p>
                        <button onClick={(e) => handleBuy(e, pkg.id)} className={pkg.highlight ? 'btn-primary' : 'btn-outline'} style={{ display: 'block', width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '15px' }}>
                            Đăng Ký Khởi Tạo
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
