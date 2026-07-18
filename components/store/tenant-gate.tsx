export function TenantGate() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center gap-4 px-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Cardápio digital
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Informe o tenant no path
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Formato: <code>/{`{tenant}`}</code>
        </p>
      </div>
    </div>
  )
}
