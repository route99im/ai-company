import { useState, useRef, useEffect } from 'react';

const DEFAULT_AGENTS = {
  alex: { id:'alex', name:'준혁', role:'CEO', color:'#f97316', bg:'#1a0e08' },
  sara: { id:'sara', name:'하은', role:'마케팅팀', color:'#eab308', bg:'#1a1808' },
  jin:  { id:'jin',  name:'민준', role:'전략기획팀', color:'#22c55e', bg:'#081a0e' },
  mia:  { id:'mia',  name:'서연', role:'콘텐츠팀', color:'#a855f7', bg:'#14081a' },
  kai:  { id:'kai',  name:'도현', role:'데이터분석팀', color:'#3b82f6', bg:'#08101a' },
};

const PERSONAS = {
  alex: `당신은 CEO 준혁입니다. gogitnam 브랜드(Threads @gogitnam, 자영업/소상공인 콘텐츠, 커뮤니티 스치니, 청주 F&B 매장 운영)의 CEO입니다. 감정 없이 결과만. 말은 짧고 단호하게.`,
  sara: `당신은 마케팅팀 하은입니다. gogitnam 브랜드 마케팅 전문가. 트렌드에 살고 감각으로 판단. 아이디어는 구체적인 실행 단위로.`,
  jin:  `당신은 전략기획팀 민준입니다. gogitnam 브랜드 전략 전문가. 말하기 전에 구조 먼저. 논리에 빈틈 있으면 짚고 넘어감.`,
  mia:  `당신은 콘텐츠팀 서연입니다. gogitnam 브랜드 콘텐츠 전문가. 아이디어 먼저 튀어나오고 나중에 정리. 비유와 예시 많음.`,
  kai:  `당신은 데이터분석팀 도현입니다. gogitnam 브랜드 데이터 전문가. 근거 없는 말 잘 안 함. 숫자와 패턴으로 말함.`,
};

const DARK = {
  appBg: '#0f0f1a',
  topbarBg: '#13131f',
  officeBg: '#16162a',
  panelBg: '#13131f',
  inputBg: '#0f0f1a',
  cardBg: '#1a1a2e',
  border: '#2a2a45',
  text: '#e0e0ff',
  textSub: '#7070aa',
  textMuted: '#404068',
  accent: '#7c6fff',
};

const LIGHT = {
  appBg: '#f4f4ff',
  topbarBg: '#ffffff',
  officeBg: '#eeeeff',
  panelBg: '#ffffff',
  inputBg: '#f8f8ff',
  cardBg: '#f0f0ff',
  border: '#d0d0ee',
  text: '#1a1a3a',
  textSub: '#5555aa',
  textMuted: '#9090bb',
  accent: '#5c4fff',
};

function RoomBox({ label, style, children, T }) {
  return (
    <div style={{ position:'absolute', border:`1px solid ${T.border}`, borderRadius:10, padding:'8px 12px', ...style }}>
      <div style={{ fontSize:11, color:T.textSub, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, fontWeight:600 }}>{label}</div>
      {children}
    </div>
  );
}

