// Dasbor KAIMEA (Bahasa Indonesia). Tanpa kode model: hasil berasal dari API mesin KAIMEA.
window.KAIMEA_APP_ID = function(){
"use strict";
const LANG = "id";
const API = window.KAIMEA_API;
const AC = new AbortController();
const T = {"pending": "Menghitung…", "demo": "Mode demo: pengukuran ini belum punya hasil contoh. Hubungkan mesin KAIMEA untuk menilai pengukuran baru.", "origin": "Mesin KAIMEA menolak situs ini. Tambahkan alamat situs ini ke ALLOWED_ORIGINS di mesin.", "engine": "Mesin KAIMEA tidak dapat memproses pengukuran ini. Periksa nilainya lalu coba lagi.", "offline": "Mesin KAIMEA tidak terjangkau. Periksa koneksi lalu coba lagi.", "retry": "Coba lagi", "demoTag": "Demo · hasil contoh", "live": "Mesin terhubung"};
const DEFAULT_FARMS = ["My shrimp farm", "Tambak udang saya"];
const localFarm = n => (!n || DEFAULT_FARMS.includes(n)) ? "Tambak udang saya" : n;
const pname = n => String(n || "").replace(/\((contoh|example)\)\s*$/i, "(contoh)");
const K = window.KAIMEA_LABELS_ID, $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt = (x, d = 1) => x == null || isNaN(x) ? "–" : Number(x).toLocaleString("id-ID", {minimumFractionDigits: d, maximumFractionDigits: d});
const rp = x => (x < 0 ? "−" : "") + "Rp " + fmt(Math.abs(x), 1) + " jt";
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const dayDiff = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 864e5);
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const WQ = [["do_min","DO subuh","mg/L",0.1],["ph","pH (subuh)","",0.05],["ph_swing","Fluktuasi pH","sore − pagi",0.05],["temp_mean","Suhu rata-rata","°C",0.1],["temp_swing","Fluktuasi suhu","°C",0.1],["salinity","Salinitas","ppt",0.5],["alkalinity","Alkalinitas","mg/L CaCO₃",1],["tan","TAN","mg/L",0.05],["no2n","Nitrit-N","mg/L",0.05],["h2s","H₂S","mg/L",0.001],["depth","Kedalaman","m",0.05],["no3n","Nitrat-N","mg/L",1]];
const WQ2 = [["soil_orp","ORP tanah dasar","mV, sampel lumpur",1],["cyano_pct","Alga biru-hijau","% fitoplankton",1]];
const ZONE = {green: "Hijau", yellow: "Kuning", red: "Merah", none: "Belum ada data"};
const ACTION = {continue: "Lanjut (SOP saja)", harvest: "Panen dini"};
const TID = {Low: "Rendah", Moderate: "Sedang", High: "Tinggi", Critical: "Kritis"};
const tierPill = t => `<span class="pill t-${t}">${TID[t] || t}</span>`;

/* ---------- state + storage ---------- */
const S = {ponds: [], readings: [], farm: {name: "Tambak udang saya", pEarly: 0.5, lossCase: "A"}, view: "farm", mode: "loading", canWrite: true, loadedP: false, loadedR: false, adding: false, delArm: null};
let DB = null;
const LS = "kaimea-farm-v1";
function lsLoad() { try { const j = JSON.parse(localStorage.getItem(LS) || "null"); if (j) { S.ponds = j.ponds || []; S.readings = j.readings || []; S.farm = Object.assign(S.farm, j.farm || {}); } } catch (e) {} }
function lsSave() { try { localStorage.setItem(LS, JSON.stringify({ponds: S.ponds, readings: S.readings, farm: S.farm})); } catch (e) {} }
async function put(coll, id, data) {
  if (DB) { try { await DB.collection(coll).doc(id).set(data); } catch (e) { fail(e); } return; }
  const arr = coll === "ponds" ? S.ponds : S.readings; const i = arr.findIndex(x => x.id === id);
  const row = Object.assign({id}, data); if (i >= 0) arr[i] = row; else arr.push(row); lsSave(); render();
}
async function patch(coll, id, data) {
  if (DB) { try { await DB.collection(coll).doc(id).update(data); } catch (e) { fail(e); } return; }
  const arr = coll === "ponds" ? S.ponds : S.readings; const r = arr.find(x => x.id === id);
  if (r) { for (const k in data) r[k] = (typeof data[k] === "object" && data[k] && !Array.isArray(data[k])) ? Object.assign({}, r[k] || {}, data[k]) : data[k]; } lsSave(); render();
}
async function del(coll, id) {
  if (DB) { try { await DB.collection(coll).doc(id).delete(); } catch (e) { fail(e); } return; }
  if (coll === "ponds") S.ponds = S.ponds.filter(x => x.id !== id); else S.readings = S.readings.filter(x => x.id !== id); lsSave(); render();
}
async function saveFarm() { if (DB) { try { await DB.doc("meta/farm").set(Object.assign({}, S.farm)); } catch (e) { fail(e); } } else { lsSave(); } }
function fail(e) {
  const c = e && e.code;
  if (c === "invalid_argument" && S.mode === "shared") { S.canWrite = false; toast("Anda dapat melihat tambak ini tetapi tidak dapat mengubahnya. Minta akses Contributor kepada pemilik."); }
  else if (c === "quota_exceeded") toast("Penyimpanan penuh. Hapus data pengukuran lama untuk menambah yang baru.");
  else toast("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
  render();
}
let toastT; function toast(m) { if (AC.signal.aborted) return; const t = $("toast"); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3200); }

