import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = "https://worldcup26.ir/get";

const BROADCASTERS = {
  "México vs Sudáfrica":          ["Canal 5", "Azteca 7", "Las Estrellas", "Canal 9", "ViX"],
  "Polonia vs Argentina":         ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "México vs Polonia":            ["Canal 5", "Azteca 7", "Canal 9", "ViX"],
  "Argentina vs Sudáfrica":       ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "México vs Argentina":          ["Canal 5", "Azteca 7", "Canal 9", "TUDN", "ViX"],
  "Sudáfrica vs Polonia":         ["ViX"],
  "Estados Unidos vs Paraguay":   ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Australia vs Turquía":         ["ViX"],
  "Estados Unidos vs Australia":  ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Brasil vs Marruecos":          ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Francia vs Senegal":           ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Alemania vs Portugal":         ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "España vs Uruguay":            ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Inglaterra vs Croacia":        ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Países Bajos vs Japón":        ["Canal 5", "Azteca 7", "TUDN", "ViX"],
  "Argentina vs Francia":         ["Canal 5", "Azteca 7", "TUDN", "ViX"],
};

const BROADCASTER_STYLE = {
  "Canal 5":       { bg: "#1a56a0", text: "#fff", label: "C5" },
  "Azteca 7":      { bg: "#e8b800", text: "#000", label: "Az7" },
  "Azteca Uno":    { bg: "#c0392b", text: "#fff", label: "Az1" },
  "Las Estrellas": { bg: "#6d28d9", text: "#fff", label: "★" },
  "Canal 9":       { bg: "#059669", text: "#fff", label: "C9" },
  "TUDN":          { bg: "#7c3aed", text: "#fff", label: "TUDN" },
  "ViX":           { bg: "#0ea5e9", text: "#fff", label: "ViX" },
};

function getBroadcasters(home, away) {
  const key1 = `${home} vs ${away}`;
  const key2 = `${away} vs ${home}`;
  if (BROADCASTERS[key1]) return BROADCASTERS[key1];
  if (BROADCASTERS[key2]) return BROADCASTERS[key2];
  return ["ViX"];
}

const TEAM_CODES = {
  "United States":"us","Mexico":"mx","México":"mx","Canada":"ca",
  "Argentina":"ar","Brazil":"br","Brasil":"br","France":"fr","Francia":"fr",
  "Germany":"de","Alemania":"de","England":"gb-eng","España":"es","Spain":"es",
  "Portugal":"pt","Netherlands":"nl","Países Bajos":"nl","Belgium":"be","Bélgica":"be",
  "Croatia":"hr","Croacia":"hr","Uruguay":"uy","Colombia":"co","Chile":"cl",
  "Ecuador":"ec","Peru":"pe","Perú":"pe","Paraguay":"py","Bolivia":"bo",
  "Venezuela":"ve","Morocco":"ma","Marruecos":"ma","Senegal":"sn",
  "Nigeria":"ng","Egypt":"eg","Egipto":"eg","Ghana":"gh","Cameroon":"cm",
  "Ivory Coast":"ci","Côte d'Ivoire":"ci","Costa de Marfil":"ci",
  "Tunisia":"tn","Túnez":"tn","Algeria":"dz","Argelia":"dz",
  "South Africa":"za","Sudáfrica":"za","DR Congo":"cd","Congo DR":"cd",
  "Cape Verde":"cv","Cabo Verde":"cv",
  "Japan":"jp","Japón":"jp","South Korea":"kr","Corea del Sur":"kr",
  "Australia":"au","Iran":"ir","Irán":"ir","Saudi Arabia":"sa","Arabia Saudita":"sa",
  "Qatar":"qa","Iraq":"iq","Irak":"iq","Jordan":"jo","Jordania":"jo",
  "Uzbekistan":"uz","Uzbekistán":"uz",
  "Switzerland":"ch","Suiza":"ch","Austria":"at","Sweden":"se","Suecia":"se",
  "Norway":"no","Noruega":"no","Scotland":"gb-sct","Escocia":"gb-sct",
  "Turkey":"tr","Turquía":"tr","Türkiye":"tr","Czechia":"cz","Chequia":"cz",
  "Bosnia and Herzegovina":"ba","Bosnia y Herzegovina":"ba",
  "Serbia":"rs","Slovakia":"sk","Eslovaquia":"sk","Romania":"ro","Rumania":"ro",
  "Poland":"pl","Polonia":"pl","Ukraine":"ua","Ucrania":"ua",
  "New Zealand":"nz","Nueva Zelanda":"nz","Panama":"pa","Panamá":"pa",
  "Honduras":"hn","Costa Rica":"cr","Jamaica":"jm","Guatemala":"gt",
  "El Salvador":"sv","Cuba":"cu","Trinidad and Tobago":"tt",
  "Haiti":"ht","Haití":"ht","Suriname":"sr","Surinam":"sr",
  "New Caledonia":"nc","Zimbabwe":"zw","Namibia":"na","Benin":"bj","Tanzania":"tz",
};

