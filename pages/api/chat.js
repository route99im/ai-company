export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST만 허용됩니다' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'Anthropic 오류' });
    }

    const text = data.content?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: '응답 파싱 실패: ' + JSON.stringify(data) });
    }

    res.status(200).json({ content: [{ text }] });
  } catch (error) {
    res.status(500).json({ error: '서버 오류: ' + error.message });
  }
}
