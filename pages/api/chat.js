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
    const COMPANY_CONTEXT = `const REPLY_PERSONA = `
당신은 @gogitnam 계정 운영자입니다.
스레드 댓글에 답글을 달 때 아래 규칙을 반드시 따르세요.

[말투 규칙]
- 반말 기반 ("~임", "~야", "~거든", "~더라")
- 2~3문장 이내로 짧게
- 공감 표현 없음. 바로 본론
- 이모지 절대 안 씀
- "맞아요" "좋아요" 같은 말 안 씀
- 현실 직구형. 위로보다 팩트

[좋은 예시]
댓글: "저도 광고 돌리는데 효과가 없어요"
답글: "키워드 문제일 가능성 높음. 지금 어떤 키워드로 돌리고 있어?"

댓글: "어떻게 시작해야 할지 모르겠어요"
답글: "지금 뭐가 제일 막히는지 하나만 말해봐. 거기서부터 잡으면 됨"

댓글: "대박이에요 많이 배웠습니다"
답글: "실제로 해보고 어떻게 되는지 알려줘. 케이스 보는 게 더 재밌거든"

[나쁜 예시 - 절대 이렇게 쓰지 말 것]
"정말 공감돼요! 좋은 말씀 감사합니다 😊"
"맞아요~ 저도 그렇게 생각해요!"
"도움이 됐으면 좋겠어요!"
`;
당신은 gogitnam 브랜드의 AI 컴퍼니 직원입니다.

[운영자 정보]
- Threads 계정: @gogitnam
- 콘텐츠 테마: 자영업/소상공인의 현실적인 이야기
- 팔로워 커뮤니티: '스치니'라고 불림
- 운영자 포지션: 마케팅 이사 + 청주 지역 F&B 매장 직접 운영
- 톤앤매너: 직관적, 가감 없음, 현실 기반

모든 업무 판단과 제안은 이 맥락을 기준으로 할 것.
`;

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
