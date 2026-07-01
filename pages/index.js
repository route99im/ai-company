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

function RoomBox({ label, style, children }) {
  return (
    <div style={{ position:'absolute', border:'0.5px solid #2a2520', borderRadius:7, padding:'5px 8px', ...style }}>
      <div style={{ fontSize:7, color:'#333', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>{label}</div>
      {children}
    </div>
  );
}

function DeskItem({ id, agents, states, selected, setSelected }) {
  const a = agents[id];
  const s = states[id];
  if (!a || !s) return null;
  const isSel = selected === id;
  const isWork = s.status === 'working';
  const isDone = s.status === 'done';
  return (
    <div style={{ width:58, cursor:'pointer', position:'relative' }} onClick={() => setSelected(id)}>
      {(s.collabs||[]).map((c, i) => (
        <div key={i} style={{
          position:'absolute', top: i===0 ? -8 : -18, right: i===0 ? -6 : 12,
          height:13, padding:'0 4px', borderRadius:8, fontSize:6, fontWeight:500,
          display:'flex', alignItems:'center', gap:2, border:'1px solid', whiteSpace:'nowrap', zIndex:10,
          background:`${agents[c.with]?.color||'#666'}14`,
          color: agents[c.with]?.color||'#666',
          borderColor:`${agents[c.with]?.color||'#666'}44`,
        }}>
          <div style={{ width:3, height:3, borderRadius:'50%', background:agents[c.with]?.color||'#666' }}/>
          {agents[c.with]?.name} {c.requester?'요청':'협업'}
        </div>
      ))}
      <div style={{
        width:58, height:48, borderRadius:6,
        background: isSel ? `${a.color}18` : (a.bg||'#111'),
        border: isSel ? `2px solid ${a.color}` : `1px solid ${isWork ? a.color+'44' : '#2a2520'}`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
        opacity: isDone ? 0.6 : 1,
      }}>
        <div style={{ fontSize:13 }}>🤖</div>
        <div style={{ fontSize:7, fontWeight:500, color: isSel||isWork ? a.color : '#666' }}>{a.name}</div>
        <div style={{ fontSize:6, color: isWork ? '#22c55e' : isDone ? '#22c55e88' : '#2a2520' }}>
          {isWork ? (s.task||'작업 중') : isDone ? '완료' : '대기'}
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, val, total, color, sub }) {
  const pct = total > 0 ? Math.round((val/total)*100) : 0;
  return (
    <div style={{ flex:1 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:3 }}>
        <span style={{ fontSize:8, color:'#444', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
        <span style={{ fontSize:14, fontWeight:500, color }}>{val}<span style={{ fontSize:8, color:'#2a2520', marginLeft:3 }}>/{total===1?0:total}</span></span>
      </div>
      <div style={{ height:5, background:'#1a1814', borderRadius:3, overflow:'hidden', border:'0.5px solid #2a2520' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3 }}/>
      </div>
      <div style={{ fontSize:7, color:'#2a2520', marginTop:2 }}>{sub}</div>
    </div>
  );
}

export default function Home() {
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
                [agentId]: { ...prev[agentId], collabs:[...prev[agentId].collabs, { with:tid, requester:true }] },
                [tid]: { ...prev[tid], status:'working', task:`${agents[agentId].name} 협업`, collabs:[...prev[tid].collabs, { with:agentId, requester:false }] },
              }));
              setTimeout(() => {
                setAgentStates(prev => ({
                  ...prev,
                  [agentId]: { ...prev[agentId], collabs:prev[agentId].collabs.filter(x=>x.with!==tid) },
                  [tid]: { ...prev[tid], status:'idle', task:'', collabs:prev[tid].collabs.filter(x=>x.with!==agentId) },
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
      setAgents(prev => ({ ...prev, [newAgent.id]: { ...newAgent, bg:'#0a0a0a' } }));
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
    <div style={{ background:'#1a1610', minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:'sans-serif' }}>

      <div style={{ background:'#111008', borderBottom:'0.5px solid #2a2520', padding:'0 14px', height:38, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ fontSize:12, fontWeight:500, color:'#e8e0d0', display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#c8a96e' }}/>
          AI 컴퍼니
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {Object.values(agents).map(ag => (
            <div key={ag.id} style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}
              onClick={() => { setSelected(ag.id); setChatTab('chat'); }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:ag.color, opacity:agentStates[ag.id]?.status==='idle'?0.35:1 }}/>
              <span style={{ fontSize:9, color: selected===ag.id ? ag.color : '#444' }}>{ag.name}</span>
            </div>
          ))}
          <button onClick={() => { setShowOnboard(true); setOnboardResult(''); setNewAgent({ id:'', name:'', role:'', color:'#6366f1' }); }}
            style={{ background:'#c8a96e14', border:'0.5px solid #c8a96e33', borderRadius:4, padding:'2px 8px', fontSize:9, color:'#c8a96e', cursor:'pointer' }}>
            + 직원 추가
          </button>
        </div>
      </div>

      <div style={{ flexShrink:0, height:190, background:'#1e1a14', position:'relative', borderBottom:'2px solid #2a2520', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)' }}>
          <DeskItem id="alex" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }}/>
        </div>
        <RoomBox label="마케팅팀" style={{ top:78, left:12, width:170, height:95, borderColor:selected==='sara'?'#eab30844':'#2a2520' }}>
          <div style={{ position:'absolute', top:18, left:8 }}>
            <DeskItem id="sara" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }}/>
          </div>
        </RoomBox>
        <RoomBox label="전략기획팀" style={{ top:78, left:194, width:170, height:95, borderColor:selected==='jin'?'#22c55e44':'#2a2520' }}>
          <div style={{ position:'absolute', top:18, left:8 }}>
            <DeskItem id="jin" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }}/>
          </div>
        </RoomBox>
        <RoomBox label="콘텐츠팀" style={{ top:78, left:376, width:155, height:95, borderColor:selected==='mia'?'#a855f744':'#2a2520' }}>
          <div style={{ position:'absolute', top:18, left:8 }}>
            <DeskItem id="mia" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }}/>
          </div>
        </RoomBox>
        <RoomBox label="데이터분석팀" style={{ top:78, right:12, width:155, height:95, borderColor:selected==='kai'?'#3b82f644':'#2a2520' }}>
          <div style={{ position:'absolute', top:18, left:8 }}>
            <DeskItem id="kai" agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }}/>
          </div>
          {Object.keys(agents).filter(id => !DEFAULT_AGENTS[id]).map((id, i) => (
            <div key={id} style={{ position:'absolute', top:18, left:76+(i*68) }}>
              <DeskItem id={id} agents={agents} states={agentStates} selected={selected} setSelected={(id) => { setSelected(id); setChatTab('chat'); }}/>
            </div>
          ))}
        </RoomBox>
        <div style={{ position:'absolute', bottom:6, left:12, display:'flex', gap:10 }}>
          {[['#22c55e44','작업 중'],['#3b82f644','협업 중'],['#2a2520','대기']].map(([bc,lbl]) => (
            <div key={lbl} style={{ display:'flex', alignItems:'center', gap:3, fontSize:7, color:'#333' }}>
              <div style={{ width:8, height:8, borderRadius:2, border:`1.5px solid ${bc}` }}/>{lbl}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flexShrink:0, background:'#111008', borderBottom:'2px solid #2a2520', padding:'7px 14px', display:'flex', gap:14 }}>
        <StatBar label="업무 지시" val={tasks.total} total={Math.max(tasks.total,1)} color="#c8a96e" sub={`총 ${tasks.total}건 분배`}/>
        <StatBar label="진행 현황" val={tasks.working} total={Math.max(tasks.total,1)} color="#3b82f6" sub={`${tasks.working}건 진행 중`}/>
        <StatBar label="완료 현황" val={tasks.done} total={Math.max(tasks.total,1)} color="#22c55e" sub={`완료율 ${tasks.total?Math.round(tasks.done/tasks.total*100):0}%`}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', flex:1, overflow:'hidden', minHeight:0 }}>

        <div style={{ background:'#141210', borderRight:'2px solid #2a2520', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'7px 12px', borderBottom:'1px solid #2a2520', display:'flex', alignItems:'center', gap:8, flexShrink:0, background:'#0f0d08' }}>
            <span style={{ fontSize:7, textTransform:'uppercase', letterSpacing:'0.08em', padding:'2px 6px', borderRadius:3, fontWeight:500, background:'#c8a96e14', color:'#c8a96e', border:'0.5px solid #c8a96e33' }}>전체 지시</span>
            <div>
              <div style={{ fontSize:11, fontWeight:500, color:'#c8a96e' }}>전 부서 지시</div>
              <div style={{ fontSize:8, color:'#444', marginTop:1 }}>직원 선택 후 전송</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:4, padding:'5px 10px', borderBottom:'1px solid #2a2520', flexShrink:0, flexWrap:'wrap' }}>
            {Object.values(agents).map(ag => (
              <div key={ag.id}
                onClick={() => setBAgents(prev => prev.includes(ag.id) ? prev.filter(x=>x!==ag.id) : [...prev,ag.id])}
                style={{ padding:'2px 7px', borderRadius:3, fontSize:8, fontWeight:500, border:'1px solid', cursor:'pointer',
                  background: bAgents.includes(ag.id)?`${ag.color}18`:'transparent',
                  color: bAgents.includes(ag.id)?ag.color:'#2a2520',
                  borderColor: bAgents.includes(ag.id)?`${ag.color}44`:'#1e1a14',
                  opacity: bAgents.includes(ag.id)?1:0.4,
                }}>
                {ag.name}
              </div>
            ))}
          </div>
          <div style={{ flex:1, overflow:'auto', padding:'6px 10px', display:'flex', flexDirection:'column', gap:4 }}>
            {bMsgs.length === 0 && <div style={{ fontSize:9, color:'#2a2520', textAlign:'center', marginTop:20 }}>지시하면 직원들이 보고합니다</div>}
            {bMsgs.map(m => (
              <div key={m.id} style={{ background:'#1a1814', border:'0.5px solid #2a2520', borderRadius:5, padding:'5px 7px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:2 }}>
                  <div style={{ width:4, height:4, borderRadius:'50%', background:agents[m.from]?.color||'#666' }}/>
                  <span style={{ fontSize:8, fontWeight:500, color:agents[m.from]?.color||'#666' }}>{agents[m.from]?.name||m.from}</span>
                  <span style={{ fontSize:7, color:'#333' }}>{agents[m.from]?.role}</span>
                  <span style={{ fontSize:7, color:'#2a2520', marginLeft:'auto' }}>{m.time}</span>
                </div>
                <div style={{ fontSize:9, color:'#777', lineHeight:1.5 }}>{m.text}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:'7px 10px', borderTop:'1px solid #2a2520', flexShrink:0, background:'#0f0d08' }}>
            <div style={{ fontSize:7, color:'#333', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>전체 지시 입력</div>
            <div style={{ display:'flex', gap:5 }}>
              <input value={bInput} onChange={e=>setBInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleBroadcast()}
                disabled={bLoading} placeholder="이번 주 콘텐츠 전략 짜줘..."
                style={{ flex:1, background:'#1a1814', border:'0.5px solid #2a2520', borderRadius:5, padding:'5px 7px', fontSize:9, color:'#c8a96e', outline:'none' }}/>
              <button onClick={handleBroadcast} disabled={bLoading}
                style={{ background:'#c8a96e14', border:'0.5px solid #c8a96e33', borderRadius:5, padding:'5px 8px', fontSize:9, color:'#c8a96e', cursor:'pointer', whiteSpace:'nowrap' }}>
                {bLoading ? '...' : '전송 →'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ background:'#141210', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'7px 12px', borderBottom:'1px solid #2a2520', display:'flex', alignItems:'center', gap:8, flexShrink:0, background:'#0f0d08' }}>
            <span style={{ fontSize:7, textTransform:'uppercase', letterSpacing:'0.08em', padding:'2px 6px', borderRadius:3, fontWeight:500, background:`${a?.color||'#666'}14`, color:a?.color||'#666', border:`0.5px solid ${a?.color||'#666'}33` }}>1대1</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:500, color:a?.color||'#666' }}>{a?.name} · {a?.role}</div>
              <div style={{ fontSize:8, color:'#444', marginTop:1 }}>{s?.status==='working' ? '응답 중...' : s?.task || '대기 중'}</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>
              {[['chat','대화'],['memory','학습 메모리']].map(([tab, label]) => (
                <div key={tab} onClick={() => setChatTab(tab)}
                  style={{ fontSize:8, padding:'2px 7px', borderRadius:3, cursor:'pointer',
                    background: chatTab===tab ? `${a?.color||'#666'}22` : 'transparent',
                    color: chatTab===tab ? (a?.color||'#666') : '#333',
                    border:`0.5px solid ${chatTab===tab ? (a?.color||'#666')+'44' : '#1e1a14'}`,
                  }}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {chatTab === 'chat' ? (
            <>
              <div ref={msgsRef} style={{ flex:1, overflow:'auto', padding:'8px 10px', display:'flex', flexDirection:'column', gap:5 }}>
                {(!chats[selected]||chats[selected].length===0) && (
                  <div style={{ fontSize:9, color:'#2a2520', textAlign:'center', marginTop:20 }}>{a?.name}에게 말을 걸어보세요</div>
                )}
                {(chats[selected]||[]).map(m => (
                  <div key={m.id} style={{ display:'flex', gap:5, alignItems:'flex-start', flexDirection:m.role==='user'?'row-reverse':'row' }}>
                    <div style={{ width:18, height:18, borderRadius:4, fontSize:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, background:m.role==='user'?'#1a1a10':(a?.bg||'#111'), color:m.role==='user'?(a?.color||'#fff'):'#fff' }}>
                      {m.role==='user'?'나':'🤖'}
                    </div>
                    <div>
                      <div style={{ padding:'5px 8px', borderRadius:7, fontSize:9, lineHeight:1.5, border:'0.5px solid', maxWidth:'84%',
                        background:m.role==='user'?'#1a1a08':'#1a1814',
                        borderColor:m.role==='user'?`${a?.color||'#666'}18`:'#2a2520',
                        color:m.role==='user'?'#e8e0c0':'#c8c0b0' }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize:7, color:'#2a2520', marginTop:2, textAlign:m.role==='user'?'right':'left' }}>{m.time}</div>
                    </div>
                  </div>
                ))}
                {cLoading && (
                  <div style={{ display:'flex', gap:5 }}>
                    <div style={{ width:18, height:18, borderRadius:4, fontSize:8, display:'flex', alignItems:'center', justifyContent:'center', background:a?.bg||'#111' }}>🤖</div>
                    <div style={{ padding:'5px 8px', borderRadius:7, border:'0.5px solid #2a2520', background:'#1a1814', display:'flex', gap:3, alignItems:'center' }}>
                      {[1,0.6,0.3].map((o,i)=><div key={i} style={{ width:3, height:3, borderRadius:'50%', background:a?.color||'#666', opacity:o }}/>)}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding:'7px 10px', borderTop:'1px solid #2a2520', flexShrink:0, background:'#0f0d08' }}>
                <div style={{ display:'flex', gap:5, alignItems:'flex-end' }}>
                  <textarea value={cInput} onChange={e=>setCInput(e.target.value)}
                    onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleChat(); }}}
                    disabled={cLoading} placeholder={`${a?.name}에게...`} rows={1}
                    style={{ flex:1, background:'#1a1814', border:'0.5px solid #2a2520', borderRadius:6, padding:'5px 7px', fontSize:9, color:'#e8e0d0', resize:'none', outline:'none', minHeight:28, lineHeight:1.4 }}/>
                  <button onClick={handleChat} disabled={cLoading}
                    style={{ width:26, height:26, borderRadius:5, border:`0.5px solid ${a?.color||'#666'}33`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:`${a?.color||'#666'}10` }}>
                    <svg width="11" height="11" fill="none" stroke={a?.color||'#666'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex:1, overflow:'auto', padding:'10px 12px' }}>
              <div style={{ fontSize:8, color:'#444', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
                {a?.name}의 누적 학습 {mem?.learnings?.length||0}건
              </div>
              {!mem?.learnings?.length ? (
                <div style={{ fontSize:9, color:'#2a2520', textAlign:'center', marginTop:20 }}>
                  아직 학습 내용이 없어요.<br/>전체 지시를 실행하면 자동으로 쌓여요.
                </div>
              ) : (
                [...(mem.learnings||[])].reverse().map((l, i) => (
                  <div key={i} style={{ background:'#1a1814', border:'0.5px solid #2a2520', borderRadius:5, padding:'6px 8px', marginBottom:5 }}>
                    <div style={{ fontSize:7, color:'#333', marginBottom:2 }}>
                      {new Date(l.date).toLocaleDateString('ko-KR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </div>
                    <div style={{ fontSize:9, color:'#888', lineHeight:1.5 }}>{l.insight}</div>
                  </div>
                ))
              )}
              <div style={{ marginTop:8, padding:'6px 8px', background:'#111008', borderRadius:5, border:'0.5px solid #2a2520' }}>
                <div style={{ fontSize:8, color:'#444', marginBottom:3 }}>핵심 지식</div>
                <div style={{ fontSize:9, color:'#666', lineHeight:1.5 }}>{mem?.coreKnowledge||'로딩 중...'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showOnboard && (
        <div style={{ position:'fixed', inset:0, background:'#00000088', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'#1a1610', border:'0.5px solid #2a2520', borderRadius:12, padding:24, width:320 }}>
            <div style={{ fontSize:13, fontWeight:500, color:'#e8e0d0', marginBottom:16 }}>신규 직원 추가</div>
            {!onboardResult ? (
              <>
                {[
                  { key:'id', label:'ID (영문 소문자)', placeholder:'예: yuna' },
                  { key:'name', label:'이름', placeholder:'예: 유나' },
                  { key:'role', label:'역할', placeholder:'예: 디자인팀' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:10 }}>
                    <div style={{ fontSize:8, color:'#555', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.label}</div>
                    <input value={newAgent[f.key]}
                      onChange={e => setNewAgent(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width:'100%', background:'#1a1814', border:'0.5px solid #2a2520', borderRadius:5, padding:'5px 8px', fontSize:10, color:'#e8e0d0', outline:'none' }}/>
                  </div>
                ))}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:8, color:'#555', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>색상</div>
                  <div style={{ display:'flex', gap:6 }}>
                    {['#f97316','#eab308','#22c55e','#a855f7','#3b82f6','#ec4899','#06b6d4','#f43f5e'].map(c => (
                      <div key={c} onClick={() => setNewAgent(prev => ({ ...prev, color:c }))}
                        style={{ width:18, height:18, borderRadius:'50%', background:c, cursor:'pointer', border: newAgent.color===c ? '2px solid #fff' : '2px solid transparent' }}/>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setShowOnboard(false)}
                    style={{ flex:1, padding:'7px 0', background:'transparent', border:'0.5px solid #2a2520', borderRadius:6, fontSize:10, color:'#555', cursor:'pointer' }}>
                    취소
                  </button>
                  <button onClick={handleOnboard} disabled={onboarding}
                    style={{ flex:1, padding:'7px 0', background:'#c8a96e18', border:'0.5px solid #c8a96e44', borderRadius:6, fontSize:10, color:'#c8a96e', cursor:'pointer' }}>
                    {onboarding ? '온보딩 중...' : '추가 →'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:8, color:'#555', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>준혁의 온보딩 브리핑</div>
                <div style={{ background:'#111008', borderRadius:6, padding:'8px 10px', fontSize:9, color:'#888', lineHeight:1.6, marginBottom:14, maxHeight:200, overflow:'auto' }}>
                  {onboardResult}
                </div>
                <button onClick={() => { setShowOnboard(false); setNewAgent({ id:'', name:'', role:'', color:'#6366f1' }); setOnboardResult(''); }}
                  style={{ width:'100%', padding:'7px 0', background:'#22c55e18', border:'0.5px solid #22c55e44', borderRadius:6, fontSize:10, color:'#22c55e', cursor:'pointer' }}>
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

