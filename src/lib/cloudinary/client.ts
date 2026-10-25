/**
 * Cloudinary Client Helper for transforms, upload, and verification badges
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'thumb' | 'fit' | 'scale';
  gravity?: 'face' | 'center' | 'auto';
  radius?: 'max' | number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
}

/**
 * Builds an optimized Cloudinary delivery URL with transformations.
 * If the URL is already an external HTTP URL or local data-URL, it preserves it gracefully.
 */
export function getTransformedCloudinaryUrl(
  urlOrPublicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!urlOrPublicId) return '';

  // If already full Cloudinary URL
  if (urlOrPublicId.includes('res.cloudinary.com')) {
    const parts = urlOrPublicId.split('/upload/');
    if (parts.length === 2) {
      const transformParts: string[] = [];
      if (options.crop) transformParts.push(`c_${options.crop}`);
      if (options.gravity) transformParts.push(`g_${options.gravity}`);
      if (options.width) transformParts.push(`w_${options.width}`);
      if (options.height) transformParts.push(`h_${options.height}`);
      if (options.radius) transformParts.push(`r_${options.radius}`);
      transformParts.push('f_auto,q_auto');

      const transformStr = transformParts.join(',');
      return `${parts[0]}/upload/${transformStr}/${parts[1]}`;
    }
    return urlOrPublicId;
  }

  // If Unsplash or generic image, append dimensions
  if (urlOrPublicId.includes('images.unsplash.com')) {
    const u = new URL(urlOrPublicId);
    if (options.width) u.searchParams.set('w', options.width.toString());
    if (options.height) u.searchParams.set('h', options.height.toString());
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    return u.toString();
  }

  return urlOrPublicId;
}

/**
 * Client-side file uploader:
 * 1. Calls /api/cloudinary-sign to get secure signature
 * 2. Uploads file directly to Cloudinary upload endpoint
 * 3. Falls back gracefully to base64 DataURL if Cloudinary API keys are not yet configured in .env
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'airpool_passengers'
): Promise<{ secureUrl: string; isRealCloudinary: boolean }> {
  try {
    const signRes = await fetch('/api/cloudinary-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });

    const signData = await signRes.json();

    if (signData.configured && signData.apiKey && signData.signature) {
      // Direct authenticated Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp.toString());
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (uploadRes.ok) {
        const uploadResult = await uploadRes.json();
        return {
          secureUrl: uploadResult.secure_url,
          isRealCloudinary: true,
        };
      }
    }
  } catch (err) {
    console.warn('Real Cloudinary upload attempted but not connected, falling back to local preview:', err);
  }

  // Local fallback reader for demo/testing without credentials
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        secureUrl: reader.result as string,
        isRealCloudinary: false,
      });
    };
    reader.readAsDataURL(file);
  });
}