function getFlag(name) {
  if (!name) return null;
  const code = TEAM_CODES[name];
  if (!code) return null;
  return `https://flagcdn.com/48x36/${code}.png`;
}

function TeamFlag({ name, size = 22 }) {
  const src = getFlag(name);
  if (!src) return (
    <span style={{ width: size * 1.33, height: size, display: "inline-block",
      background: "#1e293b", borderRadius: 2, border: "1px solid #334155" }} />
  );
  return (
    <img src={src} alt={name} style={{ width: size * 1.33, height: size,
      objectFit: "cover", borderRadius: 2, display: "inline-block",
      verticalAlign: "middle", flexShrink: 0 }}
      onError={e => { e.target.style.display = "none"; }} />
  );
}

function fmtTime(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("es-MX", {
      hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City"
    });
  } catch { return ""; }
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      weekday: "short", day: "numeric", month: "short",
      timeZone: "America/Mexico_City"
    });
  } catch { return ""; }
}

function statusLabel(status) {
  if (!status) return null;
  const s = status.toLowerCase();
  if (["live","in_play","inprogress","1h","2h","et"].some(x => s.includes(x)))
    return { text: "EN VIVO", color: "#ef4444", live: true };
  if (s === "ht" || s === "halftime")
    return { text: "½ TIEMPO", color: "#f59e0b", live: true };
  if (["finished","ft","completed","fulltime"].some(x => s.includes(x)))
    return { text: "FT", color: "#64748b", live: false };
  return { text: "Programado", color: "#3b82f6", live: false };
}

function parseMatch(m) {
  return {
    id: m.id || m._id || m.match_number || Math.random(),
    matchNum: m.match_number ?? null,
    home: m.home_team?.name || m.home_team || m.homeTeam || m.team_home || "",
    away: m.away_team?.name || m.away_team || m.awayTeam || m.team_away || "",
    homeScore: m.home_score ?? m.score_home ?? m.homeScore ?? m.goals_home ?? null,
    awayScore: m.away_score ?? m.score_away ?? m.awayScore ?? m.goals_away ?? null,
    status: m.status || m.match_status || "scheduled",
    minute: m.minute || m.match_time || null,
    group: m.group || m.group_name || null,
    stadium: m.stadium?.name || (typeof m.stadium === "string" ? m.stadium : "") || m.venue || "",
    city: m.stadium?.city || m.city || "",
    date: m.date || m.kickoff || m.kickoff_utc || m.datetime || m.match_date || null,
    round: m.round || m.stage || "",
    scorers: m.scorers || m.goals || [],
  };
}

function BroadcasterBadges({ home, away }) {
  const channels = getBroadcasters(home, away);
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
      <span style={{ fontSize: 9, color: "#475569", alignSelf: "center", letterSpacing: 0.5 }}>VER EN:</span>
      {channels.map(ch => {
        const s = BROADCASTER_STYLE[ch] || { bg: "#334155", text: "#94a3b8", label: ch };
        return (
          <span key={ch} style={{
            background: s.bg, color: s.text,
            fontSize: 9, fontWeight: 800, padding: "2px 6px",
            borderRadius: 4, letterSpacing: 0.5,
          }}>{s.label}</span>
        );
      })}
    </div>
  );
}

