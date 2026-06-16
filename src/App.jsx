import { useState, useEffect, useCallback } from "react";

const API_KEY = "08b94a5548b348d4b1c4c089205114f5";
const BASE = "https://api.football-data.org/v4/competitions/WC";
const HEADERS = { "X-Auth-Token": API_KEY };

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
  const isKnockout =
