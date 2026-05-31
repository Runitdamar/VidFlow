export default async function handler(req, res) {
  const { url, download } = req.query;
  if (!url) return res.status(400).send('Missing url');

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://www.diskwala.com/',
      'Accept': '*/*',
    };

    if (req.headers.range) headers['Range'] = req.headers.range;

    const videoRes = await fetch(url, { headers });

    res.setHeader('Content-Type', videoRes.headers.get('content-type') || 'video/mp4');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');

    if (download) res.setHeader('Content-Disposition', 'attachment');
    if (videoRes.headers.get('content-length')) res.setHeader('Content-Length', videoRes.headers.get('content-length'));
    if (videoRes.headers.get('content-range')) res.setHeader('Content-Range', videoRes.headers.get('content-range'));
    if (videoRes.headers.get('accept-ranges')) res.setHeader('Accept-Ranges', videoRes.headers.get('accept-ranges'));

    res.status(videoRes.status);

    const reader = videoRes.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); break; }
        res.write(Buffer.from(value));
      }
    };
    await pump();

  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
}
