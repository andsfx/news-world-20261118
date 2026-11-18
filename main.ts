// news-image-20261118 entry (Node 22, standard library only).
// The image is the entry.png beside this file; the program copies it to the output dir.
// Local run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const src = new URL('./entry.png', import.meta.url);
if (!existsSync(src)) {
  console.error(`entry.png not found beside main.ts (${src.pathname})`);
  process.exit(1);
}

const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
if (!existsSync(out)) mkdirSync(out, { recursive: true });
copyFileSync(src, join(out, 'entry.png'));
