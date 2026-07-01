if (!global.agentMemory) {
  global.agentMemory = {
    alex: { learnings: [], coreKnowledge: 'gogitnam CEO. 감정 없이 결과만. 항상 액션으로 귀결.' },
    sara: { learnings: [], coreKnowledge: 'gogitnam 마케팅팀 하은. Threads @gogitnam. 자영업/소상공인 콘텐츠. 커뮤니티 스치니.' },
    jin:  { learnings: [], coreKnowledge: 'gogitnam 전략기획팀 민준. 구조 먼저. 논리 검증 우선.' },
    mia:  { learnings: [], coreKnowledge: 'gogitnam 콘텐츠팀 서연. 아이디어 먼저. 스토리텔링 강점.' },
    kai:  { learnings: [], coreKnowledge: 'gogitnam 데이터분석팀 도현. 수치 기반. 근거 없으면 모른다고 함.' },
  };
}

const PERSONAS = {
  alex: `당신은 CEO 준혁입니다. gogitnam 브랜드(Threads @gogitnam, 자영업/소상공인 콘텐츠, 커뮤니티 스치니, F&B 매장 운영)의 CEO입니다. 감정 없이 결과만. 말은 짧고 단호하게.`,
  sara: `당신은 마케팅팀 하은입니다. gogitnam 브랜드 마케팅 전문가. 트렌드에 살고 감각으로 판단. 아이디어는 구체적인 실행 단위로.`,
  jin:  `당신은 전략기획팀 민준입니다. gogitnam 브랜드 전략 전문가. 말하기 전에 구조 먼저. 논리에 빈틈 있으면 짚고 넘어감.`,
  mia:  `당신은 콘텐츠팀 서연입니다. gogitnam 브랜드 콘텐츠 전문가. 아이디어 먼저 튀어나오고 나중에 정리. 비유와 예시 많음.`,
  kai:  `당신은 데이터분석팀 도현입니다. gogitnam 브랜드 데이터 전문가. 근거 없는 말 잘 안 함. 숫자와 패턴으로 말함.`,
};

const QA_PROMPT = `당신은 gogitnam 브랜드 QA 검토자입니다.
아래 기준으로 콘텐츠를 검토하세요:
- gogitnam 말투: 반말, ~임/~야/~거든, 이모지 없음, 2~3문장 이내
- 현실 직구형: 공감보다 팩트, 위로보다 해결책
- 브랜드 일관성: 자영업/소상공인 현실 기반

반드시 JSON만 반환 (마크다운 없이):
{"pass": true, "reason": "한 줄 이유", "revised": "수정본 (pass=false일 때만)"}`;

async function callClaude(system, userContent, maxTokens = 600) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  const data = await r.json();
  return data.content?.[0]?.text || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { agentId, task, instruction, useQA } = req.body;

  const basePersona = PERSONAS[agentId];
  if (!basePersona) return res.status(400).json({ error: 'Unknown agent' });

  // 메모리에서 학습 내용 가져오기
  let memoryContext = '';
  try {
    const memData = global.agentMemory[agentId];
    if (memData?.learnings?.length > 0) {
      const recent = memData.learnings.slice(-5).map(l => `- ${l.insight}`).join('\n');
      memoryContext = `\n\n[내가 그동안 배운 것들]\n${recent}`;
    }
  } catch(e) {}

  const fullPersona = `${basePersona}${memoryContext}

협업이 필요하면 응답 끝에 [COLLAB:agentId:이유] 추가.
이번 작업에서 배운 핵심 인사이트가 있으면 응답 끝에 [LEARN:내용] 추가.`;

  try {
    const rawResult = await callClaude(
      fullPersona,
      `전체 지시: "${instruction}"\n\n내 담당: ${task.detail || task.brief}`
    );

    // [COLLAB], [LEARN] 파싱
    const collabMatches = [...rawResult.matchAll(/\[COLLAB:(\w+):([^\]]+)\]/g)];
    const learnMatches  = [...rawResult.matchAll(/\[LEARN:([^\]]+)\]/g)];

    const collaborations = collabMatches.map(m => ({ targetAgent: m[1], reason: m[2] }));
    let result = rawResult.replace(/\[COLLAB:[^\]]+\]/g, '').replace(/\[LEARN:[^\]]+\]/g, '').trim();

    // 학습 내용 저장
    for (const match of learnMatches) {
      try {
        if (!global.agentMemory[agentId]) global.agentMemory[agentId] = { learnings: [] };
        global.agentMemory[agentId].learnings.push({
          date: new Date().toISOString(),
          insight: match[1],
        });
        if (global.agentMemory[agentId].learnings.length > 50) {
          global.agentMemory[agentId].learnings = global.agentMemory[agentId].learnings.slice(-50);
        }
      } catch(e) {}
    }

    // 생성-검증 패턴: Mia(서연)가 콘텐츠 만들면 QA 통과
    if (useQA || agentId === 'mia') {
      try {
        const qaRaw = await callClaude(QA_PROMPT, `검토할 콘텐츠:\n"${result}"`, 400);
        const qa = JSON.parse(qaRaw.replace(/```json|```/g, '').trim());
        if (!qa.pass && qa.revised) {
          result = qa.revised;
          if (!global.agentMemory[agentId]) global.agentMemory[agentId] = { learnings: [] };
          global.agentMemory[agentId].learnings.push({
            date: new Date().toISOString(),
            insight: `QA 검토 실패 패턴: ${qa.reason}`,
          });
        }
      } catch(e) {}
    }

    return res.status(200).json({ result, collaborations, learnings: learnMatches.map(m => m[1]) });
  } catch(e) {
    return res.status(500).json({ result: '처리 오류: ' + e.message, collaborations: [], learnings: [] });
  }
}
