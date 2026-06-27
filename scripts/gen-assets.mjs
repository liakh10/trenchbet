import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "/Users/artem/Desktop/3b823d90-3435-4c1b-a907-6410515adfa2.png";

async function main() {
  // Favicon (square) — Next.js App Router auto-serves app/icon.png
  await sharp(SRC).resize(256, 256, { fit: "cover" }).png({ compressionLevel: 9 }).toFile(join(root, "app/icon.png"));
  await sharp(SRC).resize(180, 180, { fit: "cover" }).png().toFile(join(root, "app/apple-icon.png"));

  // Blurred + darkened background for the start gate and overall lobby
  await sharp(SRC)
    .resize(1400, 1400, { fit: "cover" })
    .blur(34)
    .modulate({ brightness: 0.6, saturation: 1.05 })
    .jpeg({ quality: 78 })
    .toFile(join(root, "public/bg-blur.jpg"));

  console.log("assets generated: app/icon.png, app/apple-icon.png, public/bg-blur.jpg");
}
main().catch((e) => { console.error(e); process.exit(1); });
