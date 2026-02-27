'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

export default function NapGamePage() {
    const router = useRouter();
    const [amount, setAmount] = useState('100000');
    const [quantity, setQuantity] = useState('1');

    const handleBuy = (e: React.FormEvent) => {
        e.preventDefault();
        const itemId = `garena_${amount}`;
        const addQty = parseInt(quantity);

        let cartItems = [];
        try {
            const stored = localStorage.getItem('cartItems');
            if (stored) cartItems = JSON.parse(stored);
        } catch (e) { }

        const existing = cartItems.find((i: any) => i.id === itemId);
        if (existing) {
            existing.qty += addQty;
        } else {
            cartItems.push({ id: itemId, qty: addQty });
        }

        const totalQty = cartItems.reduce((sum: number, item: any) => sum + item.qty, 0);

        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('cartQty', totalQty.toString());

        // Clear out old single-item keys just to be safe
        localStorage.removeItem('cartItem');

        window.dispatchEvent(new Event('storage'));
        router.push('/cart');
    };

    return (
        <div style={{ padding: '8rem 5%', backgroundColor: '#000', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="section-title">Nạp Quân Huy</h1>
            <p style={{ color: '#aaa', marginBottom: '4rem', fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
                Tối ưu hoá giao dịch. Chọn mệnh giá, điền số lượng và tiếp tục. Hệ thống sẽ xử lý trong nháy mắt.
            </p>

            <div style={{
                width: '100%',
                maxWidth: '500px',
                backgroundColor: '#111',
                padding: '3rem',
                border: '1px solid #333'
            }}>
                <form onSubmit={handleBuy} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '1rem', color: '#fff', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Mệnh Giá Thẻ
                        </label>
                        <select
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{ padding: '15px', fontSize: '1.2rem', backgroundColor: '#000', border: '1px solid #444', color: '#fff' }}
                        >
                            <option value="100000">100.000 VNĐ</option>
                            <option value="200000">200.000 VNĐ</option>
                            <option value="500000">500.000 VNĐ</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '1rem', color: '#fff', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Số Lượng
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            style={{ padding: '15px', fontSize: '1.2rem', backgroundColor: '#000', border: '1px solid #444', color: '#fff' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <ShoppingCart size={24} /> Thêm Vào Giỏ Hàng
                    </button>
                </form>
            </div>
        </div>
    );
}
