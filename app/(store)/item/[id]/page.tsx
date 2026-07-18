import { redirect } from "next/navigation"

type Props = { params: Promise<{ id: string }> }

/** Legacy deep links → home (product opens via dialog). */
export default async function ItemRoute({ params }: Props) {
  await params
  redirect("/")
}
