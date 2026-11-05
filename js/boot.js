// Language switch (ID / EN). Each viewer's choice is kept in their own browser.
(function () {
  let lang = "id";
  try { if (localStorage.getItem("kaimea-lang") === "en") lang = "en"; } catch (e) {}
  let cur = null;
  function start(l) {
    if (cur) cur.stop();
    lang = l;
    try { localStorage.setItem("kaimea-lang", l); } catch (e) {}
    document.documentElement.lang = l;
    document.title = l === "en" ? "KAIMEA Farm Dashboard" : "Dasbor Tambak KAIMEA";
    document.getElementById("farmname").setAttribute("aria-label", l === "en" ? "Farm name" : "Nama tambak");
    document.querySelector(".lang").setAttribute("aria-label", l === "en" ? "Language" : "Bahasa");
    document.getElementById("lg-id").setAttribute("aria-pressed", l === "id");
    document.getElementById("lg-en").setAttribute("aria-pressed", l === "en");
    document.getElementById("toast").hidden = true;
    cur = (l === "en" ? window.KAIMEA_APP_EN : window.KAIMEA_APP_ID)();
  }
  document.getElementById("lg-id").addEventListener("click", () => lang !== "id" && start("id"));
  document.getElementById("lg-en").addEventListener("click", () => lang !== "en" && start("en"));
  start(lang);
})();
