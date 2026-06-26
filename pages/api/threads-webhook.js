if (!global.pendingReplies) global.pendingReplies = [];

const REPLY_PERSONA = `당신은 @gogitnam 계정 운영자입니다.
[말투 규칙]
- 반말 기반 (~임, ~야, ~거든, ~더라)
- 2~3문장 이내
- 이모지 없음, 공감 표현 없음
- 현실 직구형, 바로 본론
[예시]
댓글: "광고 돌리는데 효과 없어요" → "키워드 문제일 가능성 높음. 지금 어떤 키워드로 돌리고 있어?"
댓글: "어떻게 시작하죠" → "뭐가 제일 막히는지 하나만 말해봐. 거기서부터 잡으면 됨"`;

export default async function handler(req, res) {
  // 웹훅 인증 (Meta가 GET으로 확인)
  if (req.method === 'GET') {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    if (mode === 'subscribe' && token === process.env.THREADS_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    try {
      for (const entry of (req.body.entry || [])) {
        for (const change of (entry.changes || [])) {
          if (change.field === 'replies') {
            const { id: commentId, text, from } = change.value;
            const draft = await generateDraft(text);
            global.pendingReplies.unshift({
              id: Date.now().toString(),
              commentId,
              commentText: text,
              commenterName: from?.name || '익명',
              draft,
              editedDraft: null,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
      return res.status(200).json({ status: 'ok' });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
}

async function generateDraft(commentText) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: REPLY_PERSONA,
      messages: [{ role: 'user', content: `이 댓글에 답글 써줘: "${commentText}"` }],
    }),
  });
  const data = await res.json();
  return data.content[0].text;
}
