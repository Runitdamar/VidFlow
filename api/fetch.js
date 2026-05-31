export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'Missing URL' });

  const match = url.match(/diskwala\.com\/(app|creator|playlist)\/([a-fA-F0-9]{24})/i);
  if (!match) {
    return res.json({ success: false, error: 'Invalid DiskWala URL. Must be like: https://www.diskwala.com/app/XXXXXX' });
  }

  const fileId = match[2];
  const CDN = 'https://da08ctfrofx1b.cloudfront.net';

  // URL patterns discovered from APK reverse engineering
  // np = non-premium, pp = premium, dedo/lelo = quality variants
  const attempts = [
    `${CDN}/appuser/np_dedo/v2/${fileId}`,
    `${CDN}/appuser/np_lelo/v2/${fileId}`,
    `${CDN}/appuser/pp_dedo/v2/${fileId}`,
    `${CDN}/appuser/pp_lelo/v2/${fileId}`,
    `${CDN}/appuser/creator_files/v2/${fileId}`,
    `${CDN}/appuser/all_ghusja/v2/${fileId}`,
    `${CDN}/appuser/playlist_items/v2/${fileId}`,
    `${CDN}/${fileId}`,
  ];

  const headers = {
    'User-Agent': 'okhttp/4.9.0',
    'Referer': 'https://www.diskwala.com/',
    'Origin': 'https://www.diskwala.com',
  };

  const results = [];

  for (const cdnUrl of attempts) {
    try {
      const r = await fetch(cdnUrl, { method: 'HEAD', headers, redirect: 'follow' });
      results.push({ url: cdnUrl, status: r.status, ct: r.headers.get('content-type') || '' });
      
      if (r.ok || r.status === 206) {
        return res.json({ 
          success: true, 
          videoUrl: cdnUrl, 
          filename: `diskwala-${fileId.substring(0,8)}.mp4` 
        });
      }
    } catch (e) {
      results.push({ url: cdnUrl, status: 'error', ct: e.message });
    }
  }

  // Return debug info to help us narrow down
  return res.json({
    success: false,
    error: 'Could not find video. See debug for status codes.',
    debug: results,
  });
}

