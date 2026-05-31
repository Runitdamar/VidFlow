export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'Missing URL' });

  // Extract the file ID from the URL
  // Supports: https://www.diskwala.com/app/6a1ac5d67996306c222527d1
  const match = url.match(/diskwala\.com\/(app|creator|playlist)\/([a-fA-F0-9]{24})/i);
  if (!match) {
    return res.json({ success: false, error: 'Invalid DiskWala URL. Must be like: https://www.diskwala.com/app/XXXXXX' });
  }

  const fileId = match[2];

  try {
    // Hit DiskWala's real API endpoint discovered from APK
    const apiUrl = `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/all_ghusja/v2?id=${fileId}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'okhttp/4.9.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Version': '1',
        'Referer': 'https://www.diskwala.com/',
        'Origin': 'https://www.diskwala.com',
      },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      // Try to find video URL in response
      const videoUrl = data?.file_url || data?.url || data?.video_url || data?.stream_url
        || data?.data?.file_url || data?.data?.url || data?.data?.video_url;

      if (videoUrl) {
        return res.json({ success: true, videoUrl, filename: data?.name || 'diskwala-video.mp4' });
      }
    }

    // Try alternate endpoint
    const apiUrl2 = `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/creator_files/v2?id=${fileId}`;
    const apiRes2 = await fetch(apiUrl2, {
      headers: {
        'User-Agent': 'okhttp/4.9.0',
        'Accept': 'application/json',
        'Referer': 'https://www.diskwala.com/',
      },
    });

    if (apiRes2.ok) {
      const data2 = await apiRes2.json();
      const videoUrl = data2?.file_url || data2?.url || data2?.video_url
        || data2?.data?.file_url || data2?.data?.url;

      if (videoUrl) {
        return res.json({ success: true, videoUrl, filename: data2?.name || 'diskwala-video.mp4' });
      }

      // Return raw response for debugging
      return res.json({
        success: false,
        error: 'Got API response but could not find video URL.',
        debug: JSON.stringify(data2).substring(0, 500),
      });
    }

    // Fallback: try direct CDN construction
    const cdnUrl = `https://cdns3in.diskwala.com/${fileId}`;
    return res.json({
      success: false,
      error: `API returned ${apiRes.status}. File may be private or require login.`,
      debug: `Tried: ${apiUrl}`,
    });

  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
      }
        
