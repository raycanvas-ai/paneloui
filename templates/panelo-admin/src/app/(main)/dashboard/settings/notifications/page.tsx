import { DeliverySettings } from "./_components/delivery-settings";
import { NotificationMatrix } from "./_components/notification-matrix";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <NotificationMatrix />
      <DeliverySettings />
    </div>
  );
}
