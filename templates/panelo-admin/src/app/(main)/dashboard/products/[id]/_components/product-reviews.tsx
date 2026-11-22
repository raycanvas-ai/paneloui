import { format, parseISO } from "date-fns";
import { Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

import { getReviews, type Product } from "../../_components/products-data";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className={value <= rating ? "size-3.5 fill-current text-warning" : "size-3.5 text-muted-foreground/40"}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  const reviews = getReviews(product);
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Recent reviews</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span className="text-foreground tabular-nums">{average.toFixed(1)}</span>
          <Stars rating={Math.round(average)} />
          <span>from the latest {reviews.length}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y">
          {reviews.map((review) => (
            <li key={review.author} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar size="sm">
                <AvatarFallback>{getInitials(review.author)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-sm">{review.author}</span>
                  <Stars rating={review.rating} />
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {format(parseISO(review.date), "d MMM yyyy")}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{review.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
