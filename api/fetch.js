export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'Missing URL' });

  const match = url.match(/diskwala\.com\/(app|creator|playlist)\/([a-fA-F0-9]{24})/i);
  if (!match) return res.json({ success: false, error: 'Invalid DiskWala URL.' });

  const fileId = match[2];
  const APPICRPT = 'eyJwIjoiZXlKd0lqb2lUVVpyZDBWM1dVaExiMXBKZW1vd1EwRlJXVWxMYjFwSmVtb3dSRUZSWTBSUlowRkZiMHhhVGpkbk5VUm5OVEpLTDFJNWFrUlhRbUZ4U1UxSVdGWnVVRXhzVlVNd09VWkdlSGR5VWpoT1pWQkVhVWRCTUVSM2IzQjVXRFIwY2pKNVYyZEpUREZSWlhGcVltbHRaVzQwTnpCb05GbE5WbU52U0djOVBTSXNJbVFpT2lKVVducEJTRFJYTVM5M2VXMVBaMGROWjBVNFNIRktSRkZVZEVoVGNIcHpOSEZyTjBsUldubFNRemt5Wm1obVEwTmhSelJYUkZsbVdXRlVaVTVMVDFGMU0yOXlaVzVLWWtSbGJGVTFOR1J1WjJsQk0yTTBObGRqTjBoUlowWnpXUzl5UzJKeVZqYzFObU5xTVdGMVpYbGxhMlprUjNWb2IydFRhRTV5TlRCUVQyRnhUWGN3WjJ0aE9WSjZURXB0UmtReE1EVk9kRFoyYm5keE5GSldZa2RyUkhGNmJGaGFNbGR0WlVKd1EzcENhVUZDT0RJclFVMTFZVlU0WW5nck5WaFpXa2hRU0hRck4wZ3hNV1JXU1VwU04wYzJSazR6VFhoWWEwZ3hWbThyWmk4MmRVWXpWSEptZDAxS1NURktRamhZTTA5eU1XRjFkbFk1VURsck9HdEdNVVZrVkZwaFRWRlNjblpzUVZwalNESlRlVWRRYUZGSlJWRlBUa2c0YUhKUWJIRnpOV2gzYVdsS1lsaDBaMUJETWpaNU9EaFBaakZ4T0dsNVNVOVhOa3BqVFRSQmMwTk5RekE1YVc5SE9FMHJPRkZxSzFoUE1GbERSa0p1TW5sQ2NYVnRaVVJWVjFrMFV6Wk1hV1p4Y2xSaFZtdFZkelphZDFkR1kyWjJlbWRCY0d4T2VUa3haVzFZWW5RMmNGSlFXVGQzWW1weWJ6RXJjV1ppVkRKNE1tazBlV055THpsemVsZDJhVE5FWm1KaGRVbFhVV3B5VVVwSE5VNTFiVVV2VjBkdU9YWnJhV2RMTkM5TUszUmFNVXBrVGxnMGVsRXhTRXRhWm5rdk5rMWtWeXRWVjA5VE9Ib3phVkF6Y0ZGT2JtdGpZVUZFT0RGb1IwTjBaREV4VWpoTWNrbEpUMHMwZDBSTGEwRnhOVzAzZVVKd1NqZDVVMUF3UW1oTVRFNURNbTlyTVhWT2JYQk5jSHBGYkZsNlNpc3pVVUpaUkROYVV5dEliVVY2WjBocU5Xd3dWa1pZZUhBMlJrRXhXbFZ2TTNsSFNWZExTMGszUmtsUlVITXdkRVJVWlVwVU1HUkhkVXd5T0RkME5EaGxUVGhhWms5WGFIaFlSRkZRUWtJMWFuRXlhRko2YldSUlFqaExMMXBOYTNNeGJEZEdhRFU0U2taVGVuZzJXVkoyTURKQlkwVlhTVWhRT0RWbVdUWnZXVk00TlV4SVprZ3hjRzE0YUZSSmJuWnVURnBGTUVOU1ZuRlFiaTluWkVWck5saHFSbFF4VXpGTk1qQkhOV3BaVEdweFExTXlSR1pxUmpsa2NGWkViWFpaUmtSdVYwdFVSR1V4WkRKemFIbERaVXd4WjNKTWNVbFNOVVJCVFhCNFpHVllWazV6YVZkcFIxbE1OblF2UkhVMWRXMWpOMEp1S3pOalRrRlNNRGMzVUZwRE0yNVRhMWxwVERsak1sbHhPVTV2Y1hsa1VWTkpiak5LUTBkQk5rSjJWekZuYW1rMFMybDZOMlF6YzJsRWRsZzFaVmQ2T0hFck1WSnRiRUpTVTNsNFMwWTNSVGxTTm04dmQwSlNkRVZwU0d4V2RFZ3hkREE0VjBkTFkxTXlTV2xvYkRKWVJEQlRPRko1WWswM1pEVk9UakppTmxaemNYUmlkRXRGWjBWcmFqaFBUMVJuTDB0MGVtdDVWRkZTUWtaWWQyWTVZMnBCUWpGWGVuQm9MM3BvU2tGUlRtdENjbWwzU1RWaVJrUm1NVVJQVXpScE5EY3dhakp2SzJwV2NFNU1Oemd2VjJkdWMxbHNTR2xZUWtaWlF6SkZWMkZCVERJck1ERXpRVTlqTWxSdE4yOU9aeTg1VERZd1EyZFFTV2MyWjBWeFJXeE1aU3RqYUdGdGFWcFBURFpyZFcxRmFHczFaV05QVFd0b09HbDRlVUZNVGpNM1dWcHhUbEZ5TWxWUmVVcERNRTFPUW5oTU1HbGFRVWQyTW1jMmFtaHljMHBxWXpOblkwYzJXR2REWkhWS2NscG9ibWczVWpCbFNIcEdXa04yY1hSWGMwMUxSVXhRVVRWa1VEUXlTMnhTTUhGRWFYRkJSRGRLTmxvMU5FSTVkbk5hV1M5cUwwVk1WRlE0TlVaek1HeEtSRWwzV1hoU2NWRlZPRlkyYm14TFZqY3dja3c1VW5STmNESlFaVk4zYXk4d1NXdGFZbmhEVmt0ek1WcEJNbUp1U1U5VVEwOUpPV2xxYjI1SVZXaFhTM0JNTUd0UFRtNVVVRU5QZG1oRWEyaENObUpJZW5CRk1tZG9WR2xDVERKaVdGaFhjVlZUU1dSMk9XaEdSbkphU3pReWFFSjJUa2g0V0RndmFHWTBXakZaV2xGaVNrNUhTbmRaYzFKRlMwNXhVMlZMVlU5NVJXUTNWVE5tTnpsaWRHazBXV05CZEhGcFdHeG9ObVkyYld0bk1XbHhkVzAwZVVseE5qSk9OMFpGZURocFltcDVXWE5VUVd4S1Z6WndhVWxEYzJScGRXVmlUakp5UzJGbVVFUklRemxsWlUxalYwUkphWE4zUzI4eFRuaFJWelpLTmswemMxZFlkVkZ2YlVwTVJuWmFaRloyYVd3ck5XSlFhVWRaWVVGclUxTTVaM2RoYlVwQ1ZIQnBiRTEwVkdSQ2IyaFljMGx4UVVwTFJreHJZVFYzZW5SblVXVlZPV2RrU2psRk16UnVTbHBpZFdKVE9EQjFjbmhtUmxOb2RuQk9UMjloZDJsMFNqbE9ORXA2U1VOYVdIWkVVRTVMVTBGMVRWbDRabmhzVmpCSU1rc3ZjVEZXUmpkRlRUY3dNWGxuWlRZMVNUbERlWEJ0ZURaall6VkxjRTQzT1d4VlIzbEpSVFpwUkRobWRWVndUM293Y200MFpVY3pOV1pEUlc1b2JGWndiM0JoT1RKeU1EWkRkMGt4WTNWMGFuZENjRlZMYVZKb2JuRmhXRFZXY2taRldFbERWbk51Tkdkd2FWTkROR3hJVmtOblNWQXZaR1p1Y2toeE1sQXllR28xVW1SSk1EbEJlWEkwTVZBelIydzRXRkV4YTBkUFVWZENSRlpJVlZGWVZqbDRaMVV6YW5WVVlsWnRUM0JtVGl0cU5YbExlV0U0VlUxd2JubExRalpHWjJJemRYTTRUMHhaVTA1b1RIaEdRa2RuWlZZMlVXTndaM1ZVWlZKdVltRTFSa0V6YUZacVowRllhMnBOYTIwMFFXVkVNMU5aVnpsWkszQlphWGtyVTI5NVp5dHFVa1ZyY25BNWRsVkNNbWxTY2xZM1pFNVlaVXcyU2xKek1IQlRhREU1Y1ZkT2EyMUhPWEJxV1ZSSFRVVTBjVzVITlc1U1oxSkpPVVJQVURKaU1uTkRZV0pYVEhCWE1XRm1ZU3QzZWl0emFuaElNR1ZFU1hReGJWbENPSFF5WVZGVVRrMWljSGRqTURkaVdsQmlOMk5GVkZsNFUybFJTa1pQZGxwdE1XSmlNMVl4WldWcGVuRnNlVGx1ZEhFeVdsRk5NRGR5T1U0MGFFNU1aVzV5TVVJNWVrOVJNRVZHZDFGTEwwdDRhVXBHT0VrM1psaDVla1pQYVhNNFVtUnBTbmxaYWtrM2JGa3pkMHhWTVhWbFVXbENZakJtUzBoa1NsYzNjRXBwU1U5d1duTnVaa2h2TUVoRVdtWnNSV1JaUVRZMVR6QnRVRXR5YmpsSlJuSkxkemRNWkNzeWIxSm1PSEo1WjBGd1VUUkNRWHBOUW1wRGFsUlBNV2xQWWtRMWNIWm5Na2Q0T1dsQ1VHdHRVR0Z3ZUdwNVEzazRablF4Y2taNlJtUk5helozVm1WV1NuZFdjbUl2YWpkaVZEVklPRGxhVkZKM1VreHZjMXBhZFdjcmVHaExkMDlNTUdKRFFUUnRhWFJaV1VocWVVNUJZMHRtVTNZMU5ETmFPVGQyYlU1V2R6Vkpka1pzYmpOWlVXaFhOVE5OVEZGTVZHbFJTWEZwZUc4clkwVjFkblExYVROQ1YwODJSa1ZNYzBoT1pFeHJUbVpFUW1VeVNGRnFaRTgyV2tGbEwzZFdVRXRhVlZSVVZIY3dNRzgzY25Cb1FsTXpkR2h4Ymtsb2JUazJiWEZsZFROb2RIVk1VekJvU1ZOSllXeFpjRmx3Y0dsaFZXSXlNRlp1TWpOMmNuVndWa2RoYXk5d2VHZFpUV0prTWtweVJtRnZUbHBzUkZWRmFHd3hjR05ET0d4c1RVOXlaMUF2V1hoemMzRm9UblZNYldSeVlrZEZha3RUUlVsblFUQkdZamQxYWs4MFJEUXdRM1ZIUmtscFRpOW5PQ3RvZGpWMFpqWmlZVlZzTTJ0bmJGZzRlbmxPTVd4MFJtMUVVVVZZUVRCSVRtNXFOblJ6TUVWRFREWlRWRFV5YW5wUmFFRTNUSGg2TDBvM1dXSmFWRVV4UzJabVFrRkZkRmRMTDNwRldVbFJUWE56VkU5V05FRlJkWHBsTWtwMWRWbFdXVmwxYld0bU1Hc3daMHBzUjFSR05ESlJjVWhpUWxwNVFscGhRMGhhVTFoVFdIRm1RbnB3TkdKWlYyRnJka0pyUVdweFF6QnZibGxqZEc0eU4wRllPR2RDTDJSeVdIZFhhamRZUVRrNVNWUmthMUJxYVZWQmRVYzNLMlkyZGk5NE1FVklNVUY1YjNKUVIweEtjVGhaVlV0YWFtVjJPRk5WWlZOdlMzRllSbGwwUjJ4V1dUUmtSbXh1ZFdScWJHSjZOa3hhWm01cU1FOVpRelp6YWtVNE9YZHdOWEJ1ZHpSdFUyTlJOeXRhY1hVelRHazBZbnBhUVZGNFVXOUdXVlZ5VWtreVExRmhPVnBVVkVKdFdUVndlV3BYTVRjMVYyTkRiVXh2UjJKMmNHbDVWMWxSU2t0aFJVWmthWE5vUXpaWlpFWnFWVkpXWlZCSFRYZFVTRkJzY0ROUE5ITlFVMUkzTVZFeE5UaENZVTVJYUVab00zRTJWMGM0TDFSMFNGQktkMnhVWkZsNlNqRllXVFYwV1RGck9GaGFWVE5UYWtkM1JuSXZObFV5T1hvMlF6TjRZVGhvYzNReGFUWk9UbWhoVGxOeFUyOTFNbUZ1U3pjMk1YbEJZbEJwUm5GUmRHUjVRVmt4Vm1SdlFuVmpSbUo2TkhSQ05VWm1SRzlwUldwdFFVZHhVelZFYkV0WEx6VkljSFJVUkRkSGNVeHZkWE5OTkZSSWVDOTJiRmswUWxObmExZFdZMGRhZFc1UFp6RTRVbTVSZFRSM1pXeG5lVTVMY1hWS1RIUTVjSEpOUFNKOSIsInMiOiJDUVR1OGlvQ0NEMGdJQitjaDBVbEV5bDRWMHhYZTlqRUduVjFFUnlDTXYzdWUxVE9iRThOSmNTSHM0dERlbnVYZXFKeXBEN0tBY3pEWUk5OWJqdll4Zz09In0=';

  const headers = {
    'Appicrpt': APPICRPT,
    'User-Agent': 'okhttp/4.9.0',
    'Accept': 'application/json',
    'Referer': 'https://www.diskwala.com/',
  };

  const endpoints = [
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/np_dedo/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/np_lelo/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/creator_files/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/all_ghusja/v2?id=${fileId}`,
    `https://ddapidd.diskwala.com/api/v1/subscribers/appuser/pp_dedo/v2?id=${fileId}`,
  ];

  const results = [];

  for (const apiUrl of endpoints) {
    try {
      const r = await fetch(apiUrl, { headers });
      let text = '';
      try { text = await r.text(); } catch(e) { text = ''; }

      results.push({ url: apiUrl, status: r.status, body: text.substring(0, 400) });

      if (r.ok) {
        if (!text || text.trim() === '') {
          return res.json({ success: false, error: 'Got 200 but empty response', debug: results });
        }
        try {
          const data = JSON.parse(text);
          const videoUrl = data?.file_url || data?.url || data?.video_url
            || data?.stream_url || data?.data?.file_url || data?.data?.url
            || data?.data?.video_url || data?.result?.url || data?.result?.file_url
            || data?.link || data?.data?.link || data?.data?.stream;
          if (videoUrl) {
            return res.json({ success: true, videoUrl, filename: data?.name || data?.data?.name || 'diskwala-video.mp4' });
          }
          // Got 200 + JSON but no video URL - show full structure
          return res.json({ success: false, error: 'Got response, need to find video key', debug: data });
        } catch(e) {
          return res.json({ success: false, error: 'Got 200 but not JSON', debug: text.substring(0, 600) });
        }
      }
    } catch(e) {
      results.push({ url: apiUrl, status: 'error', body: e.message });
    }
  }

  return res.json({ success: false, error: 'All endpoints failed', debug: results });
    }
            
