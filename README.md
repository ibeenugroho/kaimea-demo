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


## Files

| Path | Purpose |
|---|---|
| `index.html` | Page structure |
| `css/styles.css` | Styles (light theme) |
| `img/kaimea-logo.png` | KAIMEA logo (header and browser tab) |
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

Hasil bersifat pendukung keputusan, bukan diagnosis. Pastikan penyakit dengan uji laboratorium.
