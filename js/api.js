// Talks to the KAIMEA engine API. The dashboard never calculates results itself.
(function () {
  const cfg = window.KAIMEA_CONFIG || {};
  const base = String(cfg.apiUrl || "").replace(/\/+$/, "");
  // Stable key for one pond's inputs; used for caching and to look up demo results.
  const keyOf = b => JSON.stringify([b.lang, b.lossCase, b.pond.area, b.pond.stockDate, b.pond.pondType || null, b.pEarly,
    b.readings.map(r => [r.id, r.date, r.obs, r.test, r.abw, r.doc])]);
  const hash = s => { let h1 = 5381, h2 = 52711; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = (h1 * 33) ^ c; h2 = (h2 * 33) ^ c; } return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36); };
  async function evaluate(body) {
    if (!base) {
      const hit = (window.KAIMEA_DEMO || {})[hash(keyOf(body))];
      if (hit) return JSON.parse(JSON.stringify(hit));
      throw { code: "demo" };
    }
    let res;
    try {
      res = await fetch(base + "/v1/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } catch (e) { throw { code: "offline" }; }
    if (res.status === 403) throw { code: "origin" };
    if (!res.ok) throw { code: "engine" };
    return res.json();
  }
  window.KAIMEA_API = { evaluate, keyOf, hash, mode: () => (base ? "live" : "demo") };
})();