function DeskItem({ id, agents, states, selected, setSelected, T }) {
  const a = agents[id];
  const s = states[id];
  if (!a || !s) return null;
  const isSel = selected === id;
  const isWork = s.status === 'working';
  const isDone = s.status === 'done';
  return (
    <div style={{ width:76, cursor:'pointer', position:'relative' }} onClick={() => setSelected(id)}>
      {(s.collabs||[]).map((c, i) => (
        <div key={i} style={{
          position:'absolute', top: i===0 ? -10 : -22, right: i===0 ? -8 : 14,
          height:16, padding:'0 6px', borderRadius:8, fontSize:10, fontWeight:600,
          display:'flex', alignItems:'center', gap:3, border:'1px solid', whiteSpace:'nowrap', zIndex:10,
          background:`${agents[c.with]?.color||'#666'}22`,
          color: agents[c.with]?.color||'#666',
          borderColor:`${agents[c.with]?.color||'#666'}66`,
        }}>
          <div style={{ width:4, height:4, borderRadius:'50%', background:agents[c.with]?.color||'#666' }}/>
          {agents[c.with]?.name} {c.requester?'요청':'협업'}
        </div>
      ))}
      <div style={{
        width:76, height:68, borderRadius:12,
        background: isSel ? `${a.color}25` : T.cardBg,
        border: isSel ? `2.5px solid ${a.color}` : `1.5px solid ${isWork ? a.color+'66' : T.border}`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
        opacity: isDone ? 0.5 : 1,
        boxShadow: isSel ? `0 0 12px ${a.color}44` : 'none',
        transition: 'all 0.2s',
      }}>
        <div style={{ fontSize:20 }}>🤖</div>
        <div style={{ fontSize:12, fontWeight:700, color: isSel||isWork ? a.color : T.text }}>{a.name}</div>
        <div style={{ fontSize:10, fontWeight:500, color: isWork ? '#22c55e' : isDone ? '#22c55e88' : T.textMuted }}>
          {isWork ? (s.task||'작업 중') : isDone ? '완료 ✓' : '대기'}
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, val, total, color, sub, T }) {
  const pct = total > 0 ? Math.round((val/total)*100) : 0;
  return (
    <div style={{ flex:1 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
        <span style={{ fontSize:11, color:T.textSub, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:20, fontWeight:700, color }}>{val}<span style={{ fontSize:11, color:T.textMuted, marginLeft:3 }}>/{total===1?0:total}</span></span>
      </div>
      <div style={{ height:6, background:T.cardBg, borderRadius:4, overflow:'hidden', border:`1px solid ${T.border}` }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, transition:'width 0.5s' }}/>
      </div>
      <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{sub}</div>
    </div>
  );
}

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const T = isDark ? DARK : LIGHT;

  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [agentStates, setAgentStates] = useState(
    Object.fromEntries(Object.keys(DEFAULT_AGENTS).map(id => [id, { status:'idle', task:'', collabs:[] }]))
  );
  const [tasks, setTasks] = useState({ total:0, working:0, done:0 });
  const [selected, setSelected] = useState('sara');
  const [chatTab, setChatTab] = useState('chat');
  const [chats, setChats] = useState(Object.fromEntries(Object.keys(DEFAULT_AGENTS).map(id => [id, []])));
  const [memory, setMemory] = useState({});
  const [bMsgs, setBMsgs] = useState([]);
  const [bInput, setBInput] = useState('');
  const [cInput, setCInput] = useState('');
  const [bLoading, setBLoading] = useState(false);
  const [cLoading, setCLoading] = useState(false);
  const [bAgents, setBAgents] = useState(Object.keys(DEFAULT_AGENTS));
  const [showOnboard, setShowOnboard] = useState(false);
  const [newAgent, setNewAgent] = useState({ id:'', name:'', role:'', color:'#6366f1' });
  const [onboarding, setOnboarding] = useState(false);
  const [onboardResult, setOnboardResult] = useState('');
  const msgsRef = useRef(null);

  const fetchMemory = async (agentId) => {
    try {
      const r = await fetch(`/api/memory?agentId=${agentId}`);
      const data = await r.json();
      setMemory(prev => ({ ...prev, [agentId]: data }));
    } catch(e) {}
  };

  useEffect(() => {
    if (chatTab === 'memory') fetchMemory(selected);
  }, [chatTab, selected]);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [chats, selected, cLoading]);

  const setAgent = (id, patch) =>
    setAgentStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const now = () => new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' });

  const handleBroadcast = async () => {
    if (!bInput.trim() || bLoading) return;
    const inst = bInput.trim();
    setBInput('');
    setBLoading(true);
    setAgent('alex', { status:'working', task:'태스크 분배 중' });
    try {
      const r = await fetch('/api/orchestrate', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ instruction:inst, agents:bAgents }),
      });
      const { plan } = await r.json();
      setBMsgs(prev => [{ id:Date.now(), from:'alex', text:plan.summary, time:now() }, ...prev]);
      setAgent('alex', { status:'idle', task:'' });
      const entries = Object.entries(plan.tasks||{});
      setTasks(prev => ({ total:prev.total+entries.length, working:entries.length, done:prev.done }));
      for (const [agentId, task] of entries) {
        if (!agents[agentId]) continue;
        setAgent(agentId, { status:'working', task:task.brief });
        fetch('/api/agent-task', {
          method:'POST', headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ agentId, task, instruction:inst, useQA: agentId==='mia' }),
        }).then(r=>r.json()).then(data => {
          if (data.collaborations?.length > 0) {
            for (const c of data.collaborations) {
              const tid = c.targetAgent;
              if (!agents[tid]) continue;
              setAgentStates(prev => ({
                ...prev,
                [agentId]: { ...prev[agentId], collabs:[...(prev[agentId].collabs||[]), { with:tid, requester:true }] },
                [tid]: { ...prev[tid], status:'working', task:`${agents[agentId].name} 협업`, collabs:[...(prev[tid].collabs||[]), { with:agentId, requester:false }] },
              }));
              setTimeout(() => {
                setAgentStates(prev => ({
                  ...prev,
                  [agentId]: { ...prev[agentId], collabs:(prev[agentId].collabs||[]).filter(x=>x.with!==tid) },
                  [tid]: { ...prev[tid], status:'idle', task:'', collabs:(prev[tid].collabs||[]).filter(x=>x.with!==agentId) },
                }));
              }, 3000);
            }
          }
          setAgent(agentId, { status:'done', task:'완료' });
          setTasks(prev => ({ ...prev, working:Math.max(0,prev.working-1), done:prev.done+1 }));
          setBMsgs(prev => [{ id:Date.now()+Math.random(), from:agentId, text:data.result, time:now() }, ...prev]);
          setTimeout(() => setAgent(agentId, { status:'idle', task:'' }), 3000);
        }).catch(() => {
          setAgent(agentId, { status:'idle', task:'' });
          setTasks(prev => ({ ...prev, working:Math.max(0,prev.working-1) }));
        });
      }
    } catch(e) { console.error(e); }
    finally { setBLoading(false); }
  };

  const handleChat = async () => {
    if (!cInput.trim() || cLoading) return;
    const msg = cInput.trim();
    setCInput('');
    setCLoading(true);
    const persona = PERSONAS[selected] || `당신은 ${agents[selected]?.name}입니다. gogitnam 브랜드 소속입니다.`;
    const userMsg = { id:Date.now(), role:'user', content:msg, time:now() };
    setChats(prev => ({ ...prev, [selected]:[...(prev[selected]||[]), userMsg] }));
    setAgent(selected, { status:'working' });
    try {
      const history = chats[selected]||[];
      const r = await fetch('/api/chat', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          messages:[...history.map(m=>({ role:m.role, content:m.content })), { role:'user', content:msg }],
          system: persona, max_tokens: 1000,
        }),
      });
      const data = await r.json();
      const text = data.content?.[0]?.text || '응답 오류';
      setChats(prev => ({ ...prev, [selected]:[...(prev[selected]||[]), { id:Date.now()+1, role:'assistant', content:text, time:now() }] }));
      setAgent(selected, { status:'idle' });
    } catch(e) { setAgent(selected, { status:'idle' }); }
    finally { setCLoading(false); }
  };

  const handleOnboard = async () => {
    if (!newAgent.id || !newAgent.name || !newAgent.role) return;
    setOnboarding(true);
    try {
      const r = await fetch('/api/onboard', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ newAgent }),
      });
      const data = await r.json();
      setOnboardResult(data.brief);
      setAgents(prev => ({ ...prev, [newAgent.id]: { ...newAgent, bg: isDark?'#0a0a1a':'#f0f0ff' } }));
      setAgentStates(prev => ({ ...prev, [newAgent.id]: { status:'idle', task:'', collabs:[] } }));
      setChats(prev => ({ ...prev, [newAgent.id]: [] }));
      setBAgents(prev => [...prev, newAgent.id]);
    } catch(e) { setOnboardResult('온보딩 오류가 발생했어요.'); }
    finally { setOnboarding(false); }
  };

  const a = agents[selected];
  const s = agentStates[selected];
  const mem = memory[selected];

  return (
    <div style={{ background:T.appBg, minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'-apple-system, BlinkMacSystemFont, sans-serif', transition:'all 0.3s' }}>

      {/* 탑바 */}
      <div style={{ background:T.topbarBg, borderBottom:`1px solid ${T.border}`, padding:'0 16px', height:50, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, boxShadow: isDark?'0 1px 20px #7c6fff11':'0 1px 10px #00000011' }}>
        <div style={{ fontSize:16, fontWeight:700, color:T.text, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:T.accent, boxShadow:`0 0 8px ${T.accent}` }}/>
          AI 컴퍼니
        </div>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          {Object.values(agents).map(ag => (
            <div key={ag.id} style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}
              onClick={() => { setSelected(ag.id); setChatTab('chat'); }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:ag.color, opacity:agentStates[ag.id]?.status==='idle'?0.35:1, boxShadow: agentStates[ag.id]?.status!=='idle'?`0 0 6px ${ag.color}`:'' }}/>
              <span style={{ fontSize:13, fontWeight:500, color: selected===ag.id ? ag.color : T.textSub }}>{ag.name}</span>
            </div>
          ))}
          <button onClick={() => setIsDark(d => !d)}
            style={{ background:T.cardBg, border:`1px solid ${T.border}`, borderRadius:20, padding:'4px 12px', fontSize:13, color:T.textSub, cursor:'pointer' }}>
            {isDark ? '☀️ 라이트' : '🌙 다크'}
          </button>
          <button onClick={() => { setShowOnboard(true); setOnboardResult(''); setNewAgent({ id:'', name:'', role:'', color:'#6366f1' }); }}
            style={{ background:T.accent+'22', border:`1px solid ${T.accent}44`, borderRadius:6, padding:'5px 14px', fontSize:13, fontWeight:500, color:T.accent, cursor:'pointer' }}>
            + 직원 추가
          </button>
        </div>
      </div>

      {/* 오피스 맵 */}
      <div style={{ flexShrink:0, height:270, background:T.officeBg, position:'relative', borderBottom:`2px solid ${T.border}`, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:16, left:'50%', transform:'translateX(-50%)' }}>
          <DeskItem id="alex" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }} T={T}/>
        </div>
        <RoomBox label="마케팅팀" T={T} style={{ top:105, left:12, width:200, height:140, borderColor:selected==='sara'?`${agents.sara.color}66`:T.border, background: selected==='sara'?`${agents.sara.color}08`:T.topbarBg }}>
          <div style={{ position:'absolute', top:28, left:12 }}>
            <DeskItem id="sara" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }} T={T}/>
          </div>
        </RoomBox>
        <RoomBox label="전략기획팀" T={T} style={{ top:105, left:224, width:200, height:140, borderColor:selected==='jin'?`${agents.jin.color}66`:T.border, background: selected==='jin'?`${agents.jin.color}08`:T.topbarBg }}>
          <div style={{ position:'absolute', top:28, left:12 }}>
            <DeskItem id="jin" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }} T={T}/>
          </div>
        </RoomBox>
        <RoomBox label="콘텐츠팀" T={T} style={{ top:105, left:436, width:190, height:140, borderColor:selected==='mia'?`${agents.mia.color}66`:T.border, background: selected==='mia'?`${agents.mia.color}08`:T.topbarBg }}>
          <div style={{ position:'absolute', top:28, left:12 }}>
            <DeskItem id="mia" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }} T={T}/>
          </div>
        </RoomBox>
        <RoomBox label="데이터분석팀" T={T} style={{ top:105, right:12, width:190, height:140, borderColor:selected==='kai'?`${agents.kai.color}66`:T.border, background: selected==='kai'?`${agents.kai.color}08`:T.topbarBg }}>
          <div style={{ position:'absolute', top:28, left:12 }}>
            <DeskItem id="kai" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }} T={T}/>
          </div>
          {Object.keys(agents).filter(id => !DEFAULT_AGENTS[id]).map((id, i) => (
            <div key={id} style={{ position:'absolute', top:28, left:90+(i*88) }}>
              <DeskItem id={id} agents={agents} states={agentStates} selected={selected} setSelected={(sid) => { setSelected(sid); setChatTab('chat'); }} T={T}/>
            </div>
          ))}
        </RoomBox>
        <div style={{ position:'absolute', bottom:10, left:16, display:'flex', gap:16 }}>
          {[['#22c55e','작업 중'],['#3b82f6','협업 중'],[T.textMuted,'대기']].map(([bc,lbl]) => (
            <div key={lbl} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:T.textSub }}>
              <div style={{ width:10, height:10, borderRadius:3, border:`2px solid ${bc}`, background:`${bc}22` }}/>{lbl}
            </div>
          ))}
        </div>
      </div>

      {/* 통계 바 */}
      <div style={{ flexShrink:0, background:T.topbarBg, borderBottom:`2px solid ${T.border}`, padding:'10px 18px', display:'flex', gap:20 }}>
        <StatBar label="업무 지시" val={tasks.total} total={Math.max(tasks.total,1)} color="#f59e0b" sub={`총 ${tasks.total}건 분배`} T={T}/>
        <StatBar label="진행 현황" val={tasks.working} total={Math.max(tasks.total,1)} color="#3b82f6" sub={`${tasks.working}건 진행 중`} T={T}/>
        <StatBar label="완료 현황" val={tasks.done} total={Math.max(tasks.total,1)} color="#22c55e" sub={`완료율 ${tasks.total?Math.round(tasks.done/tasks.total*100):0}%`} T={T}/>
      </div>

      {/* 하단 패널 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', flex:1, overflow:'hidden', minHeight:0 }}>

        {/* 전체 지시 */}
        <div style={{ background:T.panelBg, borderRight:`2px solid ${T.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <span style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', padding:'4px 10px', borderRadius:6, fontWeight:700, background:`${T.accent}18`, color:T.accent, border:`1px solid ${T.accent}33` }}>전체 지시</span>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:T.text }}>전 부서 지시</div>
              <div style={{ fontSize:12, color:T.textSub, marginTop:2 }}>직원 선택 후 전송</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, padding:'10px 14px', borderBottom:`1px solid ${T.border}`, flexShrink:0, flexWrap:'wrap' }}>
            {Object.values(agents).map(ag => (
              <div key={ag.id}
                onClick={() => setBAgents(prev => prev.includes(ag.id) ? prev.filter(x=>x!==ag.id) : [...prev,ag.id])}
                style={{ padding:'5px 12px', borderRadius:6, fontSize:13, fontWeight:600, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s',
                  background: bAgents.includes(ag.id)?`${ag.color}20`:'transparent',
                  color: bAgents.includes(ag.id)?ag.color:T.textMuted,
                  borderColor: bAgents.includes(ag.id)?`${ag.color}66`:T.border,
                }}>
                {ag.name}
              </div>
            ))}
          </div>
          <div style={{ flex:1, overflow:'auto', padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
            {bMsgs.length === 0 && <div style={{ fontSize:13, color:T.textMuted, textAlign:'center', marginTop:28 }}>지시하면 직원들이 보고합니다</div>}
            {bMsgs.map(m => (
              <div key={m.id} style={{ background:T.cardBg, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 12px', borderLeft:`3px solid ${agents[m.from]?.color||T.accent}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:agents[m.from]?.color||'#666' }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:agents[m.from]?.color||'#666' }}>{agents[m.from]?.name||m.from}</span>
                  <span style={{ fontSize:12, color:T.textSub }}>{agents[m.from]?.role}</span>
                  <span style={{ fontSize:11, color:T.textMuted, marginLeft:'auto' }}>{m.time}</span>
                </div>
                <div style={{ fontSize:13, color:T.text, lineHeight:1.7 }}>{m.text}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:'12px 14px', borderTop:`1px solid ${T.border}`, flexShrink:0, background:T.inputBg }}>
            <div style={{ display:'flex', gap:10 }}>
              <textarea value={bInput} onChange={e=>setBInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleBroadcast(); }}}
                disabled={bLoading} placeholder="이번 주 콘텐츠 전략 짜줘..." rows={3}
                style={{ flex:1, background:T.cardBg, border:`1.5px solid ${T.border}`, borderRadius:10, padding:'10px 14px', fontSize:14, color:T.text, outline:'none', resize:'none', lineHeight:1.6, transition:'border-color 0.2s' }}/>
              <button onClick={handleBroadcast} disabled={bLoading}
                style={{ background:T.accent, border:'none', borderRadius:10, padding:'0 22px', fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer', whiteSpace:'nowrap', minWidth:90, opacity: bLoading?0.6:1, boxShadow:`0 4px 14px ${T.accent}44` }}>
                {bLoading ? '...' : '전송 →'}
              </button>
            </div>
          </div>
        </div>

        {/* 1대1 채팅 */}
        <div style={{ background:T.panelBg, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <span style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', padding:'4px 10px', borderRadius:6, fontWeight:700, background:`${a?.color||'#666'}18`, color:a?.color||'#666', border:`1px solid ${a?.color||'#666'}44` }}>1대1</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:600, color:a?.color||T.text }}>{a?.name} · {a?.role}</div>
              <div style={{ fontSize:12, color:T.textSub, marginTop:2 }}>{s?.status==='working' ? '🟡 응답 중...' : '⚪ 대기 중'}</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {[['chat','💬 대화'],['memory','🧠 학습']].map(([tab, label]) => (
                <div key={tab} onClick={() => setChatTab(tab)}
                  style={{ fontSize:12, fontWeight:500, padding:'5px 12px', borderRadius:6, cursor:'pointer', transition:'all 0.15s',
                    background: chatTab===tab ? `${a?.color||'#666'}22` : 'transparent',
                    color: chatTab===tab ? (a?.color||'#666') : T.textSub,
                    border:`1.5px solid ${chatTab===tab ? (a?.color||'#666')+'55' : T.border}`,
                  }}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {chatTab === 'chat' ? (
            <>
              <div ref={msgsRef} style={{ flex:1, overflow:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                {(!chats[selected]||chats[selected].length===0) && (
                  <div style={{ fontSize:14, color:T.textMuted, textAlign:'center', marginTop:28 }}>{a?.name}에게 말을 걸어보세요 👋</div>
                )}
                {(chats[selected]||[]).map(m => (
                  <div key={m.id} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection:m.role==='user'?'row-reverse':'row' }}>
                    <div style={{ width:32, height:32, borderRadius:8, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:m.role==='user'?`${a?.color||'#666'}22`:T.cardBg, border:`1.5px solid ${m.role==='user'?(a?.color||'#666')+'44':T.border}`, color:m.role==='user'?(a?.color||'#fff'):T.text }}>
                      {m.role==='user'?'나':'🤖'}
                    </div>
                    <div style={{ maxWidth:'80%' }}>
                      <div style={{ padding:'10px 14px', borderRadius:12, fontSize:14, lineHeight:1.7, border:`1px solid`,
                        background:m.role==='user'?`${a?.color||'#666'}15`:T.cardBg,
                        borderColor:m.role==='user'?`${a?.color||'#666'}33`:T.border,
                        color:T.text }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize:11, color:T.textMuted, marginTop:4, textAlign:m.role==='user'?'right':'left' }}>{m.time}</div>
                    </div>
                  </div>
                ))}
                {cLoading && (
                  <div style={{ display:'flex', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', background:T.cardBg, border:`1.5px solid ${T.border}` }}>🤖</div>
                    <div style={{ padding:'10px 14px', borderRadius:12, border:`1px solid ${T.border}`, background:T.cardBg, display:'flex', gap:5, alignItems:'center' }}>
                      {[1,0.5,0.2].map((o,i)=><div key={i} style={{ width:7, height:7, borderRadius:'50%', background:a?.color||T.accent, opacity:o }}/>)}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding:'12px 14px', borderTop:`1px solid ${T.border}`, flexShrink:0, background:T.inputBg }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                  <textarea value={cInput} onChange={e=>setCInput(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleChat(); }}}
                    disabled={cLoading} placeholder={`${a?.name}에게 말하기...`} rows={3}
                    style={{ flex:1, background:T.cardBg, border:`1.5px solid ${T.border}`, borderRadius:10, padding:'10px 14px', fontSize:14, color:T.text, resize:'none', outline:'none', lineHeight:1.6 }}/>
                  <button onClick={handleChat} disabled={cLoading}
                    style={{ width:56, height:56, borderRadius:12, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:a?.color||T.accent, opacity:cLoading?0.5:1, boxShadow:`0 4px 14px ${(a?.color||T.accent)}55` }}>
                    <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex:1, overflow:'auto', padding:'16px 18px' }}>
              <div style={{ fontSize:13, color:T.textSub, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12, fontWeight:600 }}>
                {a?.name}의 누적 학습 {mem?.learnings?.length||0}건
              </div>
              {!mem?.learnings?.length ? (
                <div style={{ fontSize:14, color:T.textMuted, textAlign:'center', marginTop:28 }}>
                  아직 학습 내용이 없어요.<br/>전체 지시를 실행하면 자동으로 쌓여요.
                </div>
              ) : (
                [...(mem.learnings||[])].reverse().map((l, i) => (
                  <div key={i} style={{ background:T.cardBg, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', marginBottom:8, borderLeft:`3px solid ${a?.color||T.accent}` }}>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>
                      {new Date(l.date).toLocaleDateString('ko-KR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                    <div style={{ fontSize:13, color:T.text, lineHeight:1.7 }}>{l.insight}</div>
                  </div>
                ))
              )}
              <div style={{ marginTop:12, padding:'10px 14px', background:T.cardBg, borderRadius:10, border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:12, color:T.textSub, marginBottom:5, fontWeight:600 }}>핵심 지식</div>
                <div style={{ fontSize:13, color:T.text, lineHeight:1.7 }}>{mem?.coreKnowledge||'로딩 중...'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 신규 직원 모달 */}
      {showOnboard && (
        <div style={{ position:'fixed', inset:0, background:'#00000066', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:T.panelBg, border:`1px solid ${T.border}`, borderRadius:16, padding:30, width:380, boxShadow:'0 20px 60px #00000033' }}>
            <div style={{ fontSize:18, fontWeight:700, color:T.text, marginBottom:22 }}>신규 직원 추가</div>
            {!onboardResult ? (
              <>
                {[
                  { key:'id', label:'ID (영문 소문자)', placeholder:'예: yuna' },
                  { key:'name', label:'이름', placeholder:'예: 유나' },
                  { key:'role', label:'역할', placeholder:'예: 디자인팀' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:12, color:T.textSub, marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.label}</div>
                    <input value={newAgent[f.key]}
                      onChange={e => setNewAgent(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width:'100%', background:T.cardBg, border:`1.5px solid ${T.border}`, borderRadius:8, padding:'9px 12px', fontSize:14, color:T.text, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                ))}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:12, color:T.textSub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>색상</div>
                  <div style={{ display:'flex', gap:10 }}>
                    {['#f97316','#eab308','#22c55e','#a855f7','#3b82f6','#ec4899','#06b6d4','#f43f5e'].map(c => (
                      <div key={c} onClick={() => setNewAgent(prev => ({ ...prev, color:c }))}
                        style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer', border: newAgent.color===c ? '3px solid #fff' : '3px solid transparent', boxShadow: newAgent.color===c?`0 0 8px ${c}`:'none' }}/>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setShowOnboard(false)}
                    style={{ flex:1, padding:'11px 0', background:'transparent', border:`1.5px solid ${T.border}`, borderRadius:10, fontSize:14, color:T.textSub, cursor:'pointer' }}>
                    취소
                  </button>
                  <button onClick={handleOnboard} disabled={onboarding}
                    style={{ flex:1, padding:'11px 0', background:T.accent, border:'none', borderRadius:10, fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:`0 4px 14px ${T.accent}44` }}>
                    {onboarding ? '온보딩 중...' : '추가 →'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:13, color:T.textSub, marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>준혁의 온보딩 브리핑</div>
                <div style={{ background:T.cardBg, borderRadius:10, padding:'12px 14px', fontSize:14, color:T.text, lineHeight:1.7, marginBottom:20, maxHeight:220, overflow:'auto' }}>
                  {onboardResult}
                </div>
                <button onClick={() => { setShowOnboard(false); setNewAgent({ id:'', name:'', role:'', color:'#6366f1' }); setOnboardResult(''); }}
                  style={{ width:'100%', padding:'11px 0', background:'#22c55e', border:'none', borderRadius:10, fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer' }}>
                  완료 ✓
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
