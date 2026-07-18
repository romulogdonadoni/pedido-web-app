import Link from "next/link"

export function TenantGate({ hint }: { hint: string }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center gap-4 px-6">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Cardápio digital
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Acesse pelo path do pedido
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Formato: <code>pedido.localhost:3001/&#123;tenant&#125;</code>
        </p>
        <code className="mt-3 block rounded-xl bg-muted px-3 py-2 text-xs break-all">
          {hint}
        </code>
      </div>
      <a
        href={hint}
        className="inline-flex h-10 items-center justify-center rounded-4xl bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        Abrir demo Cowboy Burger
      </a>
      <Link href="/" className="text-center text-sm text-muted-foreground hover:underline">
        Já estou no path — tentar de novo
      </Link>
    </div>
  )
}
