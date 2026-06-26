import { useState, useEffect } from 'react';

export default function Replies() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetch replies = async () => {
    const res = await fetch('/api/handle-reply');
    setReplies(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchReplies();
    const t = setInterval(fetchReplies, 10000); // 10초마다 갱신
    return () => clearInterval(t);
  }, []);

  const action = async (id, type) => {
    setActionLoading(id + type);
    await fetch('/api/handle-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: type }),
    });
    setActionLoading(null);
    fetchReplies();
  };

  const saveEdit = async (id) => {
    await fetch('/api/handle-reply', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, editedDraft: editText }),
    });
    setEditing(null);
    fetchReplies();
  };

  if (loading) return <div style={s.center}>불러오는 중...</div>;

  return (
    <div style={s.wrap}>
      <h2 style={s.title}>💬 대기 중인 답글 {replies.length}건</h2>
      {replies.length === 0 && <div style={s.empty}>새 댓글 없음</div>}
      {replies.map(r => (
        <div key={r.id} style={s.card}>
          <div style={s.meta}>{r.commenterName} · {new Date(r.timestamp).toLocaleTimeString('ko-KR')}</div>
          <div style={s.comment}>"{r.commentText}"</div>
          <div style={s.divider} />
          {editing === r.id ? (
            <>
              <textarea
                style={s.textarea}
                value={editText}
                onChange={e => setEditText(e.target.value)}
              />
              <div style={s.btnRow}>
                <button style={s.btnSave} onClick={() => saveEdit(r.id)}>저장</button>
                <button style={s.btnCancel} onClick={() => setEditing(null)}>취소</button>
              </div>
            </>
          ) : (
            <>
              <div style={s.draft}>{r.editedDraft || r.draft}</div>
              <div style={s.btnRow}>
                <button style={s.btnApprove} onClick={() => action(r.id, 'approve')}
                  disabled={!!actionLoading}>
                  {actionLoading === r.id + 'approve' ? '...' : '✅ 게시'}
                </button>
                <button style={s.btnEdit} onClick={() => { setEditing(r.id); setEditText(r.editedDraft || r.draft); }}>
                  ✏️ 수정
                </button>
                <button style={s.btnSkip} onClick={() => action(r.id, 'skip')}
                  disabled={!!actionLoading}>
                  ❌
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const s = {
  wrap: { maxWidth: 480, margin: '0 auto', padding: '16px', fontFamily: 'sans-serif', background: '#0f0f0f', minHeight: '100vh' },
  title: { color: '#fff', fontSize: 18, marginBottom: 16 },
  empty: { color: '#666', textAlign: 'center', marginTop: 60 },
  card: { background: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12 },
  meta: { color: '#888', fontSize: 12, marginBottom: 6 },
  comment: { color: '#aaa', fontSize: 14, fontStyle: 'italic', marginBottom: 10 },
  divider: { height: 1, background: '#333', marginBottom: 10 },
  draft: { color: '#fff', fontSize: 15, lineHeight: 1.5, marginBottom: 12 },
  btnRow: { display: 'flex', gap: 8 },
  btnApprove: { flex: 1, padding: '10px 0', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 'bold' },
  btnEdit: { flex: 1, padding: '10px 0', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14 },
  btnSkip: { padding: '10px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14 },
  btnSave: { flex: 1, padding: '10px 0', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14 },
  btnCancel: { flex: 1, padding: '10px 0', background: '#333', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14 },
  textarea: { width: '100%', minHeight: 80, background: '#111', color: '#fff', border: '1px solid #444', borderRadius: 8, padding: 8, fontSize: 14, marginBottom: 8, boxSizing: 'border-box' },
  center: { color: '#fff', textAlign: 'center', marginTop: 100 },
};
