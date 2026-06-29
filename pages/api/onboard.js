export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { newAgent } = req.body;
  // { id, name, role, color, bg }

  const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000';

  // 팀 전체 지식 가져오기
  const teamRes = await fetch(`${baseUrl}/api/memory?forNewAgent=true`);
  const { teamKnowledge } = await teamRes.json();

  // 신규 직원 메모리 생성
  await fetch(`${baseUrl}/api/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'add_agent',
      id: newAgent.id,
      name: newAgent.name,
      role: newAgent.role,
      coreKnowledge: `${newAgent.name} · ${newAgent.role} · gogitnam 브랜드 소속`,
    }),
  });

  // 팀 지식으로 온보딩 브리핑 생성
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `당신은 gogitnam 브랜드 CEO Alex입니다. 신규 팀원 온보딩을 담당합니다. 짧고 핵심만. 반말.`,
      messages: [{
        role: 'user',
        content: `신규 팀원: ${newAgent.name} (${newAgent.role})\n\n팀 전체 지식:\n${teamKnowledge}\n\n이 팀원에게 전달할 온보딩 브리핑을 작성해. 우리 브랜드가 뭔지, 팀원들 각각 뭘 잘하는지, 주의사항 위주로.`,
      }],
    }),
  });
  const data = await r.json();
  const brief = data.content?.[0]?.text || '온보딩 브리핑 생성 실패';

  // 신규 직원 첫 번째 학습으로 저장
  await fetch(`${baseUrl}/api/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentId: newAgent.id,
      learning: `온보딩 완료: ${brief.substring(0, 200)}`,
    }),
  });

  return res.status(200).json({ brief, agentId: newAgent.id });
}
