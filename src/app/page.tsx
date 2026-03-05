'use client';

import Image from 'next/image';
import Link from 'next/link';
import VideoPostCard from '../components/VideoPostCard';
import { ChevronsDown } from 'lucide-react';

const FEATURED_POSTS = [
    {
        id: 'dolia',
        title: 'Mã Khởi Thiên Ca',
        hero: 'Dolia',
        video: '/posts/dolia.mp4',
        thumb: '/posts/dolia.webp',
        desc: 'Sức mạnh khởi nguyên từ Thiên Ca. Tuyệt phẩm âm nhạc và nghệ thuật.',
        link: 'https://www.facebook.com/share/v/17xSQwG1rA/'
    },
    {
        id: 'lauriel',
        title: 'Mã Đẳng Cửu Thế',
        hero: 'Lauriel',
        video: '/posts/lauriel.mp4',
        thumb: '/posts/lauriel.webp',
        desc: 'Thiên sứ hạ phàm mang theo kỉ nguyên mới của ánh sáng và quyền lực.',
        link: 'https://www.facebook.com/share/v/1E35jqTymL/'
    },
    {
        id: 'valhein',
        title: 'Mã Hành Vạn Lý',
        hero: 'Valhein',
        video: '/posts/valhein.mp4',
        thumb: '/posts/valhein.webp',
        desc: 'Chiến thần viễn chinh không khoan nhượng. Tiên phong mọi mặt trận.',
        link: 'https://www.facebook.com/share/v/18RrkRQniY/'
    }
];

export default function Home() {
    return (
        <>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: '8%',
                backgroundColor: '#000'
            }}>
                <div className="hero-static-bg" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("/hero-pg.webp")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }} />

                {/* Background Video */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/hero-pg.webp"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 1,
                        opacity: 0.6
                    }}
                >
                    <source src="/hero-pg.mp4" type="video/mp4" />
                </video>

                {/* Dark Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.9))',
                    zIndex: 2
                }} />

                <div className="hero-content" style={{ maxWidth: '900px', zIndex: 10, position: 'relative' }}>
                    <h1 className="hero-title" style={{
                        fontSize: 'clamp(2.5rem, 10vw, 6rem)',
                        fontWeight: 900,
                        lineHeight: 1,
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        color: '#fff',
                        letterSpacing: '-2px'
                    }}>
                        MEGA WHALE<br />
                        <span style={{ color: 'var(--primary)', display: 'inline-block' }}>SHOP</span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(0.9rem, 3vw, 1.25rem)',
                        marginBottom: '3rem',
                        color: '#bbb',
                        maxWidth: '550px',
                        lineHeight: 1.6,
                        fontWeight: 500
                    }}>
                        Thành viên của Đào Tạo Siêu Sao<br />
                        Nơi mua Thẻ Garena Chiết Khấu Uy tín<br />
                        Giao lưu FULL Skin FULL Tướng
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <Link href="/nap-game" className="btn-primary" style={{ padding: 'clamp(14px, 4vw, 18px) clamp(30px, 8vw, 45px)', fontSize: '1.1rem', borderRadius: '4px' }}>
                            NẠP NGAY
                        </Link>
                    </div>
                </div>

                {/* Scroll Hint */}
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--primary)',
                    animation: 'bounce 2s infinite'
                }}>
                    <ChevronsDown size={40} />
                </div>
            </section>

            <style jsx global>{`
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);}
                    40% {transform: translateY(-10px) translateX(-50%);}
                    60% {transform: translateY(-5px) translateX(-50%);}
                }
                
                @media (max-width: 480px) {
                    .hero-content {
                        padding-right: 8%;
                    }
                    .hero-title {
                        font-size: 2.8rem !important;
                        letter-spacing: -1px !important;
                    }
                }

                @media (min-width: 1024px) {
                    .hero-static-bg {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Featured Section */}
            <section style={{ padding: '8rem 8%', backgroundColor: '#050505', borderRadius: '40px 40px 0 0', marginTop: '-40px', position: 'relative', zIndex: 20 }}>
                <h2 className="section-title">SKIN MỚI NỔI BẬT</h2>


                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '3rem',
                    marginTop: '4rem'
                }}>
                    {FEATURED_POSTS.map((post: any) => (
                        <VideoPostCard
                            key={post.id}
                            hero={post.hero}
                            title={post.title}
                            desc={post.desc}
                            thumb={post.thumb}
                            video={post.video}
                            link={post.link}
                        />
                    ))}
                </div>
            </section>

            {/* Brand Ethos */}
            <section style={{
                padding: 'clamp(5rem, 15vw, 10rem) 5%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.7)), url("/trust-bg.webp") no-repeat center / cover',
                backgroundAttachment: 'fixed'
            }}>
                <div style={{ maxWidth: '800px' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 300, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: 'clamp(2px, 4vw, 4px)' }}>
                        Uy Tín Là <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Sức Mạnh</span>
                    </h2>
                    <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: '#ccc', lineHeight: 1.8, marginBottom: '2rem' }}>
                        Mỗi giao dịch tại Mega Whale Shop đều được mã hoá và đảm bảo an toàn tuyệt đối. Chúng tôi không chỉ bán card, chúng tôi mang tới một phong cách sống đậm chất game thủ.
                    </p>
                    <Link href="/nap-game" className="btn-outline" style={{ padding: 'clamp(12px, 3vw, 16px) clamp(20px, 6vw, 40px)', fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>Trải nghiệm ngay</Link>
                </div>
            </section>
        </>
    );
}
