"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";
import { Lock } from "lucide-react";
import { type Control, Controller, useForm, useWatch } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { getOrderTotals } from "../../orders/_components/orders-data";
import { formatMoney } from "../../products/_components/products-data";
import {
  CHECKOUT_FORM_ID,
  type CheckoutValues,
  cart,
  checkoutSchema,
  deliveryOptions,
  formatCardNumber,
  formatExpiry,
  PROMO_RATE,
} from "./checkout-data";
import { CheckoutSuccess } from "./checkout-success";
import { CheckoutSummary } from "./checkout-summary";

type TextFieldName = Exclude<keyof CheckoutValues, "delivery" | "country">;

function TextField({
  control,
  name,
  label,
  className,
  format,
  ...inputProps
}: {
  control: Control<CheckoutValues>;
  name: TextFieldName;
  label: string;
  className?: string;
  format?: (value: string) => string;
} & Omit<React.ComponentProps<"input">, "name" | "className" | "form">) {
  const id = `checkout-${name}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className={cn("gap-1.5", className)} data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            {...field}
            {...inputProps}
            id={id}
            aria-invalid={fieldState.invalid}
            onChange={(event) => field.onChange(format ? format(event.target.value) : event.target.value)}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export function CheckoutFlow() {
  const [placed, setPlaced] = useState<{ values: CheckoutValues; total: number } | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      region: "",
      postalCode: "",
      country: "United States",
      delivery: "standard",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });

  const deliveryId = useWatch({ control: form.control, name: "delivery" });
  const delivery = deliveryOptions.find((option) => option.id === deliveryId) ?? deliveryOptions[0];
  const { subtotal } = getOrderTotals({ items: cart, discount: 0, shipping: 0 });
  const totals = getOrderTotals({
    items: cart,
    discount: discountCode ? Math.round(subtotal * PROMO_RATE) : 0,
    shipping: delivery.price,
  });

  async function onSubmit(values: CheckoutValues) {
    // Stand-in for the payment request.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setPlaced({ values, total: totals.total });
  }

  if (placed) {
    const option = deliveryOptions.find((item) => item.id === placed.values.delivery) ?? deliveryOptions[0];
    return <CheckoutSuccess values={placed.values} total={placed.total} delivery={option} />;
  }

  const { control } = form;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <form
        id={CHECKOUT_FORM_ID}
        noValidate
        className="flex min-w-0 flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Contact</CardTitle>
            <CardDescription>We&apos;ll send the receipt and tracking updates here.</CardDescription>
          </CardHeader>
          <CardContent>
            <TextField
              control={control}
              name="email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Shipping address</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <TextField control={control} name="firstName" label="First name" autoComplete="shipping given-name" />
              <TextField control={control} name="lastName" label="Last name" autoComplete="shipping family-name" />
              <TextField
                control={control}
                name="address"
                label="Street address"
                autoComplete="shipping address-line1"
                className="sm:col-span-2"
              />
              <TextField
                control={control}
                name="apartment"
                label="Apartment, suite, etc. (optional)"
                autoComplete="shipping address-line2"
                className="sm:col-span-2"
              />
              <TextField control={control} name="city" label="City" autoComplete="shipping address-level2" />
              <TextField
                control={control}
                name="region"
                label="State / Region"
                autoComplete="shipping address-level1"
              />
              <TextField control={control} name="postalCode" label="Postal code" autoComplete="shipping postal-code" />
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="checkout-country">Country</FieldLabel>
                    <NativeSelect
                      {...field}
                      id="checkout-country"
                      autoComplete="shipping country-name"
                      className="w-full"
                    >
                      <NativeSelectOption value="United States">United States</NativeSelectOption>
                      <NativeSelectOption value="Canada">Canada</NativeSelectOption>
                      <NativeSelectOption value="United Kingdom">United Kingdom</NativeSelectOption>
                    </NativeSelect>
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Delivery method</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="delivery"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} aria-label="Delivery method">
                  {deliveryOptions.map((option) => (
                    <FieldLabel key={option.id} htmlFor={`delivery-${option.id}`}>
                      <Field orientation="horizontal">
                        <RadioGroupItem value={option.id} id={`delivery-${option.id}`} />
                        <FieldContent>
                          <FieldTitle>{option.label}</FieldTitle>
                          <FieldDescription>{option.eta}</FieldDescription>
                        </FieldContent>
                        <span className="font-medium text-sm tabular-nums">
                          {option.price ? formatMoney(option.price) : "Free"}
                        </span>
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Payment</CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <Lock className="size-3.5" />
              Card details are encrypted and never stored on our servers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 sm:grid-cols-4">
              <TextField
                control={control}
                name="cardName"
                label="Name on card"
                autoComplete="cc-name"
                className="sm:col-span-4"
              />
              <TextField
                control={control}
                name="cardNumber"
                label="Card number"
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                format={formatCardNumber}
                className="sm:col-span-2"
              />
              <TextField
                control={control}
                name="expiry"
                label="Expiry"
                autoComplete="cc-exp"
                inputMode="numeric"
                placeholder="MM/YY"
                format={formatExpiry}
              />
              <TextField
                control={control}
                name="cvc"
                label="CVC"
                autoComplete="cc-csc"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                format={(value) => value.replace(/\D/g, "")}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      </form>

      <CheckoutSummary
        totals={totals}
        delivery={delivery}
        discountCode={discountCode}
        onDiscountChange={setDiscountCode}
        submitting={form.formState.isSubmitting}
      />
    </div>
  );
}
