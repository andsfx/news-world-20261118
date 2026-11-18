#!/usr/bin/env node
/**
 * Entrypoint untuk bounty make.fun news-image-20261118.
 *
 * Alur kerja program ini cuma satu arah:
 *   validate (entry.png) -> stage (ke output dir).
 *
 * Validasi yang dilakukan sebelum copy:
 *   - file harus ada di sebelah main.ts dan bisa dibaca
 *   - 8 byte pertama harus signature PNG
 *   - chunk pertama wajib IHDR, lebar/tinggi dibaca manual dari buffer
 *   - dimensi wajib 1024x1024
 *   - ukuran file wajib di bawah 1 MiB
 *
 * Target output dibaca dari env MAKEFUN_OUTPUT_DIR; kalau kosong,
 * fallback ke /output. Program ini tidak menyentuh network sama sekali.
 */
import { access, copyFile, mkdir, open, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const MAX_BYTES = 1024 * 1024;
const WANTED_SIDE = 1024;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function say(line) {
  process.stderr.write(`[news-image] ${line}\n`);
}

function bail(line) {
  say(`FATAL: ${line}`);
  process.exit(1);
}

async function sniffDimensions(filePath) {
  const handle = await open(filePath, 'r');
  try {
    const head = Buffer.alloc(24);
    const { bytesRead } = await handle.read(head, 0, head.length, 0);
    if (bytesRead < head.length) {
      throw new Error('file terlalu kecil untuk jadi PNG');
    }
    if (!head.subarray(0, 8).equals(PNG_SIGNATURE)) {
      throw new Error('signature PNG tidak dikenali');
    }
    const firstChunk = head.subarray(12, 16).toString('ascii');
    if (firstChunk !== 'IHDR') {
      throw new Error(`chunk pertama harus IHDR, dapat ${firstChunk}`);
    }
    return {
      width: head.readUInt32BE(16),
      height: head.readUInt32BE(20),
    };
  } finally {
    await handle.close();
  }
}

async function stageEntry() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, 'entry.png');
  const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

  await access(source, constants.R_OK).catch(() => {
    bail(`entry.png tidak ditemukan atau tidak bisa dibaca: ${source}`);
  });

  const { size } = await stat(source);
  const { width, height } = await sniffDimensions(source);

  if (width !== WANTED_SIDE || height !== WANTED_SIDE) {
    bail(`dimensi entry.png harus ${WANTED_SIDE}x${WANTED_SIDE}, dapat ${width}x${height}`);
  }
  if (size > MAX_BYTES) {
    bail(`ukuran entry.png ${size} byte, melewati batas ${MAX_BYTES} byte`);
  }

  await mkdir(targetDir, { recursive: true });
  const target = join(targetDir, 'entry.png');
  await copyFile(source, target);

  say(`OK: ${width}x${height} PNG, ${size} byte -> ${target}`);
}

stageEntry().catch((error) => {
  bail(error instanceof Error ? error.message : String(error));
});
