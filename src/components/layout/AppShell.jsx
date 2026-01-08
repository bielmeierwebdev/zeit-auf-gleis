
export default function AppShell() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4">
        <h1 className="text-xl font-semibold mb-6">
          ZeitAufGleis
        </h1>

        <nav className="flex flex-col gap-2">
          <a href="/">Kalender</a>
          <a href="/overview">Übersicht</a>
          <a href="/settings">Einstellungen</a>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        {/* Seiteninhalt */}
      </main>
    </div>
  )
}
