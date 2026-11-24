// Panelo's legal pages, one entry per /legal/<doc>. Plain language on purpose: a buyer should be able to
// read every page in a minute.

export type LegalDoc = { slug: string; title: string; intro: string; sections: { heading: string; body: string[] }[] };

export const LEGAL_UPDATED = "24 November 2026";
export const SUPPORT_EMAIL = "support@paneloui.com";
const CONTACT = `email ${SUPPORT_EMAIL}`;

export const LEGAL: LegalDoc[] = [
  {
    slug: "licence",
    title: "Licence",
    intro: "What each plan lets you do with Panelo's code. The short version: build anything, for anyone; don't resell the source itself.",
    sections: [
      {
        heading: "Free components and the free template",
        body: ["MIT licensed, like the repository. Use them anywhere, for anything, including client and commercial work."],
      },
      {
        heading: "1 Year of Updates and Lifetime Access",
        body: [
          "One developer. Use Pro components, pages and templates in unlimited projects: your own, your employer's and your clients', commercial or not.",
          "1 Year of Updates includes new Pro releases and downloads for 12 months from purchase. Lifetime has no end date. On either plan, everything you installed stays yours.",
        ],
      },
      {
        heading: "Unlimited for Startups",
        body: ["The same rights for up to five developers in one company or team, sharing one licence."],
      },
      {
        heading: "On every paid plan",
        body: [
          "Ship Pro code inside the products you build. Don't redistribute or resell the Pro source itself: not as a component library, UI kit, template or theme, not in a public repository, and not through a tool that generates code from it.",
          "Your licence key is for your own use. Keep it out of public repositories and share it only with the developers your plan covers.",
          "A refunded or charged-back payment ends the licence and its key.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    intro: "The terms for using paneloui.com and buying Panelo Pro.",
    sections: [
      {
        heading: "Who sells Pro",
        body: [
          "Payments are handled by Dodo Payments, our merchant of record: they process the payment, charge any sales tax or VAT, and issue your invoice. Their checkout terms apply to the payment itself.",
          "Prices are in US dollars and paid once. There is no subscription and nothing renews.",
        ],
      },
      {
        heading: "Your account and licence",
        body: [
          "You sign in with GitHub or Google. A purchase is tied to the email you paid with and appears in your account when you sign in with that address.",
          "What you may do with the code is set out in the licence. Keep your licence key private; you can replace it from your account page at any time.",
        ],
      },
      {
        heading: "Fair use",
        body: [
          "Don't try to get Pro code without a licence, overload the site or its registry, or use the agent demo to generate harmful content. We may suspend keys or accounts used this way.",
        ],
      },
      {
        heading: "The software",
        body: [
          "Panelo is provided as is. We work to keep it correct and the site available, but we don't guarantee either, and we aren't liable for indirect or consequential losses. Our total liability is limited to what you paid us in the 12 months before a claim.",
          "Nothing here limits rights that your local consumer law gives you.",
        ],
      },
      {
        heading: "Changes and contact",
        body: [`If these terms change, the date above changes with them; what you bought stays covered by the terms you bought it under. Questions: ${CONTACT}.`],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy",
    intro: "What paneloui.com keeps about you, why, and who else handles it. We keep as little as the product allows.",
    sections: [
      {
        heading: "What we keep",
        body: [
          "Your account: name, email address and avatar from GitHub or Google, and the id of that sign-in account. We don't keep their access tokens.",
          "Your licences: the Dodo payment id, plan, email paid with, and a one-way fingerprint of your key. The key itself is never stored.",
          "A session cookie while you're signed in. Your light or dark choice lives in your browser's storage. There are no analytics or advertising trackers.",
        ],
      },
      {
        heading: "What we don't",
        body: [
          "Card details: they go to Dodo Payments and never reach us.",
          "Access logs: we don't keep them. Your IP address is held in memory for up to 10 minutes, to rate-limit checkout and the registry.",
        ],
      },
      {
        heading: "The agent demo",
        body: ["What you type to the demo assistant is sent to Groq to produce its reply. Don't type personal information there."],
      },
      {
        heading: "Who handles it",
        body: [
          "Hetzner (our server, Germany), Supabase (our database, Frankfurt), Dodo Payments (payments and invoices), GitHub and Google (sign-in), Groq (the demo assistant) and Cloudflare (DNS). Each only gets what its job needs.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          `Ask for a copy of your data, or for your account to be deleted: ${CONTACT}. Payment records are kept by Dodo Payments for as long as tax law requires.`,
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refunds",
    intro: "All sales are final. Once you've paid for Pro, there are no refunds.",
    sections: [
      {
        heading: "Why",
        body: ["Pro is source code, delivered the moment you pay. Code can't be handed back, so a sale can't be taken back."],
      },
      {
        heading: "Try everything first",
        body: [
          "Every free component, every component preview, the free template and the live agent demo are open to anyone. Buy once you're sure Pro fits.",
        ],
      },
      {
        heading: "If something goes wrong",
        body: [
          "Charged twice for the same plan? The extra charge is reversed: that's a billing mistake, not a refund.",
          `Can't get your key or install Pro? Email ${SUPPORT_EMAIL} and we'll fix your access.`,
          "Disputing or charging back a payment ends the licence and its key.",
          "Nothing here limits rights that your local consumer law gives you.",
        ],
      },
    ],
  },
];

export const legalDoc = (slug: string) => LEGAL.find((d) => d.slug === slug);
