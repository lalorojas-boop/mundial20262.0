import { useState, useEffect, useCallback } from "react";

const BASE = "/api/competitions/WC";
const HEADERS = {};

const BROADCASTER_STYLE = {
const HEADERS = {};

const BROADCASTER_STYLE = {
  "Canal 5":       { bg: "#1a56a0", text: "#fff", label: "C5" },
  "Azteca 7":      { bg: "#e8b800", text: "#000", label: "Az7" },
  "Las Estrellas": { bg: "#6d28d9", text: "#fff", label: "★" },
  "Canal 9":       { bg: "#059669", text: "#fff", label: "C9" },
  "TUDN":          { bg: "#7c3aed", text: "#fff", label: "TUDN" },
  "ViX":           { bg: "#0ea5e9", text: "#fff", label: "ViX" },
};

const BROADCASTERS_MX = {
  "Mexico":        ["Canal 5", "Azteca 7", "Las Estrellas", "Canal 9", "ViX"],
  "Argentina":     ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Brazil":        ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "France":        ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Germany":       ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Spain":         ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "England":       ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "United States": ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Portugal":      ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Netherlands":   ["Canal 5", "Azteca 7", "TUDN", "ViX"],
};

function getBroadcasters(home, away) {
  if (BROADCASTERS_MX[home]) return BROADCASTERS_MX[home];
  if (BROADCASTERS_MX[away]) return BROADCASTERS_MX[away];
  return ["ViX"];
}

const TEAM_CODES = {
  "Mexico":"mx","United States":"us","Canada":"ca","Argentina":"ar",
  "Brazil":"br","France":"fr","Germany":"de","England":"gb-eng","Spain":"es",
  "Portugal":"pt","Netherlands":"nl","Belgium":"be","Croatia":"hr","Uruguay":"uy",
  "Colombia":"co","Chile":"cl","Ecuador":"ec","Peru":"pe","Paraguay":"py",
  "Bolivia":"bo","Venezuela":"ve","Morocco":"ma","Senegal":"sn","Nigeria":"ng",
  "Egypt":"eg","Ghana":"gh","Cameroon":"cm","Ivory Coast":"ci","Côte d'Ivoire":"ci",
  "Tunisia":"tn","Algeria":"dz","South Africa":"za","DR Congo":"cd","Cape Verde":"cv",
  "Japan":"jp","South Korea":"kr","Australia":"au","Iran":"ir","Saudi Arabia":"sa",
  "Qatar":"qa","Iraq":"iq","Jordan":"jo","Uzbekistan":"uz","Switzerland":"ch",
  "Austria":"at","Sweden":"se","Norway":"no","Scotland":"gb-sct","Turkey":"tr",
  "Türkiye":"tr","Czechia":"cz","Bosnia and Herzegovina":"ba","Serbia":"rs",
  "Slovakia":"sk","Romania":"ro","Poland":"pl","Ukraine":"ua","New Zealand":"nz",
  "Panama":"pa","Honduras":"hn","Costa Rica":"cr","Jamaica":"jm","Guatemala":"gt",
  "El Salvador":"sv","Cuba":"cu","Trinidad and Tobago":"tt","Haiti":"ht",
  "Suriname":"sr","New Caledonia":"nc","Zimbabwe":"zw","Namibia":"na",
  "Benin":"bj","Tanzania":"tz","Kenya":"ke","Bahrain":"bh","Indonesia":"id",
  "Thailand":"th","China PR":"cn","China":"cn",
};

function getFlag(name) {
  const code = TEAM_CODES[name];
  return code ? `https://flagcdn.com/48x36/${code}.png` : null;
}

function TeamFlag({ name, size = 20 }) {
  const src = getFlag(name);
  if (!src) return <span style={{ width: size*1.33, height: size, display:"inline-block", background:"#1e293b", borderRadius:2, border:"1px solid #334155", flexShrink:0 }} />;
  return <img src={src} alt={name} style={{ width:size*1.33, height:size, objectFit:"cover", borderRadius:2, display:"inline-block", verticalAlign:"middle", flexShrink:0 }} onError={e=>e.target.style.display="none"} />;
}

function fmtTime(utc) {
  if (!utc) return "";
  try { return new Date(utc).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",timeZone:"America/Mexico_City"}); }
  catch { return ""; }
}

function fmtDate(utc) {
  if (!utc) return "";
  try { return new Date(utc).toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short",timeZone:"America/Mexico_City"}); }
  catch { return ""; }
}

function statusLabel(status) {
  if (!status) return null;
  const s = status.toUpperCase();
  if (s === "IN_PLAY")  return { text:"EN VIVO", color:"#ef4444", live:true };
  if (s === "PAUSED")   return { text:"½ TIEMPO", color:"#f59e0b", live:true };
  if (s === "FINISHED") return { text:"FT", color:"#64748b", live:false };
  if (s === "TIMED" || s === "SCHEDULED") return { text:"Programado", color:"#3b82f6", live:false };
  return { text:s, color:"#64748b", live:false };
}

function ScoreCard({ match, expanded, onToggle }) {
  const home  = match.homeTeam?.name || "–";
  const away  = match.awayTeam?.name || "–";
  const hScore = match.score?.fullTime?.home;
  const aScore = match.score?.fullTime?.away;
  const hHalf  = match.score?.halfTime?.home;
  const aHalf  = match.score?.halfTime?.away;
  const st = statusLabel(match.status);
  const isLive     = st?.live;
  const isFinished = st?.text === "FT";
  const showScore  = isLive || isFinished || (hScore != null && aScore != null);
  const group  = match.group ? match.group.replace("GROUP_","") : null;
  const stage  = match.stage || "";
const isKnockout = !stage.includes("GROUP");
  const utc = match.utcDate;
  const minute = match.minute || null;

  return (
    <div onClick={onToggle} style={{
      background: isLive ? "rgba(239,68,68,0.06)" : expanded ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
      border: isLive ? "1px solid rgba(239,68,68,0.25)" : expanded ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer", transition:"all 0.15s",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {group && <span style={{fontSize:9,fontWeight:800,letterSpacing:1,color:"#3b82f6",border:"1px solid rgba(59,130,246,0.4)",borderRadius:4,padding:"1px 5px"}}>GRP {group}</span>}
          {isKnockout && <span style={{fontSize:9,fontWeight:800,color:"#f59e0b",border:"1px solid rgba(245,158,11,0.4)",borderRadius:4,padding:"1px 5px"}}>{stage.replace(/_/g," ")}</span>}
          {match.venue && <span style={{fontSize:10,color:"#475569"}}>{match.venue}</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {isLive && minute && <span style={{fontSize:12,fontWeight:800,color:"#ef4444"}}>{minute}'</span>}
          {st && <span style={{fontSize:9,fontWeight:800,color:st.color,border:`1px solid ${st.color}40`,borderRadius:4,padding:"2px 6px",display:"flex",alignItems:"center",gap:4}}>
            {isLive && <span style={{width:5,height:5,borderRadius:"50%",background:st.color,display:"inline-block",animation:"pulse 1.2s infinite"}} />}
            {st.text}
          </span>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <TeamFlag name={home} size={20} />
          <span style={{fontSize:14,fontWeight:600,color:"#f1f5f9",lineHeight:1.2}}>{home}</span>
        </div>
        <div style={{textAlign:"center",minWidth:64}}>
          {showScore
            ? <span style={{fontSize:22,fontWeight:800,letterSpacing:-1,color:isLive?"#ef4444":"#f1f5f9"}}>
                {hScore ?? "–"}<span style={{color:"#334155",margin:"0 3px"}}>:</span>{aScore ?? "–"}
              </span>
            : <span style={{fontSize:14,fontWeight:700,color:"#64748b"}}>{fmtTime(utc)||"vs"}</span>
          }
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}>
          <span style={{fontSize:14,fontWeight:600,color:"#f1f5f9",lineHeight:1.2,textAlign:"right"}}>{away}</span>
          <TeamFlag name={away} size={20} />
        </div>
      </div>

      {isFinished && hHalf != null && <div style={{textAlign:"center",marginTop:4,fontSize:9,color:"#475569"}}>Medio tiempo: {hHalf} – {aHalf}</div>}
      {!showScore && utc && <div style={{textAlign:"center",marginTop:6,fontSize:10,color:"#475569"}}>{fmtDate(utc)}</div>}

      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>
        <span style={{fontSize:9,color:"#475569",alignSelf:"center"}}>VER EN:</span>
        {getBroadcasters(home,away).map(ch => {
          const s = BROADCASTER_STYLE[ch] || {bg:"#334155",text:"#94a3b8",label:ch};
          return <span key={ch} style={{background:s.bg,color:s.text,fontSize:9,fontWeight:800,padding:"2px 6px",borderRadius:4}}>{s.label}</span>;
        })}
      </div>

      {expanded && match.goals && match.goals.length > 0 && (
        <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#64748b",letterSpacing:1,marginBottom:6}}>GOLES</div>
          {match.goals.map((g,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#94a3b8",marginBottom:3}}>
              <span>⚽ {g.scorer?.name || "–"} <span style={{color:"#64748b",fontSize:10}}>({g.team?.name})</span></span>
              <span style={{color:"#64748b"}}>{g.minute}'{g.type==="PENALTY"?" (P)":g.type==="OWN"?" (PP)":""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupTable({ name, standings }) {
  if (!standings || standings.length === 0) return null;
  return (
    <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden",marginBottom:12}}>
      <div style={{padding:"10px 14px",background:"rgba(59,130,246,0.12)",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#93c5fd"}}>GRUPO {name}</span>
        <span style={{fontSize:9,color:"#475569"}}>Top 2 avanzan</span>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
        <thead>
          <tr style={{color:"#475569",fontSize:9,letterSpacing:0.5}}>
            <th style={{padding:"7px 12px",textAlign:"left",fontWeight:600}}># EQUIPO</th>
            <th style={{padding:"7px 4px",textAlign:"center",width:24}}>PJ</th>
            <th style={{padding:"7px 4px",textAlign:"center",width:24}}>G</th>
            <th style={{padding:"7px 4px",textAlign:"center",width:24}}>E</th>
            <th style={{padding:"7px 4px",textAlign:"center",width:24}}>P</th>
            <th style={{padding:"7px 4px",textAlign:"center",width:30}}>GD</th>
            <th style={{padding:"7px 12px",textAlign:"center",width:28,color:"#93c5fd",fontWeight:800}}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((r,i) => {
            const tn = r.team?.name || "";
            const gd = r.goalDifference ?? 0;
            const q = i < 2;
            return (
              <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.04)",background:q?(i===0?"rgba(59,130,246,0.07)":"rgba(59,130,246,0.03)"):"transparent"}}>
                <td style={{padding:"9px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:9,fontWeight:800,color:q?"#3b82f6":"#334155",width:10}}>{i+1}</span>
                    <TeamFlag name={tn} size={15} />
                    <span style={{color:q?"#e2e8f0":"#94a3b8",fontWeight:q?600:400}}>{tn}</span>
                  </div>
                </td>
                <td style={{textAlign:"center",color:"#64748b"}}>{r.playedGames??0}</td>
                <td style={{textAlign:"center",color:"#64748b"}}>{r.won??0}</td>
                <td style={{textAlign:"center",color:"#64748b"}}>{r.draw??0}</td>
                <td style={{textAlign:"center",color:"#64748b"}}>{r.lost??0}</td>
                <td style={{textAlign:"center",color:gd>0?"#4ade80":gd<0?"#f87171":"#64748b",fontWeight:600}}>{gd>0?"+":""}{gd}</td>
                <td style={{textAlign:"center",fontWeight:800,color:"#f1f5f9",fontSize:13,padding:"9px 12px"}}>{r.points??0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GroupFilter({ groups, selected, onChange }) {
  return (
    <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:12,paddingBottom:4,scrollbarWidth:"none"}}>
      {["ALL",...groups].map(g => (
        <button key={g} onClick={()=>onChange(g)} style={{padding:"4px 10px",borderRadius:14,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,whiteSpace:"nowrap",background:selected===g?"#3b82f6":"rgba(255,255,255,0.05)",color:selected===g?"#fff":"#64748b"}}>
          {g==="ALL"?"Todos":`Grupo ${g}`}
        </button>
      ))}
    </div>
  );
}

export default function Mundial2026() {
  const [tab, setTab]               = useState("today");
  const [matches, setMatches]       = useState([]);
  const [groups, setGroups]         = useState([]);
  const [scorers, setScorers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch]         = useState("");
  const [selGroup, setSelGroup]     = useState("ALL");

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [mRes, sRes, gRes] = await Promise.all([
        fetch(`${BASE}/matches`, { headers: HEADERS }),
        fetch(`${BASE}/scorers?limit=20`, { headers: HEADERS }),
        fetch(`${BASE}/standings`, { headers: HEADERS }),
      ]);
      if (mRes.ok) { const d = await mRes.json(); setMatches(d.matches || []); }
      if (sRes.ok) { const d = await sRes.json(); setScorers(d.scorers || []); }
      if (gRes.ok) { const d = await gRes.json(); setGroups(d.standings || []); }
      setLastUpdate(new Date());
    } catch(e) {
      setError("Sin conexión con la API. Reintentando...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 60000);
    return () => clearInterval(t);
  }, [fetchData]);

  const now      = new Date();
  const todayStr = now.toDateString();
  const live     = matches.filter(m => m.status === "IN_PLAY" || m.status === "PAUSED");
  const today    = matches.filter(m => m.utcDate && new Date(m.utcDate).toDateString() === todayStr);
  const results  = matches.filter(m => m.status === "FINISHED").sort((a,b) => new Date(b.utcDate)-new Date(a.utcDate));
  const upcoming = matches.filter(m => m.status === "TIMED" || m.status === "SCHEDULED").sort((a,b) => new Date(a.utcDate)-new Date(b.utcDate)).slice(0,30);
  const knockouts = matches.filter(m => m.stage && !m.stage.includes("GROUP"));
  const searchRes = search.trim().length >= 2
    ? matches.filter(m => m.homeTeam?.name?.toLowerCase().includes(search.toLowerCase()) || m.awayTeam?.name?.toLowerCase().includes(search.toLowerCase()))
    : [];

  const groupMap = {};
  groups.forEach(g => {
    if (g.type === "TOTAL" && g.group) {
      groupMap[g.group.replace("GROUP_","")] = g.table || [];
    }
  });
  const groupNames = Object.keys(groupMap).sort();

  function toggle(id) { setExpandedId(p => p === id ? null : id); }

  function renderMatches(list, icon, msg, sub) {
    if (!list.length) return (
      <div style={{textAlign:"center",padding:"50px 20px",color:"#475569"}}>
        <div style={{fontSize:38,marginBottom:10}}>{icon}</div>
        <div style={{fontSize:13,fontWeight:600,color:"#64748b"}}>{msg}</div>
        {sub && <div style={{fontSize:11,marginTop:5}}>{sub}</div>}
      </div>
    );
    return list.map(m => <ScoreCard key={m.id} match={m} expanded={expandedId===m.id} onToggle={()=>toggle(m.id)} />);
  }

  function renderContent() {
    if (loading) return (
      <div style={{textAlign:"center",padding:60,color:"#64748b"}}>
        <div style={{fontSize:36,marginBottom:12,animation:"spin 2s linear infinite",display:"inline-block"}}>⚽</div>
        <div style={{fontSize:13}}>Cargando Mundial 2026...</div>
      </div>
    );
    if (error) return (
      <div style={{textAlign:"center",padding:40}}>
        <div style={{color:"#ef4444",fontSize:12,marginBottom:14}}>{error}</div>
        <button onClick={fetchData} style={{background:"#3b82f6",color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:12}}>Reintentar</button>
      </div>
    );
    if (tab==="today")    return renderMatches(today,    "📅","No hay partidos hoy","Revisa la pestaña PRÓXIMOS");
    if (tab==="live")     return renderMatches(live,     "🕐","No hay partidos en curso","Los datos se actualizan cada minuto");
    if (tab==="upcoming") return renderMatches(upcoming, "🗓️","Sin próximos partidos","");
    if (tab==="results")  return (<><GroupFilter groups={groupNames} selected={selGroup} onChange={setSelGroup} />{renderMatches(selGroup==="ALL"?results:results.filter(m=>m.group?.includes(selGroup)),"📋","Sin resultados aún","")}</>);
    if (tab==="groups") {
      if (!groupNames.length) return <div style={{textAlign:"center",padding:40,color:"#475569",fontSize:12}}>Cargando grupos...</div>;
      return groupNames.map(n => <GroupTable key={n} name={n} standings={groupMap[n]} />);
    }
    if (tab==="scorers") {
      if (!scorers.length) return (
        <div style={{textAlign:"center",padding:"50px 20px",color:"#475569"}}>
          <div style={{fontSize:38,marginBottom:10}}>⚽</div>
          <div style={{fontSize:13,color:"#64748b"}}>La tabla de goleo aparecerá cuando comiencen los partidos</div>
        </div>
      );
      return (
        <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",background:"rgba(245,158,11,0.12)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <span style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#fbbf24"}}>🥇 TABLA DE GOLEO</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{color:"#475569",fontSize:9}}>
                <th style={{padding:"7px 12px",textAlign:"left"}}># JUGADOR</th>
                <th style={{padding:"7px 12px",textAlign:"left"}}>SELECCIÓN</th>
                <th style={{padding:"7px 12px",textAlign:"center",color:"#fbbf24"}}>⚽</th>
              </tr>
            </thead>
            <tbody>
              {scorers.map((s,i) => (
                <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:10,fontWeight:700,color:i<3?"#fbbf24":"#475569",width:16}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</span>
                      <span style={{color:"#e2e8f0",fontWeight:i<3?700:400}}>{s.player?.name||"–"}</span>
                    </div>
                  </td>
                  <td style={{padding:"9px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <TeamFlag name={s.team?.name||""} size={14} />
                      <span style={{color:"#64748b",fontSize:11}}>{s.team?.name||"–"}</span>
                    </div>
                  </td>
                  <td style={{padding:"9px 12px",textAlign:"center",fontWeight:800,fontSize:15,color:i<3?"#fbbf24":"#f1f5f9"}}>{s.goals??0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (tab==="bracket") {
      if (!knockouts.length) return (
        <div style={{textAlign:"center",padding:"50px 20px",color:"#475569"}}>
          <div style={{fontSize:38,marginBottom:10}}>🏆</div>
          <div style={{fontSize:13,fontWeight:600,color:"#64748b"}}>Fase eliminatoria desde el 28 de junio</div>
          <div style={{fontSize:11,marginTop:6}}>Ronda de 32 → Octavos → Cuartos → Semis → Final (19 Jul)</div>
        </div>
      );
      const byRound = {};
      knockouts.forEach(m => { const r=m.stage||"Eliminatoria"; if(!byRound[r]) byRound[r]=[]; byRound[r].push(m); });
      return Object.entries(byRound).map(([round,ms],i) => (
        <div key={i}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:"#64748b",textTransform:"uppercase",margin:"16px 0 8px"}}>{round.replace(/_/g," ")}</div>
          {ms.map(m => <ScoreCard key={m.id} match={m} expanded={expandedId===m.id} onToggle={()=>toggle(m.id)} />)}
        </div>
      ));
    }
  }

  const TABS = [
    {id:"today",    label: today.length ? `HOY (${today.length})` : "HOY"},
    {id:"live",     label: live.length  ? `🔴 EN VIVO (${live.length})` : "EN VIVO"},
    {id:"results",  label:"RESULTADOS"},
    {id:"upcoming", label:"PRÓXIMOS"},
    {id:"groups",   label:"GRUPOS"},
    {id:"scorers",  label:"GOLEADORES"},
    {id:"bracket",  label:"ELIMINATORIA"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#060d18 0%,#0b1628 55%,#060d18 100%)",fontFamily:"'Inter',system-ui,sans-serif",color:"#f1f5f9"}}>
      <div style={{background:"rgba(6,13,24,0.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"16px 14px 0",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:24}}>🏆</span>
              <div>
                <div style={{fontSize:17,fontWeight:800,letterSpacing:-0.5}}>Mundial 2026</div>
                <div style={{fontSize:9,color:"#475569",letterSpacing:1.5,textTransform:"uppercase"}}>11 Jun – 19 Jul · USA · MX · CAN</div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              {live.length > 0 && <div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end",marginBottom:2}}><span style={{width:6,height:6,borderRadius:"50%",background:"#ef4444",animation:"pulse 1.2s infinite"}} /><span style={{fontSize:10,fontWeight:700,color:"#ef4444"}}>{live.length} en vivo</span></div>}
              {lastUpdate && <div style={{fontSize:9,color:"#334155"}}>Act. {lastUpdate.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}</div>}
            </div>
          </div>
          <div style={{position:"relative",marginBottom:12}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#475569"}}>🔍</span>
            <input value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value.length>=2)setTab("search");else setTab("today");}}
              placeholder="Buscar equipo… (ej: Mexico, France)"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"8px 10px 8px 32px",fontSize:12,color:"#f1f5f9",outline:"none",boxSizing:"border-box"}} />
            {search && <button onClick={()=>{setSearch("");setTab("today");}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:14}}>✕</button>}
          </div>
          {!search && <div style={{display:"flex",gap:3,overflowX:"auto",paddingBottom:1,scrollbarWidth:"none"}}>
            {TABS.map(t => <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 11px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,whiteSpace:"nowrap",transition:"all 0.15s",background:tab===t.id?"rgba(255,255,255,0.07)":"transparent",color:tab===t.id?"#f1f5f9":"#475569",borderBottom:tab===t.id?"2px solid #3b82f6":"2px solid transparent"}}>{t.label}</button>)}
          </div>}
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"16px 12px 60px"}}>
        {tab==="search" && search.length>=2
          ? <><div style={{fontSize:11,color:"#64748b",marginBottom:12,fontWeight:600}}>{searchRes.length} partido{searchRes.length!==1?"s":""} con "{search}"</div>{renderMatches(searchRes,"🔍",`Sin resultados para "${search}"`,"Intenta en inglés: Mexico, France, Brazil")}</>
          : renderContent()
        }
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"0 12px 30px"}}>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:14}}>
          <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:1,marginBottom:8}}>CANALES EN MÉXICO</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {Object.entries(BROADCASTER_STYLE).map(([name,s]) => (
              <div key={name} style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{background:s.bg,color:s.text,fontSize:8,fontWeight:800,padding:"2px 5px",borderRadius:3}}>{s.label}</span>
                <span style={{fontSize:9,color:"#334155"}}>{name}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:8,fontSize:9,color:"#1e293b"}}>ViX Premium: Pase Mundial $799 MXN · 104 partidos completos</div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}input::placeholder{color:#334155}::-webkit-scrollbar{height:2px;width:2px}::-webkit-scrollbar-thumb{background:#1e293b}`}</style>
    </div>
  );
}
