'use client';

import { CodeEditor } from '@/components/editor/CodeEditor';
import { PreviewPlayer } from '@/components/preview/PreviewPlayer';
import { ToolBar } from '@/components/system/ToolBar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-8 gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Code motion</h1>
        <p className="text-muted-foreground">Extract your code changes as stunning animated transitions.</p>
      </div>
      <ToolBar />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <CodeEditor />
        <PreviewPlayer />
      </div>
    </main>
  );
}
