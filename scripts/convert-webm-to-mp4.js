// convert-webm-to-mp4.js
// Usage: node convert-webm-to-mp4.js input.webm output.mp4

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";

const execFileAsync = promisify(execFile);

async function convert(input, output) {
  if (!fs.existsSync(input)) {
    console.error(`Input file not found: ${input}`);
    process.exit(1);
  }

  const args = [
    "-y",             // overwrite output if exists
    "-i", input,      // input file
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    output,
  ];

  console.log("Running ffmpeg", args.join(" "));

  try {
    const { stdout, stderr } = await execFileAsync("ffmpeg", args);
    console.log(stdout);
    console.error(stderr);
    console.log(`✅ Converted to ${output}`);
  } catch (err) {
    console.error("❌ ffmpeg failed:", err);
  }
}

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  console.log("Usage: node convert-webm-to-mp4.js input.webm output.mp4");
  process.exit(1);
}

convert(input, output);