import Link from "next/link"
import { Search, UtensilsCrossed } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <UtensilsCrossed className="size-7 text-muted-foreground" />
      </div>

      <div className="max-w-sm space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Erro 404
        </p>
        <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
          Página não encontrada
        </h1>
        <p className="text-sm text-muted-foreground">
          Esse endereço não existe ou o item saiu do cardápio. Volte ao início
          ou busque o que você quer pedir.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center">
        <Button size="lg" render={<Link href="/" />}>
          Voltar ao cardápio
        </Button>
        <Button
          size="lg"
          variant="outline"
          render={<Link href="/busca" />}
        >
          <Search className="size-4" />
          Buscar itens
        </Button>
      </div>
    </div>
  )
}
