export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'Missing URL' });

  const match = url.match(/diskwala\.com\/(app|creator|playlist)\/([a-fA-F0-9]{24})/i);
  if (!match) {
    return res.json({ success: false, error: 'Invalid DiskWala URL.' });
  }

  const fileId = match[2];
  const headers = {
    'User-Agent': 'okhttp/4.9.0',
    'Accept': 'application/json',
    'Referer': 'https://www.diskwala.com/',
    'Origin': 'https://www.diskwala.com',
  };

  // Try all known API endpoint patterns with the file ID
  const apiAttempts = [
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/np_dedo/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/np_lelo/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/creator_files/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/all_ghusja/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/creator/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/appuser/np_dedo/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/appuser/creator_files/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/file?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/files/${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/media/${fileId}`,
    `https://api.diskwala.com/api/v1/file?id=${fileId}`,
    `https://api.diskwala.com/api/v1/files/${fileId}`,
  ];

  const results = [];

  for (const apiUrl of apiAttempts) {
    try {
      const r = await fetch(apiUrl, { headers });
      const status = r.status;
      let body = '';
      try { body = await r.text(); } catch(e) {}
      
      results.push({ url: apiUrl, status, body: body.substring(0, 200) });

      if (r.ok) {
        // Try to parse JSON and find video URL
        try {
          const data = JSON.parse(body);
          const videoUrl = data?.file_url || data?.url || data?.video_url 
            || data?.stream_url || data?.data?.file_url || data?.data?.url
            || data?.data?.video_url || data?.result?.url || data?.result?.file_url;
          if (videoUrl) {
            return res.json({ success: true, videoUrl, filename: `diskwala-${fileId.slice(0,8)}.mp4` });
          }
          // Return full response so we can see the structure
          return res.json({ success: false, error: 'Got 200 but no video URL found', debug: data });
        } catch(e) {
          return res.json({ success: false, error: 'Got 200 but response was not JSON', debug: body.substring(0, 500) });
        }
      }
    } catch(e) {
      results.push({ url: apiUrl, status: 'error', body: e.message });
    }
  }

  return res.json({ success: false, error: 'All endpoints failed', debug: results });
        }
            
