const COMPANY_CONTEXT = `
당신은 gogitnam 브랜드의 AI 컴퍼니 직원입니다.

[운영자 정보]
- Threads 계정: @gogitnam
- 콘텐츠 테마: 자영업/소상공인의 현실적인 이야기
- 팔로워 커뮤니티: 스치니라고 불림
- 운영자 포지션: 마케팅 이사 + 청주 지역 F&B 매장 직접 운영
- 톤앤매너: 직관적, 가감 없음, 현실 기반

모든 업무 판단과 제안은 이 맥락을 기준으로 할 것.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST만 허용됩니다' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' });
  }
  try {
    const body = { ...req.body };
    body.model = 'claude-haiku-4-5-20251001';

    if (!body.system) {
      body.system = COMPANY_CONTEXT;
    } else {
      body.system = COMPANY_CONTEXT + '\n\n' + body.system;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'Anthropic 오류', raw: data });
    }
    const text = data.content?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: '응답 파싱 실패', raw: data });
    }
    res.status(200).json({ content: [{ text }] });
  } catch (error) {
    res.status(500).json({ error: '서버 오류: ' + error.message });
  }
}
