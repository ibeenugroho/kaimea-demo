// KAIMEA farm dashboard (ID / EN). No model code here: results come from the KAIMEA engine API (or demo results).
(function () {
"use strict";
const API = window.KAIMEA_API, $ = id => document.getElementById(id);

/* ---------- words ---------- */
const STR = {
  id: {
    title: "Dasbor Tambak KAIMEA", farmDefault: "Tambak udang saya", farmLabel: "Nama tambak", langLabel: "Bahasa",
    demo: "Mode demo", live: "Terhubung", local: "Tersimpan di perangkat ini",
    sumNone: "Mulai dengan menambah kolam pertama.", sumAll: "Semua kolam dalam kondisi baik.",
    sumNeed: (n, m) => `<b>${n} dari ${m} kolam</b> perlu tindakan.`, sumWait: "Menghitung kondisi kolam…",
    stPonds: "Kolam", stNeed: "Perlu tindakan", stStake: "Dipertaruhkan", stDue: "Belum diukur",
    myPonds: "Kolam saya", sorted: "Yang paling perlu perhatian di atas", addPond: "Tambah kolam",
    zone: { red: "Merah", yellow: "Kuning", green: "Hijau", none: "Belum ada data" },
    head: { red: "Bertindak hari ini", yellow: "Perbaiki & pantau", green: "Kondisi baik", none: "Belum ada data" },
    doNow: "Lakukan", atStake: "dipertaruhkan", readToday: "diukur hari ini", readYest: "diukur kemarin", readAgo: n => `diukur ${n} hari lalu`,
    noReading: "Belum ada data. Catat pengukuran pertama.",
    pfTitle: "Kolam baru", pfName: "Nama kolam", pfArea: "Luas (ha)", pfStock: "Tanggal tebar", pfDens: "Padat tebar (ekor/m²)", pfType: "Jenis kolam",
    typeHdpe: "Berlapis (HDPE/beton)", typeEarth: "Dasar tanah", save: "Simpan", cancel: "Batal", namePh: "mis. Petak A3",
    settings: "Pengaturan", lossCase: "Dasar kerugian penyakit", caseA: "Kasus A (bawaan)", caseB: "Kasus B (hati-hati)",
    caseHint: "A: sekitar 6 dari 10 kolam terkena penyakit per siklus. B: sekitar 4–5 dari 10.",
    pEarly: "Peluang tindakan cukup dini", pEarlyHint: "Biarkan 0,5 sampai uji lapangan memberi angka sendiri.",
    exampleNote: "Kolam bertanda (contoh) adalah data contoh. Hapus dari halaman kolamnya.",
    back: "Semua kolam", tabs: { plan: "Rencana", cond: "Kondisi", log: "Catat data", hist: "Riwayat" },
    riskWord: p => p >= 0.5 ? "tinggi" : p >= 0.25 ? "sedang" : "rendah",
    heroRisk: (w, pct, money) => `Risiko penyakit ${w} (${pct}%). Sekitar ${money} dipertaruhkan bila dibiarkan.`,
    heroGreen: "Air dalam batas aman. Lanjutkan PROBAL rutin dan ukur setiap hari.",
    best: "Saran utama", worth: "nilai", stale: n => `data terakhir ${n} hari lalu`,
    act: { continue: "Lanjut sesuai SOP", harvest: "Panen dini", fix: "Perbaiki air + PROBAL dosis tinggi", boost: "PROBAL dosis tinggi" },
    grp: { Water: "Perbaiki air", PROBAL: "PROBAL", Pathogen: "Tanggap penyakit", Testing: "Pengujian" },
    tiers: ["Catat air setiap hari (gratis)", "Uji kit di tepi kolam", "Uji lab qPCR"],
    how: "Cara melakukannya", done: (d, n) => `${d} dari ${n} selesai`, planNote: "Centang saat selesai. Ukur ulang 1–2 hari setelah perbaikan air.",
    noPlan: "Tidak ada tindakan khusus. Lanjutkan rutinitas.", saves: "hemat",
    tStress: "Stres air", tRisk: "Risiko penyakit berat", tHarvest: "Perkiraan panen", of: "dari",
    tier: { Low: "Rendah", Moderate: "Sedang", High: "Tinggi", Critical: "Kritis" },
    off: "Yang perlu diperhatikan", allOk: "Semua yang diukur dalam batas aman.", okList: "Normal",
    clock: (a, b) => `Peluang wabah dalam 7 hari: <b>${a}%</b> tanpa tindakan, <b>${b}%</b> setelah perbaikan air.`,
    money: "Pilihan dan hasil siklus", moneyQ: "Perkiraan untung (atau rugi) kolam ini per siklus",
    optC: "Lanjut", optI: "Bertindak", optH: "Panen dini", bestTag: "terbaik",
    optCd: "Tanpa tindakan tambahan", optId: "Perbaikan air + PROBAL", optHd: "Jual di ukuran ±9 g", optHn: d => `Udang belum 9 g (±${d} hari lagi)`,
    priceNote: m => `Kolam sehat: ${m}. Harga masih perkiraan (udang Rp 55.000/kg, pakan Rp 16.000/kg).`,
    covLow: "Data masih sedikit, jadi skor bisa lebih rendah dari kenyataan.",
    fDaily: "Harian (subuh)", fExtra: "Tambahan", fExtraQ: "opsional", fWeekly: "Mingguan", fTests: "Hasil uji",
    fDate: "Tanggal", fDoc: "Hari ke- (DOC)", fAbw: "Berat rata-rata (g)", blank: "Kosongkan yang tidak diukur.",
    fGut: "Skor usus (SD)", fWssv: "Tabung WSSV", fPirab: "Tabung pirAB (AHPND)", fEhp: "EHP (log kopi/ng)",
    tv: { "": "belum diuji", neg: "negatif", pos: "positif" }, saveReading: "Simpan & perbarui rencana",
    prefilled: "Terisi dari pengukuran terakhir. Ubah yang berbeda saja.", orpHint: "ORP: ukur di lumpur segar dari tengah kolam.",
    trend: "Tren stres air", trendNeed: "Tren muncul setelah dua pengukuran.", hDate: "Tanggal", hStress: "Stres", del: "Hapus", confirm: "Yakin?",
    delPond: "Hapus kolam", delPondArm: "Klik lagi untuk menghapus kolam dan datanya",
    firstTitle: "Belum ada pengukuran", firstText: "Catat pengukuran subuh hari ini untuk melihat kondisi dan rencana tindakan.",
    toastPond: "Kolam ditambahkan", toastSaved: "Tersimpan. Rencana diperbarui.", toastUpd: d => `Data ${d} diperbarui`, toastNeedOne: "Isi minimal satu data air.",
    toastSet: "Pengaturan tersimpan", toastName: "Nama tambak tersimpan", toastDelP: "Kolam dihapus", toastDelR: "Data dihapus", toastFail: "Gagal menyimpan. Coba lagi.",
    pending: "Menghitung…", retry: "Coba lagi",
    err: { demo: "Mode demo hanya punya hasil contoh. Hubungkan mesin KAIMEA untuk menilai data baru.", origin: "Mesin KAIMEA menolak situs ini. Tambahkan alamat situs ke ALLOWED_ORIGINS.", engine: "Mesin tidak bisa memproses data ini. Periksa nilainya.", offline: "Tidak bisa menghubungi mesin KAIMEA. Periksa koneksi." },
    lined: "berlapis", earthen: "tanah",
    p: { do_min: "DO subuh", nh3n: "Amonia beracun (NH₃)", ph: "pH", ph_swing: "Naik-turun pH", temp_swing: "Naik-turun suhu", temp_mean: "Suhu", salinity: "Salinitas", no2n: "Nitrit", alkalinity: "Alkalinitas", h2s: "H₂S", depth: "Kedalaman", no3n: "Nitrat", tan: "TAN", soil_orp: "ORP dasar kolam", cyano_pct: "Alga biru-hijau" },
    u: { ph_swing: "sore − pagi", cyano_pct: "% plankton" },
    nf: "id-ID", date: { weekday: "long", day: "numeric", month: "long" },
  },
  en: {
    title: "KAIMEA Farm Dashboard", farmDefault: "My shrimp farm", farmLabel: "Farm name", langLabel: "Language",
    demo: "Demo mode", live: "Connected", local: "Saved on this device",
    sumNone: "Start by adding your first pond.", sumAll: "All ponds are in good shape.",
    sumNeed: (n, m) => `<b>${n} of ${m} ponds</b> need action.`, sumWait: "Checking your ponds…",
    stPonds: "Ponds", stNeed: "Need action", stStake: "At stake", stDue: "Not read yet",
    myPonds: "My ponds", sorted: "Most urgent first", addPond: "Add pond",
    zone: { red: "Red", yellow: "Yellow", green: "Green", none: "No data" },
    head: { red: "Act today", yellow: "Fix and watch", green: "Looking good", none: "No data yet" },
    doNow: "Do", atStake: "at stake", readToday: "read today", readYest: "read yesterday", readAgo: n => `read ${n} days ago`,
    noReading: "No data yet. Add the first reading.",
    pfTitle: "New pond", pfName: "Pond name", pfArea: "Area (ha)", pfStock: "Stocking date", pfDens: "Density (PL/m²)", pfType: "Pond type",
    typeHdpe: "Lined (HDPE/concrete)", typeEarth: "Earthen bottom", save: "Save", cancel: "Cancel", namePh: "e.g. Pond A3",
    settings: "Settings", lossCase: "Disease-loss baseline", caseA: "Case A (default)", caseB: "Case B (cautious)",
    caseHint: "A: about 6 in 10 ponds get disease in a cycle. B: about 4–5 in 10.",
    pEarly: "Chance action is early enough", pEarlyHint: "Keep 0.5 until a field trial gives your own number.",
    exampleNote: "Ponds marked (example) are sample data. Delete them from their pond page.",
    back: "All ponds", tabs: { plan: "Plan", cond: "Condition", log: "Add reading", hist: "History" },
    riskWord: p => p >= 0.5 ? "high" : p >= 0.25 ? "moderate" : "low",
    heroRisk: (w, pct, money) => `Disease risk is ${w} (${pct}%). About ${money} at stake if nothing changes.`,
    heroGreen: "Water is in range. Keep routine PROBAL and daily readings.",
    best: "Best move", worth: "worth", stale: n => `last reading ${n} days old`,
    act: { continue: "Continue as usual", harvest: "Harvest early", fix: "Fix water + PROBAL boost", boost: "PROBAL boost" },
    grp: { Water: "Fix the water", PROBAL: "PROBAL", Pathogen: "Disease response", Testing: "Testing" },
    tiers: ["Log water daily (free)", "Pond-side kit test", "Lab qPCR test"],
    how: "How to do it", done: (d, n) => `${d} of ${n} done`, planNote: "Tick items when done. Re-measure 1–2 days after a water fix.",
    noPlan: "Nothing special to do. Keep the routine.", saves: "saves",
    tStress: "Water stress", tRisk: "Serious disease risk", tHarvest: "Expected harvest", of: "of",
    tier: { Low: "Low", Moderate: "Moderate", High: "High", Critical: "Critical" },
    off: "What needs attention", allOk: "Everything measured is in range.", okList: "In range",
    clock: (a, b) => `Chance of an outbreak within 7 days: <b>${a}%</b> with no action, <b>${b}%</b> after the water fix.`,
    money: "Options and cycle result", moneyQ: "Expected profit (or loss) for this pond this cycle",
    optC: "Continue", optI: "Act", optH: "Harvest early", bestTag: "best",
    optCd: "No extra action", optId: "Water fix + PROBAL", optHd: "Sell at about 9 g", optHn: d => `Shrimp not 9 g yet (~${d} days)`,
    priceNote: m => `A healthy pond earns ${m}. Prices are estimates (shrimp Rp 55,000/kg, feed Rp 16,000/kg).`,
    covLow: "Few readings, so the score may understate the stress.",
    fDaily: "Daily (dawn)", fExtra: "Extra", fExtraQ: "optional", fWeekly: "Weekly", fTests: "Test results",
    fDate: "Date", fDoc: "Day of culture", fAbw: "Mean weight (g)", blank: "Leave blank if not measured.",
    fGut: "Gut score (SD)", fWssv: "WSSV tube", fPirab: "pirAB tube (AHPND)", fEhp: "EHP (log copies/ng)",
    tv: { "": "not tested", neg: "negative", pos: "positive" }, saveReading: "Save & update plan",
    prefilled: "Pre-filled from the last reading. Change only what differs.", orpHint: "ORP: measure in fresh mud from the pond centre.",
    trend: "Water stress trend", trendNeed: "The trend appears after two readings.", hDate: "Date", hStress: "Stress", del: "Delete", confirm: "Sure?",
    delPond: "Delete pond", delPondArm: "Click again to delete the pond and its data",
    firstTitle: "No readings yet", firstText: "Add today's dawn readings to see the pond's condition and plan.",
    toastPond: "Pond added", toastSaved: "Saved. Plan updated.", toastUpd: d => `Reading for ${d} updated`, toastNeedOne: "Enter at least one water reading.",
    toastSet: "Setting saved", toastName: "Farm name saved", toastDelP: "Pond deleted", toastDelR: "Reading deleted", toastFail: "Could not save. Try again.",
    pending: "Calculating…", retry: "Try again",
    err: { demo: "Demo mode only has sample results. Connect the KAIMEA engine to score new readings.", origin: "The KAIMEA engine refused this site. Add its address to ALLOWED_ORIGINS.", engine: "The engine could not process this reading. Check the values.", offline: "Can't reach the KAIMEA engine. Check your connection." },
    lined: "lined", earthen: "earthen",
    p: { do_min: "Dawn DO", nh3n: "Toxic ammonia (NH₃)", ph: "pH", ph_swing: "pH swing", temp_swing: "Temperature swing", temp_mean: "Temperature", salinity: "Salinity", no2n: "Nitrite", alkalinity: "Alkalinity", h2s: "H₂S", depth: "Depth", no3n: "Nitrate", tan: "TAN", soil_orp: "Bottom ORP", cyano_pct: "Blue-green algae" },
    u: { ph_swing: "pm − am", cyano_pct: "% of plankton" },
    nf: "en-GB", date: { weekday: "long", day: "numeric", month: "long" },
  },
};
const UNIT = { do_min: "mg/L", ph: "", ph_swing: "", temp_mean: "°C", temp_swing: "°C", salinity: "ppt", alkalinity: "mg/L", tan: "mg/L", no2n: "mg/L", h2s: "mg/L", depth: "m", no3n: "mg/L", soil_orp: "mV", cyano_pct: "%", nh3n: "mg/L" };
const DAILY = [["do_min", 0.1], ["ph", 0.05], ["temp_mean", 0.1], ["salinity", 0.5], ["alkalinity", 1], ["tan", 0.05]];
const EXTRA = [["ph_swing", 0.05], ["temp_swing", 0.1], ["no2n", 0.05], ["h2s", 0.001], ["depth", 0.05], ["no3n", 1]];
const WEEKLY = [["soil_orp", 1], ["cyano_pct", 1]];
const DEFAULT_FARMS = ["My shrimp farm", "Tambak udang saya"];

let L = "id";
try { if (localStorage.getItem("kaimea-lang") === "en") L = "en"; } catch (e) {}
const W = () => STR[L];
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (x, d = 1) => x == null || isNaN(x) ? "–" : Number(x).toLocaleString(W().nf, { minimumFractionDigits: d, maximumFractionDigits: d });
const rp = (x, d = 1) => (x < 0 ? "−" : "") + "Rp " + fmt(Math.abs(x), d) + " jt";
const pname = n => String(n || "").replace(/\((contoh|example)\)\s*$/i, L === "en" ? "(example)" : "(contoh)");
const farmName = n => (!n || DEFAULT_FARMS.includes(n)) ? W().farmDefault : n;
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const dayDiff = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 864e5);
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- state + storage (this browser only) ---------- */
const LS = "kaimea-farm-v1";
const S = { ponds: [], readings: [], farm: { name: "", pEarly: 0.5, lossCase: "A" }, adding: false, delArm: null, tab: {} };
function load() {
  try { const j = JSON.parse(localStorage.getItem(LS) || "null"); if (j) { S.ponds = j.ponds || []; S.readings = j.readings || []; Object.assign(S.farm, j.farm || {}); } } catch (e) {}
  if (!S.ponds.length && API.mode() === "demo" && window.KAIMEA_DEMO_SEED) {
    const sd = JSON.parse(JSON.stringify(window.KAIMEA_DEMO_SEED));
    S.ponds = sd.ponds; S.readings = sd.readings; Object.assign(S.farm, sd.farm); save();
  }
}
function save() { try { localStorage.setItem(LS, JSON.stringify({ ponds: S.ponds, readings: S.readings, farm: S.farm })); } catch (e) { toast(W().toastFail); } }
function put(coll, id, data) { const arr = S[coll], i = arr.findIndex(x => x.id === id), row = Object.assign({ id }, data); if (i >= 0) arr[i] = row; else arr.push(row); save(); render(); }
function remove(coll, id) { S[coll] = S[coll].filter(x => x.id !== id); save(); }
let toastT; function toast(m) { const t = $("toast"); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2800); }

