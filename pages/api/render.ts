// pages/api/render.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import path from 'path';
import { tmpdir } from 'os';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { steps, fps, width, height } = req.body;

    console.log('[Render] Incoming request with:', {
      stepsLength: steps?.length,
      fps,
      width,
      height,
    });

    const entry = path.resolve('./remotion/index.tsx');
    console.log('[Render] Bundling entry:', entry);

    const bundleLocation = await bundle(entry, () => {
      console.log('[Render] Bundling...');
    });
    console.log('[Render] Bundle completed at:', bundleLocation);

    const compositions = await getCompositions(bundleLocation, {
      inputProps: { steps },
    });

    const composition = compositions.find((c) => c.id === 'code-steps');
    if (!composition) {
      console.error('[Render] Composition not found');
      return res.status(404).send('Composition not found');
    }

    const outputPath = path.join(tmpdir(), `code-steps-${Date.now()}.mp4`);
    console.log('[Render] Output path:', outputPath);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { steps },
      logLevel: 'verbose',
      onBrowserLog: (log) => {
        console.log('[Render] browser log:', log.text);
      },
    });

    const buffer = fs.readFileSync(outputPath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename=code-steps.mp4');
    res.send(buffer);
  } catch (err) {
    console.error('[Render Error]', err);
    res.status(500).send('Render failed');
  }
}