function ScoreCard({ match, expanded, onToggle }) {
  const { home, away, homeScore, awayScore, status, minute, group, stadium, city, date, scorers, round } = match;
  const st = statusLabel(status);
  const isLive = st?.live;
  const isFinished = st && st.text === "FT";
  const showScore = isLive || isFinished || (homeScore != null && awayScore != null);
  const isKnockout = round && !round.toLowerCase().includes("group");

  return (
    <div onClick={onToggle} style={{
      background: isLive ? "rgba(239,68,68,0.06)" : expanded ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
      border: isLive ? "1px solid rgba(239,68,68,0.25)" : expanded ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {group && (
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: "#3b82f6",
              border: "1px solid rgba(59,130,246,0.4)", borderRadius: 4, padding: "1px 5px" }}>
              GRP {group}
            </span>
          )}
          {isKnockout && (
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: "#f59e0b",
              border: "1px solid rgba(245,158,11,0.4)", borderRadius: 4, padding: "1px 5px" }}>
              {round.toUpperCase()}
            </span>
          )}
          <span style={{ fontSize: 10, color: "#475569" }}>{stadium}{city ? `, ${city}` : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isLive && minute && <span style={{ fontSize: 12, fontWeight: 800, color: "#ef4444" }}>{minute}'</span>}
          {st && (
            <span style={{ fontSize: 9, fontWeight: 800, color: st.color,
              border: `1px solid ${st.color}40`, borderRadius: 4, padding: "2px 6px",
              display: "flex", alignItems: "center", gap: 4 }}>
              {isLive && <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color,
                display: "inline-block", animation: "pulse 1.2s infinite" }} />}
              {st.text}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TeamFlag name={home} size={20} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.2 }}>{home}</span>
        </div>
        <div style={{ textAlign: "center", minWidth: 64 }}>
          {showScore ? (
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1, color: isLive ? "#ef4444" : "#f1f5f9" }}>
              {homeScore ?? "–"}<span style={{ color: "#334155", margin: "0 3px" }}>:</span>{awayScore ?? "–"}
            </span>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: "#64748b" }}>{fmtTime(date) || "vs"}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.2, textAlign: "right" }}>{away}</span>
          <TeamFlag name={away} size={20} />
        </div>
      </div>

      {!showScore && date && (
        <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "#475569" }}>{fmtDate(date)}</div>
      )}

      <BroadcasterBadges home={home} away={away} />

      {expanded && scorers && scorers.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: 1, marginBottom: 6 }}>GOLES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {scorers.map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                <span>⚽ {g.player || g.name || "–"}</span>
                <span style={{ color: "#64748b" }}>{g.minute || g.time || ""}'{g.type === "penalty" ? " (P)" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GroupTable({ group }) {
  if (!group) return null;
  const { name, standings = [], teams = [] } = group;
  const rows = standings.length > 0 ? standings : teams.map(t => ({
    team: t.name || t, played: 0, won: 0, drawn: 0, lost: 0,
    goals_for: 0, goals_against: 0, goal_difference: 0, points: 0
  }));

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ padding: "10px 14px", background: "rgba(59,130,246,0.12)",
        borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#93c5fd" }}>GRUPO {name}</span>
        <span style={{ fontSize: 9, color: "#475569" }}>Top 2 avanzan</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ color: "#475569", fontSize: 9, letterSpacing: 0.5 }}>
            <th style={{ padding: "7px 12px", textAlign: "left", fontWeight: 600 }}>#  EQUIPO</th>
            <th style={{ padding: "7px 4px", textAlign: "center", width: 24 }}>PJ</th>
            <th style={{ padding: "7px 4px", textAlign: "center", width: 24 }}>G</th>
            <th style={{ padding: "7px 4px", textAlign: "center", width: 24 }}>E</th>
            <th style={{ padding: "7px 4px", textAlign: "center", width: 24 }}>P</th>
            <th style={{ padding: "7px 4px", textAlign: "center", width: 30 }}>GD</th>
            <th style={{ padding: "7px 12px", textAlign: "center", width: 28, color: "#93c5fd", fontWeight: 800 }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const tn = r.team || r.name || "";
            const gd = r.goal_difference ?? r.gd ?? 0;
            const qualified = i < 2;
            return (
              <tr key={i} style={{
                borderTop: "1px solid rgba(255,255,255,0.04)",
                background: qualified ? (i === 0 ? "rgba(59,130,246,0.07)" : "rgba(59,130,246,0.03)") : "transparent",
              }}>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: qualified ? "#3b82f6" : "#334155", width: 10 }}>{i + 1}</span>
                    <TeamFlag name={tn} size={15} />
                    <span style={{ color: qualified ? "#e2e8f0" : "#94a3b8", fontWeight: qualified ? 600 : 400 }}>{tn}</span>
                  </div>
                </td>
                <td style={{ textAlign: "center", color: "#64748b" }}>{r.played ?? 0}</td>
                <td style={{ textAlign: "center", color: "#64748b" }}>{r.won ?? 0}</td>
                <td style={{ textAlign: "center", color: "#64748b" }}>{r.drawn ?? 0}</td>
                <td style={{ textAlign: "center", color: "#64748b" }}>{r.lost ?? 0}</td>
                <td style={{ textAlign: "center", color: gd > 0 ? "#4ade80" : gd < 0 ? "#f87171" : "#64748b", fontWeight: 600 }}>
                  {gd > 0 ? "+" : ""}{gd}
                </td>
                <td style={{ textAlign: "center", fontWeight: 800, color: "#f1f5f9", fontSize: 13, padding: "9px 12px" }}>
                  {r.points ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Mundial2026() {
  const [tab, setTab] = useState("today");
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("ALL");

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const urls = [`${API_BASE}/games`, `${API_BASE}/groups`, `${API_BASE}/scorers`];
      const [gamesRes, groupsRes, scorersRes] = await Promise.all(urls.map(u => fetch(u).catch(() => null)));
      if (gamesRes?.ok) { const d = await gamesRes.json(); setMatches(Array.isArray(d) ? d : d.games || d.matches || d.data || []); }
      if (groupsRes?.ok) { const d = await groupsRes.json(); setGroups(Array.isArray(d) ? d : d.groups || d.data || []); }
      if (scorersRes?.ok) { const d = await scorersRes.json(); setScorers(Array.isArray(d) ? d : d.scorers || d.top_scorers || d.data || []); }
      setLastUpdate(new Date());
    } catch (e) {
      setError("Sin conexión con la API. Reintentando...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const parsed = matches.map(parseMatch);
  const now = new Date();
  const todayStr = now.toDateString();
  const liveMatches = parsed.filter(m => statusLabel(m.status)?.live);
  const todayMatches = parsed.filter(m => m.date && new Date(m.date).toDateString() === todayStr);
  const results = parsed.filter(m => { const s = statusLabel(m.status); return s && s.text === "FT"; }).sort((a, b) => new Date(b.date) - new Date(a.date));
  const upcoming = parsed.filter(m => m.date && new Date(m.date) > now && !statusLabel(m.status)?.live && statusLabel(m.status)?.text !== "FT").sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 30);
  const knockouts = parsed.filter(m => { const r = (m.round || "").toLowerCase(); return r.includes("round") || r.includes("quarter") || r.includes("semi") || r.includes("final") || r.includes("16") || r.includes("knockout"); });
  const searchResults = search.trim().length >= 2 ? parsed.filter(m => m.home.toLowerCase().includes(search.toLowerCase()) || m.away.toLowerCase().includes(search.toLowerCase())).sort((a, b) => new Date(a.date) - new Date(b.date)) : [];
  const groupNames = [...new Set(parsed.map(m => m.group).filter(Boolean))].sort();

  function toggle(id) { setExpandedId(prev => prev === id ? null : id); }

  const TABS = [
    { id: "today", label: todayMatches.length > 0 ? `HOY (${todayMatches.length})` : "HOY" },
    { id: "live", label: liveMatches.length > 0 ? `🔴 EN VIVO (${liveMatches.length})` : "EN VIVO" },
    { id: "results", label: "RESULTADOS" },
    { id: "upcoming", label: "PRÓXIMOS" },
    { id: "groups", label: "GRUPOS" },
    { id: "scorers", label: "GOLEADORES" },
    { id: "bracket", label: "ELIMINATORIA" },
  ];

  function renderMatches(list, emptyIcon, emptyMsg, emptySubMsg) {
    if (list.length === 0) return (
      <div style={{ textAlign: "center", padding: "50px 20px", color: "#475569" }}>
        <div style={{ fontSize: 38, marginBottom: 10 }}>{emptyIcon}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{emptyMsg}</div>
        {emptySubMsg && <div style={{ fontSize: 11, marginTop: 5 }}>{emptySubMsg}</div>}
      </div>
    );
    return list.map((m) => <ScoreCard key={m.id} match={m} expanded={expandedId === m.id} onToggle={() => toggle(m.id)} />);
  }

  function renderContent() {
    if (loading) return (
      <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
        <div style={{ fontSize: 36, marginBottom: 12, animation: "spin 2s linear infinite", display: "inline-block" }}>⚽</div>
        <div style={{ fontSize: 13 }}>Cargando Mundial 2026...</div>
      </div>
    );
    if (error) return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 14 }}>{error}</div>
        <button onClick={fetchData} style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontSize: 12 }}>Reintentar</button>
      </div>
    );
    if (tab === "today") return renderMatches(todayMatches, "📅", "No hay partidos hoy", "Revisa la pestaña PRÓXIMOS");
    if (tab === "live") return renderMatches(liveMatches, "🕐", "No hay partidos en curso", "Los resultados se actualizan cada minuto");
    if (tab === "results") return (<><GroupFilter groups={groupNames} selected={selectedGroup} onChange={setSelectedGroup} />{renderMatches(selectedGroup === "ALL" ? results : results.filter(m => m.group === selectedGroup), "📋", "Sin resultados aún", null)}</>);
    if (tab === "upcoming") return renderMatches(upcoming, "🗓️", "Sin próximos partidos cargados", null);
    if (tab === "groups") {
      if (groups.length === 0) {
        const byGroup = {};
        parsed.forEach(m => { if (!m.group) return; if (!byGroup[m.group]) byGroup[m.group] = { name: m.group, teams: new Set(), standings: [] }; if (m.home) byGroup[m.group].teams.add(m.home); if (m.away) byGroup[m.group].teams.add(m.away); });
        const fake = Object.values(byGroup).sort((a, b) => a.name.localeCompare(b.name)).map(g => ({ ...g, teams: [...g.teams].map(t => ({ name: t })) }));
        if (!fake.length) return <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 12 }}>Datos de grupos no disponibles</div>;
        return fake.map((g, i) => <GroupTable key={i} group={g} />);
      }
      return groups.sort((a, b) => (a.name || "").localeCompare(b.name || "")).map((g, i) => (<GroupTable key={i} group={{ name: g.name || g.group_name || g.id, standings: g.standings || g.table || [], teams: g.teams || [] }} />));
    }
    if (tab === "scorers") {
      if (scorers.length === 0) return (<div style={{ textAlign: "center", padding: "50px 20px", color: "#475569" }}><div style={{ fontSize: 38, marginBottom: 10 }}>⚽</div><div style={{ fontSize: 13, color: "#64748b" }}>La tabla de goleo aparecerá cuando comiencen los partidos</div></div>);
      return (
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.12)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#fbbf24" }}>🥇 TABLA DE GOLEO</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "#475569", fontSize: 9, letterSpacing: 0.5 }}>
                <th style={{ padding: "7px 12px", textAlign: "left" }}>#  JUGADOR</th>
                <th style={{ padding: "7px 12px", textAlign: "left" }}>SELECCIÓN</th>
                <th style={{ padding: "7px 12px", textAlign: "center", color: "#fbbf24" }}>⚽</th>
              </tr>
            </thead>
            <tbody>
              {scorers.slice(0, 20).map((s, i) => {
                const team = s.team || s.country || s.nationality || "";
                return (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: i < 3 ? "#fbbf24" : "#475569", width: 16 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
                        <span style={{ color: "#e2e8f0", fontWeight: i < 3 ? 700 : 400 }}>{s.player || s.name || s.player_name || "–"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <TeamFlag name={team} size={14} />
                        <span style={{ color: "#64748b", fontSize: 11 }}>{team}</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 12px", textAlign: "center", fontWeight: 800, fontSize: 15, color: i < 3 ? "#fbbf24" : "#f1f5f9" }}>{s.goals ?? s.goal_count ?? s.goals_scored ?? "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    if (tab === "bracket") {
      if (knockouts.length === 0) return (<div style={{ textAlign: "center", padding: "50px 20px", color: "#475569" }}><div style={{ fontSize: 38, marginBottom: 10 }}>🏆</div><div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Fase eliminatoria desde el 28 de junio</div><div style={{ fontSize: 11, marginTop: 6 }}>Ronda de 32 → Octavos → Cuartos → Semis → Final (19 Jul)</div></div>);
      const byRound = {};
      knockouts.forEach(m => { const r = m.round || "Eliminatoria"; if (!byRound[r]) byRound[r] = []; byRound[r].push(m); });
      return Object.entries(byRound).map(([round, ms], i) => (<div key={i}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#64748b", textTransform: "uppercase", margin: "16px 0 8px", padding: "0 2px" }}>{round}</div>{ms.map(m => <ScoreCard key={m.id} match={m} expanded={expandedId === m.id} onToggle={() => toggle(m.id)} />)}</div>));
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#060d18 0%,#0b1628 55%,#060d18 100%)", fontFamily: "'Inter', system-ui, sans-serif", color: "#f1f5f9" }}>
      <div style={{ background: "rgba(6,13,24,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 14px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🏆</span>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.5 }}>Mundial 2026</div>
                <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1.5, textTransform: "uppercase" }}>11 Jun – 19 Jul · USA · MX · CAN</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {liveMatches.length > 0 && (<div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 2 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.2s infinite" }} /><span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>{liveMatches.length} en vivo</span></div>)}
              {lastUpdate && <div style={{ fontSize: 9, color: "#334155" }}>Act. {lastUpdate.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</div>}
            </div>
          </div>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#475569" }}>🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); if (e.target.value.length >= 2) setTab("search"); else setTab("today"); }} placeholder="Buscar equipo… (ej: México, Francia)" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 10px 8px 32px", fontSize: 12, color: "#f1f5f9", outline: "none", boxSizing: "border-box" }} />
            {search && <button onClick={() => { setSearch(""); setTab("today"); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14 }}>✕</button>}
          </div>
          {!search && (
            <div style={{ display: "flex", gap: 3, overflowX: "auto", paddingBottom: 1, msOverflowStyle: "none", scrollbarWidth: "none" }}>
              {TABS.map(t => (<button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 11px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: 0.3, whiteSpace: "nowrap", transition: "all 0.15s", background: tab === t.id ? "rgba(255,255,255,0.07)" : "transparent", color: tab === t.id ? "#f1f5f9" : "#475569", borderBottom: tab === t.id ? "2px solid #3b82f6" : "2px solid transparent" }}>{t.label}</button>))}
            </div>
          )}
        </div>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 12px 60px" }}>
        {tab === "search" && search.length >= 2 ? (<><div style={{ fontSize: 11, color: "#64748b", marginBottom: 12, fontWeight: 600 }}>{searchResults.length} partido{searchResults.length !== 1 ? "s" : ""} con "{search}"</div>{renderMatches(searchResults, "🔍", `Sin resultados para "${search}"`, "Intenta con el nombre en inglés o español")}</>) : renderContent()}
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 12px 30px" }}>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14 }}>
          <div style={{ fontSize: 9, color: "#334155", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>CANALES EN MÉXICO</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(BROADCASTER_STYLE).map(([name, s]) => (<div key={name} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ background: s.bg, color: s.text, fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 3 }}>{s.label}</span><span style={{ fontSize: 9, color: "#334155" }}>{name}</span></div>))}
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: "#1e293b" }}>ViX Premium: Pase Mundial $799 MXN · 104 partidos completos</div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}input::placeholder{color:#334155}::-webkit-scrollbar{height:2px;width:2px}::-webkit-scrollbar-thumb{background:#1e293b}`}</style>
    </div>
  );
}

function GroupFilter({ groups, selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 12, paddingBottom: 4, msOverflowStyle: "none", scrollbarWidth: "none" }}>
      {["ALL", ...groups].map(g => (<button key={g} onClick={() => onChange(g)} style={{ padding: "4px 10px", borderRadius: 14, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s", background: selected === g ? "#3b82f6" : "rgba(255,255,255,0.05)", color: selected === g ? "#fff" : "#64748b" }}>{g === "ALL" ? "Todos" : `Grupo ${g}`}</button>))}
    </div>
  );
}
