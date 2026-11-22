import { CurrentPlan } from "./_components/current-plan";
import { InvoicesTable } from "./_components/invoices-table";
import { PaymentDetails } from "./_components/payment-details";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <CurrentPlan />
      <PaymentDetails />
      <InvoicesTable />
    </div>
  );
}
