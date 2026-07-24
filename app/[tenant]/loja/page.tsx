import { redirect } from "next/navigation"

type Props = { params: Promise<{ tenant: string }> }

/** Legacy /{tenant}/loja → /{tenant} */
export default async function LojaAliasRoute({ params }: Props) {
  const { tenant } = await params
  redirect(`/${tenant.trim().toLowerCase()}`)
}
