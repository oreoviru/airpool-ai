import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || 'airpool_passengers';
    const timestamp = Math.round(new Date().getTime() / 1000);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary credentials are fully configured
    const isConfigured = Boolean(
      cloudName &&
      apiKey &&
      apiSecret &&
      !cloudName.includes('your-') &&
      !apiSecret.includes('your-')
    );

    if (!isConfigured) {
      // Graceful fallback for hackathon judges running demo locally without Cloudinary credentials
      return NextResponse.json({
        configured: false,
        timestamp,
        folder,
        message: 'Cloudinary credentials not provided in .env. Falling back to client-safe simulated asset processing.',
      });
    }

    // Parameters to sign in alphabetical order
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha256')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    return NextResponse.json({
      configured: true,
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    console.error('Cloudinary sign route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
