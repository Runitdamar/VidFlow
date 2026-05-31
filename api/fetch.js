export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'Missing URL' });

  const match = url.match(/diskwala\.com\/(app|creator|playlist)\/([a-fA-F0-9]{24})/i);
  if (!match) {
    return res.json({ success: false, error: 'Invalid DiskWala URL. Must be like: https://www.diskwala.com/app/XXXXXX' });
  }

  const fileId = match[2];

  // All known CDN/API patterns from APK reverse engineering
  const attempts = [
    // CloudFront CDN (primary video delivery)
    `https://da08ctfrofx1b.cloudfront.net/${fileId}`,
    `https://da08ctfrofx1b.cloudfront.net/uploads/${fileId}`,
    `https://da08ctfrofx1b.cloudfront.net/videos/${fileId}`,
    `https://da08ctfrofx1b.cloudfront.net/files/${fileId}`,
    // DiskWala CDN
    `https://cdns3in.diskwala.com/${fileId}`,
    `https://cdns3in.diskwala.com/uploads/${fileId}`,
    `https://cdns3in.diskwala.com/videos/${fileId}`,
  ];

  const headers = {
    'User-Agent': 'okhttp/4.9.0',
    'Referer': 'https://www.diskwala.com/',
    'Origin': 'https://www.diskwala.com',
  };

  for (const cdnUrl of attempts) {
    try {
      const r = await fetch(cdnUrl, { method: 'HEAD', headers });
      if (r.ok || r.status === 206) {
        const ct = r.headers.get('content-type') || '';
        if (ct.includes('video') || ct.includes('octet') || ct.includes('mp4')) {
          return res.json({ success: true, videoUrl: cdnUrl, filename: `${fileId}.mp4` });
        }
      }
      // Even a 403 means the file EXISTS on CDN — return it and try to play
      if (r.status === 403) {
        return res.json({ 
          success: false, 
          error: 'This file requires login to access. DiskWala CDN returned 403 (Forbidden). The file exists but is protected.',
          debug: `CDN URL tried: ${cdnUrl}`
        });
      }
    } catch (e) { continue; }
  }

  return res.json({
    success: false,
    error: 'DiskWala requires login to access files. Their API needs a Firebase auth token which is only available after signing in through their app.',
    debug: `File ID: ${fileId}`
  });
}

