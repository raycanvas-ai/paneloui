/* Profile page data: one person, their links and the case studies they show. Swap these to reuse the page. */

export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const person = {
    first: 'Mina',
    name: 'Mina Winkel',
    tagline: 'I’m a Product Designer based in Melbourne.',
    avatar: '/avatars/ann-press.webp',
    banner: '/carousel/floral.webp',
    verified: true,
    online: true,
    replies: 'Usually replies within a few hours',
    location: 'Melbourne, Australia',
    website: 'minawinkel.com',
    email: 'hello@minawinkel.com',
    experience: 'I specialise in UX/UI design, brand strategy, and Webflow development.',
    about: [
        'I’m a Product Designer based in Melbourne, Australia. I specialise in UX/UI design, brand strategy, and Webflow development. I’m always striving to grow and learn something new and I don’t take myself too seriously.',
    ],
    /** Shown after "Read more". */
    more: [
        'Before going independent I led design at two early-stage startups, taking each from first wireframes to a product used by thousands of teams every week.',
        'Today I work with a handful of clients a year, usually from the first research interview through to a shipped, documented design system.',
    ],
    featured: ['Typewolf', 'Mindsparkle Magazine', 'Webflow', 'Fonts In Use', 'CSS Winner', 'httpster', 'Siteinspire', 'Best Website Gallery'],
}

export const SKILLS = ['UX Design', 'Product Design', 'Webflow', 'Figma'] as const
export type Skill = (typeof SKILLS)[number]

export type CaseStudy = {
    id: 'dropbox' | 'framer' | 'square' | 'linear' | 'vercel'
    brand: string
    title: string
    summary: string
    role: string
    year: number
    skills: Skill[]
    url: string
}

export const caseStudies: CaseStudy[] = [
    { id: 'dropbox', brand: 'Dropbox', title: 'A calmer home for every file', summary: 'Reworked the landing and onboarding flow so new teams reach their first shared folder in half the steps.', role: 'Lead product designer', year: 2025, skills: ['UX Design', 'Product Design'], url: 'https://dropbox.com' },
    { id: 'framer', brand: 'Framer', title: 'Templates that sell themselves', summary: 'Designed and built a template collection in Framer that became a top seller in its first month.', role: 'Designer and builder', year: 2025, skills: ['Product Design', 'Figma'], url: 'https://framer.com' },
    { id: 'square', brand: 'Square', title: 'Checkout for small sellers', summary: 'Simplified the seller dashboard and checkout settings for owners running a shop from their phone.', role: 'UX designer', year: 2024, skills: ['UX Design', 'Figma'], url: 'https://squareup.com' },
    { id: 'linear', brand: 'Linear', title: 'Triage without the noise', summary: 'Explored a quieter inbox for issue triage: grouping, snoozing and keyboard-first review.', role: 'Product design contract', year: 2024, skills: ['Product Design', 'Figma'], url: 'https://linear.app' },
    { id: 'vercel', brand: 'Vercel', title: 'A launch site in a week', summary: 'Designed and shipped a Webflow launch site for a new product, from brand moodboard to live.', role: 'Brand and Webflow', year: 2023, skills: ['Webflow', 'UX Design'], url: 'https://vercel.com' },
]

export const LISTS = ['Shortlist', 'Melbourne designers', 'Webflow experts']
