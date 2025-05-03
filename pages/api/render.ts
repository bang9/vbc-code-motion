// pages/api/render.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import path from 'path';
import { tmpdir } from 'os';
import fs from 'fs';
import { z } from 'zod';

import { Theme } from '@code-hike/lighter';
import { HighlightedCode, highlight } from 'codehike/code';

const RenderSchema = z.object({
  steps: z.array(z.string()).min(1),
  fps: z.coerce.number().int().min(1),
  width: z.coerce.number().int().min(1),
  height: z.coerce.number().int().min(1),
  theme: z.string(),
  language: z.string(),
  fontFamily: z.string(),
  fontSize: z.coerce.number().int().min(1),
  currentStep: z.coerce.number().int().optional(),
  format: z.enum(['video', 'gif', 'webm']).optional(),
  totalDurationSec: z.coerce.number(),
  scale: z.coerce.number().optional(),
  scheme: z.enum(['light', 'dark']).optional().default('light'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const parseResult = RenderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).send('Invalid input');
    }

    const {
      fps,
      width,
      height,
      steps,
      theme,
      language,
      fontFamily,
      fontSize,
      format = 'video',
      totalDurationSec,
      scale = format === 'gif' ? 1 : 2,
      scheme,
    } = parseResult.data;

    const highlightedSteps: HighlightedCode[] = await Promise.all(
      steps.map((v) => highlight({ lang: language, value: v, meta: '' }, theme as unknown as Theme)),
    );

    const compositionConfigs = { fps, width, height };
    const codeConfigs = {
      fps,
      steps,
      highlightedSteps,
      theme,
      language,
      fontFamily,
      fontSize,
      totalDurationSec,
      scheme,
    };

    if (format === 'gif') {
      const limitedFps = Math.max(Math.min(fps, 50), 30);
      compositionConfigs.fps = limitedFps;
      codeConfigs.fps = limitedFps;
    }

    const entry = path.resolve('./src/components/preview/DownloadPlayer.tsx');
    const bundleLocation = await bundle(entry, undefined);
    const compositions = await getCompositions(bundleLocation, {
      inputProps: codeConfigs,
    });
    const composition = compositions.find((c) => c.id === 'code-steps');
    if (!composition) {
      return res.status(404).send('Composition not found');
    }

    const formatOptions = {
      video: {
        codec: 'h264' as const,
        imageFormat: undefined,
        pixelFormat: undefined,
        outputExt: 'mp4',
        contentType: 'video/mp4',
      },
      gif: {
        codec: 'gif' as const,
        imageFormat: 'png' as const,
        pixelFormat: undefined,
        outputExt: 'gif',
        contentType: 'image/gif',
      },
      webm: {
        codec: 'vp8' as const,
        imageFormat: 'png' as const,
        pixelFormat: 'yuva420p' as const,
        outputExt: 'webm',
        contentType: 'video/webm',
      },
    };

    const opts = formatOptions[format] ?? formatOptions.video;
    const outputPath = path.join(tmpdir(), `code-steps-${Date.now()}.${opts.outputExt}`);

    await renderMedia({
      composition: {
        ...composition,
        width: compositionConfigs.width,
        height: compositionConfigs.height,
        fps: compositionConfigs.fps,
        defaultProps: codeConfigs,
      },
      serveUrl: bundleLocation,
      codec: opts.codec,
      outputLocation: outputPath,
      inputProps: codeConfigs,
      ...(opts.imageFormat ? { imageFormat: opts.imageFormat } : {}),
      ...(opts.pixelFormat ? { pixelFormat: opts.pixelFormat } : {}),
      scale,
    });

    const buffer = fs.readFileSync(outputPath);
    res.setHeader('Content-Type', opts.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=code-steps.${opts.outputExt}`);
    res.send(buffer);
    fs.unlinkSync(outputPath);
  } catch (err: any) {
    console.log('err', err);
    res.status(500).send(err?.message || 'Render failed');
  }
}
