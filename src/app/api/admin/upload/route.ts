import { NextResponse } from 'next/server';
import { getSession } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { image } = body;

        if (!image) {
            return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
        }

        const formData = new FormData();
        formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
        formData.append('source', image);
        formData.append('format', 'json');

        const uploadResponse = await fetch('https://freeimage.host/api/1/upload', {
            method: 'POST',
            body: formData,
            referrerPolicy: 'no-referrer',
        });

        const data = await uploadResponse.json();

        if (data.status_code === 200 && data.image && data.image.url) {
            return NextResponse.json({ url: data.image.url });
        } else {
            console.error('Upload Error:', data);
            return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Image upload error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
