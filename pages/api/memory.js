if (!global.agentMemory) {
  global.agentMemory = {
    alex: { learnings: [], coreKnowledge: 'gogitnam CEO. 감정 없이 결과만. 항상 액션으로 귀결.' },
    sara: { learnings: [], coreKnowledge: 'gogitnam 마케팅팀. Threads @gogitnam. 자영업/소상공인 콘텐츠. 커뮤니티 스치니.' },
    jin:  { learnings: [], coreKnowledge: 'gogitnam 전략기획팀. 구조 먼저. 논리 검증 우선.' },
    mia:  { learnings: [], coreKnowledge: 'gogitnam 콘텐츠팀. 아이디어 먼저. 스토리텔링 강점.' },
    kai:  { learnings: [], coreKnowledge: 'gogitnam 데이터분석팀. 수치 기반. 근거 없으면 모른다고 함.' },
  };
}

export default async function handler(req, res) {

  // 특정 에이전트 메모리 조회
  if (req.method === 'GET') {
    const { agentId, forNewAgent } = req.query;

    if (forNewAgent) {
      // 신규 직원용: 전체 팀 지식 요약
      const teamKnowledge = Object.entries(global.agentMemory).map(([id, mem]) => {
        const recentLearnings = mem.learnings.slice(-10).map(l => `- ${l.insight}`).join('\n');
        return `[${id.toUpperCase()}의 지식]\n${mem.coreKnowledge}\n최근 학습:\n${recentLearnings || '아직 없음'}`;
      }).join('\n\n');
      return res.status(200).json({ teamKnowledge });
    }

    if (agentId && global.agentMemory[agentId]) {
      return res.status(200).json(global.agentMemory[agentId]);
    }

    return res.status(200).json(global.agentMemory);
  }

  // 학습 추가
  if (req.method === 'POST') {
    const { agentId, learning, type } = req.body;

    if (type === 'add_agent') {
      // 신규 직원 추가
      const { id, name, role, coreKnowledge } = req.body;
      if (!global.agentMemory[id]) {
        global.agentMemory[id] = {
          learnings: [],
          coreKnowledge: coreKnowledge || `${name} · ${role}`,
        };
      }
      return res.status(200).json({ status: 'ok', agentId: id });
    }

    if (agentId && global.agentMemory[agentId] && learning) {
      global.agentMemory[agentId].learnings.push({
        date: new Date().toISOString(),
        insight: learning,
      });
      // 최근 50개만 유지
      if (global.agentMemory[agentId].learnings.length > 50) {
        global.agentMemory[agentId].learnings = global.agentMemory[agentId].learnings.slice(-50);
      }
      return res.status(200).json({ status: 'ok' });
    }

    return res.status(400).json({ error: 'invalid request' });
  }
}
