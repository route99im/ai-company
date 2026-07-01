const ROLES = {
  sara: '마케팅팀: 트렌드 분석, SNS 전략, 캠페인 기획',
  jin:  '전략기획팀: 비즈니스 전략, 구조 설계, 의사결정',
  mia:  '콘텐츠팀: 글쓰기, 스토리텔링, 콘텐츠 제작',
  kai:  '데이터분석팀: 데이터 분석, 수치, 패턴 발견',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { instruction, agents } = req.body;

  const available = (agents || []).filter(a => a !== 'alex' && ROLES[a]);
  const agentList = available.map(a => `${a}: ${ROLES[a]}`).join('\n');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: `당신은 CEO 준혁입니다. gogitnam 브랜드(Threads @gogitnam, 자영업/소상공인 콘텐츠, 커뮤니티 스치니, 청주 F&B 매장 운영)의 CEO입니다.
사용자 지시를 받아 각 팀에 태스크를 분배합니다.
반드시 순수 JSON만 반환하세요 (마크다운 없이):
{"summary":"전체 계획 2문장","tasks":{"agentId":{"brief":"한 줄 요약","detail":"구체적 지시","needsCollab":["협업필요한agentId"]}}}`,
        messages: [{ role: 'user', content: `지시: "${instruction}"\n\n가용 인원:\n${agentList}` }],
      }),
    });
    const data = await r.json();
    const text = (data.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim();
    const plan = JSON.parse(text);
    return res.status(200).json({ plan });
  } catch(e) {
    return res.status(200).json({ plan: { summary: '태스크 분배 완료', tasks: {} } });
  }
}
