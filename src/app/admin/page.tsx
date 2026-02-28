'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../../components/Modal';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [showAddInventoryForm, setShowAddInventoryForm] = useState(false);
    const [newInventoryData, setNewInventoryData] = useState({ game: 'Liên Quân', serial: '', pin: '', cardValue: 100000 });

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'prompt';
        message: string;
        onConfirm?: (val?: string) => void;
        onClose?: () => void;
    }>({ isOpen: false, type: 'alert', message: '' });

    // All Orders Tab States
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [allOrdersSearchTerm, setAllOrdersSearchTerm] = useState('');
    const [allOrdersFilter, setAllOrdersFilter] = useState('newest'); // newest, oldest, price_asc, price_desc

    const [inventoryCards, setInventoryCards] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
    const [manualWCash, setManualWCash] = useState<number | ''>('');
    const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [systemStats, setSystemStats] = useState<any>(null);
    const [systemStatsLoading, setSystemStatsLoading] = useState(false);

    const [membershipDiscounts] = useState([
        { code: 'TGG 1% (Gói Cá Con)', percent: 1 },
        { code: 'TGG 1% (Gói Cá Mập)', percent: 1 },
        { code: 'TGG 5% (Gói Cá Mập Megalodon)', percent: 5 },
        { code: 'TGG 1% (Gói Cá Mập Megalodon)', percent: 1 },
        { code: 'TGG 10% (Gói Cá Voi)', percent: 10 },
        { code: 'TGG 5% (Gói Cá Voi)', percent: 5 },
        { code: 'TGG 1% (Gói Cá Voi)', percent: 1 }
    ]);

    const [posts, setPosts] = useState([
        { id: 'dolia', title: 'Mã Khởi Thiên Ca', hero: 'Dolia', video: '/posts/dolia.mp4', thumb: '/posts/dolia.png', link: 'https://www.facebook.com/share/v/17xSQwG1rA/' },
        { id: 'lauriel', title: 'Mã Đẳng Cửu Thế', hero: 'Lauriel', video: '/posts/lauriel.mp4', thumb: '/posts/lauriel.png', link: 'https://www.facebook.com/share/v/1E35jqTymL/' },
        { id: 'valhein', title: 'Mã Hành Vạn Lý', hero: 'Valhein', video: '/posts/valhein.mp4', thumb: '/posts/valhein.png', link: 'https://www.facebook.com/share/v/18RrkRQniY/' }
    ]);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.authenticated || !data.user.isAdmin) {
                    router.push('/login');
                } else {
                    setIsAdmin(true);
                }
                setLoading(false);
            })
            .catch(() => {
                router.push('/login');
            });
    }, [router]);

    useEffect(() => {
        if (isAdmin && activeTab === 'orders') {
            fetch('/api/admin/orders')
                .then(res => res.json())
                .then(data => setOrders(data || []))
                .catch(err => console.error(err));
        } else if (isAdmin && activeTab === 'all_orders') {
            fetch('/api/admin/all-orders')
                .then(res => res.json())
                .then(data => setAllOrders(data || []))
                .catch(err => console.error(err));
        } else if (isAdmin && activeTab === 'inventory') {
            fetch('/api/admin/inventory')
                .then(res => res.json())
                .then(data => setInventoryCards(data || []))
                .catch(err => console.error(err));
        } else if (isAdmin && activeTab === 'users') {
            fetch('/api/admin/users')
                .then(res => res.json())
                .then(data => setUsers(data || []))
                .catch(err => console.error(err));
        } else if (isAdmin && activeTab === 'overview') {
            fetch('/api/admin/all-orders')
                .then(res => res.json())
                .then(data => setAllOrders(data || []))
                .catch(err => console.error(err));
            fetch('/api/admin/inventory')
                .then(res => res.json())
                .then(data => setInventoryCards(data || []))
                .catch(err => console.error(err));
            // Lấy live system stats
            setSystemStatsLoading(true);
            fetch('/api/admin/system-stats')
                .then(res => res.json())
                .then(data => { setSystemStats(data); setSystemStatsLoading(false); })
                .catch(() => setSystemStatsLoading(false));
        }
    }, [isAdmin, activeTab]);

    const handleApproveOrder = async (orderId: string) => {
        const res = await fetch(`/api/admin/orders/${orderId}/approve`, { method: 'POST' });
        if (res.ok) {
            setOrders(orders.filter(o => o.id !== orderId));
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Đã có lỗi xảy ra khi xác nhận!' });
        }
    };

    const confirmRejectOrder = async (orderId: string) => {
        const res = await fetch(`/api/admin/orders/${orderId}/reject`, { method: 'POST' });
        if (res.ok) {
            setOrders(orders.filter(o => o.id !== orderId));
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Đã có lỗi xảy ra khi từ chối!' });
        }
    };

    const handleRejectOrder = (orderId: string) => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            message: 'Bạn có chắc chắn muốn từ chối đơn hàng này không?',
            onConfirm: () => confirmRejectOrder(orderId)
        });
    };

    const confirmDeleteInventory = async (id: string, serial: string) => {
        const res = await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' });
        if (res.ok) {
            setInventoryCards(inventoryCards.filter(c => c.id !== id));
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Có lỗi xảy ra khi xóa thẻ.' });
        }
    };

    const handleDeleteInventory = (id: string, serial: string) => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            message: `Bạn có chắc chắn muốn xóa thẻ Serial: ${serial}?`,
            onConfirm: () => confirmDeleteInventory(id, serial)
        });
    };

    const handleAddInventory = async () => {
        if (!newInventoryData.serial || !newInventoryData.pin) {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Vui lòng nhập đầy đủ Serial và Mã Nạp.' });
            return;
        }

        const cardValue = parseInt(newInventoryData.cardValue.toString()) || 100000;
        let qh = 204;
        let price = 97000;
        let cost = 96000;

        if (cardValue === 200000) { qh = 408; price = 194000; cost = 192000; }
        else if (cardValue === 500000) { qh = 1020; price = 485000; cost = 480000; }

        const dataToSubmit = {
            ...newInventoryData,
            cardValue,
            qh,
            price,
            cost
        };

        const res = await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSubmit),
        });

        if (res.ok) {
            const newItem = await res.json();
            setInventoryCards([newItem, ...inventoryCards]);
            setShowAddInventoryForm(false);
            setNewInventoryData({ game: 'Liên Quân', serial: '', pin: '', cardValue: 100000 });
            setModalConfig({ isOpen: true, type: 'alert', message: 'Nhập thẻ thành công!' });
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Có lỗi xảy ra khi nhập thẻ.' });
        }
    };

    const handleEditClick = (item: any) => {
        setEditingInventoryId(item.id);
        setEditFormData({
            game: item.game,
            serial: item.serial,
            pin: item.pin,
            qh: item.qh || item.cardValue,
            status: item.status
        });
    };

    const handleCancelEdit = () => {
        setEditingInventoryId(null);
        setEditFormData({});
    };

    const handleSaveEdit = async () => {
        if (!editingInventoryId) return;
        const res = await fetch(`/api/admin/inventory/${editingInventoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editFormData)
        });
        if (res.ok) {
            const updated = await res.json();
            setInventoryCards(inventoryCards.map(c => c.id === editingInventoryId ? updated : c));
            setEditingInventoryId(null);
            setEditFormData({});
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Có lỗi khi lưu thông tin.' });
        }
    };

    const handleManualWCash = async () => {
        if (!selectedUserDetail || manualWCash === '' || isNaN(Number(manualWCash)) || Number(manualWCash) === 0) return;

        const delta = Number(manualWCash);
        const res = await fetch(`/api/admin/users/${selectedUserDetail.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ whaleCashDelta: delta })
        });

        if (res.ok) {
            const updatedUser = await res.json();
            setUsers(users.map(u => u.id === updatedUser.id ? { ...u, whaleCash: updatedUser.whaleCash } : u));
            setSelectedUserDetail({ ...selectedUserDetail, whaleCash: updatedUser.whaleCash });
            setManualWCash('');
            setModalConfig({ isOpen: true, type: 'alert', message: 'Cập nhật số dư thành công!' });
        } else {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Đã có lỗi xảy ra khi cập nhật số dư.' });
        }
    };

    const executeSendCode = async (targetUser: string, quantityStr: string, discount: any) => {
        const quantity = parseInt(quantityStr || '1');
        try {
            const res = await fetch('/api/admin/discounts/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetId: targetUser,
                    codeName: discount.code,
                    percent: discount.percent,
                    quantity: quantity
                })
            });
            const data = await res.json();
            if (res.ok) {
                setModalConfig({ isOpen: true, type: 'alert', message: `Gửi thành công ${quantity} mã ${discount.code} tới người dùng!` });
            } else {
                setModalConfig({ isOpen: true, type: 'alert', message: `Lỗi: ${data.error}` });
            }
        } catch (error) {
            setModalConfig({ isOpen: true, type: 'alert', message: 'Lỗi hệ thống' });
        }
    };

    const promptCodeQuantity = (targetUser: string, discount: any) => {
        setModalConfig({
            isOpen: true,
            type: 'prompt',
            message: `Nhập số lượng mã muốn gửi (mặc định 1):`,
            onConfirm: (q) => executeSendCode(targetUser, q || '1', discount)
        });
    };

    const handleSendCode = (index: number) => {
        const discount = membershipDiscounts[index];
        setModalConfig({
            isOpen: true,
            type: 'prompt',
            message: `Nhập UID hoặc OpenID của người dùng muốn gửi mã ${discount.code}:`,
            onConfirm: (val) => {
                if (val) {
                    setTimeout(() => promptCodeQuantity(val, discount), 300);
                }
            }
        });
    };

    if (loading) {
        return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang xác thực quyền Admin...</div>;
    }

    if (!isAdmin) {
        return null; // Redirecting
    }

    const filteredAllOrders = allOrders.filter((o) => {
        if (!allOrdersSearchTerm) return true;
        return o.id.toLowerCase().includes(allOrdersSearchTerm.toLowerCase());
    }).sort((a, b) => {
        if (allOrdersFilter === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (allOrdersFilter === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (allOrdersFilter === 'price_asc') return a.totalAmount - b.totalAmount;
        if (allOrdersFilter === 'price_desc') return b.totalAmount - a.totalAmount;
        return 0;
    });

    const filteredUsers = users.filter((u) => {
        const term = userSearchTerm.toLowerCase();
        return (
            (u.username && u.username.toLowerCase().includes(term)) ||
            (u.email && u.email.toLowerCase().includes(term)) ||
            (u.uid && u.uid.toLowerCase().includes(term)) ||
            (u.openid && u.openid.toLowerCase().includes(term))
        );
    });

    return (
        <div style={{ padding: '8rem 5%', minHeight: '100vh', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

            {/* Sidebar */}
            <div style={{ width: '250px', flexGrow: 1, maxWidth: '300px', backgroundColor: '#111', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.2rem' }}>Quản Trị</h2>

                <button
                    onClick={() => setActiveTab('overview')}
                    style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'overview' ? '#222' : 'transparent', color: activeTab === 'overview' ? 'var(--primary)' : '#aaa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderLeft: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent' }}
                >
                    Tổng Quan
                </button>

                <button
                    onClick={() => setActiveTab('orders')}
                    style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'orders' ? '#222' : 'transparent', color: activeTab === 'orders' ? 'var(--primary)' : '#aaa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderLeft: activeTab === 'orders' ? '2px solid var(--primary)' : '2px solid transparent' }}
                >
                    Yêu Cầu
                </button>

                <button
                    onClick={() => setActiveTab('all_orders')}
                    style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'all_orders' ? '#222' : 'transparent', color: activeTab === 'all_orders' ? 'var(--primary)' : '#aaa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderLeft: activeTab === 'all_orders' ? '2px solid var(--primary)' : '2px solid transparent' }}
                >
                    Đơn Hàng
                </button>

                <button
                    onClick={() => setActiveTab('inventory')}
                    style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'inventory' ? '#222' : 'transparent', color: activeTab === 'inventory' ? 'var(--primary)' : '#aaa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderLeft: activeTab === 'inventory' ? '2px solid var(--primary)' : '2px solid transparent' }}
                >
                    Kho Thẻ Garena
                </button>

                <button
                    onClick={() => setActiveTab('users')}
                    style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'users' ? '#222' : 'transparent', color: activeTab === 'users' ? 'var(--primary)' : '#aaa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderLeft: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent' }}
                >
                    Người Dùng
                </button>

                <button
                    onClick={() => setActiveTab('discounts')}
                    style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'discounts' ? '#222' : 'transparent', color: activeTab === 'discounts' ? 'var(--primary)' : '#aaa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderLeft: activeTab === 'discounts' ? '2px solid var(--primary)' : '2px solid transparent' }}
                >
                    Mã Giảm Giá
                </button>

                <button
                    onClick={() => setActiveTab('posts')}
                    style={{ textAlign: 'left', padding: '15px', backgroundColor: activeTab === 'posts' ? '#222' : 'transparent', color: activeTab === 'posts' ? 'var(--primary)' : '#aaa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', borderLeft: activeTab === 'posts' ? '2px solid var(--primary)' : '2px solid transparent' }}
                >
                    Post
                </button>

            </div>

            {/* Content */}
            <div style={{ flex: '2 1 600px', backgroundColor: '#111', padding: '3rem', border: '1px solid #333', overflowX: 'auto' }}>

                {activeTab === 'overview' && (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '2rem' }}>Tổng Quan Hệ Thống</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>

                            {/* Tổng Doanh Thu */}
                            <div style={{ backgroundColor: '#222', padding: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
                                <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>Tổng Doanh Thu</p>
                                <h4 style={{ fontSize: '2rem', color: '#fff' }}>{new Intl.NumberFormat('vi-VN').format(allOrders.filter(o => o.status === 'DONE').reduce((acc, o) => acc + o.totalAmount, 0))}₫</h4>
                                <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '10px' }}>Đơn hàng thành công</p>
                            </div>

                            {/* Tổng Lợi Nhuận */}
                            <div style={{ backgroundColor: '#222', padding: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
                                <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>Tổng Lợi Nhuận</p>
                                <h4 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{new Intl.NumberFormat('vi-VN').format(inventoryCards.filter(c => c.status === 'DONE').reduce((acc, c) => acc + ((c.price || 0) - (c.cost || 0)), 0))}₫</h4>
                                <p style={{ color: 'rgba(68, 214, 44, 0.8)', fontSize: '0.8rem', marginTop: '10px' }}>Từ thẻ Garena đã bán</p>
                            </div>

                            {/* Supabase DB Size — LIVE */}
                            <div style={{ backgroundColor: '#222', padding: '2rem', border: `1px solid ${systemStats?.supabase ? '#1c6b3a' : '#333'}`, borderRadius: '8px' }}>
                                <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>Database (Supabase)</p>
                                {systemStatsLoading ? (
                                    <h4 style={{ fontSize: '1.5rem', color: '#555' }}>Đang tải...</h4>
                                ) : systemStats?.supabase ? (
                                    <>
                                        <h4 style={{ fontSize: '2rem', color: '#fff' }}>{systemStats.supabase.label}</h4>
                                        {/* Progress bar */}
                                        <div style={{ width: '100%', height: '6px', backgroundColor: '#333', borderRadius: '3px', overflow: 'hidden', marginTop: '12px' }}>
                                            <div style={{
                                                width: `${systemStats.supabase.dbUsedPercent}%`,
                                                height: '100%',
                                                backgroundColor: parseFloat(systemStats.supabase.dbUsedPercent) > 80 ? '#ff4d4f' : 'var(--primary)',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                        <p style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: '8px' }}>🟢 Live · {systemStats.supabase.dbUsedPercent}% dùng</p>
                                    </>
                                ) : (
                                    <>
                                        <h4 style={{ fontSize: '2rem', color: '#fff' }}>-- / 0.5 GB</h4>
                                        <p style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '10px' }}>Không lấy được dữ liệu</p>
                                    </>
                                )}
                            </div>

                            {/* Vercel — Deployment & Usage */}
                            <div style={{ backgroundColor: '#222', padding: '2rem', border: `1px solid ${systemStats?.vercel?.hasToken ? '#1c6b3a' : '#333'}`, borderRadius: '8px' }}>
                                <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>Vercel Deploy</p>
                                {systemStatsLoading ? (
                                    <h4 style={{ fontSize: '1.5rem', color: '#555' }}>Đang tải...</h4>
                                ) : systemStats?.vercel?.hasToken ? (
                                    <>
                                        {systemStats.vercel.deployments?.[0] ? (
                                            <>
                                                <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '6px' }}>
                                                    {systemStats.vercel.deployments[0].state === 'READY'
                                                        ? '🟢 READY'
                                                        : systemStats.vercel.deployments[0].state === 'ERROR'
                                                            ? '🔴 ERROR'
                                                            : '🟡 ' + systemStats.vercel.deployments[0].state}
                                                </h4>
                                                <p style={{ color: '#aaa', fontSize: '0.75rem' }}>
                                                    {new Date(systemStats.vercel.deployments[0].createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </>
                                        ) : (
                                            <h4 style={{ fontSize: '1.4rem', color: '#fff' }}>Đã kết nối</h4>
                                        )}
                                        <p style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: '8px' }}>🟢 Vercel API Live</p>
                                    </>
                                ) : (
                                    <>
                                        <h4 style={{ fontSize: '1.3rem', color: '#FFD700' }}>Chưa có token</h4>
                                    </>
                                )}
                            </div>

                            {/* Kho Thẻ Còn */}
                            <div style={{ backgroundColor: '#222', padding: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
                                <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>Kho Thẻ Còn</p>
                                <h4 style={{ fontSize: '2rem', color: '#fff' }}>{systemStats?.app?.inventoryCount ?? '...'}</h4>
                                <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '10px' }}>Thẻ Garena chưa bán</p>
                            </div>

                            {/* Đơn Chờ Duyệt */}
                            <div style={{ backgroundColor: '#222', padding: '2rem', border: `1px solid ${(systemStats?.app?.pendingCount ?? 0) > 0 ? '#ff4d4f44' : '#333'}`, borderRadius: '8px' }}>
                                <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '10px' }}>Đơn Chờ Duyệt</p>
                                <h4 style={{ fontSize: '2rem', color: (systemStats?.app?.pendingCount ?? 0) > 0 ? '#ff4d4f' : '#fff' }}>{systemStats?.app?.pendingCount ?? '...'}</h4>
                                <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '10px' }}>Cần xử lý</p>
                            </div>

                        </div>

                        {/* Bảng Vercel Deployments */}
                        {systemStats?.vercel?.deployments?.length > 0 && (
                            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}>
                                <p style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '1rem' }}>Deployments Gần Nhất</p>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#ccc' }}>
                                    <thead>
                                        <tr style={{ color: '#555', textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: '1px solid #333' }}>
                                            <th style={{ padding: '8px 0', textAlign: 'left' }}>Trạng Thái</th>
                                            <th style={{ padding: '8px 0', textAlign: 'left' }}>URL</th>
                                            <th style={{ padding: '8px 0', textAlign: 'left' }}>Thời Gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {systemStats.vercel.deployments.map((d: any, i: number) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '10px 0' }}>
                                                    <span style={{
                                                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem',
                                                        backgroundColor: d.state === 'READY' ? 'rgba(68,214,44,0.15)' : d.state === 'ERROR' ? 'rgba(255,77,79,0.15)' : 'rgba(255,165,0,0.15)',
                                                        color: d.state === 'READY' ? 'var(--primary)' : d.state === 'ERROR' ? '#ff4d4f' : 'orange'
                                                    }}>{d.state}</span>
                                                </td>
                                                <td style={{ padding: '10px 0', color: '#aaa', fontSize: '0.8rem' }}>{d.url}</td>
                                                <td style={{ padding: '10px 0', color: '#666', fontSize: '0.8rem' }}>{new Date(d.createdAt).toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* App stats row */}
                        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            <div style={{ backgroundColor: '#1a1a1a', padding: '1rem 1.5rem', border: '1px solid #2a2a2a', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>Người dùng</span>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem' }}>{systemStats?.app?.userCount ?? '...'}</span>
                            </div>
                            <div style={{ backgroundColor: '#1a1a1a', padding: '1rem 1.5rem', border: '1px solid #2a2a2a', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#888', fontSize: '0.9rem' }}>Đơn DONE</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.3rem' }}>{systemStats?.app?.orderCount ?? '...'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '2rem' }}>Đơn Hàng Cần Xác Nhận</h3>

                        {orders.length === 0 ? (
                            <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Hiện chưa có đơn hàng mới nào chờ duyệt.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #333', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '15px 0' }}>Khách Hàng</th>
                                        <th>Sản Phẩm</th>
                                        <th>Số Tiền</th>
                                        <th>Ngày / Giờ</th>
                                        <th>Trạng Thái</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '20px 0', fontWeight: 'bold' }}>{o.user?.username || o.userId}</td>
                                            <td style={{ color: '#ccc' }}>{o.productName}</td>
                                            <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(o.totalAmount)}₫</td>
                                            <td style={{ color: '#888' }}>{new Intl.DateTimeFormat('vi-VN', { timeStyle: 'short', dateStyle: 'short' }).format(new Date(o.createdAt))}</td>
                                            <td>
                                                <span style={{ backgroundColor: 'rgba(255, 165, 0, 0.2)', color: 'orange', padding: '5px 10px', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                                    Pending
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleApproveOrder(o.id)}
                                                        className="btn-primary" style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                                                    >
                                                        Xác Nhận
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectOrder(o.id)}
                                                        style={{ padding: '8px 15px', fontSize: '0.85rem', backgroundColor: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                    >
                                                        Từ Chối
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'all_orders' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>Danh Sách Đơn Hàng</h3>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm mã đơn hàng (ID)..."
                                    value={allOrdersSearchTerm}
                                    onChange={(e) => setAllOrdersSearchTerm(e.target.value)}
                                    style={{
                                        padding: '10px 15px',
                                        backgroundColor: '#222',
                                        border: '1px solid #444',
                                        color: '#fff',
                                        borderRadius: '4px',
                                        width: '300px'
                                    }}
                                />
                                <select
                                    value={allOrdersFilter}
                                    onChange={(e) => setAllOrdersFilter(e.target.value)}
                                    style={{
                                        padding: '10px 15px',
                                        backgroundColor: '#222',
                                        border: '1px solid #444',
                                        color: '#fff',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="price_asc">Giá: Thấp đến cao</option>
                                    <option value="price_desc">Giá: Cao đến thấp</option>
                                </select>
                            </div>
                        </div>

                        {filteredAllOrders.length === 0 ? (
                            <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Không tìm thấy đơn hàng nào.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff', minWidth: '900px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #333', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                            <th style={{ padding: '15px 0' }}>Mã Hóa Đơn</th>
                                            <th>Khách Hàng</th>
                                            <th>Sản Phẩm</th>
                                            <th>Số Tiền</th>
                                            <th>Ngày / Giờ</th>
                                            <th>Trạng Thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAllOrders.map((o) => (
                                            <tr key={o.id} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '15px 0', fontSize: '0.85rem', color: '#888' }}>#{o.id.substring(0, 8)}</td>
                                                <td style={{ fontWeight: 'bold' }}>{o.user?.username || o.userId}</td>
                                                <td style={{ color: '#ccc' }}>{o.productName} (x{o.quantity || 1})</td>
                                                <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(o.totalAmount)}₫</td>
                                                <td style={{ color: '#888', fontSize: '0.85rem' }}>{new Intl.DateTimeFormat('vi-VN', { timeStyle: 'short', dateStyle: 'short' }).format(new Date(o.createdAt))}</td>
                                                <td>
                                                    <span style={{
                                                        backgroundColor: o.status === 'DONE' ? 'rgba(68, 214, 44, 0.2)' : o.status === 'PENDING' ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)',
                                                        color: o.status === 'DONE' ? 'var(--primary)' : o.status === 'PENDING' ? 'orange' : 'red',
                                                        padding: '5px 10px', fontSize: '0.8rem', textTransform: 'uppercase', borderRadius: '4px'
                                                    }}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>Danh sách Bài Viết (Posts)</h3>
                            <button className="btn-primary" style={{ padding: '10px 20px' }}>+ Thêm mới</button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                    <th style={{ padding: '15px 0' }}>Tiêu Đề / Tướng</th>
                                    <th>Thumbnail</th>
                                    <th>Video MP4</th>
                                    <th>URL Chuyển Hướng</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '20px 0' }}>
                                            <div style={{ fontWeight: 600, color: '#fff' }}>{p.title}</div>
                                            <div style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>{p.hero}</div>
                                        </td>
                                        <td style={{ color: '#aaa', fontSize: '0.9rem' }}>{p.thumb}</td>
                                        <td style={{ color: '#aaa', fontSize: '0.9rem' }}>{p.video}</td>
                                        <td style={{ color: '#aaa', fontSize: '0.9rem' }}>{p.link}</td>
                                        <td>
                                            <button style={{ color: '#fff', border: '1px solid #444', padding: '8px 15px', marginRight: '5px' }}>Sửa</button>
                                            <button style={{ color: '#ff4d4f', border: '1px solid #ff4d4f', background: 'transparent', padding: '8px 15px', cursor: 'pointer' }}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'discounts' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>Danh Sách Thẻ Giảm Giá (TGG)</h3>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                    <th style={{ padding: '15px 0' }}>Tên Thẻ Giảm Giá</th>
                                    <th>Mức Giảm</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {membershipDiscounts.map((d, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '20px 0', fontWeight: 600, color: 'var(--primary)' }}>{d.code}</td>
                                        <td>{d.percent}%</td>
                                        <td>
                                            <button
                                                onClick={() => handleSendCode(index)}
                                                style={{ color: '#fff', border: '1px solid #444', padding: '8px 15px', backgroundColor: '#333', cursor: 'pointer', borderRadius: '4px' }}
                                            >
                                                Gửi Tặng Người Dùng
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>Quản lý Kho thẻ Garena</h3>
                            <button onClick={() => setShowAddInventoryForm(!showAddInventoryForm)} className="btn-primary" style={{ padding: '10px 20px' }}>
                                {showAddInventoryForm ? 'Thoát' : '+ Nhập Thẻ Mới'}
                            </button>
                        </div>

                        {showAddInventoryForm && (
                            <div style={{ backgroundColor: '#222', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #444', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <h4 style={{ color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '1rem' }}>Nhập Thẻ Garena Mới</h4>

                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 200px' }}>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Game</label>
                                        <input value={newInventoryData.game} onChange={e => setNewInventoryData({ ...newInventoryData, game: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} placeholder="Liên Quân" />
                                    </div>
                                    <div style={{ flex: '1 1 200px' }}>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Mệnh giá (VNĐ)</label>
                                        <select value={newInventoryData.cardValue} onChange={e => setNewInventoryData({ ...newInventoryData, cardValue: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                                            <option value={100000}>100.000 VNĐ</option>
                                            <option value={200000}>200.000 VNĐ</option>
                                            <option value={500000}>500.000 VNĐ</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 300px' }}>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Số Serial</label>
                                        <input value={newInventoryData.serial} onChange={e => setNewInventoryData({ ...newInventoryData, serial: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} placeholder="Ví dụ: 795317382" />
                                    </div>
                                    <div style={{ flex: '1 1 300px' }}>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Mã Nạp (PIN)</label>
                                        <input value={newInventoryData.pin} onChange={e => setNewInventoryData({ ...newInventoryData, pin: e.target.value })} style={{ width: '100%', padding: '10px', backgroundColor: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', letterSpacing: '2px' }} placeholder="Ví dụ: 8380900809093927" />
                                    </div>
                                </div>

                                <button onClick={handleAddInventory} className="btn-primary" style={{ padding: '12px 20px', marginTop: '10px', alignSelf: 'flex-start', fontWeight: 'bold' }}>Lưu Thẻ Vào Kho</button>
                            </div>
                        )}

                        {inventoryCards.length === 0 ? (
                            <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Kho dữ liệu hiện đang trống.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff', minWidth: '800px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #333', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                            <th style={{ padding: '15px 0' }}>Game</th>
                                            <th>Serial</th>
                                            <th>Mã Nạp</th>
                                            <th>Quân Huy</th>
                                            <th>Giá Nhập</th>
                                            <th>Giá Bán</th>
                                            <th>Lợi Nhuận</th>
                                            <th>Trạng Thái</th>
                                            <th>Ngày Nhập</th>
                                            <th>Ngày Bán</th>
                                            <th>Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventoryCards.map((c) => (
                                            <tr key={c.id} style={{ borderBottom: '1px solid #222' }}>
                                                {editingInventoryId === c.id ? (
                                                    <>
                                                        <td style={{ padding: '20px 0' }}>
                                                            <input value={editFormData.game || ''} onChange={(e) => setEditFormData({ ...editFormData, game: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }} />
                                                        </td>
                                                        <td>
                                                            <input value={editFormData.serial || ''} onChange={(e) => setEditFormData({ ...editFormData, serial: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }} />
                                                        </td>
                                                        <td>
                                                            <input value={editFormData.pin || ''} onChange={(e) => setEditFormData({ ...editFormData, pin: e.target.value })} style={{ width: '100%', padding: '5px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }} />
                                                        </td>
                                                        <td>
                                                            <input type="number" value={editFormData.qh || ''} onChange={(e) => setEditFormData({ ...editFormData, qh: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '5px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }} />
                                                        </td>
                                                        <td style={{ color: '#888', fontSize: '0.9rem' }}>-</td>
                                                        <td style={{ color: '#888', fontSize: '0.9rem' }}>-</td>
                                                        <td style={{ color: '#888', fontSize: '0.9rem' }}>-</td>
                                                        <td>
                                                            <select value={editFormData.status || ''} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })} style={{ padding: '5px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>
                                                                <option value="NEW">NEW</option>
                                                                <option value="PENDING">PENDING</option>
                                                                <option value="DONE">DONE</option>
                                                            </select>
                                                        </td>
                                                        <td style={{ color: '#888' }}>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(c.inTime))}</td>
                                                        <td style={{ color: '#888' }}>{c.outTime ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(c.outTime)) : '-'}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <button onClick={handleSaveEdit} style={{ color: '#fff', border: '1px solid var(--primary)', padding: '5px 10px', backgroundColor: 'var(--primary)', borderRadius: '4px' }}>Lưu</button>
                                                                <button onClick={handleCancelEdit} style={{ color: '#fff', border: '1px solid #444', padding: '5px 10px', backgroundColor: 'transparent', borderRadius: '4px' }}>Hủy</button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ padding: '20px 0', fontWeight: 'bold' }}>{c.game}</td>
                                                        <td style={{ color: '#aaa' }}>{c.serial}</td>
                                                        <td style={{ color: '#fff', letterSpacing: '1px' }}>{c.pin}</td>
                                                        <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(c.qh || c.cardValue)}</td>
                                                        <td style={{ color: '#aaa', fontSize: '0.9rem' }}>{new Intl.NumberFormat('vi-VN').format(c.cost || 0)}₫</td>
                                                        <td style={{ color: '#aaa', fontSize: '0.9rem' }}>{new Intl.NumberFormat('vi-VN').format(c.price || 0)}₫</td>
                                                        <td style={{ color: 'rgba(68, 214, 44, 1)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format((c.price || 0) - (c.cost || 0))}₫</td>
                                                        <td>
                                                            <span style={{
                                                                backgroundColor: c.status === 'NEW' ? 'rgba(68, 214, 44, 0.2)' : 'rgba(255, 0, 0, 0.2)',
                                                                color: c.status === 'NEW' ? 'var(--primary)' : 'red',
                                                                padding: '5px 10px',
                                                                fontSize: '0.8rem',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {c.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: '#888' }}>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(c.inTime))}</td>
                                                        <td style={{ color: '#888' }}>{c.outTime ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(c.outTime)) : '-'}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <button
                                                                    onClick={() => handleEditClick(c)}
                                                                    style={{ color: '#fff', border: '1px solid #444', padding: '6px 12px', backgroundColor: 'transparent', borderRadius: '4px' }}
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteInventory(c.id, c.serial)}
                                                                    style={{ color: '#fff', border: '1px solid red', padding: '6px 12px', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '4px' }}
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>Quản Lý Người Dùng</h3>
                            <input
                                type="text"
                                placeholder="Tìm Username, Email, UID..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                style={{ padding: '8px 15px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#222', color: '#fff', width: '250px' }}
                            />
                        </div>

                        {filteredUsers.length === 0 ? (
                            <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Chưa có dữ liệu người dùng.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#fff' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #333', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '15px 0' }}>Username</th>
                                        <th>Email</th>
                                        <th>UID</th>
                                        <th>OpenID</th>
                                        <th>Số dư WCash</th>
                                        <th>Tổng Chi Tiêu</th>
                                        <th>Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '20px 0', fontWeight: 'bold' }}>{u.username}</td>
                                            <td style={{ color: '#aaa' }}>{u.email}</td>
                                            <td style={{ color: '#ccc' }}>{u.uid}</td>
                                            <td style={{ color: '#ccc' }}>{u.openid}</td>
                                            <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(u.whaleCash)}</td>
                                            <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(u.totalSpent)}₫</td>
                                            <td>
                                                <button
                                                    onClick={() => setSelectedUserDetail(u)}
                                                    style={{ color: '#fff', border: '1px solid #444', padding: '6px 12px', backgroundColor: 'transparent', borderRadius: '4px' }}
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </div>

            {selectedUserDetail && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '400px', border: '1px solid #333' }}>
                        <h3 style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                            Thông Tin Chi Tiết
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <p><strong>Username:</strong> <span style={{ color: '#ccc' }}>{selectedUserDetail.username}</span></p>
                            <p><strong>Email:</strong> <span style={{ color: '#ccc' }}>{selectedUserDetail.email}</span></p>
                            <p><strong>UID:</strong> <span style={{ color: '#ccc' }}>{selectedUserDetail.uid}</span></p>
                            <p><strong>OpenID:</strong> <span style={{ color: '#ccc' }}>{selectedUserDetail.openid}</span></p>
                            <p><strong>Số Dư:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(selectedUserDetail.whaleCash)} WCash</span></p>
                            <p><strong>Tổng Chi Tiêu:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(selectedUserDetail.totalSpent)}₫</span></p>
                        </div>

                        <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                            <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem', color: '#888', textTransform: 'uppercase' }}>Can thiệp Số dư (Thêm/Trừ WCash)</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    placeholder="Ví dụ: 1000 hoặc -500"
                                    value={manualWCash}
                                    onChange={(e) => setManualWCash(e.target.value === '' ? '' : Number(e.target.value))}
                                    style={{ flex: 1, padding: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                                />
                                <button
                                    onClick={handleManualWCash}
                                    style={{ padding: '10px 15px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Thực Thi
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedUserDetail(null)}
                            style={{ width: '100%', padding: '10px', marginTop: '2rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

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