/* ---------- engine calls ---------- */
const CACHE = new Map(), INFLIGHT = new Map();
const pondReadings = id => S.readings.filter(r => r.pondId === id).sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.at || 0) - (a.at || 0));
function makeBody(p, rs) {
  return { lang: L, pEarly: +S.farm.pEarly || 0.5, lossCase: S.farm.lossCase === "B" ? "B" : "A", pond: { area: +p.area || 1, stockDate: p.stockDate || null, pondType: p.pondType || null },
    readings: rs.slice(0, 60).map(r => ({ id: r.id, date: r.date, obs: r.obs || {}, test: r.test || {}, abw: r.abw ?? null, doc: r.doc ?? null })) };
}
function evaluate(p) {
  const rs = pondReadings(p.id), last = rs[0];
  if (!last) return { p, rs, last: null };
  const age = dayDiff(last.date, today()), body = makeBody(p, rs), key = API.keyOf(body), hit = CACHE.get(p.id);
  if ((!hit || hit.key !== key) && INFLIGHT.get(p.id) !== key) {
    INFLIGHT.set(p.id, key);
    API.evaluate(body).then(v => ({ key, v }), e => ({ key, err: (e && e.code) || "offline" })).then(entry => {
      if (INFLIGHT.get(p.id) === key) INFLIGHT.delete(p.id);
      CACHE.set(p.id, entry); render();
    });
  }
  if (!hit || hit.key !== key) return { p, rs, last, age, status: "pending" };
  if (hit.err) return { p, rs, last, age, status: hit.err };
  const r = hit.v.result;
  const act = r.best === "intervene" ? (r.plan.items.length ? W().act.fix : W().act.boost) : W().act[r.best];
  return { p, rs, last, age, r, act, doc: hit.v.doc, persist: hit.v.persist, hist: hit.v.history, A: +p.area || 1 };
}
const priority = e => !e.r ? -1 : ({ red: 3, yellow: 2, green: 1 }[e.r.zone] * 1e4 + e.r.lossContinue * e.A);
function checklist(e) {
  const r = e.r, list = [];
  r.plan.items.forEach(i => list.push({ key: "w-" + i.param, grp: "Water", title: i.title, what: i.what, cost: i.cost }));
  r.probal.items.forEach((i, k) => list.push({ key: "p-" + k + "-" + i.title.slice(0, 12).replace(/\W/g, ""), grp: "PROBAL", title: i.title, what: i.what, cost: i.cost }));
  r.pathItems.forEach((i, k) => list.push({ key: "d-" + k, grp: "Pathogen", title: i.title, what: i.what }));
  r.tests.forEach((t, k) => { const m = t.match(/^(?:Tingkat|Tier)\s*(\d)/i); list.push({ key: "t-" + k, grp: "Testing", title: m && W().tiers[+m[1]] ? W().tiers[+m[1]] : t.split(/[:(]/)[0].trim(), what: t }); });
  return list;
}

/* ---------- shell ---------- */
function shell() {
  const w = W();
  document.documentElement.lang = L; document.title = w.title;
  $("farmname").setAttribute("aria-label", w.farmLabel);
  if (document.activeElement !== $("farmname")) $("farmname").value = farmName(S.farm.name);
  $("lang").setAttribute("aria-label", w.langLabel);
  $("lg-id").setAttribute("aria-pressed", L === "id"); $("lg-en").setAttribute("aria-pressed", L === "en");
  $("mode").textContent = API.mode() === "demo" ? w.demo : w.live;
  $("mode").className = "chip " + (API.mode() === "demo" ? "chip-demo" : "chip-live");
  $("today").textContent = new Date().toLocaleDateString(w.nf, w.date);
}
function render() {
  shell();
  const m = location.hash.match(/^#p-([^/]+)(?:\/(\w+))?/);
  if (m && S.ponds.some(p => p.id === m[1])) renderPond(m[1], m[2]); else renderFarm();
}

/* ---------- farm screen ---------- */
function renderFarm() {
  const w = W(), ev = S.ponds.map(evaluate).sort((a, b) => priority(b) - priority(a) || (a.p.name || "").localeCompare(b.p.name || ""));
  const ok = ev.filter(e => e.r), need = ok.filter(e => e.r.zone !== "green").length;
  const stake = ok.filter(e => e.r.zone !== "green").reduce((s, e) => s + e.r.lossContinue * e.A, 0);
  const due = ev.filter(e => !e.last || e.age > 0).length, waiting = ev.some(e => e.status === "pending");
  const sum = !S.ponds.length ? w.sumNone : waiting && !ok.length ? w.sumWait : need ? w.sumNeed(need, ok.length) : w.sumAll;
  let h = `<section class="hello"><div><h1>${sum}</h1>${S.ponds.length ? `<p class="muted">${esc(farmName(S.farm.name))} · ${fmt(S.ponds.reduce((s, p) => s + (+p.area || 0), 0), 1)} ha</p>` : ""}</div>
    ${S.ponds.length ? `<div class="stats">
      <div class="stat"><span>${w.stNeed}</span><b class="${need ? "t-bad" : "t-ok"}">${need}<small> / ${ok.length}</small></b></div>
      <div class="stat"><span>${w.stStake}</span><b>${rp(stake, 0)}</b></div>
      <div class="stat"><span>${w.stDue}</span><b class="${due ? "t-warn" : "t-ok"}">${due}</b></div></div>` : ""}</section>`;
  h += `<div class="bar-head"><div><h2>${w.myPonds}</h2>${S.ponds.length > 1 ? `<span class="muted">${w.sorted}</span>` : ""}</div><button class="btn primary" id="addPond">+ ${w.addPond}</button></div>`;
  if (S.adding) h += `<form class="card form-card" id="pondForm"><h3>${w.pfTitle}</h3><div class="fgrid">
    <label class="fld wide"><span>${w.pfName}</span><input id="pf_name" required maxlength="40" placeholder="${w.namePh}"></label>
    <label class="fld"><span>${w.pfArea}</span><input id="pf_area" type="number" step="0.05" min="0.05" value="0.5" required></label>
    <label class="fld"><span>${w.pfStock}</span><input id="pf_stock" type="date" value="${today()}"></label>
    <label class="fld"><span>${w.pfDens}</span><input id="pf_dens" type="number" step="5" value="70"></label>
    <label class="fld"><span>${w.pfType}</span><select id="pf_type"><option value="hdpe">${w.typeHdpe}</option><option value="earthen">${w.typeEarth}</option></select></label></div>
    <div class="row-end"><button type="button" class="btn ghost" id="pf_cancel">${w.cancel}</button><button class="btn primary" type="submit">${w.save}</button></div></form>`;
  if (S.ponds.length) h += `<div class="ponds">` + ev.map(card).join("") + `</div>`;
  if (S.ponds.some(p => /\((contoh|example)\)/i.test(p.name || ""))) h += `<p class="muted small">${w.exampleNote}</p>`;
  h += `<details class="settings"><summary>${w.settings}</summary><div class="fgrid">
    <label class="fld"><span>${w.lossCase}</span><select id="ff_lc"><option value="A" ${S.farm.lossCase === "B" ? "" : "selected"}>${w.caseA}</option><option value="B" ${S.farm.lossCase === "B" ? "selected" : ""}>${w.caseB}</option></select><em>${w.caseHint}</em></label>
    <label class="fld"><span>${w.pEarly}</span><input id="ff_pe" type="number" step="0.05" min="0" max="1" value="${esc(S.farm.pEarly)}"><em>${w.pEarlyHint}</em></label></div></details>`;
  $("view").innerHTML = h;
  document.querySelectorAll("[data-pond]").forEach(el => el.addEventListener("click", () => { location.hash = "p-" + el.dataset.pond; }));
  $("addPond").onclick = () => { S.adding = true; render(); setTimeout(() => $("pf_name") && $("pf_name").focus(), 0); };
  const pf = $("pondForm");
  if (pf) { pf.onsubmit = ev2 => { ev2.preventDefault(); S.adding = false; put("ponds", uid("p"), { name: $("pf_name").value.trim(), area: +$("pf_area").value, stockDate: $("pf_stock").value || null, density: +$("pf_dens").value || null, pondType: $("pf_type").value, createdAt: Date.now() }); toast(w.toastPond); };
    $("pf_cancel").onclick = () => { S.adding = false; render(); }; }
  $("ff_lc").onchange = ev2 => { S.farm.lossCase = ev2.target.value === "B" ? "B" : "A"; save(); toast(w.toastSet); render(); };
  $("ff_pe").onchange = ev2 => { S.farm.pEarly = Math.min(1, Math.max(0, +ev2.target.value || 0.5)); save(); toast(w.toastSet); render(); };
}
function card(e) {
  const w = W(), z = e.r ? e.r.zone : "none";
  const when = !e.last ? "" : e.age <= 0 ? w.readToday : e.age === 1 ? w.readYest : w.readAgo(e.age);
  let body;
  if (e.r) body = `<p class="pc-do"><span>${w.doNow}</span>${esc(e.act)}</p>
    ${z !== "green" ? `<p class="pc-money">${rp(e.r.lossContinue * e.A, 0)} <span>${w.atStake}</span></p>` : ""}`;
  else body = `<p class="pc-wait">${e.last ? esc(e.status === "pending" ? w.pending : w.err[e.status] || w.err.offline) : w.noReading}</p>`;
  return `<button type="button" class="pc z-${z}" data-pond="${esc(e.p.id)}">
    <span class="badge z-${z}"><i></i>${w.head[z]}</span><span class="pc-name">${esc(pname(e.p.name))}</span>
    ${body}
    <div class="pc-meta">${fmt(+e.p.area || 1, 2)} ha${e.doc ? ` · DOC ${e.doc}` : ""}${when ? ` · <span class="${e.age > 1 ? "t-warn" : ""}">${when}</span>` : ""}</div></button>`;
}

/* ---------- pond screen ---------- */
function renderPond(id, tabArg) {
  const w = W(), p = S.ponds.find(x => x.id === id), e = evaluate(p);
  const tab = tabArg && w.tabs[tabArg] ? tabArg : (e.last ? "plan" : "log");
  const type = p.pondType ? " · " + (p.pondType === "earthen" ? w.earthen : w.lined) : "";
  let h = `<a class="back" href="#">← ${w.back}</a>
  <div class="pond-head"><div><h1>${esc(pname(p.name))}</h1><p class="muted">${fmt(+p.area || 1, 2)} ha${e.doc ? " · DOC " + e.doc : ""}${p.density ? " · " + p.density + " PL/m²" : ""}${type}</p></div></div>`;
  if (e.r) {
    const r = e.r, z = r.zone, pct = fmt(r.R.post[2] * 100, 0);
    const line = z === "green" ? w.heroGreen : w.heroRisk(w.riskWord(r.R.post[2]), pct, rp(r.lossContinue * e.A, 0));
    h += `<section class="hero z-${z}"><div class="hero-l"><span class="badge z-${z}"><i></i>${w.zone[z]}</span><h2>${w.head[z]}</h2><p>${line}</p>${e.age > 1 ? `<p class="small t-warn">${w.stale(e.age)}</p>` : ""}</div>
      <div class="hero-r"><span>${w.best}</span><b>${esc(e.act)}</b>${r.valueOfPlan > 0.05 ? `<em>${w.worth} ${rp(r.valueOfPlan * e.A, 1)}</em>` : ""}</div></section>`;
  }
  h += `<div class="tabcard"><nav class="tabs" role="tablist">${Object.entries(w.tabs).map(([k, v]) => `<a role="tab" href="#p-${esc(p.id)}/${k}" aria-selected="${k === tab}">${v}</a>`).join("")}</nav><div class="panel">`;
  if (tab === "log") h += logForm(p, e);
  else if (tab === "hist") h += history(p, e);
  else if (!e.last) h += `<div class="empty"><h3>${w.firstTitle}</h3><p>${w.firstText}</p><a class="btn primary" href="#p-${esc(p.id)}/log">${w.tabs.log}</a></div>`;
  else if (!e.r) h += `<div class="empty"><p>${esc(e.status === "pending" ? w.pending : w.err[e.status] || w.err.offline)}</p>${e.status !== "pending" ? `<button class="btn ghost" id="retry">${w.retry}</button>` : ""}</div>`;
  else h += tab === "cond" ? condition(e) : plan(e);
  h += `</div></div>`;
  $("view").innerHTML = h;
  bindPond(p, e);
}
function plan(e) {
  const w = W(), cl = checklist(e), done = e.last.done || {}, nd = cl.filter(c => done[c.key]).length;
  if (!cl.length) return `<div class="empty"><p>${w.noPlan}</p></div>`;
  let h = `<div class="progress"><span>${w.done(nd, cl.length)}</span><div class="pbar"><i style="width:${cl.length ? nd / cl.length * 100 : 0}%"></i></div></div>`, grp = "";
  cl.forEach(c => {
    if (c.grp !== grp) { if (grp) h += `</div>`; grp = c.grp; h += `<h3 class="grp">${w.grp[grp]}</h3><div class="todo">`; }
    const d = !!done[c.key], cost = c.cost ? (c.cost < 0 ? w.saves + " " + rp(-c.cost) : rp(c.cost)) : "";
    h += `<div class="item ${d ? "done" : ""}"><label class="check"><input type="checkbox" data-key="${esc(c.key)}" ${d ? "checked" : ""}><span class="ttl">${esc(c.title)}</span>${cost ? `<span class="cost">${cost}</span>` : ""}</label>
      ${c.what && c.what !== c.title ? `<details><summary>${w.how}</summary><p>${esc(c.what)}</p></details>` : ""}</div>`;
  });
  return h + `</div><p class="muted small">${w.planNote}</p>`;
}
function condition(e) {
  const w = W(), r = e.r, S2 = r.S;
  const keys = Object.keys(S2.subs).sort((a, b) => S2.contrib[b] - S2.contrib[a]);
  const bad = keys.filter(k => S2.subs[k] > 0), good = keys.filter(k => !(S2.subs[k] > 0));
  const val = k => k === "nh3n" ? fmt(S2.nh3n, 3) : fmt(S2.vals[k], k === "h2s" ? 3 : Math.abs(S2.vals[k]) >= 20 ? 0 : 1);
  let h = `<div class="tiles">
    <div class="tile"><span>${w.tStress}</span><b>${fmt(S2.si, 0)}<small>/100</small></b><em class="tier t-${S2.tier}">${w.tier[S2.tier] || S2.tier}</em></div>
    <div class="tile"><span>${w.tRisk}</span><b>${fmt(r.R.post[2] * 100, 0)}<small>%</small></b><div class="risk"><i class="L" style="width:${r.R.post[0] * 100}%"></i><i class="M" style="width:${r.R.post[1] * 100}%"></i><i class="H" style="width:${r.R.post[2] * 100}%"></i></div></div>
    <div class="tile"><span>${w.tHarvest}</span><b>${fmt(r.prod.tonnes * e.A, 1)}<small> t</small></b><em>${w.of} ${fmt(r.prod.healthyT * e.A, 1)} t</em></div></div>`;
  h += `<h3 class="grp">${w.off}</h3>`;
  h += bad.length ? `<div class="params">${bad.map(k => `<div class="prm"><span class="pn">${w.p[k] || k}</span><span class="pv">${val(k)} <small>${UNIT[k] || ""}</small></span><div class="sbar"><i class="${S2.subs[k] >= 0.5 ? "hi" : "mid"}" style="width:${Math.max(6, S2.subs[k] * 100)}%"></i></div></div>`).join("")}</div>` : `<p class="okline">${w.allOk}</p>`;
  if (good.length) h += `<p class="muted small"><b>${w.okList}:</b> ${good.map(k => w.p[k] || k).join(" · ")}</p>`;
  const notes = (S2.notes || []).concat(S2.coverage < 0.5 ? [w.covLow] : []);
  if (notes.length) h += `<p class="note">${notes.map(esc).join(" ")}</p>`;
  h += `<p class="clock">${w.clock(fmt(r.clock.noAction[6].cum * 100, 0), fmt(r.clock.withFix[6].cum * 100, 0))}</p>`;
  const opt = (k, n, d) => { const v = r.exp[k]; return `<div class="opt ${r.best === k ? "best" : ""}"><span>${n}${r.best === k ? `<i>${w.bestTag}</i>` : ""}</span><b class="${v != null && v < 0 ? "t-bad" : ""}">${v == null ? "–" : rp(v * e.A, 1)}</b><em>${d}</em></div>`; };
  h += `<h3 class="grp">${w.money}</h3><p class="muted small" style="margin-top:-6px">${w.moneyQ}</p><div class="opts">${opt("continue", w.optC, w.optCd)}${opt("intervene", w.optI, w.optId)}${opt("harvest", w.optH, r.harvestFeasible ? w.optHd : w.optHn(r.dTo9))}</div>
  <p class="muted small">${w.priceNote(rp(r.healthy.margin * e.A, 0))}</p>`;
  return h;
}
function logForm(p, e) {
  const w = W(), pre = e.last || { obs: {}, test: {} }, o = pre.obs || {}, t = pre.test || {};
  const f = ([k, s]) => `<label class="fld"><span>${w.p[k]} <small>${(w.u[k] ?? UNIT[k]) || ""}</small></span><input id="w_${k}" type="number" step="${s}" inputmode="decimal" value="${esc(o[k] ?? "")}"></label>`;
  const sel = (id, lab, v) => `<label class="fld"><span>${lab}</span><select id="${id}">${["", "neg", "pos"].map(x => `<option value="${x}" ${(v || "") === x ? "selected" : ""}>${w.tv[x]}</option>`).join("")}</select></label>`;
  const weekly = WEEKLY.filter(([k]) => !(k === "soil_orp" && p.pondType === "hdpe"));
  return `<form id="rf" class="logform">${e.last ? `<p class="muted small hint-top">${w.prefilled}</p>` : ""}
    <div class="fgrid">
      <label class="fld"><span>${w.fDate}</span><input id="r_date" type="date" value="${today()}"></label>
      ${p.stockDate ? "" : `<label class="fld"><span>${w.fDoc}</span><input id="r_doc" type="number" min="1" max="140" value="${esc(pre.doc || 45)}"></label>`}
      <label class="fld"><span>${w.fAbw}</span><input id="r_abw" type="number" step="0.1" value="${esc(pre.abw ?? "")}"></label></div>
    <h3 class="grp">${w.fDaily}</h3><div class="fgrid">${DAILY.map(f).join("")}</div>
    <details class="more"><summary><span>${w.fExtra} <small>· ${w.fExtraQ}</small></span></summary><div class="fgrid">${EXTRA.map(f).join("")}</div></details>
    <details class="more"><summary>${w.fWeekly}</summary><div class="fgrid">${weekly.map(f).join("")}</div>${weekly.some(x => x[0] === "soil_orp") ? `<p class="muted small">${w.orpHint}</p>` : ""}</details>
    <details class="more"><summary>${w.fTests}</summary><div class="fgrid">
      <label class="fld"><span>${w.fGut}</span><input id="t_gut" type="number" step="0.1" value="${esc(t.gutScore ?? "")}"></label>
      ${sel("t_wssv", w.fWssv, t.wssv)}${sel("t_pirab", w.fPirab, t.pirab)}
      <label class="fld"><span>${w.fEhp}</span><input id="t_ehp" type="number" step="0.1" value="${esc(t.ehpLog ?? "")}"></label></div></details>
    <div class="row-end"><span class="muted small">${w.blank}</span><button class="btn primary" type="submit">${w.saveReading}</button></div></form>`;
}
function history(p, e) {
  const w = W();
  let h = `<h3 class="grp" style="margin-top:0">${w.trend}</h3>${trendSVG(e.hist)}`;
  if (e.rs.length) h += `<div class="tw"><table><thead><tr><th>${w.hDate}</th><th class="n">${w.hStress}</th><th class="n">DO</th><th class="n">pH</th><th class="n">TAN</th><th></th></tr></thead><tbody>${e.rs.map(x => {
    const s = (e.hist || []).find(q => q.id === x.id), o = x.obs || {};
    return `<tr><td>${esc(x.date)}</td><td class="n">${s ? `<span class="dotv t-${s.tier}"></span>${fmt(s.si, 0)}` : "–"}</td><td class="n">${fmt(o.do_min, 1)}</td><td class="n">${fmt(o.ph, 2)}</td><td class="n">${fmt(o.tan, 2)}</td>
      <td class="n"><button class="link" data-delr="${esc(x.id)}">${S.delArm === x.id ? w.confirm : w.del}</button></td></tr>`; }).join("")}</tbody></table></div>`;
  return h + `<div class="row-end" style="margin-top:22px"><button class="btn danger" id="delPond">${S.delArm === "pond" ? w.delPondArm : w.delPond}</button></div>`;
}
function trendSVG(hist) {
  const pts = (hist || []).slice(0, 21).reverse();
  if (pts.length < 2) return `<p class="muted small">${W().trendNeed}</p>`;
  const Wd = 900, H = 220, l = 30, r = 14, t = 12, b = 26, n = pts.length;
  const x = i => l + i * (Wd - l - r) / (n - 1), y = v => t + (1 - v / 100) * (H - t - b);
  let g = [[0, 30, "#e7f4ec"], [30, 55, "#fdf3dc"], [55, 100, "#fbe6e2"]].map(([a, c, col]) => `<rect x="${l}" y="${y(c)}" width="${Wd - l - r}" height="${y(a) - y(c)}" fill="${col}"/>`).join("");
  [0, 30, 55, 100].forEach(v => g += `<text x="${l - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`);
  const step = Math.ceil(n / 6); pts.forEach((p, i) => { if (i % step === 0 || i === n - 1) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${p.date.slice(5)}</text>`; });
  g += `<path d="${pts.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.si).toFixed(1)).join(" ")}" fill="none" stroke="var(--brand)" stroke-width="2.5" stroke-linejoin="round"/>` +
    pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.si)}" r="${i === n - 1 ? 5 : 3}" fill="#fff" stroke="var(--brand)" stroke-width="2"><title>${p.date}: ${fmt(p.si, 0)}</title></circle>`).join("");
  return `<svg class="trend" viewBox="0 0 ${Wd} ${H}" width="100%" role="img" aria-label="${W().trend}">${g}</svg>`;
}
function bindPond(p, e) {
  const w = W(), num = id => { const v = $(id) && $(id).value; return v === "" || v == null ? null : +v; };
  const rb = $("retry"); if (rb) rb.onclick = () => { CACHE.delete(p.id); INFLIGHT.delete(p.id); render(); };
  const f = $("rf");
  if (f) f.onsubmit = ev => {
    ev.preventDefault(); const obs = {};
    DAILY.concat(EXTRA, WEEKLY).forEach(([k]) => { const v = num("w_" + k); if (v != null) obs[k] = v; });
    if (!Object.keys(obs).length) { toast(w.toastNeedOne); return; }
    const test = { gutScore: num("t_gut"), auc: 0.83, wssv: $("t_wssv").value, pirab: $("t_pirab").value, ehpLog: num("t_ehp") };
    Object.keys(test).forEach(k => (test[k] === null || test[k] === "") && delete test[k]);
    const date = $("r_date").value || today(), same = e.rs.find(x => x.date === date);
    const row = { pondId: p.id, date, obs, test, abw: num("r_abw"), at: Date.now(), done: {} };
    if (!p.stockDate) row.doc = num("r_doc") || 45;
    location.hash = "p-" + p.id + "/plan";
    put("readings", same ? same.id : uid("r"), row); toast(same ? w.toastUpd(date) : w.toastSaved); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  document.querySelectorAll("input[data-key]").forEach(cb => cb.onchange = () => {
    const r = S.readings.find(x => x.id === e.last.id); if (!r) return;
    r.done = Object.assign({}, r.done || {}, { [cb.dataset.key]: cb.checked }); save(); render();
  });
  const dp = $("delPond");
  if (dp) dp.onclick = () => {
    if (S.delArm !== "pond") { S.delArm = "pond"; render(); setTimeout(() => { if (S.delArm === "pond") { S.delArm = null; render(); } }, 5000); return; }
    S.delArm = null; e.rs.forEach(r => remove("readings", r.id)); remove("ponds", p.id); location.hash = ""; toast(w.toastDelP); render();
  };
  document.querySelectorAll("[data-delr]").forEach(b => b.onclick = () => {
    const id = b.dataset.delr; if (S.delArm !== id) { S.delArm = id; render(); return; }
    S.delArm = null; remove("readings", id); toast(w.toastDelR); render();
  });
}

/* ---------- start ---------- */
function setLang(l) { if (l === L) return; L = l; try { localStorage.setItem("kaimea-lang", l); } catch (e) {} render(); }
$("lg-id").onclick = () => setLang("id"); $("lg-en").onclick = () => setLang("en");
$("farmname").addEventListener("change", ev => { S.farm.name = ev.target.value.trim(); save(); toast(W().toastName); render(); });
window.addEventListener("hashchange", () => { S.delArm = null; render(); window.scrollTo(0, 0); });
load(); render();
})();
