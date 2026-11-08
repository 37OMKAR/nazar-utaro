# 🧿 Nazar Utaro

Feeling like someone you love is low? Type their name, pick a tradition, and send them a link.
The moment they open it, an animated grandma performs the **whole nazar utarna ritual** for them,
in the dress, language and style of the state, community or country you chose.

It's a static web app (plain HTML/CSS/JS, no build step, no backend, no tracking).

## How it works

1. Open the app, fill in **their name** (plus your name and a sweet message, both optional).
2. Choose her tradition (or tap **Surprise me**).
3. Hit **Preview** to watch it yourself, or **Create the link** and share it on WhatsApp / Telegram.
4. When your friend opens the link they see a *"Begin the ritual"* screen (needed so that sound can play), then the ritual runs for roughly 40 to 55 seconds:
   the person on the stool starts out gloomy under a dark nazar cloud, the cloud gets pulled away round by round, burnt, smashed or blessed away,
   and they end up beaming. Your message appears on the final card.

The link simply carries the data in the URL (`?to=Priya&from=Omkar&m=...&t=maharashtra`), so there is nothing to store on a server.

## Traditions included

| | Tradition | What she does |
|---|---|---|
| 🇮🇳 | **Maharashtra** (nauvari sari) | Salt, mustard & dry red chillies waved 7×, then a Kolhapuri **chappal**, then into the **fire**. The "no cough = strong nazar" test, *alabala* knuckle-cracking, and a black *teet* |
| 🇮🇳 | **Gujarat** (chaniya choli) | Mithu-rai-marcha, *ovaranaa*, kaalu tilu |
| 🇮🇳 | **Punjab** (salwar kameez, phulkari) | Waar ke mirchaan into the fire, *balaiyaan*, kaala teeka |
| 🇮🇳 | **Bengal** (laal-paar sari) | Nun-lonka burnt on coals, *balai shaat*, kalo tip, **conch** and ulu-ulu |
| 🇮🇳 | **South India** (Kanjeevaram sari) | Red aarti water with camphor, lime, then a **coconut smash** and thishti pottu |
| 🇮🇳 | **Rajasthan** (ghagra, odhani) | Rai-namak-mirch on glowing coals, *balaiyaan*, kaala teeka |
| 🌍 | **Turkey** | Üzerlik smoke and a **nazar boncuğu** pinned on you |
| 🌍 | **Italy** | Nonna's *malocchio* test: three drops of olive oil in water |
| 🌍 | **Mexico** | A *limpia* with an egg and rue & basil, egg cracked into a glass |
| 🌍 | **Brazil** | A *benzedeira* sweeps you with a rue (*arruda*) branch. It wilts as it absorbs the evil eye |
| 🌍 | **Iran** | Esfand seeds crackling on hot coals, *cheshm-e bad door* |
| 🌍 | **Japan** | Shinto *harae* with an ōnusa wand and purifying salt |

Every ritual line is shown in the local language **and** in English. Turn on the 🗣️ button to have the
browser read it aloud (uses a local voice for that language when the device has one, otherwise English).

> Folk traditions vary from family to family and village to village. These are light-hearted, respectful
> interpretations meant to make someone smile, and they're no substitute for real support when someone is struggling.

## Run locally

```bash
python3 -m http.server 8000   # or any static server
# open http://localhost:8000
```

(You can also just double-click `index.html`; everything works from `file://`.)

## Put it online so you can send links

Any static host works (GitHub Pages, Netlify, Cloudflare Pages, S3…).
With GitHub Pages: **Settings → Pages → Source: GitHub Actions**. The workflow in
`.github/workflows/pages.yml` publishes the site on every push to `main`.

## Adding a new tradition

Everything is data-driven, so add an entry to `js/data.js`:

- `woman`: costume (garment, colours, hair, jewellery, sleeves, drape)
- `scene`: backdrop (add new ones in `js/scenes.js`)
- `station`: `fire`, `bowl`, `glass`, `plain` or `none`
- `steps`: the script. Each step has a duration, a native + English line, hand motions (`pt`, `circle`, `sweep`, `path`), held props (`js/art.js → PROPS`), and events (`burst`, `poof`, `crack`, `smash`, …)

## Project layout

```
index.html        page shell
css/style.css     UI + SVG animation hooks
js/data.js        traditions: costumes, scenes, scripts, language lines
js/art.js         the woman, the person, nazar cloud, props, stations (all SVG)
js/scenes.js      painted backdrops
js/ritual.js      stage + timeline engine (IK arms, events, mood)
js/fx.js          canvas particles (sparks, smoke, petals, confetti…)
js/audio.js       synthesised sounds + optional speech
js/app.js         creator page, gate, end card, link sharing
```

Handy for development: `?to=Name&t=<id>&autostart=1&at=20` jumps straight into the ritual at second 20, paused.
