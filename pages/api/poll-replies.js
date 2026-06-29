const REPLY_PERSONA = `당신은 @gogitnam 계정 운영자입니다.
[말투 규칙]
- 반말 기반 (~임, ~야, ~거든, ~더라)
- 2~3문장 이내
- 이모지 없음, 공감 표현 없음
- 현실 직구형, 바로 본론
[예시]
댓글: "광고 돌리는데 효과 없어요" → "키워드 문제일 가능성 높음. 지금 어떤 키워드로 돌리고 있어?"
댓글: "어떻게 시작하죠" → "뭐가 제일 막히는지 하나만 말해봐. 거기서부터 잡으면 됨"
댓글: "많이 배웠습니다" → "실제로 해보고 어떻게 됐는지 알려줘. 케이스 보는 게 더 재밌거든"`;

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  try {
    // 1. 최근 게시물 가져오기
    const threadsRes = await fetch(
      `https://graph.threads.net/v1.0/${process.env.THREADS_USER_ID}/threads?fields=id,text,timestamp&limit=10&access_token=${process.env.THREADS_ACCESS_TOKEN}`
    );
    const threadsData = await threadsRes.json();
    if (!threadsData.data) return res.status(200).json({ status: 'no threads' });

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    let processed = 0;

    for (const thread of threadsData.data) {
      // 2. 각 게시물의 댓글 가져오기
      const repliesRes = await fetch(
        `https://graph.threads.net/v1.0/${thread.id}/replies?fields=id,text,username,timestamp&access_token=${process.env.THREADS_ACCESS_TOKEN}`
      );
      const repliesData = await repliesRes.json();
      if (!repliesData.data) continue;

      for (const reply of repliesData.data) {
        // 10분 이내 댓글만, 내 댓글 제외
        if (reply.timestamp < tenMinutesAgo) continue;
        if (reply.username === 'gogitnam') continue;

        // 3. AI 답글 생성
        const draft = await generateReply(reply.text);

        // 4. 자동 게시
        await postReply(reply.id, draft);
        processed++;
      }
    }

    return res.status(200).json({ status: 'ok', processed });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

async function generateReply(commentText) {
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

async function postReply(commentId, text) {
  const createRes = await fetch(
    `https://graph.threads.net/v1.0/${process.env.THREADS_USER_ID}/threads`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'TEXT',
        text,
        reply_to_id: commentId,
        access_token: process.env.THREADS_ACCESS_TOKEN,
      }),
    }
  );
  const { id: creationId } = await createRes.json();

  await fetch(
    `https://graph.threads.net/v1.0/${process.env.THREADS_USER_ID}/threads_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: process.env.THREADS_ACCESS_TOKEN,
      }),
    }
  );
}
