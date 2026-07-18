"use client"

import Link from "next/link"
import { ClipboardList, Store, UserRound } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Menu do perfil"
      >
        <Avatar size="sm" className="size-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
            <UserRound className="size-3.5" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                Visitante
              </span>
              <span className="text-xs text-muted-foreground">
                Sua conta neste cardápio
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href="/pedidos" />}
            className="cursor-pointer"
          >
            <ClipboardList />
            Meus pedidos
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/perfil" />}
            className="cursor-pointer"
          >
            <Store />
            Perfil da loja
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
