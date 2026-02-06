import React, { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   🪙 숨은 보조금 찾아드림
   Vercel serverless proxy → 공공데이터포털 API
   ───────────────────────────────────────────── */

// ── API helpers (프록시 경유) ───────────────
async function apiServices({ page = 1, perPage = 20, search = "", category = "" } = {}) {
  const p = new URLSearchParams({ page, perPage });
  if (search) p.set("search", search);
  if (category) p.set("category", category);
  const r = await fetch(`/api/services?${p}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiConditions(serviceId) {
  const r = await fetch(`/api/conditions?serviceId=${encodeURIComponent(serviceId)}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ── constants ──────────────────────────────
const CATS = {
  "생활안정":   { e: "🛒", bg: "#E8F5E9" },
  "주거":       { e: "🏠", bg: "#E3F2FD" },
  "보육":       { e: "📚", bg: "#FFF3E0" },
  "교육":       { e: "🎓", bg: "#FFF3E0" },
  "고용":       { e: "💼", bg: "#F3E5F5" },
  "창업":       { e: "🚀", bg: "#F3E5F5" },
  "보건":       { e: "💊", bg: "#FFEBEE" },
  "의료":       { e: "🏥", bg: "#FFEBEE" },
  "임신":       { e: "🤰", bg: "#FCE4EC" },
  "출산":       { e: "🍼", bg: "#FCE4EC" },
  "보호":       { e: "🤲", bg: "#E0F7FA" },
  "돌봄":       { e: "🫶", bg: "#E0F7FA" },
  "문화":       { e: "🎨", bg: "#F9FBE7" },
  "환경":       { e: "🌿", bg: "#F1F8E9" },
  "농림":       { e: "🌾", bg: "#F1F8E9" },
  "행정":       { e: "🏛️", bg: "#ECEFF1" },
  "안전":       { e: "🛡️", bg: "#ECEFF1" },
};

const catInfo = (f) => {
  if (!f) return { e: "📋", bg: "#F5F5F5" };
  for (const [k, v] of Object.entries(CATS)) if (f.includes(k)) return v;
  return { e: "📋", bg: "#F5F5F5" };
};

const USERS = [
  { k: "all", l: "전체",   e: "🔍" },
  { k: "청년",  l: "청년",   e: "🧑" },
  { k: "어르신", l: "어르신", e: "👴" },
  { k: "임산부", l: "임산부", e: "🤰" },
  { k: "장애인", l: "장애인", e: "♿" },
  { k: "저소득", l: "저소득", e: "🏡" },
  { k: "학생",  l: "학생",   e: "🎓" },
  { k: "구직",  l: "구직자", e: "💼" },
];

const CAT_TABS = ["전체","생활안정","주거","보육·교육","고용·창업","보건·의료","임신·출산","보호·돌봄","문화·환경"];

const COND = {
  JA0101:"남성",JA0102:"여성",JA0201:"소득0~50%",JA0202:"소득51~75%",JA0203:"소득76~100%",JA0204:"소득101~200%",JA0205:"소득200%↑",
  JA0301:"예비부모",JA0302:"임산부",JA0303:"출산/입양",JA0313:"농업인",JA0314:"어업인",
  JA0317:"초등학생",JA0318:"중학생",JA0319:"고등학생",JA0320:"대학생",
  JA0326:"근로자",JA0327:"구직자",JA0328:"장애인",JA0329:"국가보훈",JA0330:"질병/질환자",
  JA0401:"다문화",JA0402:"북한이탈",JA0403:"한부모/조손",JA0404:"1인가구",JA0411:"다자녀",JA0412:"무주택",
};

// ── AdBanner (카드 사이 광고) ──────────────
function AdBanner({ slot = "XXXXXXXXXX" }) {
  const ref = useRef(null);
  const pushed = useRef(false);
  useEffect(() => {
    if (ref.current && !pushed.current) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); pushed.current = true; } catch {}
    }
  }, []);
  return (
    <div style={{ margin: "6px 0", minHeight: 100, background: "#f9f5ed", borderRadius: 12, overflow: "hidden", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(27,67,50,.08)" }}>
      <ins className="adsbygoogle" ref={ref} style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-6735356659801736"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true" />
    </div>
  );
}

// ── Privacy Policy Modal ──────────────────
function PrivacyModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", maxHeight: "80vh", overflow: "auto", padding: 24 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Black Han Sans'", fontSize: 20, color: "#1B4332", marginBottom: 12 }}>개인정보처리방침</h2>
        <div style={{ fontSize: 13, color: "#444", lineHeight: 1.8 }}>
          <p><b>1. 수집하는 개인정보</b><br />본 서비스는 별도의 회원가입 없이 이용 가능하며, 개인정보를 직접 수집하지 않습니다.</p>
          <p style={{ marginTop: 10 }}><b>2. 쿠키 및 광고</b><br />본 서비스는 Google AdSense를 통해 광고를 게재하며, 이 과정에서 쿠키가 사용될 수 있습니다. 사용자는 브라우저 설정을 통해 쿠키 사용을 거부할 수 있습니다.</p>
          <p style={{ marginTop: 10 }}><b>3. 데이터 출처</b><br />본 서비스에서 제공하는 보조금 정보는 행정안전부 보조금24 공공데이터포털 API를 통해 제공받고 있습니다.</p>
          <p style={{ marginTop: 10 }}><b>4. 제3자 서비스</b><br />- Google AdSense (광고)<br />- Vercel (호스팅)<br />- 공공데이터포털 (데이터 API)</p>
          <p style={{ marginTop: 10 }}><b>5. 문의</b><br />서비스 관련 문의는 이메일로 연락 바랍니다.</p>
          <p style={{ marginTop: 10, color: "#999", fontSize: 11 }}>시행일: 2025년 2월 7일</p>
        </div>
        <button onClick={onClose} style={{ marginTop: 16, width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#1B4332", color: "#E8A838", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR'" }}>닫기</button>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoad]  = useState(false);
  const [moreLoad, setMore] = useState(false);
  const [status, setStatus] = useState("…");
  const [err, setErr]       = useState(null);

  const [input, setInput]     = useState("");
  const [query, setQuery]     = useState("");
  const [userF, setUserF]     = useState("all");
  const [catF, setCatF]       = useState("전체");
  const [favs, setFavs]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("favs") || "[]"); } catch { return []; }
  });
  const [favOnly, setFavOnly] = useState(false);
  const [openId, setOpenId]   = useState(null);
  const [conds, setConds]     = useState(null);
  const [condLoad, setCondL]  = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const timer = useRef(null);

  // splash
  useEffect(() => { const t = setTimeout(() => setScreen("main"), 1800); return () => clearTimeout(t); }, []);

  // initial load
  useEffect(() => { if (screen === "main") load(1, true); }, [screen]);

  // debounce search
  const onInput = v => { setInput(v); clearTimeout(timer.current); timer.current = setTimeout(() => setQuery(v), 400); };

  // reload on filter change
  useEffect(() => { if (screen === "main") load(1, true); }, [query, catF]);

  // persist favs
  useEffect(() => { localStorage.setItem("favs", JSON.stringify(favs)); }, [favs]);

  // ── load data ───
  const load = async (p = 1, reset = false) => {
    reset ? setLoad(true) : setMore(true);
    try {
      const cat = catF === "전체" ? "" : catF.split("·")[0];
      const json = await apiServices({ page: p, perPage: 20, search: query, category: cat });
      const rows = (json.data || []).map(d => ({
        id: d["서비스ID"]||"", name: d["서비스명"]||"", summary: d["서비스목적요약"]||"",
        target: d["지원대상"]||"", content: d["지원내용"]||"", how: d["신청방법"]||"",
        deadline: d["신청기한"]||"", criteria: d["선정기준"]||"", org: d["소관기관명"]||"",
        orgType: d["소관기관유형"]||"", dept: d["부서명"]||"", category: d["서비스분야"]||"",
        userType: d["사용자구분"]||"", link: d["상세조회URL"]||"", views: d["조회수"]||0,
        phone: d["전화문의"]||"", support: d["지원유형"]||"", reception: d["접수기관"]||"",
      }));
      reset ? setItems(rows) : setItems(prev => [...prev, ...rows]);
      setTotal(json.matchCount || json.totalCount || 0);
      setPage(p); setStatus("live"); setErr(null);
    } catch (e) { setStatus("err"); setErr(e.message); if (reset) setItems([]); }
    setLoad(false); setMore(false);
  };

  // ── detail / conditions ───
  const toggleDetail = async (id) => {
    if (openId === id) { setOpenId(null); setConds(null); return; }
    setOpenId(id); setCondL(true); setConds(null);
    try { const j = await apiConditions(id); setConds(j.data?.[0] || null); } catch { setConds(null); }
    setCondL(false);
  };

  // ── client filters ───
  const display = items.filter(i => {
    if (favOnly && !favs.includes(i.id)) return false;
    if (userF !== "all") {
      const hay = `${i.target}${i.userType}${i.name}${i.summary}`;
      if (!hay.includes(userF)) return false;
    }
    return true;
  });

  const toggleFav = id => setFavs(p => p.includes(id) ? p.filter(f=>f!==id) : [...p, id]);

  // ════════════════════════════════
  //  SPLASH
  // ════════════════════════════════
  if (screen === "splash") return (
    <div style={Z.splash}><style>{CSS}</style>
      <div style={Z.si}>
        <div style={Z.sIcon}>🪙</div>
        <h1 style={Z.sTitle}>숨은 보조금<br/>찾아드림</h1>
        <p style={Z.sSub}>10,000개 이상의 정부 혜택을 한눈에</p>
        <div style={Z.barT}><div style={Z.barF}/></div>
      </div>
    </div>
  );

  // ════════════════════════════════
  //  MAIN
  // ════════════════════════════════
  return (
    <div style={Z.app}><style>{CSS}</style>

      {/* ── header ── */}
      <header style={Z.hdr}>
        <div style={Z.hRow}>
          <div>
            <h1 style={Z.logo}>🪙 숨은 보조금 찾아드림</h1>
            <p style={Z.hMeta}>
              {status==="live" && <span style={{color:"#4ADE80",fontWeight:700,fontSize:11}}>● 실시간</span>}
              {status==="…"    && <span style={{color:"#F5D78E",fontWeight:700,fontSize:11}}>● 연결 중</span>}
              {status==="err"  && <span style={{color:"#FB7185",fontWeight:700,fontSize:11}}>● 오류</span>}
              {" "}총 <b>{total.toLocaleString()}</b>건의 보조금
            </p>
          </div>
        </div>

        {/* search */}
        <div style={Z.sW}>
          <span style={Z.sI}>🔍</span>
          <input value={input} onChange={e=>onInput(e.target.value)} placeholder="보조금 검색... (예: 청년, 주거, 교육)" style={Z.sIn}/>
          {input && <button onClick={()=>{setInput("");setQuery("");}} style={Z.clr}>✕</button>}
        </div>

        {/* user chips */}
        <div style={Z.cRow}>
          {USERS.map(u=>(
            <button key={u.k} onClick={()=>setUserF(u.k)} style={{...Z.ch,...(userF===u.k?Z.chA:{})}}>{u.e} {u.l}</button>
          ))}
        </div>

        {/* category + fav */}
        <div style={Z.subR}>
          <div style={Z.catS}>
            {CAT_TABS.map(c=>(
              <button key={c} onClick={()=>setCatF(c)} style={{...Z.ct,...(catF===c?Z.ctA:{})}}>{c==="전체"?"📋":catInfo(c.split("·")[0]).e} {c}</button>
            ))}
          </div>
          <button onClick={()=>setFavOnly(!favOnly)} style={{...Z.fBtn,...(favOnly?Z.fBtnA:{})}}>{favOnly?"💛":"🤍"}{favs.length>0?` ${favs.length}`:""}</button>
        </div>
      </header>

      {/* ── result count ── */}
      <div style={Z.rBar}>
        {loading ? <span style={{animation:"pulse 1.2s infinite"}}>🔍 보물 탐색 중...</span>
        : <>🎯 <b>{display.length}</b>건 발견{query&&<span style={Z.qTag}>"{query}"</span>}</>}
      </div>

      {/* ── cards ── */}
      <div style={Z.list}>
        {loading ? [0,1,2].map(i=><div key={i} style={{...Z.skel,animationDelay:`${i*.12}s`}}/>) :
         display.length===0 ? (
          <div style={Z.empty}>
            <div style={{fontSize:48,marginBottom:12}}>🏝️</div>
            <p style={Z.eT}>{err?"API 연결을 확인해주세요":"검색 결과가 없어요"}</p>
            <p style={Z.eD}>다른 조건으로 찾아볼까요?</p>
            <button onClick={()=>{setInput("");setQuery("");setUserF("all");setCatF("전체");setFavOnly(false);}} style={Z.rstBtn}>🔄 초기화</button>
          </div>
        ) : <>
          {display.map((it,idx) => {
            const ci = catInfo(it.category);
            const open = openId===it.id;
            const fav = favs.includes(it.id);
            return (
              <React.Fragment key={it.id}>
              {idx > 0 && idx % 5 === 0 && <AdBanner slot={`ad-slot-${idx}`} />}
              <div style={{...Z.card,animation:`cardPop .35s ease ${idx*.04}s both`}}>
                {/* top */}
                <div style={Z.cTop}>
                  <span style={{...Z.badge,background:ci.bg}}>{ci.e} {it.category||"기타"}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {it.views>0&&<span style={Z.views}>👀 {it.views.toLocaleString()}</span>}
                    <button onClick={()=>toggleFav(it.id)} style={{...Z.hrt,animation:fav?"heartPop .3s":"none"}}>{fav?"💛":"🤍"}</button>
                  </div>
                </div>

                <h3 style={Z.cTitle}>{it.name}</h3>
                <p style={Z.cOrg}>{it.org}{it.dept?` · ${it.dept}`:""}</p>
                <p style={Z.cSum}>{it.summary||it.content||"상세 내용은 상세보기를 눌러주세요."}</p>

                {/* tags */}
                <div style={Z.tags}>
                  {it.support&&<span style={Z.tG}>{it.support}</span>}
                  {it.userType&&<span style={Z.tO}>{it.userType}</span>}
                  {it.orgType&&<span style={Z.tB}>{it.orgType}</span>}
                </div>

                <button onClick={()=>toggleDetail(it.id)} style={Z.dtBtn}>{open?"접기 ▲":"상세보기 ▼"}</button>

                {/* detail panel */}
                {open && (
                  <div style={Z.dtBox}>
                    {condLoad ? <p style={{animation:"pulse 1s infinite",color:"#888",fontSize:13}}>지원조건 불러오는 중...</p> : <>
                      {it.target&&<Sec icon="👤" label="지원대상" text={it.target}/>}
                      {it.content&&<Sec icon="📦" label="지원내용" text={it.content}/>}
                      {it.criteria&&it.criteria!=="null"&&<Sec icon="✅" label="선정기준" text={it.criteria}/>}
                      {it.how&&<Sec icon="📝" label="신청방법" text={it.how}/>}
                      {it.deadline&&it.deadline!=="null"&&<Sec icon="📅" label="신청기한" text={it.deadline}/>}
                      {it.phone&&it.phone!=="null"&&<Sec icon="📞" label="문의" text={it.phone}/>}
                      {it.reception&&<Sec icon="🏢" label="접수기관" text={it.reception}/>}
                      {conds && (
                        <div style={Z.dSec}>
                          <h4 style={Z.dL}>🎯 세부 지원조건</h4>
                          <div style={Z.condR}>
                            {conds.JA0110!=null&&conds.JA0111!=null&&<span style={Z.condT}>🎂 {conds.JA0110}~{conds.JA0111}세</span>}
                            {Object.entries(COND).map(([c,l])=>{
                              if(c==="JA0110"||c==="JA0111") return null;
                              return conds[c]==="Y"?<span key={c} style={Z.condT}>{l}</span>:null;
                            })}
                          </div>
                        </div>
                      )}
                    </>}
                  </div>
                )}

                {/* bottom */}
                <div style={Z.cBot}>
                  {it.link&&<a href={it.link} target="_blank" rel="noopener noreferrer" style={Z.aBtn}>정부24에서 보기 →</a>}
                </div>
              </div>
              </React.Fragment>
            );
          })}

          {items.length<total&&(
            <button onClick={()=>!moreLoad&&load(page+1,false)} disabled={moreLoad} style={Z.moreBtn}>
              {moreLoad?"불러오는 중...":`더 보기 (${items.length} / ${total.toLocaleString()})`}
            </button>
          )}
        </>}
      </div>

      <PrivacyModal open={privacy} onClose={()=>setPrivacy(false)} />
      <div style={Z.foot}><div style={Z.footIn}>💡 데이터 출처: 행정안전부 보조금24 · 공공데이터포털<br/><span onClick={()=>setPrivacy(true)} style={{cursor:"pointer",textDecoration:"underline",opacity:.7}}>개인정보처리방침</span></div></div>
    </div>
  );
}

