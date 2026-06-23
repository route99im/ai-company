export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST만 허용됩니다' });
  }

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: '텍스트가 없습니다' });

  const ACCESS_TOKEN = process.env.THREADS_ACCESS_TOKEN;
  const USER_ID = process.env.THREADS_USER_ID;

  try {
    // 1단계: 컨테이너 생성
    const createRes = await fetch(`https://graph.threads.net/v1.0/${USER_ID}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'TEXT',
        text: text,
        access_token: ACCESS_TOKEN,
      }),
    });
    const createData = await createRes.json();
    if (!createData.id) return res.status(500).json({ error: '컨테이너 생성 실패', detail: createData });

    // 2단계: 게시
    const publishRes = await fetch(`https://graph.threads.net/v1.0/${USER_ID}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: ACCESS_TOKEN,
      }),
    });
    const publishData = await publishRes.json();
    if (!publishData.id) return res.status(500).json({ error: '게시 실패', detail: publishData });

    res.status(200).json({ success: true, post_id: publishData.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
