import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

import { faqs } from "./pricing-data";

export function PricingFaq() {
  return (
    <Card>
      <CardContent className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-base">Frequently asked questions</h2>
          <p className="text-muted-foreground text-sm">
            Still unsure? Email{" "}
            <a href="mailto:billing@panelo.dev" className="text-primary underline-offset-4 hover:underline">
              billing@panelo.dev
            </a>{" "}
            and a human replies within a business day.
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue={faqs[0].question}>
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
