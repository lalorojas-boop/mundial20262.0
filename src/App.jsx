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
    { id: "today", label: todayMatches.length > 0 ? `HOY (${todayMatches.length})` : "HOY"