async function connect() {
  S.mode = "local"; lsLoad();
  if (!S.ponds.length && API.mode() === "demo" && window.KAIMEA_DEMO_SEED) {
    const sd = JSON.parse(JSON.stringify(window.KAIMEA_DEMO_SEED));
    S.ponds = sd.ponds; S.readings = sd.readings; S.farm = Object.assign(S.farm, sd.farm); lsSave();
  }
  render();
}

/* ---------- engine per pond ---------- */
function pondReadings(id) { return S.readings.filter(r => r.pondId === id).sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.at || 0) - (a.at || 0)); }
function docOf(p, date) { return p.stockDate ? Math.max(1, dayDiff(p.stockDate, date) + 1) : null; }
const CACHE = new Map(), INFLIGHT = new Map();
function makeBody(p, rs) {
  return {lang: LANG, pEarly: +S.farm.pEarly || 0.5, lossCase: S.farm.lossCase === "B" ? "B" : "A", pond: {area: +p.area || 1, stockDate: p.stockDate || null, pondType: p.pondType || null},
    readings: rs.slice(0, 60).map(r => ({id: r.id, date: r.date, obs: r.obs || {}, test: r.test || {}, abw: r.abw ?? null, doc: r.doc ?? null}))};
}
function requestEval(p, body, key) {
  if (INFLIGHT.get(p.id) === key) return;
  INFLIGHT.set(p.id, key);
  API.evaluate(body).then(v => ({key, v}), e => ({key, err: (e && e.code) || "offline"})).then(entry => {
    if (AC.signal.aborted) return;
    if (INFLIGHT.get(p.id) === key) INFLIGHT.delete(p.id);
    CACHE.set(p.id, entry); render();
  });
}
function retryPond(id) { CACHE.delete(id); INFLIGHT.delete(id); render(); }
function evaluate(p) {
  const rs = pondReadings(p.id); const last = rs[0];
  if (!last) return {p, rs, last: null};
  const age = dayDiff(last.date, today()), fallbackDoc = docOf(p, last.date) || last.doc || 45;
  const body = makeBody(p, rs), key = API.keyOf(body), hit = CACHE.get(p.id);
  if (!hit || hit.key !== key) requestEval(p, body, key);
  if (!hit || (hit.err && hit.key !== key)) return {p, rs, last, age, res: null, status: "pending", doc: fallbackDoc};
  if (hit.err) return {p, rs, last, age, res: null, status: hit.err, doc: fallbackDoc};
  const res = hit.v.result;
  const ivName = res.plan.items.length ? "Perbaiki air + PROBAL dosis tinggi" : "PROBAL dosis tinggi";
  return {p, rs, last, res, age, doc: hit.v.doc, persist: hit.v.persist, hist: hit.v.history, actionName: res.best === "intervene" ? ivName : ACTION[res.best]};
}
function checklist(e) {
  const r = e.res, list = [];
  r.plan.items.forEach(i => list.push({key: "w-" + i.param, grp: "Air", title: i.title, what: i.what, why: i.why, cost: i.cost, unit: i.unit}));
  r.probal.items.forEach((i, k) => list.push({key: "p-" + k + "-" + i.title.slice(0, 12).replace(/\W/g, ""), grp: "PROBAL", title: i.title, what: i.what, cost: i.cost}));
  r.pathItems.forEach((i, k) => list.push({key: "d-" + k, grp: "Patogen", title: i.title, what: i.what}));
  r.tests.forEach((t, k) => list.push({key: "t-" + k, grp: "Pengujian", title: t.split(/[:(,]/)[0].trim(), what: t}));
  return list;
}
const priority = e => !e.res ? -1 : ({red: 3, yellow: 2, green: 1}[e.res.zone] * 1000 + e.res.lossContinue * (+e.p.area || 1));

/* ---------- rendering ---------- */
function statusBar() {
  const m = {loading: ["off", "Menghubungkan…"], shared: ["", "Tersimpan untuk semua anggota tambak"], local: ["off", "Hanya tersimpan di peramban ini"], slow: ["off", "Data tersimpan belum terjangkau; menampilkan yang sudah dimuat"], error: ["off", "Koneksi ke data terputus. Muat ulang halaman"]}[S.mode];
  $("status").innerHTML = `<span><span class="dot ${m[0]}"></span>${m[1]}</span>${API.mode() === "demo" ? `<span class="pill stale">${T.demoTag}</span>` : `<span>${T.live}</span>`}${S.canWrite ? "" : "<span>Hanya lihat</span>"}<span>${esc(new Date().toLocaleDateString("id-ID", {weekday: "short", day: "numeric", month: "short", year: "numeric"}))}</span>`;
}
function render() {
  statusBar();
  if (document.activeElement !== $("farmname")) $("farmname").value = localFarm(S.farm.name);
  const h = location.hash.slice(1);
  if (h.startsWith("p-") && S.ponds.some(p => p.id === h.slice(2))) renderPond(h.slice(2)); else renderFarm();
}
function risk3(p) { return `<div class="risk3">${["L","M","H"].map((c, i) => `<span class="${c}" style="width:${(p[i] * 100).toFixed(1)}%">${p[i] > 0.1 ? ["Rendah","Sedang","Tinggi"][i] + " " + fmt(p[i] * 100, 0) + "%" : ""}</span>`).join("")}</div>`; }

function renderFarm() {
  const ev = S.ponds.map(evaluate).sort((a, b) => priority(b) - priority(a) || (a.p.name || "").localeCompare(b.p.name || ""));
  const withData = ev.filter(e => e.res);
  const need = withData.filter(e => e.res.zone !== "green").length;
  const loss = withData.reduce((s, e) => s + e.res.lossContinue * (+e.p.area || 1), 0);
  const val = withData.reduce((s, e) => s + e.res.valueOfPlan * (+e.p.area || 1), 0);
  const stale = ev.filter(e => !e.last || e.age > 1).length;
  const area = S.ponds.reduce((s, p) => s + (+p.area || 0), 0);
  let h = `<div class="kpis">
    <div><div class="k">Kolam</div><div class="v">${S.ponds.length}<small> · ${fmt(area, 1)} ha</small></div></div>
    <div><div class="k">Perlu tindakan</div><div class="v" style="color:${need ? "var(--bad)" : "var(--ok)"}">${need}<small> dari ${withData.length}</small></div></div>
    <div><div class="k">Perkiraan kerugian bila dibiarkan</div><div class="v">${fmt(loss, 0)}<small> jt Rp</small></div></div>
    <div><div class="k">Manfaat tindakan yang disarankan</div><div class="v">${fmt(val, 0)}<small> jt Rp</small></div></div>
    <div><div class="k">Perlu diukur hari ini</div><div class="v" style="color:${stale ? "var(--warn)" : "var(--ok)"}">${stale}</div></div>
  </div>`;
  h += `<div class="sect"><h2>Papan kolam</h2><span class="q">Warna = lampu status dari pengukuran terakhir. Klik kolam untuk melihat kondisi dan rencana tindakannya.</span>
    ${S.canWrite ? `<button class="primary" id="addPond">Tambah kolam</button>` : ""}</div>`;
  if (S.adding) h += `<form class="inline" id="pondForm">
    <label>Nama kolam<input id="pf_name" required maxlength="40" placeholder="mis. Petak A3"></label>
    <label>Luas (ha)<input id="pf_area" type="number" step="0.05" min="0.05" value="0.5" required></label>
    <label>Tanggal tebar<input id="pf_stock" type="date" value="${today()}"></label>
    <label>Padat tebar (PL/m²)<input id="pf_dens" type="number" step="5" value="70"></label>
    <label>Jenis kolam<select id="pf_type"><option value="hdpe">Berlapis (HDPE atau beton)</option><option value="earthen">Dasar tanah</option></select></label>
    <button class="primary" type="submit">Simpan kolam</button><button type="button" class="ghost" id="pf_cancel">Batal</button></form>`;
  if (!S.ponds.length) {
    h += S.mode === "loading" ? `<div class="empty">Memuat data kolam…</div>` : `<div class="empty"><h3>Belum ada kolam</h3>Tambahkan kolam pertama, lalu masukkan hasil ukur air hari ini. KAIMEA menilai kondisi air, memperkirakan risiko penyakit dan uang yang dipertaruhkan, serta memberi rencana langkah demi langkah untuk setiap parameter yang menyimpang.</div>`;
  } else {
    h += `<div class="board">` + ev.map(e => {
      const z = e.res ? e.res.zone : "none";
      return `<div class="tile z-${z}" role="button" tabindex="0" data-pond="${esc(e.p.id)}">
        <div class="row"><span class="nm" style="font-family:var(--f-display);color:var(--ink);font-size:15px">${esc(pname(e.p.name))}</span><span class="pill zp z-${z}">${ZONE[z]}</span></div>
        ${e.res ? `<div class="row"><span>IS ${fmt(e.res.S.si, 0)} ${tierPill(e.res.S.tier)}</span><span>Tinggi ${fmt(e.res.R.post[2] * 100, 0)}%</span></div>
        <div class="act">${esc(e.actionName)}${e.res.plan.items[0] ? " · " + esc(e.res.plan.items[0].title) : ""}</div>
        <div class="row"><span>DOC ${e.doc}</span><span>${e.age <= 0 ? "diukur hari ini" : e.age === 1 ? "diukur kemarin" : `<span class="pill stale">${e.age} hari lalu</span>`}</span></div>`
        : e.last ? `<div class="act" style="color:var(--muted)">${esc(T[e.status] || T.offline)}</div>` : `<div class="act" style="color:var(--muted)">Belum ada pengukuran. Masukkan hasil ukur air hari ini.</div>`}
      </div>`;
    }).join("") + `</div>`;
    h += `<div class="sect"><h2>Daftar prioritas</h2><span class="q">Terburuk di atas: lampu status, lalu rupiah yang dipertaruhkan</span></div>
    <div class="tw"><table><thead><tr><th>Kolam</th><th>Status</th><th class="n">IS</th><th>Stresor</th><th class="n">P(Tinggi)</th><th class="n">Rugi bila dibiarkan</th><th>Lakukan sekarang</th><th class="n">Manfaat</th><th class="n">Tindakan selesai</th></tr></thead><tbody>` +
    ev.map(e => {
      if (!e.res) return `<tr class="click" data-pond="${esc(e.p.id)}"><td><b>${esc(pname(e.p.name))}</b></td><td><span class="pill zp z-none">Belum ada data</span></td><td colspan="7" style="color:var(--muted)">${e.last ? esc(T[e.status] || T.offline) : "Menunggu pengukuran pertama"}</td></tr>`;
      const cl = checklist(e), done = cl.filter(c => e.last.done && e.last.done[c.key]).length, A = +e.p.area || 1;
      return `<tr class="click" data-pond="${esc(e.p.id)}"><td><b>${esc(pname(e.p.name))}</b><br><span style="font:11px var(--f-data);color:var(--muted)">${fmt(A, 2)} ha · DOC ${e.doc}</span></td>
      <td><span class="pill zp z-${e.res.zone}">${ZONE[e.res.zone]}</span></td><td class="n">${fmt(e.res.S.si, 0)}</td>
      <td>${e.res.S.active.map(k => K.SPEC[k].label).join(", ") || "–"}</td><td class="n">${fmt(e.res.R.post[2] * 100, 0)}%</td>
      <td class="n">${fmt(e.res.lossContinue * A, 1)}</td><td>${esc(e.actionName)}</td><td class="n">${fmt(e.res.valueOfPlan * A, 1)}</td><td class="n">${done}/${cl.length}</td></tr>`;
    }).join("") + `</tbody></table></div><p class="note">Nilai uang dalam Rp juta per kolam untuk siklus ini, ${S.farm.lossCase === "B" ? "dasar kerugian Kasus B (hati-hati)" : "dasar kerugian Kasus A"}. Kolam bertanda "(contoh)" adalah data contoh; hapus dari halaman masing-masing kolam.</p>`;
  }
  h += `<div class="sect"><h2>Pengaturan tambak</h2></div><form class="inline" id="farmForm"><label>Peluang tindakan masih cukup dini (0–1)<input id="ff_pe" type="number" step="0.05" min="0" max="1" value="${esc(S.farm.pEarly)}" ${S.canWrite ? "" : "disabled"}></label><span class="hint" style="max-width:60ch">Dipakai untuk menimbang opsi "bertindak sekarang". Gunakan 0,5 sampai uji coba Anda sendiri mengukur seberapa dini sinyal muncul.</span><label>Dasar perhitungan kerugian penyakit<select id="ff_lc" ${S.canWrite ? "" : "disabled"}><option value="A" ${S.farm.lossCase === "B" ? "" : "selected"}>Kasus A: per penyakit (bawaan)</option><option value="B" ${S.farm.lossCase === "B" ? "selected" : ""}>Kasus B: hati-hati</option></select></label><span class="hint" style="max-width:60ch">Kasus A: sekitar 6 dari 10 kolam kehilangan udang karena penyakit dalam satu siklus, sesuai model kerugian penyakit KAIMEA. Kasus B: sekitar 4 sampai 5 dari 10, perkiraan yang hati-hati. Mengubah porsi risiko dan uang yang dipertaruhkan, bukan koreksi air.</span></form>`;
  $("view").innerHTML = h;
  document.querySelectorAll("[data-pond]").forEach(el => { el.addEventListener("click", () => { location.hash = "p-" + el.dataset.pond; }); el.addEventListener("keydown", k => { if (k.key === "Enter" || k.key === " ") { k.preventDefault(); location.hash = "p-" + el.dataset.pond; } }); });
  const ap = $("addPond"); if (ap) ap.onclick = () => { S.adding = true; render(); setTimeout(() => $("pf_name") && $("pf_name").focus(), 0); };
  const pf = $("pondForm"); if (pf) { pf.onsubmit = ev2 => { ev2.preventDefault(); const id = uid("p"); S.adding = false; put("ponds", id, {name: $("pf_name").value.trim(), area: +$("pf_area").value, stockDate: $("pf_stock").value || null, density: +$("pf_dens").value || null, pondType: $("pf_type").value, createdAt: Date.now()}).then(() => toast("Kolam ditambahkan")); if (DB) render(); }; $("pf_cancel").onclick = () => { S.adding = false; render(); }; }
  const fl = $("ff_lc"); if (fl) fl.onchange = () => { S.farm.lossCase = fl.value === "B" ? "B" : "A"; saveFarm().then(() => toast("Pengaturan disimpan")); render(); };
  const ff = $("ff_pe"); if (ff) ff.onchange = () => { S.farm.pEarly = Math.min(1, Math.max(0, +ff.value || 0.5)); saveFarm().then(() => toast("Pengaturan disimpan")); render(); };
}

function trendSVG(hist) {
  const pts = (hist || []).slice(0, 21).reverse().map(h => ({d: h.date, si: h.si}));
  if (pts.length < 2) return `<p class="note">Tren muncul setelah dua kali pengukuran.</p>`;
  const W = 560, H = 170, l = 30, r = 12, t = 10, b = 26, n = pts.length;
  const x = i => l + i * (W - l - r) / (n - 1), y = v => t + (1 - v / 100) * (H - t - b);
  const band = (a, c, col) => `<rect x="${l}" y="${y(c)}" width="${W - l - r}" height="${y(a) - y(c)}" fill="${col}" opacity=".35"/>`;
  let g = band(0, 30, "var(--ok-bg)") + band(30, 55, "var(--warn-bg)") + band(55, 75, "var(--bad-bg)") + band(75, 100, "var(--crit-bg)");
  [0, 30, 55, 75, 100].forEach(v => g += `<line x1="${l}" x2="${W - r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${l - 4}" y="${y(v) + 3}" text-anchor="end">${v}</text>`);
  const step = Math.ceil(n / 7); pts.forEach((p, i) => { if (i % step === 0 || i === n - 1) g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${p.d.slice(5)}</text>`; });
  const path = pts.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.si).toFixed(1)).join(" ");
  g += `<path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.2"/>` + pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.si)}" r="${i === n - 1 ? 4 : 2.5}" fill="var(--accent)"><title>${p.d}: IS ${fmt(p.si, 0)}</title></circle>`).join("");
  return `<div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:320px" role="img" aria-label="Tren indeks stres">${g}</svg></div>`;
}
function clockSVG(c) {
  const W = 300, H = 120, l = 34, r = 10, t = 8, b = 22, x = d => l + (d - 1) * (W - l - r) / 6, y = p => t + (1 - p) * (H - t - b);
  const path = a => a.map((p, i) => (i ? "L" : "M") + x(p.d).toFixed(1) + " " + y(p.cum).toFixed(1)).join(" ");
  let g = ""; [0, .5, 1].forEach(p => g += `<line x1="${l}" x2="${W - r}" y1="${y(p)}" y2="${y(p)}" stroke="var(--line)"/><text x="${l - 4}" y="${y(p) + 3}" text-anchor="end">${p * 100}%</text>`);
  for (let d = 1; d <= 7; d++) g += `<text x="${x(d)}" y="${H - 6}" text-anchor="middle">h${d}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Peluang wabah 7 hari">${g}<path d="${path(c.noAction)}" fill="none" stroke="var(--bad)" stroke-width="2"/><path d="${path(c.withFix)}" fill="none" stroke="var(--ok)" stroke-width="2"/></svg>
  <div style="display:flex;gap:12px;font-size:12px;flex-wrap:wrap"><span style="color:var(--bad)">■ tanpa tindakan ${fmt(c.noAction[6].cum * 100, 0)}%</span><span style="color:var(--ok)">■ setelah perbaikan air ${fmt(c.withFix[6].cum * 100, 0)}%</span></div>`;
}

function renderPond(id) {
  const p = S.ponds.find(x => x.id === id), e = evaluate(p), A = +p.area || 1, last = e.last, ro = S.canWrite ? "" : "disabled";
  const pre = last || {obs: {}, test: {}};
  let h = `<p style="margin:0 0 10px"><a href="#farm">← Semua kolam</a></p>
  <div class="ph"><div><h1>${esc(pname(p.name))}</h1><div class="meta">${fmt(A, 2)} ha · tebar ${esc(p.stockDate || "–")}${p.density ? " · " + p.density + " PL/m²" : ""}${p.pondType ? " · " + ({earthen: "tanah", hdpe: "berlapis"}[p.pondType] || "") : ""} · ${e.rs.length} pengukuran</div></div>
  ${S.canWrite ? `<button class="danger" id="delPond">${S.delArm === "pond" ? "Klik lagi untuk menghapus kolam beserta datanya" : "Hapus kolam"}</button>` : ""}</div>
  <div class="grid" style="margin-top:14px"><aside class="rail"><form id="rf">
    <div class="k">${last ? "Pengukuran baru (terisi dari pengukuran terakhir)" : "Pengukuran pertama"}</div>
    <fieldset><legend>Waktu</legend>
      <div class="f"><label for="r_date">Tanggal</label><input id="r_date" type="date" value="${today()}" ${ro}></div>
      ${p.stockDate ? "" : `<div class="f"><label for="r_doc">Umur budidaya (DOC)</label><input id="r_doc" type="number" min="1" max="140" value="${esc(pre.doc || 45)}" ${ro}></div>`}
      <div class="f"><label for="r_abw">Berat rata-rata <small>g, opsional</small></label><input id="r_abw" type="number" step="0.1" value="${esc(pre.abw ?? "")}" ${ro}></div></fieldset>
    <fieldset><legend>Kimia dan fisika air</legend>${WQ.map(([k, l, u, s]) => `<div class="f"><label for="w_${k}">${l} <small>${u}</small></label><input id="w_${k}" type="number" step="${s}" value="${esc(pre.obs && pre.obs[k] != null ? pre.obs[k] : "")}" ${ro}></div>`).join("")}
      <p class="hint">Kosongkan yang tidak diukur. DO subuh, pH pagi/sore, suhu, salinitas, alkalinitas dan TAN sudah mencakup sebagian besar skor.</p></fieldset>
    <fieldset><legend>Dasar kolam dan plankton <small>mingguan</small></legend>${WQ2.filter(([k]) => !(k === "soil_orp" && p.pondType === "hdpe")).map(([k, l, u, s]) => `<div class="f"><label for="w_${k}">${l} <small>${u}</small></label><input id="w_${k}" type="number" step="${s}" value="${esc(pre.obs && pre.obs[k] != null ? pre.obs[k] : "")}" ${ro}></div>`).join("")}
      <p class="hint">ORP tanah: tancapkan ORP meter ke sampel lumpur segar dari tengah kolam (hanya tambak tanah). Alga biru-hijau: porsi Cyanophyta dari hitungan plankton.</p></fieldset>
    <fieldset><legend>Hasil uji</legend>
      <div class="f"><label for="t_gut">Skor disbiosis usus <small>SD</small></label><input id="t_gut" type="number" step="0.1" value="${esc(pre.test && pre.test.gutScore != null ? pre.test.gutScore : "")}" ${ro}></div>
      <div class="f"><label for="t_wssv">Tabung WSSV</label><select id="t_wssv" ${ro}>${["", "neg", "pos"].map(v => `<option value="${v}" ${(pre.test && pre.test.wssv || "") === v ? "selected" : ""}>${{"": "belum diuji", neg: "negatif", pos: "positif"}[v]}</option>`).join("")}</select></div>
      <div class="f"><label for="t_pirab">Tabung pirAB <small>AHPND</small></label><select id="t_pirab" ${ro}>${["", "neg", "pos"].map(v => `<option value="${v}" ${(pre.test && pre.test.pirab || "") === v ? "selected" : ""}>${{"": "belum diuji", neg: "negatif", pos: "positif"}[v]}</option>`).join("")}</select></div>
      <div class="f"><label for="t_ehp">Beban EHP <small>log₁₀ kopi/ng</small></label><input id="t_ehp" type="number" step="0.1" value="${esc(pre.test && pre.test.ehpLog != null ? pre.test.ehpLog : "")}" ${ro}></div>
      <p class="hint">Hasil uji terbawa ke pengukuran berikutnya; kosongkan bila hasilnya sudah tidak berlaku.</p></fieldset>
    ${S.canWrite ? `<div style="display:flex;gap:8px;margin-top:12px"><button class="primary" type="submit">Simpan pengukuran dan perbarui rencana</button></div>` : `<p class="hint">Hanya lihat.</p>`}
  </form></aside><div class="main">`;

  if (!last) { h += `<div class="empty"><h3>Kolam ini belum punya pengukuran</h3>Masukkan hasil ukur subuh hari ini di sebelah kiri lalu simpan. Kondisi dan rencana tindakan akan muncul di sini.</div></div></div>`; $("view").innerHTML = h; bindPond(p, e); return; }
  if (!e.res) { h += `<div class="empty"><p style="margin:0 0 10px">${esc(T[e.status] || T.offline)}</p>${e.status !== "pending" ? `<button class="primary" id="retryEval">${T.retry}</button>` : ""}</div></div></div>`; $("view").innerHTML = h; bindPond(p, e); const rb = $("retryEval"); if (rb) rb.onclick = () => retryPond(p.id); return; }

  const r = e.res, cl = checklist(e), done = last.done || {}, nd = cl.filter(c => done[c.key]).length;
  const head = {red: "Bertindak hari ini.", yellow: "Koreksi dan pantau ketat.", green: "Kolam dalam kondisi baik."}[r.zone];
  const why = r.zone === "green" ? `Air dalam batas toleransi (IS ${fmt(r.S.si, 0)}). Lanjutkan rutinitas PROBAL pemeliharaan dan pengukuran harian.` :
    `${r.S.active.length ? "Di luar batas: " + r.S.active.map(k => K.SPEC[k].label).join(", ") + ". " : ""}Peluang ${fmt(r.R.post[2] * 100, 0)}% kolam ini berisiko tinggi; sekitar ${rp(r.lossContinue * A)} dipertaruhkan bila dibiarkan. Disarankan: <b>${esc(e.actionName)}</b> (manfaat ${rp(r.valueOfPlan * A)}).`;
  h += `<div class="banner z-${r.zone}"><b>${ZONE[r.zone]} · ${head}</b> ${why}${e.age > 1 ? ` <span class="pill stale">pengukuran terakhir ${e.age} hari lalu</span>` : ""}</div>
  <div class="verdict">
    <div><div class="k">Indeks stres</div><div class="v">${fmt(r.S.si, 0)} ${tierPill(r.S.tier)}</div></div>
    <div><div class="k">P(kolam risiko tinggi)</div><div class="v">${fmt(r.R.post[2] * 100, 0)}<small>%</small></div></div>
    <div><div class="k">Perkiraan panen</div><div class="v">${fmt(r.prod.tonnes * A, 2)}<small> dari ${fmt(r.prod.healthyT * A, 2)} t</small></div></div>
    <div><div class="k">Perkiraan rugi bila dibiarkan</div><div class="v">${fmt(r.lossContinue * A, 1)}<small> jt Rp</small></div></div>
  </div>`;

  // action checklist
  let grp = "", items = "";
  cl.forEach(c => {
    if (c.grp !== grp) { grp = c.grp; items += `<div class="k grp">${{Air: "Air: koreksi kimia dan fisika", PROBAL: "PROBAL", Patogen: "Respons patogen", Pengujian: "Pengujian"}[grp]}</div>`; }
    const d = !!done[c.key];
    items += `<label class="item ${d ? "done" : ""}"><input type="checkbox" data-key="${esc(c.key)}" ${d ? "checked" : ""} ${ro}><div><h3>${esc(c.title)}</h3><p class="w">${esc(c.what)}</p>${c.why ? `<p class="y">${esc(c.why)}</p>` : ""}${c.cost ? `<div class="c">${esc(c.unit || "")}${c.unit ? " · " : ""}${c.cost < 0 ? "hemat " + rp(-c.cost) : rp(c.cost)}</div>` : ""}</div></label>`;
  });
  h += `<section class="card"><div class="ch"><h2>Rencana tindakan</h2><span class="q">Untuk pengukuran ${esc(last.date)} · IS setelah perbaikan air ≈ ${fmt(r.plan.after.si, 0)} (${TID[r.plan.after.tier]})</span><span class="prog">${nd}/${cl.length} selesai</span></div>
  <div class="todo">${items}</div><p class="note">Centang tiap butir saat tim menyelesaikannya. Simpan pengukuran baru 24–48 jam setelah perbaikan air untuk memastikan hasilnya.</p></section>`;

  // condition details
  const rows = Object.keys(r.S.subs).sort((a, b) => r.S.contrib[b] - r.S.contrib[a]).map(k => {
    const s = r.S.subs[k], sp = K.SPEC[k], val = k === "nh3n" ? r.S.nh3n : r.S.vals[k];
    return `<tr><td>${sp.label}</td><td class="n">${fmt(val, k === "nh3n" || k === "h2s" ? 3 : 2)}</td><td><div class="bar"><i class="${s >= 0.5 ? "s-hi" : s > 0 ? "s-mid" : ""}" style="width:${s * 100}%"></i></div></td><td class="n">${fmt(r.S.contrib[k], 1)}</td></tr>`;
  }).join("");
  h += `<section class="card"><div class="ch"><h2>Kondisi saat ini</h2><span class="q">Stres air dan risiko penyakit pada DOC ${e.doc}</span></div>
  <div class="row2"><div><div class="k">Parameter air, terburuk di atas</div><div style="overflow-x:auto"><table><thead><tr><th>Parameter</th><th class="n">Nilai</th><th>Stres</th><th class="n">Poin IS</th></tr></thead><tbody>${rows}</tbody></table></div>
  <p class="note">Cakupan ${fmt(r.S.coverage * 100, 0)}% dari panel lengkap${r.S.coverage < 0.5 ? ", jadi skor ini batas bawah" : ""}.${e.persist > 1 ? ` Stresor menumpuk ${e.persist} hari berturut-turut.` : ""} ${r.S.notes.map(esc).join(" ")}</p></div>
  <div><div class="k">Kelas risiko penyakit</div>${risk3(r.R.post)}<div class="hint" style="margin:-4px 0 10px">${r.R.steps.length ? "Diperbarui oleh: " + esc(r.R.steps.join("; ")) : "Dari stres air saja. Uji kit akan mempertajamnya."}</div>
  <div class="k">Peluang awal wabah dalam 7 hari</div>${clockSVG(r.clock)}<p class="note">Bentuk ilustratif dari simulator kolam, bukan prakiraan terkalibrasi.</p></div></div></section>`;

  // economics
  const opt = (key, name, desc) => { const v = r.exp[key]; return `<div class="opt ${r.best === key ? "best" : ""}"><div class="k" style="display:flex;justify-content:space-between"><span>${name}</span>${r.best === key ? "<span>terbaik</span>" : ""}</div><div class="v">${v == null ? "n/a" : fmt(v * A, 1)}<small>${v == null ? "" : " jt Rp"}</small></div><div class="hint">${desc}</div></div>`; };
  h += `<section class="card"><div class="ch"><h2>Uang yang dipertaruhkan</h2><span class="q">Perkiraan margin siklus kolam ini untuk tiap pilihan</span></div>
  <div class="opts">${opt("continue", "Lanjut", "Tanpa tindakan tambahan")}${opt("intervene", r.plan.items.length ? "Perbaiki air + PROBAL" : "PROBAL dosis tinggi", `Air ${rp(r.plan.chemCost)} + PROBAL; PROBAL menutup ${fmt(r.fUse * 100, 0)}% selisih bila dini`)}${opt("harvest", "Panen dini", r.harvestFeasible ? "Jual pada sekitar 9 g" : `Udang mencapai 9 g dalam ${r.dTo9} hari`)}</div>
  <p class="note">Kolam sehat menghasilkan ${rp(r.healthy.margin * A)} siklus ini (${fmt(A, 2)} ha). Harga masih asumsi: udang Rp 55.000/kg size 60, pakan Rp 16.000/kg. Memakai ${S.farm.lossCase === "B" ? "dasar kerugian Kasus B (hati-hati)" : "dasar kerugian Kasus A"}.</p></section>`;

  // trend + history
  h += `<section class="card"><div class="ch"><h2>Tren stres</h2><span class="q">Indeks stres per pengukuran, batas tingkat 30 / 55 / 75</span></div>${trendSVG(e.hist)}
  <details style="margin-top:8px"><summary>Riwayat pengukuran (${e.rs.length})</summary><div style="overflow-x:auto"><table><thead><tr><th>Tanggal</th><th class="n">IS</th><th>Tingkat</th><th class="n">DO</th><th class="n">pH</th><th class="n">TAN</th><th class="n">Alk</th><th>Uji</th><th></th></tr></thead><tbody>
  ${e.rs.map(x => { const s = (e.hist || []).find(h => h.id === x.id) || {si: null, tier: ""}, o = x.obs || {}, t = x.test || {};
    return `<tr><td>${esc(x.date)}</td><td class="n">${fmt(s.si, 0)}</td><td>${tierPill(s.tier)}</td><td class="n">${fmt(o.do_min, 1)}</td><td class="n">${fmt(o.ph, 2)}</td><td class="n">${fmt(o.tan, 2)}</td><td class="n">${fmt(o.alkalinity, 0)}</td>
    <td>${[t.wssv === "pos" ? "WSSV+" : "", t.pirab === "pos" ? "pirAB+" : "", t.ehpLog != null ? "EHP " + t.ehpLog : "", t.gutScore != null ? "gut " + t.gutScore : ""].filter(Boolean).join(", ") || "–"}</td>
    <td>${S.canWrite ? `<button class="ghost" data-delr="${esc(x.id)}" style="padding:2px 8px">${S.delArm === x.id ? "Konfirmasi" : "Hapus"}</button>` : ""}</td></tr>`; }).join("")}
  </tbody></table></div></details></section></div></div>`;
  $("view").innerHTML = h;
  bindPond(p, e);
}

function bindPond(p, e) {
  const num = id => { const v = $(id) && $(id).value; return v === "" || v == null ? null : +v; };
  const f = $("rf");
  if (f) f.onsubmit = ev => {
    ev.preventDefault(); const obs = {}; WQ.concat(WQ2).forEach(([k]) => { const v = num("w_" + k); if (v != null) obs[k] = v; });
    const test = {gutScore: num("t_gut"), auc: 0.83, wssv: $("t_wssv").value, pirab: $("t_pirab").value, ehpLog: num("t_ehp")};
    Object.keys(test).forEach(k => (test[k] === null || test[k] === "") && delete test[k]);
    if (!Object.keys(obs).length) { toast("Masukkan minimal satu hasil ukur air."); return; }
    const date = $("r_date").value || today();
    const same = e.rs.find(x => x.date === date);
    const row = {pondId: p.id, date, obs, test, abw: num("r_abw"), at: Date.now(), done: {}};
    if (!p.stockDate) row.doc = num("r_doc") || 45;
    put("readings", same ? same.id : uid("r"), row).then(() => toast(same ? "Pengukuran " + date + " diperbarui" : "Pengukuran disimpan. Rencana diperbarui."));
    if (DB) render(); window.scrollTo({top: 0, behavior: "smooth"});
  };
  document.querySelectorAll("input[data-key]").forEach(cb => cb.onchange = () => patch("readings", e.last.id, {done: {[cb.dataset.key]: cb.checked}}));
  const dp = $("delPond");
  if (dp) dp.onclick = async () => {
    if (S.delArm !== "pond") { S.delArm = "pond"; render(); setTimeout(() => { if (S.delArm === "pond") { S.delArm = null; render(); } }, 5000); return; }
    S.delArm = null; for (const r of e.rs) await del("readings", r.id); await del("ponds", p.id); location.hash = "farm"; toast("Kolam dihapus");
  };
  document.querySelectorAll("[data-delr]").forEach(b => b.onclick = () => {
    const id = b.dataset.delr; if (S.delArm !== id) { S.delArm = id; render(); return; } S.delArm = null; del("readings", id).then(() => toast("Pengukuran dihapus"));
  });
}

$("farmname").addEventListener("change", ev => { S.farm.name = ev.target.value.trim() || "Tambak udang saya"; saveFarm().then(() => toast("Nama tambak disimpan")); }, {signal: AC.signal});
window.addEventListener("hashchange", () => { S.delArm = null; render(); window.scrollTo(0, 0); }, {signal: AC.signal});
render();
connect();
return {stop(){ AC.abort(); }};
};
