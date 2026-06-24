import { useState, useRef, useEffect } from 'react';

const AGENTS = {
  ceo:       { name:'Alex', title:'CEO',      emoji:'🤖', bg:'#EEF2FF', accent:'#6366F1', border:'#C7D2FE', bodyColor:'#6366F1', legColor:'#3730A3', shoeColor:'#1E1B4B', faceColor:'#EEF2FF', light:'#C7D2FE',
    persona:`당신은 스타트업 CEO Alex입니다. 냉철하고 전략적입니다. 전체 지시시 반드시 순수 JSON만 반환 (마크다운 없이): {"ceo_comment":"2문장","marketing_task":"지시","strategy_task":"지시","content_task":"지시","data_task":"지시"}` },
  marketing: { name:'Sara', title:'마케팅팀', emoji:'📢', bg:'#FFF7ED', accent:'#F97316', border:'#FED7AA', bodyColor:'#F97316', legColor:'#EA580C', shoeColor:'#7C2D12', faceColor:'#FFF7ED', light:'#FED7AA',
    persona:`당신은 마케팅 전문가 Sara입니다. 트렌디하고 실전적입니다. 사용자와 1대1 채팅입니다. 친근하게 대화하되 전문적인 마케팅 인사이트를 제공하세요.` },
  strategy:  { name:'Jin',  title:'전략기획팀',emoji:'🎯', bg:'#F0FDF4', accent:'#22C55E', border:'#BBF7D0', bodyColor:'#22C55E', legColor:'#15803D', shoeColor:'#14532D', faceColor:'#F0FDF4', light:'#BBF7D0',
    persona:`당신은 전략기획 전문가 Jin입니다. 논리적이고 구조적입니다. 사용자와 1대1 채팅입니다. 친근하게 대화하되 전략적 인사이트를 제공하세요.` },
  content:   { name:'Mia',  title:'콘텐츠팀', emoji:'✍️', bg:'#FDF4FF', accent:'#A855F7', border:'#E9D5FF', bodyColor:'#A855F7', legColor:'#9333EA', shoeColor:'#581C87', faceColor:'#FDF4FF', light:'#E9D5FF',
    persona:`당신은 콘텐츠 크리에이터 Mia입니다. 창의적이고 스토리텔링을 잘합니다. 사용자와 1대1 채팅입니다. 친근하고 재치있게 대화하며 창의적 아이디어를 제공하세요.` },
  data:      { name:'Kai',  title:'데이터분석팀',emoji:'📊', bg:'#EFF6FF', accent:'#3B82F6', border:'#BFDBFE', bodyColor:'#3B82F6', legColor:'#2563EB', shoeColor:'#1E3A8A', faceColor:'#EFF6FF', light:'#BFDBFE',
    persona:`당신은 데이터 분석가 Kai입니다. 수치와 근거를 중시합니다. 사용자와 1대1 채팅입니다. 친근하게 대화하되 데이터 기반 인사이트를 제공하세요.` },
};

const LAYOUT = [
  { id:'ceo',       top:'4%',  left:'2%',  width:'30%', height:'42%' },
  { id:'marketing', top:'4%',  left:'34%', width:'30%', height:'42%' },
  { id:'strategy',  top:'4%',  left:'66%', width:'30%', height:'42%' },
  { id:'content',   top:'50%', left:'2%',  width:'46%', height:'44%' },
  { id:'data',      top:'50%', left:'50%', width:'46%', height:'44%' },
];

