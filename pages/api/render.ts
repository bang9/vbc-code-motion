// pages/api/render.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import path from 'path';
import { tmpdir } from 'os';
import fs from 'fs';
import { z } from 'zod';

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
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // zod로 입력값 검증 및 파싱
    const parseResult = RenderSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.log('zod error:', parseResult.error);
      return res.status(400).send('Invalid input');
    }
    const { fps, width, height, steps, theme, language, fontFamily, fontSize, format = 'video' } = parseResult.data;

    const compositionConfigs = { fps, width, height };
    const codeConfigs = { steps, theme, language, fontFamily, fontSize };

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

    // 포맷별 옵션 팩토리
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
    console.log('[Render] Output path:', outputPath);

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
      logLevel: 'verbose',
      inputProps: codeConfigs,
      ...(opts.imageFormat ? { imageFormat: opts.imageFormat } : {}),
      ...(opts.pixelFormat ? { pixelFormat: opts.pixelFormat } : {}),
      onBrowserLog: (log) => {
        console.log('[Render] browser log:', log.text);
      },
    });

    const buffer = fs.readFileSync(outputPath);
    res.setHeader('Content-Type', opts.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=code-steps.${opts.outputExt}`);
    res.send(buffer);

    // 임시 파일 삭제
    fs.unlinkSync(outputPath);
  } catch (err: any) {
    console.error('[Render Error]', err);
    res.status(500).send(err?.message || 'Render failed');
  }
}
