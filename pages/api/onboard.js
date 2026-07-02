if (!global.agentMemory) {
  global.agentMemory = {
    alex: { learnings: [], coreKnowledge: 'gogitnam CEO 준혁. 감정 없이 결과만. 항상 액션으로 귀결.' },
    sara: { learnings: [], coreKnowledge: 'gogitnam 마케팅팀 하은. Threads @gogitnam. 자영업/소상공인 콘텐츠. 커뮤니티 스치니.' },
    jin:  { learnings: [], coreKnowledge: 'gogitnam 전략기획팀 민준. 구조 먼저. 논리 검증 우선.' },
    mia:  { learnings: [], coreKnowledge: 'gogitnam 콘텐츠팀 서연. 아이디어 먼저. 스토리텔링 강점.' },
    kai:  { learnings: [], coreKnowledge: 'gogitnam 데이터분석팀 도현. 수치 기반. 근거 없으면 모른다고 함.' },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { newAgent } = req.body;

  // 팀 전체 지식 정리
  const teamKnowledge = Object.entries(global.agentMemory).map(([id, mem]) => {
    const recentLearnings = (mem.learnings||[]).slice(-10).map(l => `- ${l.insight}`).join('\n');
    return `[${id.toUpperCase()}의 지식]\n${mem.coreKnowledge}\n최근 학습:\n${recentLearnings || '아직 없음'}`;
  }).join('\n\n');

  // 신규 직원 메모리 생성
  if (!global.agentMemory[newAgent.id]) {
    global.agentMemory[newAgent.id] = {
      learnings: [],
      coreKnowledge: `${newAgent.name} · ${newAgent.role} · gogitnam 브랜드 소속`,
    };
  }

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
        max_tokens: 800,
        system: `당신은 gogitnam 브랜드 CEO 준혁입니다. 신규 팀원 온보딩을 담당합니다. 짧고 핵심만. 반말.`,
        messages: [{
          role: 'user',
          content: `신규 팀원: ${newAgent.name} (${newAgent.role})\n\n팀 전체 지식:\n${teamKnowledge}\n\n이 팀원에게 전달할 온보딩 브리핑을 작성해. 우리 브랜드가 뭔지, 팀원들 각각 뭘 잘하는지, 주의사항 위주로.`,
        }],
      }),
    });
    const data = await r.json();
    const brief = data.content?.[0]?.text || '온보딩 브리핑 생성 실패';

    // 신규 직원 첫 번째 학습으로 저장
    global.agentMemory[newAgent.id].learnings.push({
      date: new Date().toISOString(),
      insight: `온보딩 완료: ${brief.substring(0, 200)}`,
    });

    return res.status(200).json({ brief, agentId: newAgent.id });
  } catch(e) {
    return res.status(500).json({ brief: '온보딩 오류: ' + e.message });
  }
}