// ── detail section helper ──
function Sec({icon,label,text}){
  return(
    <div style={Z.dSec}>
      <h4 style={Z.dL}>{icon} {label}</h4>
      <p style={Z.dT}>{text}</p>
    </div>
  );
}

// ═══════ colors ═══════
const C={f:"#1B4332",fl:"#2D6A4F",g:"#E8A838",gl:"#F5D78E",cr:"#FDF6EC",cd:"#F5EADB",w:"#FFFFFF",ca:"#FFFDF8",tx:"#1A1A1A",su:"#777"};

// ═══════ CSS ═══════
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Noto Sans KR',sans-serif;background:${C.cr};-webkit-tap-highlight-color:transparent}
input:focus{outline:none}
::-webkit-scrollbar{height:3px;width:3px}
::-webkit-scrollbar-thumb{background:#C4A265;border-radius:3px}
::-webkit-scrollbar-track{background:transparent}
@keyframes bounce{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-10px) rotate(-4deg)}75%{transform:translateY(-6px) rotate(3deg)}}
@keyframes fill{0%{width:0}100%{width:100%}}
@keyframes fadeUp{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
@keyframes cardPop{0%{opacity:0;transform:scale(.96) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes heartPop{0%{transform:scale(1)}50%{transform:scale(1.35)}100%{transform:scale(1)}}
`;

// ═══════ styles ═══════
const Z={
  splash:{height:"100vh",background:`linear-gradient(155deg,${C.f},#0B2218)`,display:"flex",alignItems:"center",justifyContent:"center"},
  si:{textAlign:"center",animation:"fadeUp .6s ease-out"},
  sIcon:{fontSize:60,display:"block",marginBottom:14,animation:"bounce 1.3s ease-in-out infinite"},
  sTitle:{fontFamily:"'Black Han Sans'",fontSize:32,color:C.gl,lineHeight:1.2,letterSpacing:-1,marginBottom:8},
  sSub:{color:"rgba(255,255,255,.5)",fontSize:12,marginBottom:24},
  barT:{width:130,height:3,background:"rgba(255,255,255,.1)",borderRadius:3,margin:"0 auto",overflow:"hidden"},
  barF:{height:"100%",background:`linear-gradient(90deg,${C.g},${C.gl})`,borderRadius:3,animation:"fill 1.6s ease-out forwards"},

  app:{maxWidth:480,margin:"0 auto",background:C.cr,minHeight:"100vh",paddingBottom:60,position:"relative"},

  hdr:{background:`linear-gradient(155deg,${C.f},${C.fl})`,padding:"16px 12px 10px",position:"sticky",top:0,zIndex:100,boxShadow:"0 3px 16px rgba(0,0,0,.14)"},
  hRow:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10},
  logo:{fontFamily:"'Black Han Sans'",fontSize:19,color:C.gl,letterSpacing:-.5},
  hMeta:{color:"rgba(255,255,255,.6)",fontSize:11,marginTop:2},

  sW:{position:"relative",marginBottom:8},
  sI:{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,opacity:.55},
  sIn:{width:"100%",padding:"10px 34px 10px 34px",borderRadius:11,border:"none",background:"rgba(255,255,255,.13)",color:C.w,fontSize:14,fontFamily:"'Noto Sans KR'",caretColor:C.gl},
  clr:{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:18,height:18,fontSize:10,color:C.w,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},

  cRow:{display:"flex",gap:5,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"},
  ch:{flexShrink:0,padding:"5px 11px",borderRadius:16,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.7)",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Noto Sans KR'",transition:"all .15s"},
  chA:{background:C.g,color:C.f,borderColor:C.g,fontWeight:700},

  subR:{display:"flex",gap:6,alignItems:"center"},
  catS:{display:"flex",gap:5,overflowX:"auto",flex:1,paddingBottom:2,scrollbarWidth:"none"},
  ct:{flexShrink:0,padding:"4px 9px",borderRadius:7,border:"none",background:"rgba(255,255,255,.07)",color:"rgba(255,255,255,.6)",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Noto Sans KR'"},
  ctA:{background:"rgba(255,255,255,.2)",color:C.w,fontWeight:600},
  fBtn:{flexShrink:0,padding:"4px 9px",borderRadius:7,border:"1px solid rgba(255,255,255,.15)",background:"transparent",color:"rgba(255,255,255,.65)",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"'Noto Sans KR'"},
  fBtnA:{background:"rgba(232,168,56,.22)",borderColor:C.g,color:C.gl},

  rBar:{padding:"11px 16px",fontSize:13,color:C.su},
  qTag:{background:C.gl,color:C.f,padding:"1px 6px",borderRadius:4,fontSize:11,fontWeight:600,marginLeft:4},

  list:{padding:"0 12px 14px",display:"flex",flexDirection:"column",gap:10},

  card:{background:C.ca,borderRadius:13,padding:14,boxShadow:"0 1px 6px rgba(27,67,50,.05)",border:"1px solid rgba(27,67,50,.04)"},
  cTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7},
  badge:{padding:"2px 9px",borderRadius:12,fontSize:11,fontWeight:500,color:"#333"},
  views:{fontSize:10,color:"#aaa"},
  hrt:{background:"none",border:"none",fontSize:17,cursor:"pointer",padding:2,lineHeight:1},
  cTitle:{fontFamily:"'Black Han Sans'",fontSize:16,color:C.f,marginBottom:2,lineHeight:1.35,letterSpacing:-.3},
  cOrg:{fontSize:11,color:C.su,marginBottom:7},
  cSum:{fontSize:13,color:"#444",lineHeight:1.65,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"},
  tags:{display:"flex",gap:4,flexWrap:"wrap",marginTop:8},
  tG:{fontSize:10,background:"#E8F5E9",color:"#2E7D32",padding:"2px 6px",borderRadius:4},
  tO:{fontSize:10,background:"#FFF3E0",color:"#E65100",padding:"2px 6px",borderRadius:4},
  tB:{fontSize:10,background:"#E3F2FD",color:"#1565C0",padding:"2px 6px",borderRadius:4},

  dtBtn:{background:"none",border:"none",color:C.fl,fontSize:12,cursor:"pointer",padding:"7px 0 0",fontWeight:500,fontFamily:"'Noto Sans KR'"},

  dtBox:{marginTop:8,padding:12,background:C.cr,borderRadius:9,animation:"fadeUp .25s ease-out",border:"1px solid rgba(27,67,50,.05)"},
  dSec:{marginBottom:10},
  dL:{fontSize:12,fontWeight:700,color:C.f,marginBottom:3},
  dT:{fontSize:13,color:"#444",lineHeight:1.7,wordBreak:"keep-all"},
  condR:{display:"flex",gap:4,flexWrap:"wrap",marginTop:3},
  condT:{fontSize:11,background:C.w,border:"1px solid rgba(27,67,50,.08)",padding:"2px 7px",borderRadius:5,color:C.f},

  cBot:{display:"flex",justifyContent:"flex-end",marginTop:10,paddingTop:8,borderTop:"1px solid rgba(0,0,0,.03)"},
  aBtn:{background:`linear-gradient(135deg,${C.f},${C.fl})`,color:C.gl,padding:"7px 14px",borderRadius:9,fontSize:12,fontWeight:600,textDecoration:"none",fontFamily:"'Noto Sans KR'",boxShadow:"0 2px 6px rgba(27,67,50,.16)",whiteSpace:"nowrap"},

  moreBtn:{width:"100%",padding:12,borderRadius:10,border:`2px dashed rgba(27,67,50,.12)`,background:"transparent",color:C.fl,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Noto Sans KR'",marginTop:4},

  skel:{height:140,borderRadius:13,background:`linear-gradient(90deg,${C.cd} 25%,${C.cr} 50%,${C.cd} 75%)`,backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"},

  empty:{textAlign:"center",padding:"44px 18px",animation:"fadeUp .4s ease-out"},
  eT:{fontFamily:"'Black Han Sans'",fontSize:17,color:C.f,marginBottom:5},
  eD:{color:C.su,fontSize:13,marginBottom:16},
  rstBtn:{background:C.g,color:C.f,border:"none",padding:"9px 20px",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Noto Sans KR'"},

  foot:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",maxWidth:480,width:"100%",zIndex:100,background:`linear-gradient(0deg,${C.cr} 70%,transparent)`,paddingTop:14},
  footIn:{background:C.f,margin:"0 8px 8px",borderRadius:10,padding:"9px 12px",textAlign:"center",color:"rgba(255,255,255,.55)",fontSize:10},
};
