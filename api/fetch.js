export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'Missing URL' });

  try {
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.diskwala.com/',
      },
      redirect: 'follow',
    });

    if (!pageRes.ok) {
      return res.json({ success: false, error: `Page returned ${pageRes.status}. Link may be private or expired.` });
    }

    const html = await pageRes.text();

    const patterns = [
      /<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video["']/i,
      /<video[^>]+src=["']([^"']+)["']/i,
      /<source[^>]+src=["']([^"']+\.mp4[^"']*)["']/i,
      /"videoUrl"\s*:\s*"([^"]+)"/i,
      /"video_url"\s*:\s*"([^"]+)"/i,
      /"file"\s*:\s*"(https?:\/\/[^"]+)"/i,
      /"url"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/i,
      /(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i,
    ];

    let videoUrl = null;
    for (const p of patterns) {
      const m = html.match(p);
      if (m && m[1]) {
        videoUrl = m[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
        break;
      }
    }

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const filename = titleMatch
      ? titleMatch[1].trim().replace(/[^a-z0-9\s]/gi, '').trim().replace(/\s+/g, '-').substring(0, 60) + '.mp4'
      : 'diskwala-video.mp4';

    if (videoUrl) return res.json({ success: true, videoUrl, filename });

    return res.json({ success: false, error: 'Could not find video. Link may require login or is unsupported.' });

  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
        }
