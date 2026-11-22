import { notFound } from "next/navigation";

import { getOrder } from "../_components/orders-data";
import { OrderDetailHeader } from "./_components/order-detail-header";
import { OrderItemsCard } from "./_components/order-items-card";
import { OrderAddressCard, OrderCustomerCard, OrderPaymentCard } from "./_components/order-side-cards";
import { OrderTimeline } from "./_components/order-timeline";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-4">
      <OrderDetailHeader order={order} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-8">
          <OrderItemsCard order={order} />
          <OrderTimeline order={order} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 xl:col-span-4">
          <OrderCustomerCard order={order} />
          <OrderAddressCard order={order} />
          <OrderPaymentCard order={order} />
        </div>
      </div>
    </div>
  );
}
