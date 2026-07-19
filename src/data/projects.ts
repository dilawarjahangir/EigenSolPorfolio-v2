export type ProjectCategory = 'Web' | 'Mobile' | 'AI/ML';
export type ProjectStatus = 'Active' | 'Archived';

export type PortfolioProject = {
  id: string;
  title: string;
  primaryCategory: ProjectCategory;
  description: string;
  tags: string[];
  coreTechnologies?: string[];
  coverImage?: string;
  galleryImages: string[];
  imageAspectRatio?: string;
  liveUrl?: string;
  liveLinks?: Array<{
    label: string;
    url: string;
  }>;
  role: string;
  status: ProjectStatus;
  clientName: string;
  featured: boolean;
  caseStudy?: {
    overview: string[];
    challenge: string[];
    solution: string[];
    features: Array<{
      title: string;
      description: string;
    }>;
    architecture?: string[];
    impact: string[];
  };
};

const skillLabelMap: Record<string, string> = {
  ReactJS: 'React',
  TailwindCSS: 'Tailwind CSS',
  'Express 5': 'Express',
  'OpenAI API': 'OpenAI',
  'JWT Authentication': 'JWT Auth',
  'Material-UI': 'Material UI',
  MLops: 'MLOps',
};

const normalizeLink = (link: string) => {
  const trimmed = link.trim();

  if (!trimmed || trimmed.toLowerCase() === 'nill') {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const normalizeStatus = (status: string): ProjectStatus =>
  status === 'continued' ? 'Active' : 'Archived';

const asset = (path: string) => encodeURI(path);

const deriveTags = (skills: string[]) => {
  const seen = new Set<string>();
  const tags: string[] = [];

  skills.forEach((skill) => {
    const label = skillLabelMap[skill] ?? skill;
    const key = label.toLowerCase();

    if (seen.has(key) || tags.length >= 4) {
      return;
    }

    seen.add(key);
    tags.push(label);
  });

  return tags;
};

const allProjects: PortfolioProject[] = [
  {
    id: 'htask',
    title: 'HTask',
    primaryCategory: 'AI/ML',
    description:
      'Voice assistants used to manage and track hotel reception workflows such as bookings, check-ins, room service, food ordering, and complaint handling.',
    tags: deriveTags([
      'Python',
      'React',
      'ReactJS',
      'Laravel',
      'PHP',
      'Neo4j',
      'MySQL',
      'JavaScript',
      'TypeScript',
    ]),
    coverImage: asset('/projects/htask/htask-cover.webp'),
    galleryImages: [
      asset('/projects/htask/htask-cover.webp'),
      asset('/projects/htask/htask-panel-2.webp'),
      asset('/projects/htask/htask-room-booking.webp'),
      asset('/projects/htask/htask-payment.webp'),
      asset('/projects/htask/Screenshot 2026-03-18 193813.webp'),
      asset('/projects/htask/Screenshot 2026-03-18 193947.webp'),
      asset('/projects/htask/Screenshot 2026-03-18 194044.webp'),
    ],
    liveUrl: normalizeLink('https://entaai.net'),
    role: 'Full-Stack Developer',
    status: normalizeStatus('continued'),
    clientName: 'Saad',
    featured: true,
  },
  {
    id: 'hmc-holding',
    title: 'HMC Holding',
    primaryCategory: 'Web',
    description:
      'Multi-page React/Vite website for a UAE-focused consulting group, combining structured service discovery, inquiry funnels, calculators, gated live Dubai projects map access, blog content, SEO tooling, and a standalone mail backend.',
    tags: deriveTags([
      'React 19',
      'React Router 7',
      'Vite 8',
      'Tailwind CSS 4',
      'JavaScript',
      'GSAP 3',
      'Lenis',
      'Motion',
      'Swiper',
      'Lucide React',
      'REST API',
    ]),
    coreTechnologies: [
      'React 19',
      'Vite 8',
      'Tailwind CSS 4',
      'React Router DOM 7',
      'React Helmet Async',
      'GSAP',
      'Motion',
      'Lenis',
      'Swiper',
      'Lucide React',
      'Puppeteer Core',
      'Node.js',
      'Express 5',
      'Nodemailer',
      'CORS',
      'dotenv',
      'Custom Validators',
      'SMTP Email',
      'Sitemap Generation',
      'Vercel',
    ],
    coverImage: asset('/projects/hmc-holding/Screenshot 2026-03-18 201158.webp'),
    galleryImages: [
      asset('/projects/hmc-holding/Screenshot 2026-03-18 201158.webp'),
      asset('/projects/hmc-holding/Screenshot 2026-03-18 201323.webp'),
      asset('/projects/hmc-holding/Screenshot 2026-03-18 201352.webp'),
      asset('/projects/hmc-holding/Screenshot 2026-03-18 201456.webp'),
      asset('/projects/hmc-holding/Screenshot 2026-03-18 201548.webp'),
      asset('/projects/hmc-holding/Screenshot 2026-03-18 201625.webp'),
      asset('/projects/hmc-holding/Screenshot 2026-03-18 201711.webp'),
    ],
    liveUrl: normalizeLink('https://hmc-holding.com'),
    role: 'Frontend Engineer',
    status: normalizeStatus('continued'),
    clientName: 'HMC Holding',
    featured: true,
    caseStudy: {
      overview: [
        'HMC Holding was built as a multi-page digital platform for a UAE-focused consulting, real-estate, corporate advisory, visa, and investment services group.',
        'The project translates a broad service offering into clear user journeys, helping visitors move from brand discovery into service exploration, calculator-assisted planning, gated project-map access, and structured inquiry submission.',
      ],
      challenge: [
        'The client needed to present many service lines without overwhelming visitors, including company formation, business advisory, real estate, corporate advisory, visa services, legal support, calculators, and project discovery.',
        'HMC also needed inquiry flows that captured the visitor intent, selected services, calculator values, page context, and projects-map access requests in a format the internal team could act on quickly.',
      ],
      solution: [
        'Built a React and Vite frontend with route groups for services, sub-services, blogs, calculators, careers, contact, company pages, and a gated live projects map.',
        'Created a standalone Express mail backend with dedicated endpoints for contact, service, legal, calculator, mortgage calculator, and projects-map inquiries.',
        'Added route-level SEO support, sitemap generation, optional prerender tooling, and reusable service catalog patterns so the website can grow with new service pages.',
      ],
      features: [
        {
          title: 'Structured Service Catalog',
          description:
            'Service categories and sub-service routes make business investment advisory, company formation, business solutions, corporate advisory, real estate, and visa services easier to navigate.',
        },
        {
          title: 'Context-Rich Inquiry Flows',
          description:
            'Service inquiries send selected services, service paths, page URL, and page path to the backend so HMC receives more useful sales context.',
        },
        {
          title: 'Gated Live Projects Map',
          description:
            'The projects map unlock flow captures name, email, and phone, persists unlock state locally, and sends a dedicated projects-map request to the mail backend.',
        },
        {
          title: 'Business Setup Calculator',
          description:
            'The calculator captures activity, setup reason, jurisdiction, office needs, UAE status, visa needs, and timeline before routing a structured request to HMC.',
        },
        {
          title: 'Mortgage Calculator Inquiry',
          description:
            'Mortgage submissions include assumptions such as property value, down payment, interest rate, loan term, income, estimated payment, repayment, and interest.',
        },
        {
          title: 'SEO And Content Platform',
          description:
            'Route metadata, blog detail pages, sitemap generation, SEO route scripts, and optional prerendering support the website as a search-ready marketing platform.',
        },
      ],
      architecture: [
        'The React SPA owns routing, service presentation, calculators, SEO metadata, gated map UI, and user-facing forms.',
        'The frontend sends inquiry payloads to a configurable API base URL through dedicated helper functions.',
        'The Express backend validates each inquiry type and sends structured SMTP emails for service, contact, legal, calculator, mortgage, and map access flows.',
      ],
      impact: [
        'Converted a complex advisory business into a clearer digital journey across services, tools, project discovery, and inquiry capture.',
        'Improved lead quality by sending HMC service selections, calculator values, map access details, and page context instead of generic form messages.',
        'Created a scalable structure for future services, inquiry types, SEO routes, CRM integration, or analytics without replacing the frontend foundation.',
      ],
    },
  },
  {
    id: 'eigenmc',
    title: 'EigenMC',
    primaryCategory: 'Web',
    description:
      'Full-stack FMCSA motor-carrier intelligence SaaS with a public product site, authenticated React dashboard, FastAPI backend, PostgreSQL data model, admin controls, lead workflows, CSV exports, usage limits, and a resilient TypeScript scraping pipeline.',
    tags: deriveTags([
      'React',
      'TypeScript',
      'FastAPI',
      'PostgreSQL',
      'Node.js',
      'Express',
      'Tailwind CSS',
      'Redux Toolkit',
      'React Query',
      'Playwright',
    ]),
    coreTechnologies: [
      'React 18',
      'TypeScript',
      'Vite 6',
      'Tailwind CSS 4',
      'Radix UI',
      'Redux Toolkit',
      'React Query',
      'TanStack Table',
      'React Hook Form',
      'Zod',
      'FastAPI',
      'SQLAlchemy',
      'PostgreSQL',
      'Alembic',
      'Pydantic',
      'JWT Auth',
      'TypeScript Scraper',
      'Node.js',
      'undici',
      'htmlparser2',
      'cheerio',
      'curl-cffi',
      'Playwright',
      'Vitest',
      'Cloudflare Tunnel',
      'EC2',
    ],
    coverImage: asset('/projects/eigenmc/1.webp'),
    imageAspectRatio: '2 / 1',
    galleryImages: [
      asset('/projects/eigenmc/1.webp'),
      asset('/projects/eigenmc/2.webp'),
      asset('/projects/eigenmc/3.webp'),
      asset('/projects/eigenmc/4.webp'),
      asset('/projects/eigenmc/5.webp'),
      asset('/projects/eigenmc/6.webp'),
      asset('/projects/eigenmc/7.webp'),
    ],
    liveUrl: normalizeLink('https://eigenmc.eigensol.com'),
    liveLinks: [
      {
        label: 'Product Site',
        url: normalizeLink('https://eigenmc.eigensol.com')!,
      },
      {
        label: 'SaaS App',
        url: normalizeLink('https://mc.eigensol.com')!,
      },
    ],
    role: 'Full-Stack Product Engineering',
    status: normalizeStatus('continued'),
    clientName: 'EigenSol',
    featured: true,
    caseStudy: {
      overview: [
        'EigenMC is a full SaaS platform for searching, filtering, managing, and exporting FMCSA motor-carrier data. It combines a public marketing site, authenticated dashboard, FastAPI backend, PostgreSQL database, admin tools, and a dedicated scraping pipeline.',
        'The product turns public carrier registry data into a practical workflow for prospecting, contact discovery, lead conversion, follow-up management, account administration, and data access control.',
      ],
      challenge: [
        'FMCSA carrier data is public, but direct usage is slow and fragmented. Users need fast filtering across large datasets, reliable contact access, CSV exports, and a workflow for turning carrier records into leads.',
        'The platform also needed commercial access controls such as view quotas, contact export limits, subscription states, session limits, and admin-managed user permissions.',
        'On the data side, the scraper had to tolerate blocked responses, proxy failures, interrupted jobs, retry loops, and long-running refresh operations.',
      ],
      solution: [
        'Built a React and Vite dashboard with carrier search, URL-backed filters, server-side pagination, CSV export, redacted rows, detail views, lead conversion, lead pipeline management, and admin workspaces.',
        'Implemented a FastAPI backend with JWT sessions, role-based access, carrier search APIs, leads APIs, dashboard snapshots, admin controls, subscriptions, custom limits, export quotas, and PostgreSQL persistence.',
        'Created a modular TypeScript scraper with jobs, tasks, parsers, consumers, checkpoints, persistent retry, proxy handling, database output modes, and operational documentation.',
        'Added a lightweight static product website for EigenMC’s public-facing marketing and conversion surface.',
      ],
      features: [
        {
          title: 'Carrier Search Workspace',
          description:
            'Users can search and filter carriers by MC range, keyword, state, city, entity type, FMCSA status, internal status, contact availability, equipment, inspection data, and lead state.',
        },
        {
          title: 'Quota-Aware Data Access',
          description:
            'The backend enforces view quotas, redacted carrier rows, export quotas, subscription state, and custom user limits so access can be controlled commercially.',
        },
        {
          title: 'Lead Pipeline',
          description:
            'Carriers can be converted into leads and managed across new, follow-up, active, failed, completed, and archived states with notes, follow-up scheduling, bulk actions, and CSV export.',
        },
        {
          title: 'Admin And Super-Admin Controls',
          description:
            'Admins can manage users, roles, active status, temporary passwords, assigned admins, allowed sessions, subscriptions, custom limits, and broader platform settings.',
        },
        {
          title: 'Dashboard Snapshots',
          description:
            'The API provides single-call user, admin, and super-admin dashboard snapshots to avoid noisy multi-request frontend loading patterns.',
        },
        {
          title: 'Resilient Scraping Pipeline',
          description:
            'The TypeScript scraper supports FMCSA SAFER and SMS scraping, checkpoint resume, persistent retry, proxy pools, batch-level retries, MC-level retries, database consumers, and file outputs.',
        },
      ],
      architecture: [
        'The static EigenMC marketing site presents the product separately from the SaaS dashboard.',
        'The React dashboard consumes FastAPI endpoints for authentication, carriers, leads, dashboards, admin workflows, dialers, limits, and settings.',
        'FastAPI owns authentication, roles, subscriptions, carrier access rules, lead management, exports, and admin operations over PostgreSQL.',
        'The scraper fetches FMCSA data, parses and normalizes records, checkpoints progress, retries failed work, and writes results to PostgreSQL or export files.',
      ],
      impact: [
        'Turned raw FMCSA registry data into a searchable, quota-controlled carrier intelligence product.',
        'Connected search directly to business actions: contact copying, dialer links, CSV exports, lead conversion, follow-ups, and admin-managed access.',
        'Created a production-minded ingestion pipeline that can resume interrupted runs, retry blocked records, rotate proxies, and keep the SaaS database fresh.',
      ],
    },
  },
  {
    id: 'a2prop',
    title: 'A2 Properties',
    primaryCategory: 'Web',
    description:
      'Full-stack real-estate discovery and lead-generation platform for a Dubai-focused property business, combining premium brand presentation, live inventory, multilingual content, and CRM-connected conversion workflows.',
    tags: deriveTags([
      'React 19',
      'React Router 7',
      'Vite 7',
      'Tailwind CSS',
      'JavaScript',
      'GSAP 3',
      'ScrollTrigger',
    ]),
    coreTechnologies: [
      'React 19',
      'Vite',
      'TypeScript',
      'Tailwind CSS',
      'React Router 7',
      'Framer Motion',
      'GSAP',
      'Lenis',
      'Swiper',
      'i18next',
      'Node.js',
      'Express 5',
      'Zod',
      'Axios',
      'Helmet',
      'Pino',
      'Node Cache',
      'Nodemailer',
      'Pixxi CRM API',
      'SMTP Notifications',
    ],
    coverImage: asset('/projects/a2properties/A2-prop-cover.webp'),
    galleryImages: [
      asset('/projects/a2properties/A2-prop-cover.webp'),
      asset('/projects/a2properties/Screenshot 2026-03-18 193113.webp'),
      asset('/projects/a2properties/Screenshot 2026-03-18 193146.webp'),
      asset('/projects/a2properties/Screenshot 2026-03-18 193242.webp'),
    ],
    liveUrl: normalizeLink('https://a2properties.ae'),
    role: 'Frontend Engineer',
    status: normalizeStatus('continued'),
    clientName: 'A2 Properties',
    featured: true,
    caseStudy: {
      overview: [
        'A2 Properties was built as a full-stack real-estate platform that does more than present a polished brand. It connects discovery, property browsing, gated feature access, enquiry flows, and CRM-backed operations into one product experience.',
        'The platform positions A2 Properties as a premium Dubai real-estate brand while supporting practical business workflows such as live listing access, property detail exploration, lead capture, and multilingual market content.',
      ],
      challenge: [
        'The client needed a website that could feel investor-ready while avoiding the common weakness of real-estate sites: attractive pages backed by stale listings, weak filtering, disconnected forms, or exposed third-party CRM logic.',
        'Pixxi CRM data needed to stay secure on the server, be normalized into frontend-friendly property models, and support lead routing without leaking credentials or forcing the frontend to understand raw CRM payloads.',
      ],
      solution: [
        'Built a React and Vite frontend with premium landing pages, property listing routes, detail pages, blog content, AI Map access, and English/Arabic multilingual support.',
        'Designed a Node.js, TypeScript, and Express API layer as a secure gateway to Pixxi CRM for listings, details, metadata, agents, leads, reminders, and AI Map notifications.',
        'Added validation, caching, rate limiting, logging, and response normalization so the frontend receives stable product data while sensitive integration details remain server-side.',
      ],
      features: [
        {
          title: 'Premium Marketing Experience',
          description:
            'Motion-rich homepage sections, investor-focused messaging, partner logos, testimonials, blog content, FAQs, and brand-led visual depth create a high-end real-estate presentation.',
        },
        {
          title: 'Advanced Property Discovery',
          description:
            'The listings experience supports type switching, keyword search, price, bedroom, property type, developer, location, amenity filters, pagination, and loading states.',
        },
        {
          title: 'Rich Property Detail Pages',
          description:
            'Property pages render galleries, pricing, key facts, location context, developer data, amenities, floor plans, payment plans, agent details, enquiries, and recommended listings.',
        },
        {
          title: 'Gated AI Map Funnel',
          description:
            'The AI Map route is unlocked through a lead form, persists access locally, triggers backend notification flow, and turns a premium feature into a conversion mechanism.',
        },
        {
          title: 'CRM-Connected Lead Capture',
          description:
            'General contact, listing-specific enquiries, and AI Map unlock requests are validated, enriched, and routed through backend endpoints instead of disconnected frontend forms.',
        },
        {
          title: 'English And Arabic Support',
          description:
            'i18next and react-i18next power multilingual content for a broader UAE audience and stronger regional fit.',
        },
      ],
      architecture: [
        'The React SPA calls internal API endpoints under /api/v1 instead of calling Pixxi directly.',
        'The Express backend converts frontend query formats into Pixxi-compatible requests, fetches data server-side, and transforms responses into normalized listing and property models.',
        'Lead submissions are validated and routed to Pixxi forms, while AI Map unlocks can also trigger SMTP notifications.',
      ],
      impact: [
        'Turned the site from a static brochure into a connected digital funnel covering discovery, filtering, detail review, trust-building, gated access, and enquiry submission.',
        'Protected CRM credentials by keeping Pixxi integration server-side and giving the frontend a stable internal API contract.',
        'Created a scalable foundation where listing filters, metadata, lead flows, reminders, and future CRM workflows can be extended without rebuilding the frontend.',
      ],
    },
  },
  {
    id: 'sleep-tracking',
    title: 'Sleep Tracking (ExceedSleep)',
    primaryCategory: 'Mobile',
    description:
      'Mobile-first sleep wellness platform with Expo React Native, sleep-event detection, Node/Express API, React admin panel, analytics, audio storage, and subscription support.',
    tags: deriveTags([
      'Expo',
      'React Native',
      'TensorFlow Lite',
      'Node.js',
      'Express.js',
      'TypeScript',
      'PostgreSQL',
      'Redis',
      'React',
      'Vite',
      'TailwindCSS',
    ]),
    coreTechnologies: [
      'Expo',
      'React Native',
      'TypeScript',
      'Expo Router',
      'Redux Toolkit',
      'RTK Query',
      'Expo AV',
      'React Native Fast TFLite',
      'TensorFlow Lite',
      'Node.js',
      'Express 5',
      'PostgreSQL',
      'Redis',
      'JWT Authentication',
      'AWS S3',
      'Multer',
      'Nodemailer',
      'Stripe',
      'RevenueCat',
      'React',
      'Vite',
      'TailwindCSS',
      'TanStack Table',
      'Recharts',
      'Python',
    ],
    coverImage: asset('/projects/sleep-tracking/sleep-tracking-cover.webp'),
    galleryImages: [
      asset('/projects/sleep-tracking/sleep-tracking-cover.webp'),
      asset('/projects/sleep-tracking/5.webp'),
      asset('/projects/sleep-tracking/6.webp'),
      asset('/projects/sleep-tracking/7.webp'),
      asset('/projects/sleep-tracking/8.webp'),
      asset('/projects/sleep-tracking/9.webp'),
      asset('/projects/sleep-tracking/10.webp'),
      asset('/projects/sleep-tracking/11.webp'),
      asset('/projects/sleep-tracking/12.webp'),
      asset('/projects/sleep-tracking/13.webp'),
      asset('/projects/sleep-tracking/21.webp'),
      asset('/projects/sleep-tracking/23.webp'),
      asset('/projects/sleep-tracking/24.webp'),
      asset('/projects/sleep-tracking/26.webp'),
      asset('/projects/sleep-tracking/sleep-tracking-10.webp'),
      asset('/projects/sleep-tracking/sleep-tracking-18.webp'),
    ],
    liveUrl: normalizeLink('Nill'),
    role: 'Full-Stack Developer',
    status: normalizeStatus('discontinued'),
    clientName: 'Confidential',
    featured: true,
    caseStudy: {
      overview: [
        'Sleep Tracking (ExceedSleep) is a full-stack sleep wellness platform built around a mobile sleep recorder, on-device sleep-event detection, a Node/Express API, and a React admin dashboard.',
        'The system helps users start overnight sessions, capture meaningful audio events, review sleep quality, and use curated sounds and mixes as part of their sleep routine.',
      ],
      challenge: [
        'The product needed to feel like a mobile sleep app first, while still supporting a complex backend for sessions, audio uploads, analytics, protected media, subscriptions, and admin operations.',
        'Sleep recording also required careful handling of short audio chunks, noise filtering, event labels, very short sessions, local cleanup, and long-running auth stability on mobile devices.',
      ],
      solution: [
        'I structured the project into separate mobile, API, admin web, and AI areas so each part could evolve independently while sharing one product workflow.',
        'The mobile app records short audio chunks during a sleep session, classifies useful events, uploads event metadata and audio to the API, and displays sleep score, stage timeline, and event history in the insights screen.',
        'The backend stores sessions and events in PostgreSQL, supports Redis-backed auth flows, handles local or S3 media storage, and exposes admin routes for users, content, analytics, billing plans, and subscribers.',
      ],
      features: [
        {
          title: 'Mobile sleep recorder',
          description:
            'Expo React Native app for starting and ending sleep sessions, recording audio chunks, keeping the session active, processing local audio, and cleaning old cached files.',
        },
        {
          title: 'Sleep-event detection',
          description:
            'TensorFlow Lite based detection pipeline for sleep-related labels such as snore, cough, speech, sneeze, sniff, laughter, music, silence, unknown, and noise.',
        },
        {
          title: 'Session analytics',
          description:
            'Sleep APIs produce session summaries, event breakdowns, daily analytics, dominant label share, latest graph data, and latest score data.',
        },
        {
          title: 'Sleep score and stage timeline',
          description:
            'Backend services convert recorded events, duration, sound intensity, and session timing into a readable sleep quality score and per-minute stage timeline.',
        },
        {
          title: 'Audio storage and playback',
          description:
            'Detected event clips can be uploaded with metadata and stored locally or in S3, with protected streaming for authorized users.',
        },
        {
          title: 'Sound library and mixes',
          description:
            'Users can browse sounds, favorites, recommended content, categories, sub-categories, player screens, and personal sleep mixes.',
        },
        {
          title: 'Admin operations',
          description:
            'React/Vite admin dashboard for users, sound uploads, categories, mixes, sleep sessions, analytics, billing plans, subscribers, and subscription analytics.',
        },
        {
          title: 'Auth and subscriptions',
          description:
            'OTP signup, login, Google auth, refresh tokens, role-based access, IAP confirmation, entitlement checks, and optional Stripe/RevenueCat subscription support.',
        },
      ],
      architecture: [
        'A user starts a sleep session in the Expo mobile app. The app records short chunks, filters low-value audio, runs detection logic, and uploads meaningful events with labels, timestamps, duration, decibel level, and audio files.',
        'The Express API validates auth, stores event records in PostgreSQL, saves media through local storage or S3, deduplicates nearby events, and returns analytics responses to the mobile insights screen.',
        'The React admin panel consumes the same API surface for operational workflows such as content management, user review, session analytics, billing plans, and subscriber monitoring.',
      ],
      impact: [
        'Delivered a complete mobile-first sleep tracking product with supporting backend, admin, and AI model components.',
        'Connected audio recording, event detection, sleep scoring, analytics, protected audio playback, and admin review into one workflow.',
        'Gave non-technical admins a dashboard for managing content, users, sessions, and subscriptions without direct database access.',
      ],
    },
  },
  {
    id: '1016-visualizer',
    title: '1016 Visualizer',
    primaryCategory: 'Web',
    description:
      'Laravel-based automotive parts visualizer and dealer ordering platform with canvas vehicle previews, SVG part highlights, material/version switching, order summaries, CSV invoices, and mail delivery.',
    tags: deriveTags(['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Blade', 'Bootstrap']),
    coreTechnologies: [
      'Laravel 10',
      'PHP 8.1',
      'MySQL',
      'Eloquent ORM',
      'Blade',
      'Laravel UI Auth',
      'Laravel Sanctum',
      'Vite',
      'Bootstrap',
      'Sass',
      'JavaScript',
      'Canvas API',
      'SVG Overlays',
      'Flickity',
      'Toastr',
      'Laravel Mail',
      'CSV Generation',
    ],
    coverImage: asset('/projects/1016/Screenshot 2026-03-18 193425.webp'),
    galleryImages: [
      asset('/projects/1016/Screenshot 2026-03-18 193425.webp'),
      asset('/projects/1016/Screenshot 2026-03-18 193523.webp'),
      asset('/projects/1016/Screenshot 2026-03-18 193610.webp'),
    ],
    liveUrl: normalizeLink('https://build.1016industries.com/app/list'),
    role: 'Full-Stack Developer',
    status: normalizeStatus('discontinued'),
    clientName: 'Christopher',
    featured: false,
    caseStudy: {
      overview: [
        '1016 Industries Visualizer is a Laravel-based automotive parts visualization and ordering platform for high-end vehicle customization.',
        'The product lets customers and dealers browse supported vehicle models, switch materials and versions, inspect front/back views, hover over visual hotspots, add parts to an order, and submit selected parts through public or authenticated workflows.',
      ],
      challenge: [
        'The client needed to turn a complex aftermarket parts catalog into a visual buying workflow where users could understand which SKU belongs to which area of a premium vehicle.',
        'The platform also needed to support different vehicle versions, material variants, side views, part images, highlight SVG files, dealer-specific wholesale ordering, and large catalog update batches.',
      ],
      solution: [
        'Built a Laravel application with Blade views, Eloquent models, MySQL catalog tables, custom JavaScript, canvas rendering, SVG highlight overlays, and order submission flows.',
        'Created a hierarchical vehicle data model covering brands, models, trims, cars, variants, sides, parts, version links, public orders, and dealer member orders.',
        'Implemented a dealer workflow with brand/model/trim selection, part search, order summary, VAT-aware order storage, CSV invoice generation, and order email delivery.',
      ],
      features: [
        {
          title: 'Vehicle visualizer',
          description:
            'Canvas-based car preview with SVG highlight overlays so each part can visually map to the correct vehicle region.',
        },
        {
          title: 'Material and version switching',
          description:
            'Support for configured materials such as carbon fiber, forged carbon, FRP, and Black Badge, plus linked vehicle versions.',
        },
        {
          title: 'Interactive part rail',
          description:
            'Part cards show title, SKU, image, material, and price, with hover states that activate matching highlight regions on the car.',
        },
        {
          title: 'Public order submission',
          description:
            'Customers can select parts, enter contact details, submit orders, and trigger backend validation, persistence, and email notification.',
        },
        {
          title: 'Dealer wholesale workflow',
          description:
            'Authenticated dealers can select brand, model, trim, search available parts, build a wholesale order, and submit it through API v2 endpoints.',
        },
        {
          title: 'CSV invoice generation',
          description:
            'Dealer orders generate CSV invoice files with dealer details, selected parts, SKUs, material, model, make, trim, and total.',
        },
        {
          title: 'Catalog import structure',
          description:
            'Seeders and importer files manage brands, cars, variants, sides, images, highlights, part SKUs, prices, and catalog update batches.',
        },
        {
          title: 'Rollback controls',
          description:
            'Authenticated admin rollback routes support feature toggles, theme activation, backup creation, backup restoration, and emergency rollback actions.',
        },
      ],
      architecture: [
        'The public `/list` route shows available vehicles and launches `/visualizer/{car_id}` for cars with configured variants.',
        'The visualizer requests `/visualizer/{car_id}/details`, receives structured car JSON, draws the active side image on canvas, and injects the matching SVG highlight overlay.',
        'Public orders are submitted through `/order/place`, while authenticated dealer orders use API v2 endpoints for models, trims, parts, and wholesale order submission.',
        'Laravel persists orders in MySQL and uses mail plus generated CSV files to send order details to the configured recipient.',
      ],
      impact: [
        'Converted a premium automotive parts catalog into an interactive visual buying experience.',
        'Reduced SKU confusion by tying each part to imagery, material options, side views, and highlight regions.',
        'Supported both public customer inquiries and authenticated dealer wholesale ordering from the same catalog foundation.',
      ],
    },
  },
  {
    id: 'iqmetric',
    title: 'IQMetric',
    primaryCategory: 'Web',
    description:
      'Online IQ tests and games SaaS with admin and user panels, payment integration, and analytics.',
    tags: deriveTags(['Laravel', 'HTML', 'CSS', 'JavaScript', 'MySQL']),
    coverImage: asset('/projects/iqmetric/Screenshot 2026-03-18 194337.webp'),
    galleryImages: [
      asset('/projects/iqmetric/Screenshot 2026-03-18 194337.webp'),
      asset('/projects/iqmetric/Screenshot 2026-03-18 194411.webp'),
      asset('/projects/iqmetric/Screenshot 2026-03-18 194447.webp'),
    ],
    liveUrl: normalizeLink('https://iqmetric.com'),
    role: 'Full-Stack Developer',
    status: normalizeStatus('discontinued'),
    clientName: 'Kevin Mitnick',
    featured: false,
  },
  {
    id: 'zainather',
    title: 'zainather.com',
    primaryCategory: 'Web',
    description:
      'Professional medical website for Dr. Zain Ather with patient consultation flows, recruiter-facing CV access, practical care tools, SEO metadata, restrained motion, and GitHub Pages deployment.',
    tags: deriveTags(['JavaScript', 'GSAP', 'HTML', 'CSS', 'SEO', 'GitHub Pages']),
    coreTechnologies: [
      'HTML',
      'CSS',
      'JavaScript',
      'GSAP',
      'Responsive Design',
      'WhatsApp Deep Links',
      'PDF CV',
      'SEO Metadata',
      'Open Graph',
      'Twitter Metadata',
      'JSON-LD',
      'Sitemap',
      'Robots.txt',
      'GitHub Pages',
      'CNAME',
      'SPA Fallback',
    ],
    coverImage: asset('/projects/zainather/1.webp'),
    imageAspectRatio: '2 / 1',
    galleryImages: [
      asset('/projects/zainather/1.webp'),
      asset('/projects/zainather/2.webp'),
      asset('/projects/zainather/3.webp'),
    ],
    liveUrl: normalizeLink('https://zainather.com'),
    role: 'Web Developer | UI/UX Developer',
    status: normalizeStatus('continued'),
    clientName: 'Dr. Zain Ather',
    featured: false,
    caseStudy: {
      overview: [
        'zainather.com was designed and developed as a professional digital presence for Dr. Zain Ather.',
        'The website supports two user groups at the same time: patients looking to book consultations quickly, and recruiters, institutions, or collaborators reviewing background and contact options.',
      ],
      challenge: [
        'The client wanted a professional, corporate, medically credible website that did not feel like a generic AI-generated portfolio template.',
        'The site also needed clear patient booking actions, recruiter-facing CV access, strong mobile responsiveness, improved SEO, restrained motion, and deployment on GitHub Pages under zainather.com.',
      ],
      solution: [
        'Reframed the website as a service and trust-building medical platform rather than a portfolio-first personal site.',
        'Built two clear conversion paths: a patient consultation path through structured WhatsApp and phone actions, and a recruiter/collaborator path through experience, background, contact, and CV access.',
        'Added Care Tools as practical patient-support content, replacing generic blog-style content with searchable, filterable health-topic tools.',
        'Refined the visual system toward a white-first, restrained navy and cool gray-blue design with sharper geometry, controlled spacing, subtle motion, and professional typography.',
      ],
      features: [
        {
          title: 'Consultation-first homepage',
          description:
            'Homepage structure supports quick patient consultation actions while still giving recruiters and collaborators a clear professional review path.',
        },
        {
          title: 'WhatsApp booking flow',
          description:
            'Appointment booking passes structured user input into a WhatsApp message, keeping the flow direct without requiring a backend booking system.',
        },
        {
          title: 'Care Tools',
          description:
            'Searchable and filterable health tools cover practical topics such as blood pressure, diabetes, diet, exercise, heart health, hydration, sleep, stress, fever, digestive health, and women’s health basics.',
        },
        {
          title: 'Recruiter CV access',
          description:
            'A public PDF CV workflow gives recruiters and collaborators a formal document alongside the web profile.',
        },
        {
          title: 'Professional visual system',
          description:
            'The UI avoids soft portfolio styling in favor of a corporate medical tone with section-led layout, sharper geometry, restrained colors, and subtle motion.',
        },
        {
          title: 'SEO and deployment',
          description:
            'Metadata, canonical tags, Open Graph, Twitter metadata, JSON-LD, robots, sitemap, favicon, manifest, CNAME handling, SPA fallback, and GitHub Pages deployment support public launch.',
        },
      ],
      architecture: [
        'The site is organized around Home, About, Experience, Care Tools, and Contact so navigation matches patient and recruiter intent.',
        'Patient actions use direct phone and WhatsApp links, with booking messages assembled from structured input instead of a backend form submission.',
        'Care Tools pages use topic-focused content, visual panels, filtering, search, and official-reference links to support credibility.',
        'The deployed site uses GitHub Pages with root asset sync, CNAME handling, SPA fallback, and asset path fixes for reliable custom-domain hosting.',
      ],
      impact: [
        'Turned a generic web presence into a focused consultation-first medical website.',
        'Created clearer paths for patients, recruiters, institutions, and collaborators.',
        'Added practical health tools, CV access, SEO readiness, and deployment stability while preserving a professional medical tone.',
      ],
    },
  },
  {
    id: 'objecttracker',
    title: 'Object Following Drone',
    primaryCategory: 'AI/ML',
    description:
      'Computer-vision drone tracking system for DJI Tello, webcam, and Three.js simulation with real-time target tracking, grid-based navigation, smooth velocity control, and PyQt6/OpenCV interfaces.',
    tags: deriveTags([
      'Python',
      'OpenCV',
      'PyTorch',
      'PyQt6',
      'Three.js',
      'Computer Vision',
      'Robotics',
    ]),
    coreTechnologies: [
      'Python',
      'OpenCV',
      'PyQt6',
      'NumPy',
      'PyTorch',
      'DaSiamRPN',
      'OpenCV CSRT Tracker',
      'DJI Tello',
      'djitellopy',
      'WebSockets',
      'Three.js',
      'JavaScript',
      'Node.js',
      'http-server',
      'GLB Models',
    ],
    galleryImages: [],
    liveUrl: normalizeLink('Nill'),
    role: 'Computer Vision Developer | Robotics Developer',
    status: normalizeStatus('discontinued'),
    clientName: 'HakamSol',
    featured: false,
    caseStudy: {
      overview: [
        'Object Following Drone is a computer-vision and robotics project for tracking a selected object and guiding a drone to follow it in real time.',
        'The system supports a physical DJI Tello drone, webcam testing, and a browser-based Three.js simulation so the tracking and navigation loop can be tested before flight.',
      ],
      challenge: [
        'The project needed to connect live video tracking with drone movement while keeping the workflow testable without risking hardware on every iteration.',
        'Tracking also needed to handle selected target boundaries, lost targets, frame-center offsets, depth estimation from bounding-box area, and smooth command output to the drone.',
      ],
      solution: [
        'Built a modular Python application where camera input, interface, tracking model, navigator, flight guide, and controller can be swapped through command-line arguments or environment variables.',
        'Implemented DaSiamRPN, multi-model DaSiam, and OpenCV CSRT tracking options that maintain target boundary and center values from live frames.',
        'Added a grid-based navigation layer and smooth Tello controller that converts target offsets into velocity commands with speed caps, update throttling, and timeout-based stopping.',
        'Created a Three.js simulation with a low-poly city, target object, API/WebSocket controls, keyboard controls, and canvas frame streaming for safer development.',
      ],
      features: [
        {
          title: 'Runtime component switching',
          description:
            'Camera, interface, and model can be selected from `.env` or command-line arguments to run Tello, webcam, or simulator workflows.',
        },
        {
          title: 'Real-time target selection',
          description:
            'PyQt6 and OpenCV interfaces allow users to choose an object boundary from the video feed and initialize tracking from that selection.',
        },
        {
          title: 'Multiple tracking models',
          description:
            'Supports DaSiamRPN, a multi-tracker DaSiam variant, and OpenCV CSRT for testing different tracking reliability and performance tradeoffs.',
        },
        {
          title: 'Grid-based navigation',
          description:
            'The navigator compares the target center and bounding-box area against a safe center zone to calculate left/right, up/down, and forward/back movement intent.',
        },
        {
          title: 'Smooth Tello control',
          description:
            'DJI Tello movement uses smoothed RC velocity commands, speed caps, minimum update intervals, and timeout-based stops.',
        },
        {
          title: 'Three.js simulation',
          description:
            'Browser simulation provides a low-poly city, target object, camera controls, WebSocket command handling, and frame streaming before physical flight testing.',
        },
      ],
      architecture: [
        'The app starts by selecting camera, interface, and tracking model from command-line arguments or environment variables.',
        'Frames flow from TelloCam, WebCam, or SimCam into the interface and tracking model.',
        'The tracker outputs target boundary and center values, the grid navigator calculates offsets, and the flight guide applies safe-zone movement logic.',
        'The active controller sends commands to the DJI Tello, simulation controller, or dummy controller depending on the selected runtime.',
      ],
      impact: [
        'Built a practical object-following architecture that can run against real hardware, webcam input, or simulation.',
        'Separated tracking, navigation, interface, and controller concerns so future models or controllers can be added without rewriting the whole system.',
        'Reduced hardware testing risk by providing a simulation path before using the physical DJI Tello.',
      ],
    },
  },
];

export const projectFilters: Array<'All' | ProjectCategory> = ['All', 'Web', 'Mobile', 'AI/ML'];

export const portfolioProjects = allProjects;
export const featuredPortfolioProjects = allProjects.filter((project) => project.featured);
export const getPortfolioProjectById = (id: string) =>
  allProjects.find((project) => project.id === id);
