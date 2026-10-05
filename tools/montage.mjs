// Contact sheet. Uso: node tools/montage.mjs <out.png> <cols> <scale> img1 img2 ...
import sharp from "sharp";
const [out, cols, scale, ...files] = process.argv.slice(2);
const c = +cols, s = +scale;
const metas = await Promise.all(files.map((f) => sharp(f).metadata()));
const cw = Math.round(metas[0].width * s), ch = Math.round(metas[0].height * s);
const rows = Math.ceil(files.length / c);
const comps = await Promise.all(files.map(async (f, i) => ({ input: await sharp(f).resize(cw, ch).toBuffer(), left: (i % c) * (cw + 6), top: Math.floor(i / c) * (ch + 6) })));
await sharp({ create: { width: c * cw + (c - 1) * 6, height: rows * ch + (rows - 1) * 6, channels: 3, background: "#888" } }).composite(comps).png().toFile(out);
