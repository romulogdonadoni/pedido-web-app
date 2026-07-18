"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useStoreNav } from "@/lib/store/nav-context"

export default function NotFound() {
  const { href } = useStoreNav()

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        O item ou a página que você procurou não existe.
      </p>
      <Button render={<Link href={href("/")} />}>Voltar ao cardápio</Button>
    </div>
  )
}
