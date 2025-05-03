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
    const compositionConfigs = {
      fps: req.body.fps,
      width: req.body.width,
      height: req.body.height,
    };

    const codeConfigs = {
      steps: req.body.steps,
      theme: req.body.theme,
      language: req.body.language,
      fontFamily: req.body.fontFamily,
      fontSize: req.body.fontSize,
    };

    const entry = path.resolve('./remotion/index.tsx');
    console.log('[Render] Bundling entry:', entry);

    const bundleLocation = await bundle(entry, () => {
      console.log('[Render] Bundling...');
    });
    console.log('[Render] Bundle completed at:', bundleLocation);

    const compositions = await getCompositions(bundleLocation, {
      inputProps: codeConfigs,
    });

    const composition = compositions.find((c) => c.id === 'code-steps');
    if (!composition) {
      console.error('[Render] Composition not found');
      return res.status(404).send('Composition not found');
    }

    composition.defaultProps = codeConfigs
    composition.width = compositionConfigs.width;
    composition.height = compositionConfigs.height;
    composition.fps = compositionConfigs.fps;

    const outputPath = path.join(tmpdir(), `code-steps-${Date.now()}.mp4`);
    console.log('[Render] Output path:', outputPath);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
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
