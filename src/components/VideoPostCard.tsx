'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

interface VideoPostCardProps {
    hero: string;
    title: string;
    desc: string;
    thumb: string;
    video: string;
    link: string;
}

export default function VideoPostCard({ hero, title, desc, thumb, video, link }: VideoPostCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.currentTime = 0; // reset video to start
            videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    return (
        <div
            className="glass-card"
            style={{
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
        >
            <div style={{ height: '400px', position: 'relative', backgroundColor: '#000', overflow: 'hidden' }}>
                <img
                    src={thumb}
                    alt={title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        opacity: isHovered ? 0 : 1,
                        transition: 'opacity 0.6s ease',
                        zIndex: 1
                    }}
                />
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    loop
                    autoPlay
                    poster={thumb}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isHovered ? 1 : 0.8, // subtle opacity change
                        transition: 'opacity 0.6s ease',
                        zIndex: 0
                    }}
                >
                    <source src={video} type="video/mp4" />
                </video>
            </div>
            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {hero}
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>{title}</h3>
                <p style={{ color: '#888', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem', flex: 1 }}>{desc}</p>
                <Link href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                    Khám Phá <span style={{ color: 'var(--primary)', transition: 'transform 0.3s', transform: isHovered ? 'translateX(5px)' : 'none' }}>&rarr;</span>
                </Link>
            </div>
        </div>
    );
}
