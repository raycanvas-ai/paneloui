import { cn } from '@/components/panelo/lib/utils'

import { budget, card, cardTitle, money } from './finance-data'

/** Current Budget (dashboard-pages/eight): the lines as a legend, then the same split as one proportional bar. */
export function BudgetCard({ className }: { className?: string }) {
    return (
        <section aria-labelledby="budget-title" className={cn(card, 'flex h-full flex-col p-4.5', className)}>
            <h2 id="budget-title" className={cardTitle}>
                Current Budget
            </h2>

            <dl className="mt-5 flex flex-col gap-3.5">
                {budget.map((b) => (
                    <div key={b.label} className="flex items-center gap-2.5 text-xs leading-4">
                        <span className={cn('size-2.5 shrink-0 rounded-[3px]', b.tone)} aria-hidden="true" />
                        <dt className="flex-1 truncate text-foreground/70">{b.label}</dt>
                        <dd className="font-mono font-semibold">{money(b.value)}</dd>
                    </div>
                ))}
            </dl>

            <div className="min-h-6 flex-1" aria-hidden="true" />

            {/* Proportional, with a floor so the smallest line stays visible. */}
            <div role="img" aria-label={`Budget split: ${budget.map((b) => `${b.label} ${money(b.value)}`).join(', ')}`} className="flex h-9.5 gap-1">
                {budget.map((b) => (
                    <span key={b.label} className={cn('min-w-3 rounded-[4px]', b.tone)} style={{ flexGrow: b.value, flexBasis: 0 }} />
                ))}
            </div>
        </section>
    )
}
