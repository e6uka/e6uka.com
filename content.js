window.PORTFOLIO = {
  sample: true,

  name: "Chukwuebuka Clinton Okeke",
  role: "Frontend engineer",
  headline: "I’ve built web and mobile products for fintech, e-commerce and healthcare, with code that stays clean as they grow.",
  availability: "Based in Lagos, Nigeria. Open to product frontend roles, remote or on-site.",
  bio: [
    "I'm a frontend engineer who builds products end to end across web and mobile: storefronts and the back offices behind them, multi-tenant banking on web and app, and now a hospital records system.",
    "What I care about most is code that scales with the product. Shared components, clear boundaries between tenants, and a codebase a new teammate can find their way around quickly.",
    "On the web I work in React, Next.js and Vite. On mobile, React Native and Flutter. I'm now learning backend development from scratch on Medly, so I understand the API on the other side of the screen.",
  ],

  email: "clintonokeke56@gmail.com",
  cv: "",
  links: [
    { label: "GitHub", href: "https://github.com/e6uka" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/chukwuebuka-okeke-3ba66123a/" },
  ],

  projects: [
    {
      short: "medly",
      name: "Medly",
      summary: "A multi-tenant hospital and patient records system I'm building end to end on my own: the brand and logo, the product design and the frontend, plus the backend, which I'm learning from scratch as I go. Each hospital gets its own workspace for patients, records and staff.",
      role: "Brand, design, frontend, learning backend",
      year: "2026, in progress",
      stack: [],
      image: "",
      links: [],
    },
    {
      short: "marketsquare",
      name: "Marketsquare",
      summary: "Online shop and back office for Marketsquare, a supermarket chain growing across Nigeria. Shoppers pick their nearest branch and shop its own catalogue and prices. I designed most of the screens within the existing brand, then built them from scratch in an MVVM structure: each screen's logic lives in its own view-model hook, with Paystack checkout and Google Places addresses.",
      role: "Screen design and frontend",
      year: "2025 - 2026",
      stack: ["React", "TypeScript", "Vite", "TanStack Query", "Zustand", "Tailwind CSS"],
      image: "assets/marketsquare.png",
      alt: "Marketsquare storefront for the Purple Lekki store: product search, category menu, a Shop Everything You Need banner and a row of hot products with prices in naira.",
      links: [{ label: "Live site", href: "https://moneysquare.ng" }],
    },
    {
      short: "finlake cib",
      name: "Finlake Corporate Internet Banking",
      summary: "The web service businesses bank through on Finlake, a modular banking platform where each bank runs on the same codebase with its own data and branding. Data-heavy screens with large grids, charts, spreadsheet import and export, and OTP-protected actions, organised in MVVM with a CI check that enforces the pattern.",
      role: "Frontend engineer",
      year: "2026",
      stack: ["React", "TypeScript", "Redux Toolkit", "TanStack Query", "AG Grid", "shadcn/ui"],
      image: "",
      links: [{ label: "Product site", href: "https://finlake.tech" }],
    },
    {
      short: "finlake app",
      name: "Finlake Mobility",
      summary: "Finlake's mobile banking apps, part of the platform's Mobility Suite, built in Flutter for the same multi-bank setup as the web services.",
      role: "Mobile engineer",
      year: "2026",
      stack: ["Flutter", "Dart"],
      image: "",
      links: [{ label: "Product site", href: "https://finlake.tech" }],
    },
    {
      short: "vertex labs",
      name: "Vertex Labs",
      summary: "Brand and website for Vertex Labs, a cloud and software engineering firm, designed from scratch: the logo, the visual identity and every page, then built and shipped with analytics to see which sections turn visits into enquiries.",
      role: "Logo, design and frontend",
      year: "2026",
      stack: ["React", "Vite", "Tailwind CSS", "PostHog"],
      image: "assets/vertex-labs.png",
      alt: "Vertex Labs home page: the headline Your systems were built for a company you've outgrown, beside a diagram of a web app, API, job worker, legacy billing and Postgres with four problem areas circled.",
      links: [
        { label: "Live site", href: "https://vertex-labs.org" },
        { label: "Source", href: "https://github.com/e6uka/vertex-labs" },
      ],
    },
  ],

  skills: [
    { group: "Web", items: ["React", "TypeScript", "Next.js", "Vite", "Tailwind CSS"] },
    { group: "Data and state", items: ["TanStack Query", "Redux Toolkit", "Zustand", "React Hook Form", "Zod"] },
    { group: "Mobile", items: ["Flutter", "Dart", "React Native"] },
    { group: "Practice", items: ["MVVM architecture", "Multi-tenant apps", "Payments (Paystack)", "CI/CD on AWS and Azure DevOps"] },
  ],

  experience: [],
};
