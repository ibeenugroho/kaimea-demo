# KAIMEA Farm Dashboard

Pond condition and action plan dashboard for intensive vannamei shrimp farms. Bilingual: Bahasa Indonesia and English.

Enter each pond's daily water readings and test results. The dashboard shows:

- a traffic light per pond and a farm-wide priority list;
- the pond's current condition: stress index, disease-risk class, expected harvest and money at stake;
- a step-by-step action plan (water corrections, PROBAL protocol, pathogen response, testing) that the team can tick off.

## How it works

This repository contains **only the user interface**. All calculations run in the **KAIMEA engine**, a private service. The dashboard sends a pond's readings to the engine and displays what comes back. No model formulas, thresholds, weights or economic parameters are in this repository.

```
Browser (this repo)  --- pond readings --->  KAIMEA engine (private)
                     <--- results + plan ---
```

Pond data is saved in the visitor's own browser (localStorage). Nothing is stored on a server.

## Demo mode

With no engine configured, the dashboard opens with five sample ponds and pre-computed results, so you can explore every screen. New readings show a message asking you to connect the engine.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Connect the engine

Edit `js/config.js`:

```js
window.KAIMEA_CONFIG = { apiUrl: "https://kaimea-engine.<your-account>.workers.dev" };
```

The engine only answers websites listed in its `ALLOWED_ORIGINS` setting, so add this dashboard's address there.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository: **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`.
3. The site appears at `https://<username>.github.io/<repository>/`. Add that origin (`https://<username>.github.io`) to the engine's `ALLOWED_ORIGINS`.

## Files

| Path | Purpose |
|---|---|
| `index.html` | Page structure |
| `css/styles.css` | Styles (light theme) |
| `js/config.js` | Engine address |
| `js/api.js` | Calls the engine; looks up demo results |
| `js/demo-data.js` | Sample ponds and their pre-computed results |
| `js/app.js` | Dashboard screens, Indonesian and English text, language switch |

## Disclaimer

Results are decision support based on models that are still being validated with pilot data. They are not a diagnosis. Confirm disease with laboratory tests.

---

## Ringkasan (Bahasa Indonesia)

Dasbor kondisi kolam dan rencana tindakan untuk tambak udang vaname intensif. Repositori ini hanya berisi tampilan. Semua perhitungan berjalan di **mesin KAIMEA** yang bersifat privat; dasbor mengirim hasil ukur kolam ke mesin dan menampilkan hasilnya. Data kolam tersimpan di peramban masing-masing pengguna.

- **Mode demo:** tanpa mesin, dasbor menampilkan lima kolam contoh beserta hasilnya.
- **Menghubungkan mesin:** isi `apiUrl` di `js/config.js` dengan alamat mesin KAIMEA.
- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main`, `/ (root)`.

Hasil bersifat pendukung keputusan, bukan diagnosis. Pastikan penyakit dengan uji laboratorium.
