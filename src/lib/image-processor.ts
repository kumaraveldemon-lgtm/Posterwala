import sharp from "sharp";

export interface ProcessedDesignImages {
  thumbnailBuffer: Buffer;
  watermarkBuffer: Buffer;
  originalBuffer: Buffer;
  width: number;
  height: number;
  format: string;
}

/**
 * Creates an SVG watermark overlay with diagonal Posterwala branding
 */
function createWatermarkSvg(width: number, height: number): Buffer {
  const fontSize = Math.max(24, Math.round(width / 24));
  const spacing = fontSize * 5;

  let pattern = "";
  for (let y = -height; y < height * 2; y += spacing) {
    for (let x = -width; x < width * 2; x += spacing * 1.5) {
      pattern += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-weight="900" font-size="${fontSize}" fill="white" fill-opacity="0.22" transform="rotate(-30 ${x} ${y})">POSTERWALA</text>`;
    }
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        ${pattern}
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}

/**
 * Process a high-resolution design image:
 * 1. Read metadata
 * 2. Create a watermarked preview (max 1600px width/height)
 * 3. Create a fast thumbnail (600px width)
 */
export async function processDesignUpload(
  inputBuffer: Buffer
): Promise<ProcessedDesignImages> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const originalWidth = metadata.width || 1200;
  const originalHeight = metadata.height || 1200;

  // 1. Generate Watermark Preview (max 1600px)
  const watermarkWidth = Math.min(originalWidth, 1600);
  const resizedForWatermark = await sharp(inputBuffer)
    .resize({ width: watermarkWidth, withoutEnlargement: true })
    .toBuffer();

  const wmMeta = await sharp(resizedForWatermark).metadata();
  const wmSvg = createWatermarkSvg(wmMeta.width || watermarkWidth, wmMeta.height || 1200);

  const watermarkBuffer = await sharp(resizedForWatermark)
    .composite([
      {
        input: wmSvg,
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 85 })
    .toBuffer();

  // 2. Generate Thumbnail (max 600px width)
  const thumbnailBuffer = await sharp(inputBuffer)
    .resize({ width: 600, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return {
    thumbnailBuffer,
    watermarkBuffer,
    originalBuffer: inputBuffer,
    width: originalWidth,
    height: originalHeight,
    format: metadata.format || "jpeg",
  };
}

/**
 * Generate 300 DPI print-ready file with bleed (for Phase 4/5)
 * @param inputBuffer High-res original
 * @param targetWidthPx Target width in px at 300 DPI (including bleed)
 * @param targetHeightPx Target height in px at 300 DPI (including bleed)
 */
export async function generatePrintReadyBuffer(
  inputBuffer: Buffer,
  targetWidthPx: number,
  targetHeightPx: number
): Promise<Buffer> {
  return await sharp(inputBuffer)
    .resize(targetWidthPx, targetHeightPx, {
      fit: "cover",
      position: "centre",
    })
    .withMetadata({ density: 300 })
    .tiff({ compression: "lzw" }) // or high quality tiff/png
    .toBuffer();
}
