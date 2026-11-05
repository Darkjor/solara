// Genera un video de hero (placeholder) a partir de renders: Ken Burns + fundidos, loop sin salto.
// Salida: public/video/hero.{webm,mp4}, hero-poster.webp, hero-movil.{webm,mp4}, hero-movil-poster.webp
// Uso:  FFMPEG=<ruta ffmpeg> FFPROBE=<ruta ffprobe> node scripts/build-hero-video.mjs <lareserve|solara>
// (ffmpeg-static / ffprobe-static se instalan fuera del repo; no son dependencias del proyecto.)
// Para cambiarlo por el video real: reemplazar los archivos de public/video/ con los mismos nombres.
import sharp from "sharp";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FFPROBE = process.env.FFPROBE || "ffprobe";
const site = process.argv[2];

const FPS = 24;
const SHOT = 3.2; // s visibles por plano (sin solape)
const FADE = 0.8; // s de fundido
// z: [zoom inicial, final] (max 1.07); px/py: posicion del recorte 0..1 al inicio/final.
const SITES = {
  lareserve: [
    { src: "_material/renders-2026-11/Renders la reserve/4.png", z: [1.0, 1.07], px: [0.3, 0.7], py: [0.5, 0.5] },
    { src: "_material/renders-2026-11/Renders la reserve/2.png", z: [1.07, 1.0], px: [0.6, 0.4], py: [0.5, 0.5] },
    { src: "public/img/hero-aerea.webp", z: [1.0, 1.07], px: [0.7, 0.3], py: [0.4, 0.5] },
    { src: "public/img/albercas.webp", z: [1.05, 1.0], px: [0.4, 0.6], py: [0.5, 0.5] },
    { src: "_material/renders-2026-11/Renders la reserve/INT sala cocina.png", z: [1.0, 1.07], px: [0.5, 0.5], py: [0.6, 0.45] },
  ],
  solara: [
    { src: ".materiales/Renders/Solara 1.png", z: [1.0, 1.07], px: [0.35, 0.65], py: [0.5, 0.5] },
    { src: ".materiales/Renders/Solara 2.png", z: [1.07, 1.0], px: [0.6, 0.4], py: [0.5, 0.5] },
    { src: "public/img/lifestyle-playa-pareja.webp", z: [1.0, 1.06], px: [0.5, 0.5], py: [0.55, 0.45] },
    { src: ".materiales/Renders/Solara 3.png", z: [1.0, 1.07], px: [0.65, 0.35], py: [0.5, 0.5] },
    { src: "public/img/render-fachada-1.webp", z: [1.06, 1.0], px: [0.4, 0.6], py: [0.5, 0.5] },
  ],
};
const shots = SITES[site];
if (!shots) throw new Error("Uso: node scripts/build-hero-video.mjs <lareserve|solara>");

const OUT = "public/video";
fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `hero-${site}-`));

function run(bin, args) {
  const r = spawnSync(bin, args, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`${bin} fallo:\n${r.stderr?.toString().slice(-1500)}`);
  return r.stdout.toString();
}
const size = (f) => fs.statSync(f).size;

async function build({ name, W, H, maxMB, crfWebm, crfMp4 }) {
  // 1) planos preparados al doble de resolucion (cover; en vertical sharp elige el centro de interes)
  const imgs = [];
  for (let i = 0; i < shots.length; i++) {
    const f = path.join(tmp, `${name}-${i}.jpg`);
    await sharp(shots[i].src)
      .resize(W * 2, H * 2, { fit: "cover", position: H > W ? sharp.strategy.attention : "centre", kernel: "lanczos3" })
      .jpeg({ quality: 95 })
      .toFile(f);
    imgs.push(f);
  }
  // 2) filtro: zoompan por plano + xfade encadenado; el primer plano se repite al final para cerrar el loop
  const order = [...shots.map((_, i) => i), 0];
  const inputs = [];
  const parts = [];
  order.forEach((si, k) => {
    const s = shots[si];
    const isTail = k === order.length - 1;
    const dur = isTail ? FADE + 0.2 : SHOT + FADE;
    const d = Math.round(dur * FPS);
    const n = `on/${d - 1}`;
    const z = `${s.z[0]}+(${s.z[1] - s.z[0]})*${n}`;
    const x = `(iw-iw/zoom)*(${s.px[0]}+(${s.px[1] - s.px[0]})*${n})`;
    const y = `(ih-ih/zoom)*(${s.py[0]}+(${s.py[1] - s.py[0]})*${n})`;
    inputs.push("-i", imgs[si]);
    parts.push(`[${k}:v]zoompan=z='${z}':x='${x}':y='${y}':d=${d}:s=${W}x${H}:fps=${FPS},format=yuv420p,setsar=1[v${k}]`);
  });
  let last = "v0";
  for (let k = 1; k < order.length; k++) {
    const off = (k * SHOT).toFixed(3);
    parts.push(`[${last}][v${k}]xfade=transition=fade:duration=${FADE}:offset=${off}[x${k}]`);
    last = `x${k}`;
  }
  const loopLen = shots.length * SHOT;
  const master = path.join(tmp, `${name}-master.mkv`);
  // se descartan los primeros FADE s (donde el final aun se mezcla) y se toma exactamente un ciclo
  run(FFMPEG, [
    "-y", ...inputs, "-filter_complex", parts.join(";"), "-map", `[${last}]`,
    "-ss", String(FADE), "-t", String(loopLen), "-r", String(FPS),
    "-c:v", "libx264", "-crf", "8", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-an", master,
  ]);
  // 3) codificacion final; sube el CRF hasta cumplir el peso maximo
  const limit = maxMB * 1024 * 1024;
  const enc = (ext, mk, start) => {
    const dest = path.join(OUT, `${name}.${ext}`);
    for (let crf = start; crf < start + 14; crf += 2) {
      run(FFMPEG, ["-y", "-i", master, "-an", ...mk(crf), dest]);
      if (size(dest) <= limit) return console.log(`${dest} crf=${crf} ${(size(dest) / 1048576).toFixed(2)} MB`);
    }
    throw new Error(`${dest} supera ${maxMB} MB`);
  };
  enc("webm", (crf) => ["-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0", "-deadline", "good", "-cpu-used", "2", "-row-mt", "1", "-pix_fmt", "yuv420p", "-g", "96"], crfWebm);
  enc("mp4", (crf) => ["-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-crf", String(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-g", "96"], crfMp4);
  // 4) poster = primer cuadro
  const png = path.join(tmp, `${name}-poster.png`);
  run(FFMPEG, ["-y", "-i", master, "-frames:v", "1", png]);
  await sharp(png).webp({ quality: 78, effort: 6 }).toFile(path.join(OUT, `${name}-poster.webp`));
}

await build({ name: "hero", W: 1920, H: 1080, maxMB: 3.5, crfWebm: 34, crfMp4: 26 });
await build({ name: "hero-movil", W: 1080, H: 1920, maxMB: 2.5, crfWebm: 34, crfMp4: 26 });

for (const f of fs.readdirSync(OUT).filter((x) => /^hero.*\.(webm|mp4)$/.test(x))) {
  const j = JSON.parse(run(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,width,height,r_frame_rate:format=duration", "-of", "json", path.join(OUT, f)]));
  console.log(f, j.streams[0].codec_name, `${j.streams[0].width}x${j.streams[0].height}`, j.streams[0].r_frame_rate, `${Number(j.format.duration).toFixed(2)}s`, `${(size(path.join(OUT, f)) / 1048576).toFixed(2)} MB`);
}
fs.rmSync(tmp, { recursive: true, force: true });
