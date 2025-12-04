# 🎄 Christmas E-Card Generator

*A cozy little JavaScript + CSS holiday card with animated snow, pixel-art vibes, and lots of festive charm.*

<p align="left">
  <img 
    src="../assets/frosty.png"
    width="800"
    alt="Pixel art scene showing Santa Claus with his arm around a snowman, standing beside a decorated Christmas tree in a snowy landscape at night."
    title="Pixel Art Santa, Snowman, and Christmas Tree"
  >
</p>

[![GitHub stars](https://img.shields.io/github/stars/v-gajjar/ChristmasCard?style=social)](https://github.com/v-gajjar/ChristmasCard/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/v-gajjar/ChristmasCard?style=social)](https://github.com/v-gajjar/ChristmasCard/network/members)
[![GitHub issues](https://img.shields.io/github/issues/v-gajjar/ChristmasCard)](https://github.com/v-gajjar/ChristmasCard/issues)
![Snowflakes](https://img.shields.io/badge/snowflakes-300-blue?logo=snowflake)

This project started as some lighthearted seasonal fun — I wanted to play with Canvas animations, sprinkle in some CSS magic, and build something people could tweak and send to friends. It turned into a fully customizable Christmas e-card with falling snow, holiday characters, and a clean retro aesthetic.  

If you’re looking for a simple, joyful project to fork and make your own… this is it. ✨

---

## ❄️ Features

- **Animated snow** powered by an HTML5 Canvas (smooth, lightweight, and customizable)  
- **Pixel-art Christmas scene** (tree, lights, Santa/Frosty, cookies & hot cocoa)  
- **Customizable “From …” line** for personal messages  
- **Border styles**, **snow speed control**, and other fun visual tweaks  
- **Download as PNG** — perfect for sending to friends  
- **Optional WebM video recording** of the animated snow  
- Fully front-end; just open `index.html` and you’re good to go  

---

## 🛠️ How It Works

The falling snow effect is adapted from this great tutorial:  
https://dev.to/codebubb/javascript-snow-52im

I expanded it with:

- Dynamic snowflake generation (currently set to **300❄️**, see `NUMBER_OF_SNOWFLAKES` in `snow.js`)  
- High-DPI support for crisp snow on Retina/4K screens  
- Responsive layout  
- Customization controls for name, border, and snow speed  
- Optional video recording support using the Canvas capture API  

Everything runs in pure JavaScript — no frameworks required.

---

📁 Project Structure

Here’s a quick overview of the files in this repo and what each one does:

<details>
<summary>📁 Click to expand file structure</summary>

```plaintext
.
├── .gitignore
├── assets
│   ├── frosty.png
├── css
│   └── styles.css
├── images
│   ├── christmas_hat.svg
│   └── snow_scene.jpg
├── index.html
├── js
│   └── snow.js
├── README.md
└── scripts
    └── convert-webm-to-mp4.js
```

</details>

---

## 🎁 Getting Started

Clone or fork the repo:

```bash
git clone https://github.com/v-gajjar/ChristmasCard.git
cd ChristmasCard
```

Open `index.html` in your browser:

```bash
# macOS
open index.html

# Windows
start index.html

# Linux (GNOME-based)
xdg-open index.html
```

That’s it — the snow will start falling automatically. ❄️

---

## 🧰 Using the Conversion Script (WebM → MP4)

The browser can generate a WebM file of the animated snow, but some platforms prefer MP4.
To solve that, this project includes a tiny Node script using ffmpeg.

✅ Requirements

- Node.js installed
- ffmpeg installed
- macOS: brew install ffmpeg
- Ubuntu: sudo apt-get install ffmpeg
- Windows: install from https://ffmpeg.org/download.html￼

📦 Running the Script

Place your recorded WebM file in the project root (or adjust paths as needed).

Run:

```bash
node scripts/convert-webm-to-mp4.js input.webm output.mp4
```

Example:

```bash
node scripts/convert-webm-to-mp4.js christmas-snow.webm christmas-snow.mp4
```

If successful, you’ll see:

```bash
Running ffmpeg...
✅ Converted to christmas-snow.mp4
```

✨ Output

- input.webm → raw browser recording
- output.mp4 → high-compatibility MP4 suitable for sharing on any platform

---

🎅 Extra Notes on Recording

- The “Download Video (WebM)” button in the UI uses the HTML Canvas CaptureStream + MediaRecorder API.
- Recording duration defaults to 5 seconds, but you can tweak this in snow.js.
- The MP4 conversion is offline — nothing is uploaded.

---

## ✨ Make It Your Own

Want to:

- Swap in your own pixel characters?  
- Change the greeting text or background art?  
- Make the snow fall faster or slower?  
- Send different cards to different people?  

Do it! The project is intentionally simple and hackable.

The main logic lives in:

```text
index.html   → card markup + controls
styles.css   → layout + holiday styling
snow.js      → snow animation, sliders, and export logic
```

---

## 📸 Exporting Your Card

This project includes built-in export options:

- **Download PNG** — captures your entire card as an image  
- **Download Snow Video (WebM)** — records a short clip of the animation  

If you need MP4, you can convert the generated WebM with `ffmpeg`:

```bash
ffmpeg -i christmas-snow.webm \
  -c:v libx264 -preset veryfast -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  christmas-snow.mp4
```

---

## 🎅 Contributing

If you want to improve the pixel art, add new borders, introduce more characters, or expand the holiday chaos — feel free to open an issue or send a PR.  

Festive creativity welcome. 🎁

---

## 🌟 License

MIT — because holiday joy should be free.
