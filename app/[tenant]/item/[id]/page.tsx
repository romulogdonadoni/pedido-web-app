import { redirect } from "next/navigation"

type Props = { params: Promise<{ tenant: string; id: string }> }

/** Legacy deep links → store home (product opens via dialog). */
export default async function ItemRoute({ params }: Props) {
  const { tenant } = await params
  redirect(`/${tenant.trim().toLowerCase()}`)
}
