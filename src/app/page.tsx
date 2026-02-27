import Image from 'next/image';
import Link from 'next/link';
import VideoPostCard from '../components/VideoPostCard';

const FEATURED_POSTS = [
    {
        id: 'dolia',
        title: 'Mã Khởi Thiên Ca',
        hero: 'Dolia',
        video: '/posts/dolia.mp4',
        thumb: '/posts/dolia.png',
        desc: 'Sức mạnh khởi nguyên từ Thiên Ca. Tuyệt phẩm âm nhạc và nghệ thuật.',
        link: 'https://www.facebook.com/share/v/17xSQwG1rA/'
    },
    {
        id: 'lauriel',
        title: 'Mã Đẳng Cửu Thế',
        hero: 'Lauriel',
        video: '/posts/lauriel.mp4',
        thumb: '/posts/lauriel.png',
        desc: 'Thiên sứ hạ phàm mang theo kỉ nguyên mới của ánh sáng và quyền lực.',
        link: 'https://www.facebook.com/share/v/1E35jqTymL/'
    },
    {
        id: 'valhein',
        title: 'Mã Hành Vạn Lý',
        hero: 'Valhein',
        video: '/posts/valhein.mp4',
        thumb: '/posts/valhein.png',
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
                height: '90vh',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'flex-end',
                paddingBottom: '5rem',
                paddingLeft: '5%'
            }}>
                {/* Background Video */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                    }}
                >
                    <source src="/hero-bg.mp4" type="video/mp4" />
                </video>

                {/* Dark Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.9))',
                    zIndex: 1
                }} />

                <div style={{ maxWidth: '800px', zIndex: 10, position: 'relative' }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 5rem)',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        color: '#fff',
                        letterSpacing: 'clamp(2px, 3vw, 5px)'
                    }}>
                        MEGA WHALE<br />SHOP
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                        marginBottom: '3rem',
                        color: '#ccc',
                        maxWidth: '600px',
                        lineHeight: 1.6
                    }}>
                        Thành viên của Đào Tạo Siêu Sao. Nơi mua thẻ Garena Chiết Khấu Uy tín.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <Link href="/nap-game" className="btn-primary" style={{ padding: 'clamp(12px, 3vw, 16px) clamp(20px, 6vw, 40px)', fontSize: 'clamp(1rem, 3vw, 1.2rem)', textAlign: 'center' }}>
                            NẠP NGAY
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section style={{ padding: 'clamp(4rem, 10vw, 8rem) 5%', backgroundColor: '#000' }}>
                <h2 className="section-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', paddingLeft: 'clamp(0.5rem, 2vw, 1rem)' }}>Skin Mới Nổi Bật</h2>

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
                background: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.7)), url("/trust-bg.png") no-repeat center / cover',
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
