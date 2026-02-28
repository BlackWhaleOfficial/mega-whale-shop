import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';

import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
    title: 'Mega Whale Shop',
    description: 'Premium Garena Card Game Store',
    icons: {
        icon: '/favicon.ico',
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <Navbar />

                <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
                    {children}
                </main>

                <footer style={{
                    padding: '4rem 5%',
                    backgroundColor: '#0a0a0a',
                    borderTop: '1px solid #222',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '2rem',
                    color: '#888',
                    fontSize: '0.9rem'
                }}>
                    <div>
                        <h3 style={{ color: '#fff', marginBottom: '1rem', letterSpacing: '2px' }}>MEGA WHALE SHOP</h3>
                        <p>Premium card store for Garena games.</p>
                    </div>
                    <div>
                        <p>&copy; 2026 Mega Whale Shop. All rights reserved.</p>
                    </div>
                </footer>
                <Analytics />
            </body>
        </html>
    );
}