function LegoCharacter({ agentId, status }) {
  const ag = AGENTS[agentId];
  const [frame, setFrame] = useState(0);
  const [pos, setPos] = useState({ x:0, y:0 });
  const animRef = useRef(null);
  const tRef = useRef(0);
  const posRef = useRef({ x:0, dir:1, speed:0.15+Math.random()*0.15 });

  useEffect(() => {
    const animate = () => {
      tRef.current++;
      const t = tRef.current;
      if (status === 'working') {
        posRef.current.x += posRef.current.dir * posRef.current.speed;
        if (posRef.current.x > 20 || posRef.current.x < -20) posRef.current.dir *= -1;
        setPos({ x: posRef.current.x, y: Math.sin(t * 0.18) * 2 });
        setFrame(Math.floor(t / 7) % 2);
      } else {
        setPos({ x: posRef.current.x, y: Math.sin(t * 0.05) * 1 });
        setFrame(0);
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [status]);

  const la = status==='working'?(frame===0?-28:28):0;
  const ra = status==='working'?(frame===0?28:-28):0;
  const lla = status==='working'?(frame===0?22:-22):0;
  const rla = status==='working'?(frame===0?-22:22):0;

  return (
    <div style={{ transform:`translateX(${pos.x}px) translateY(${pos.y}px)`, display:'inline-block' }}>
      <svg width="44" height="76" viewBox="0 0 48 84">
        <rect x="18" y="0" width="12" height="5" rx="2.5" fill={ag.light}/>
        <rect x="11" y="4" width="26" height="24" rx="5" fill={ag.faceColor} stroke={ag.light} strokeWidth="1"/>
        <circle cx="19" cy="13" r="2.2" fill={ag.accent}/>
        <circle cx="29" cy="13" r="2.2" fill={ag.accent}/>
        <path d={status==='working'?"M18 20 Q24 25 30 20":"M18 19 Q24 23 30 19"} stroke={ag.accent} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <rect x="9" y="30" width="30" height="26" rx="3" fill={ag.bodyColor}/>
        <g transform={`rotate(${la},9,33)`}><rect x="1" y="30" width="8" height="20" rx="3" fill={ag.bodyColor}/><rect x="1" y="49" width="8" height="7" rx="2" fill={ag.faceColor}/></g>
        <g transform={`rotate(${ra},39,33)`}><rect x="39" y="30" width="8" height="20" rx="3" fill={ag.bodyColor}/><rect x="39" y="49" width="8" height="7" rx="2" fill={ag.faceColor}/></g>
        <g transform={`rotate(${lla},16,58)`}><rect x="11" y="58" width="11" height="18" rx="3" fill={ag.legColor}/><rect x="9" y="74" width="13" height="7" rx="2" fill={ag.shoeColor}/></g>
        <g transform={`rotate(${rla},32,58)`}><rect x="26" y="58" width="11" height="18" rx="3" fill={ag.legColor}/><rect x="26" y="74" width="13" height="7" rx="2" fill={ag.shoeColor}/></g>
      </svg>
    </div>
  );
}

const CHAT_KEY = 'ai_co_chats_v4';
const TASKS_KEY = 'ai_co_tasks_v4';

function loadLS(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } }
function saveLS(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

export default function Home() {
  const [statuses, setStatuses] = useState({ceo:'idle',marketing:'idle',strategy:'idle',content:'idle',data:'idle'});
  const [bubbles, setBubbles] = useState({});
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatAgent, setChatAgent] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chats, setChats] = useState({});
  const [tasks, setTasks] = useState({ todo:[], doing:[], done:[] });
  const [newTask, setNewTask] = useState('');
  const [postingMsgId, setPostingMsgId] = useState(null);
  const [postResults, setPostResults] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => {
    setChats(loadLS(CHAT_KEY, {}));
    setTasks(loadLS(TASKS_KEY, { todo:[], doing:[], done:[] }));
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chats, chatAgent]);

  const setSt = (id, st) => setStatuses(p=>({...p,[id]:st}));
  const setBubble = (id, text) => setBubbles(p=>({...p,[id]:text}));

  const callClaude = async (system, messages) => {
    const res = await fetch('/api/chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ model:'claude-3-haiku-20240307', max_tokens:1000, system, messages }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.content?.[0]?.text || '';
  };

  const runAllTask = async () => {
    if (loading || !task.trim()) return;
    const t = task; setTask('');
    setLoading(true);
    setStatuses({ceo:'idle',marketing:'idle',strategy:'idle',content:'idle',data:'idle'});
    setBubbles({});

    // 태스크 보드에 자동 추가
    const taskId = Date.now();
    const newEntry = { id:taskId, text:t, assignee:'전체', ts: new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}) };
    setTasks(prev => {
      const u = { ...prev, doing:[...prev.doing, newEntry] };
      saveLS(TASKS_KEY, u); return u;
    });

    try {
      setSt('ceo','working'); setBubble('ceo','업무 분석 중...');
      const ceoRaw = await callClaude(AGENTS.ceo.persona, [{role:'user',content:`업무: ${t}`}]);
      let parsed;
      try { parsed = JSON.parse(ceoRaw.trim()); }
      catch { parsed = {ceo_comment:ceoRaw,marketing_task:t,strategy_task:t,content_task:t,data_task:t}; }
      setBubble('ceo', parsed.ceo_comment?.slice(0,26)+'...');
      setSt('ceo','done');

      const teams = [
        {id:'marketing',task:parsed.marketing_task,bubble:'캠페인 기획 중...'},
        {id:'strategy', task:parsed.strategy_task, bubble:'시장 분석 중...'},
        {id:'content',  task:parsed.content_task,  bubble:'카피 작성 중...'},
        {id:'data',     task:parsed.data_task,      bubble:'지표 설계 중...'},
      ];
      teams.forEach(({id,bubble})=>{ setSt(id,'working'); setBubble(id,bubble); });

      const results = await Promise.all(teams.map(({id,task:tk})=>
        callClaude(AGENTS[id].persona, [{role:'user',content:`CEO 지시: ${tk}\n전체 업무: ${t}`}])
      ));

      teams.forEach(({id, task: agentTask},i)=>{
        setSt(id,'done'); setBubble(id, results[i]?.slice(0,26)+'...');
        setChats(prev=>{ const u={...prev,[id]:[...(prev[id]||[]),{ role:'user', content:`[전체 지시] ${agentTask}`, ts:Date.now()-1 },
                                                {role:'assistant',content:results[i],ts:Date.now()}]}; saveLS(CHAT_KEY,u); return u; });
        setTimeout(()=>setBubble(id,null),4000);
      });
      setTimeout(()=>setBubble('ceo',null),4000);

      // 완료로 이동
      setTasks(prev=>{
        const u = { ...prev, doing:prev.doing.filter(x=>x.id!==taskId), done:[...prev.done,{...newEntry,doneAt:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}] };
        saveLS(TASKS_KEY,u); return u;
      });

    } catch(e) {
      setBubble('ceo','오류!');
      setStatuses({ceo:'idle',marketing:'idle',strategy:'idle',content:'idle',data:'idle'});
      setTasks(prev=>{ const u={...prev,doing:prev.doing.filter(x=>x.id!==taskId),todo:[...prev.todo,newEntry]}; saveLS(TASKS_KEY,u); return u; });
    }
    setLoading(false);
  };

  const postToThreads = async (text, msgId) => {
    setPostingMsgId(msgId);
    try {
      const res = await fetch('/api/threads-post', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) {
        setPostResults(p=>({...p,[msgId]:'posted'}));
      } else {
        setPostResults(p=>({...p,[msgId]:'error'}));
      }
    } catch(e) {
      setPostResults(p=>({...p,[msgId]:'error'}));
    }
    setPostingMsgId(null);
  };

  const sendChat = async () => {
    if (chatLoading||!chatInput.trim()||!chatAgent) return;
    const msg=chatInput.trim(); setChatInput('');
    const prev = chats[chatAgent]||[];
    const newMsgs=[...prev,{role:'user',content:msg,ts:Date.now()}];
    setChats(p=>{ const u={...p,[chatAgent]:newMsgs}; saveLS(CHAT_KEY,u); return u; });
    setChatLoading(true); setSt(chatAgent,'working'); setBubble(chatAgent,'답변 작성 중...');
    try {
      const reply = await callClaude(AGENTS[chatAgent].persona, newMsgs.map(m=>({role:m.role,content:m.content})));
      const withReply=[...newMsgs,{role:'assistant',content:reply,ts:Date.now()}];
      setChats(p=>{ const u={...p,[chatAgent]:withReply}; saveLS(CHAT_KEY,u); return u; });
      setSt(chatAgent,'done'); setBubble(chatAgent,reply.slice(0,26)+'...');
      setTimeout(()=>setBubble(chatAgent,null),4000);
    } catch(e){ setSt(chatAgent,'idle'); }
    setChatLoading(false);
  };

  const addTodo = () => {
    if (!newTask.trim()) return;
    const entry = { id:Date.now(), text:newTask.trim(), ts:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}) };
    setTasks(prev=>{ const u={...prev,todo:[...prev.todo,entry]}; saveLS(TASKS_KEY,u); return u; });
    setNewTask('');
  };
  const moveTo = (from, to, id) => {
    setTasks(prev=>{
      const item = prev[from].find(x=>x.id===id);
      if (!item) return prev;
      const u = { ...prev, [from]:prev[from].filter(x=>x.id!==id), [to]:[...prev[to],item] };
      saveLS(TASKS_KEY,u); return u;
    });
  };
  const removeTask = (col, id) => {
    setTasks(prev=>{ const u={...prev,[col]:prev[col].filter(x=>x.id!==id)}; saveLS(TASKS_KEY,u); return u; });
  };

  const totalToday = tasks.todo.length + tasks.doing.length + tasks.done.length;

  const TaskCol = ({ label, col, color, items }) => (
    <div style={{flex:1}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:color}}/>
        <div style={{fontSize:11,fontWeight:600,color:'#64748B'}}>{label}</div>
        <div style={{marginLeft:'auto',fontSize:11,background:'#F1F5F9',color:'#64748B',borderRadius:10,padding:'1px 7px'}}>{items.length}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {items.map(item=>(
          <div key={item.id} style={{background:'#fff',border:'0.5px solid #E2E8F0',borderRadius:8,padding:'7px 10px'}}>
            <div style={{fontSize:12,color:'#0F172A',lineHeight:1.5,marginBottom:4}}>{item.text}</div>
            <div style={{display:'flex',alignItems:'center',gap:4}}>
              <span style={{fontSize:10,color:'#94A3B8'}}>{item.ts}</span>
              <div style={{marginLeft:'auto',display:'flex',gap:4}}>
                {col==='todo'&&<button onClick={()=>moveTo('todo','doing',item.id)} style={{fontSize:10,padding:'1px 6px',border:'0.5px solid #E2E8F0',borderRadius:4,background:'#F8FAFC',cursor:'pointer',color:'#64748B'}}>시작</button>}
                {col==='doing'&&<button onClick={()=>moveTo('doing','done',item.id)} style={{fontSize:10,padding:'1px 6px',border:'0.5px solid #BBF7D0',borderRadius:4,background:'#F0FDF4',cursor:'pointer',color:'#16A34A'}}>완료</button>}
                {col==='done'&&<button onClick={()=>removeTask('done',item.id)} style={{fontSize:10,padding:'1px 6px',border:'0.5px solid #FECACA',borderRadius:4,background:'#FEF2F2',cursor:'pointer',color:'#DC2626'}}>삭제</button>}
              </div>
            </div>
          </div>
        ))}
        {items.length===0&&<div style={{fontSize:11,color:'#CBD5E1',textAlign:'center',padding:'12px 0'}}>없음</div>}
      </div>
    </div>
  );

  return (
    <div style={{width:'100vw',height:'100vh',display:'flex',flexDirection:'column',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',overflow:'hidden',background:'#F8FAFC'}}>

      {/* 상단 바 */}
      <div style={{height:42,background:'#fff',borderBottom:'1px solid #E2E8F0',display:'flex',alignItems:'center',padding:'0 16px',gap:10,flexShrink:0,zIndex:10}}>
        <div style={{fontSize:14,fontWeight:700,color:'#0F172A',letterSpacing:-0.3}}>🏢 AI 컴퍼니</div>
        <div style={{fontSize:11,color:'#CBD5E1'}}>|</div>
        <div style={{fontSize:11,color:'#94A3B8'}}>섹터 클릭 → 1대1 채팅</div>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:11,color:'#94A3B8'}}>오늘 총 업무 <span style={{fontWeight:700,color:'#0F172A'}}>{totalToday}</span>건</div>
          {Object.entries(statuses).map(([id,st])=>(
            <div key={id} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:st==='working'?'#22C55E':'#EF4444',boxShadow:st==='working'?'0 0 4px #22C55E':'none',transition:'all 0.3s'}}/>
              <span style={{fontSize:10,color:'#94A3B8'}}>{AGENTS[id].name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 */}
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        {/* 오피스 평면도 */}
        <div style={{flex:1,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(#E2E8F0 1px,transparent 1px),linear-gradient(90deg,#E2E8F0 1px,transparent 1px)',backgroundSize:'36px 36px',opacity:0.35}}/>

          {LAYOUT.map(({id,top,left,width,height})=>{
            const ag=AGENTS[id];
            const st=statuses[id];
            const bubble=bubbles[id];
            const isOpen=chatAgent===id;
            return (
              <div key={id} onClick={()=>setChatAgent(isOpen?null:id)}
                style={{position:'absolute',top,left,width,height,background:isOpen?ag.bg:'#fff',border:`1.5px solid ${isOpen?ag.accent:st==='working'?ag.border:'#E2E8F0'}`,borderRadius:14,cursor:'pointer',transition:'all 0.2s',boxShadow:isOpen?`0 0 0 3px ${ag.accent}22`:st==='working'?`0 0 8px ${ag.border}`:'0 1px 3px rgba(0,0,0,0.05)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',padding:'0 0 10px',overflow:'visible'}}>

                {/* 헤더 */}
                <div style={{position:'absolute',top:8,left:10,right:10,display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:st==='working'?'#22C55E':'#EF4444',boxShadow:st==='working'?'0 0 5px #22C55E':'none',transition:'all 0.3s',flexShrink:0}}/>
                  <div style={{fontSize:10,fontWeight:600,color:isOpen?ag.accent:'#94A3B8',letterSpacing:0.3}}>{ag.title}</div>
                  {(chats[id]||[]).length>0&&<div style={{marginLeft:'auto',fontSize:9,background:ag.accent,color:'#fff',borderRadius:8,padding:'1px 5px',fontWeight:600}}>{(chats[id]||[]).length}</div>}
                </div>

                {/* 말풍선 */}
                {bubble&&(
                  <div style={{position:'absolute',top:-40,left:'50%',transform:'translateX(-50%)',background:'#fff',border:`1px solid ${ag.border}`,borderRadius:10,padding:'5px 10px',fontSize:11,whiteSpace:'nowrap',zIndex:20,color:'#0F172A',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis'}}>
                    {bubble}
                    <div style={{position:'absolute',bottom:-5,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'5px solid transparent',borderRight:'5px solid transparent',borderTop:`5px solid ${ag.border}`}}/>
                    <div style={{position:'absolute',bottom:-4,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'5px solid transparent',borderRight:'5px solid transparent',borderTop:'5px solid #fff'}}/>
                  </div>
                )}

                {/* 캐릭터 */}
                <LegoCharacter agentId={id} status={st}/>

                {/* 이름 + 상태점 */}
                <div style={{display:'flex',alignItems:'center',gap:5,marginTop:3}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#0F172A'}}>{ag.name}</div>
                  <div style={{width:6,height:6,borderRadius:'50%',background:st==='working'?'#22C55E':'#EF4444',boxShadow:st==='working'?'0 0 4px #22C55E':'none',transition:'all 0.3s'}}/>
                </div>
                <div style={{fontSize:10,color:'#94A3B8'}}>{st==='working'?'작업 중...':st==='done'?'완료 ✓':'대기 중'}</div>
              </div>
            );
          })}

          {/* 전체 지시 입력창 */}
          <div style={{position:'absolute',bottom:14,left:'50%',transform:'translateX(-50%)',width:'58%',maxWidth:560,background:'#fff',border:'1px solid #E2E8F0',borderRadius:14,padding:'9px 12px',boxShadow:'0 4px 16px rgba(0,0,0,0.08)',display:'flex',gap:8,zIndex:10}}>
            <input value={task} onChange={e=>setTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runAllTask()}
              placeholder="전 부서에 업무를 지시하세요..."
              style={{flex:1,border:'none',outline:'none',fontSize:13,background:'transparent',color:'#0F172A'}}/>
            <button onClick={runAllTask} disabled={loading}
              style={{padding:'7px 14px',background:loading?'#94A3B8':'#6366F1',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:loading?'not-allowed':'pointer',whiteSpace:'nowrap'}}>
              {loading?'처리 중...':'전체 지시 →'}
            </button>
          </div>
        </div>

        {/* 우측 패널 */}
        <div style={{width:300,background:'#fff',borderLeft:'1px solid #E2E8F0',display:'flex',flexDirection:'column',flexShrink:0}}>

          {/* 1대1 채팅 */}
          {chatAgent ? (
            <>
              <div style={{padding:'12px 14px',borderBottom:'1px solid #E2E8F0',display:'flex',alignItems:'center',gap:8,background:AGENTS[chatAgent].bg,flexShrink:0}}>
                <div style={{fontSize:18}}>{AGENTS[chatAgent].emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700}}>{AGENTS[chatAgent].name}</div>
                  <div style={{fontSize:10,color:'#64748B'}}>1대1 채팅</div>
                </div>
                <button onClick={()=>setChatAgent(null)} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',color:'#94A3B8'}}>✕</button>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'12px',display:'flex',flexDirection:'column',gap:8}}>
                {!(chats[chatAgent]||[]).length&&(
                  <div style={{textAlign:'center',color:'#94A3B8',fontSize:12,marginTop:20}}>
                    <div style={{fontSize:28,marginBottom:6}}>{AGENTS[chatAgent].emoji}</div>
                    {AGENTS[chatAgent].name}에게 말을 걸어보세요!
                  </div>
                )}
                {(chats[chatAgent]||[]).map((m,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:6,alignItems:'flex-end'}}>
                    {m.role==='assistant'&&<div style={{width:24,height:24,borderRadius:6,background:AGENTS[chatAgent].bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>{AGENTS[chatAgent].emoji}</div>}
                    <div style={{maxWidth:'80%'}}>
                      <div style={{padding:'8px 11px',borderRadius:m.role==='user'?'10px 10px 2px 10px':'10px 10px 10px 2px',background:m.role==='user'?AGENTS[chatAgent].accent:'#F1F5F9',color:m.role==='user'?'#fff':'#0F172A',fontSize:12,lineHeight:1.6,whiteSpace:'pre-wrap'}}>
                        {m.content}
                      </div>
                      {m.role==='assistant'&&(
                        <button onClick={()=>postToThreads(m.content, i)} disabled={postingMsgId===i||postResults[i]==='posted'}
                          style={{marginTop:4,fontSize:10,padding:'3px 8px',border:'0.5px solid #E2E8F0',borderRadius:6,background:postResults[i]==='posted'?'#F0FDF4':postResults[i]==='error'?'#FEF2F2':'#fff',color:postResults[i]==='posted'?'#16A34A':postResults[i]==='error'?'#DC2626':'#64748B',cursor:postingMsgId===i?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:4}}>
                          {postResults[i]==='posted'?'✓ 스레드 게시됨':postResults[i]==='error'?'❌ 오류':postingMsgId===i?'게시 중...':'🧵 스레드에 올리기'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading&&(
                  <div style={{display:'flex',gap:6,alignItems:'flex-end'}}>
                    <div style={{width:24,height:24,borderRadius:6,background:AGENTS[chatAgent].bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>{AGENTS[chatAgent].emoji}</div>
                    <div style={{padding:'9px 12px',borderRadius:'10px 10px 10px 2px',background:'#F1F5F9',display:'flex',gap:3}}>
                      {[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:'50%',background:'#94A3B8',display:'inline-block',animation:`bounce 1s ${i*0.15}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>
              <div style={{padding:'10px 12px',borderTop:'1px solid #E2E8F0',display:'flex',gap:6,flexShrink:0}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendChat()}
                  placeholder={`${AGENTS[chatAgent].name}에게...`}
                  style={{flex:1,padding:'8px 10px',border:'1px solid #E2E8F0',borderRadius:8,fontSize:12,outline:'none',background:'#F8FAFC'}}/>
                <button onClick={sendChat} disabled={chatLoading}
                  style={{padding:'8px 12px',background:chatLoading?'#94A3B8':AGENTS[chatAgent].accent,color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:chatLoading?'not-allowed':'pointer'}}>
                  전송
                </button>
              </div>
            </>
          ) : (
            /* 업무 보드 */
            <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
              <div style={{padding:'12px 14px',borderBottom:'1px solid #E2E8F0',flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:700,color:'#0F172A',marginBottom:2}}>📋 오늘 업무 현황</div>
                <div style={{fontSize:11,color:'#94A3B8'}}>총 {totalToday}건 · 완료 {tasks.done.length}건</div>
              </div>

              {/* 업무 추가 */}
              <div style={{padding:'10px 12px',borderBottom:'1px solid #F1F5F9',flexShrink:0,display:'flex',gap:6}}>
                <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTodo()}
                  placeholder="새 업무 추가..."
                  style={{flex:1,padding:'7px 10px',border:'1px solid #E2E8F0',borderRadius:8,fontSize:12,outline:'none',background:'#F8FAFC'}}/>
                <button onClick={addTodo} style={{padding:'7px 11px',background:'#6366F1',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>+</button>
              </div>

              {/* 3컬럼 */}
              <div style={{flex:1,overflowY:'auto',padding:'12px',display:'flex',gap:10}}>
                <TaskCol label="할 일" col="todo" color="#94A3B8" items={tasks.todo}/>
                <TaskCol label="진행 중" col="doing" color="#F97316" items={tasks.doing}/>
                <TaskCol label="완료" col="done" color="#22C55E" items={tasks.done}/>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        input:focus{border-color:#6366F1!important}
      `}</style>
    </div>
  );
}
