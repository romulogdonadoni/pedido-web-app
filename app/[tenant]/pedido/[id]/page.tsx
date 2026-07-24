import type { Metadata } from "next"

import { OrderReceipt } from "@/components/orders/order-receipt"

type Props = { params: Promise<{ tenant: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: id }
}

export default async function PedidoRoute({ params }: Props) {
  const { id } = await params
  return <OrderReceipt orderId={id} />
}
