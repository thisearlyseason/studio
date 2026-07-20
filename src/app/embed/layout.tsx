export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-zinc-100 p-4 text-zinc-950 sm:p-8"><div className="mx-auto max-w-xl">{children}</div></main>;
}
