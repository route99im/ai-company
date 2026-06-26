if (!global.pendingReplies) global.pendingReplies = [];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(global.pendingReplies);
  }

  if (req.method === 'PATCH') {
    const { id, editedDraft } = req.body;
    const reply = global.pendingReplies.find(r => r.id === id);
    if (reply) reply.editedDraft = editedDraft;
    return res.status(200).json({ status: 'ok' });
  }

  if (req.method === 'POST') {
    const { id, action } = req.body;
    const idx = global.pendingReplies.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).end();
    const reply = global.pendingReplies[idx];

    if (action === 'skip') {
      global.pendingReplies.splice(idx, 1);
      return res.status(200).json({ status: 'skipped' });
    }

    if (action === 'approve') {
      const text = reply.editedDraft || reply.draft;
      // 1. 답글 컨테이너 생성
      const createRes = await fetch(
        `https://graph.threads.net/v1.0/${process.env.THREADS_USER_ID}/threads`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_type: 'TEXT',
            text,
            reply_to_id: reply.commentId,
            access_token: process.env.THREADS_ACCESS_TOKEN,
          }),
        }
      );
      const { id: creationId } = await createRes.json();
      // 2. 게시
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
      global.pendingReplies.splice(idx, 1);
      return res.status(200).json({ status: 'posted' });
    }
  }
}
