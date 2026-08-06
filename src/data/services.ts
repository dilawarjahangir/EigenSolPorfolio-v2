export type ServiceSlug =
  | "custom-software-development"
  | "web-application-development"
  | "mobile-app-development"
  | "ui-ux-design-systems"
  | "cloud-devops"
  | "ai-machine-learning"
  | "digital-marketing-content-creation";

export type ServiceMetric = {
  value: number;
  suffix?: string;
  label: readonly [string, string];
};

export type ServiceCapability = {
  title: string;
  categories: readonly string[];
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceProcessStep = {
  number: string;
  title: readonly [string, string];
  description: string;
};

export type ServiceOffering = {
  slug: ServiceSlug;
  title: string;
  lines: readonly [string, string];
  shortDescription: string;
  quickAnswer: string;
  idealFor: readonly string[];
  faqs: readonly ServiceFaq[];
  hero: {
    lines: readonly [string, string, string];
    badge: string;
    description: string;
  };
  metrics: readonly ServiceMetric[];
  overview: {
    description: string;
    approachTitle: string;
    steps: readonly string[];
  };
  media?: {
    banner?: string;
    overview?: string;
    pair?: readonly [string, string];
  };
  capabilities: readonly ServiceCapability[];
  process: {
    title: readonly [string, string];
    steps: readonly ServiceProcessStep[];
  };
};

export const serviceOfferings: readonly ServiceOffering[] = [
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    lines: ["Custom Software", "Development"],
    shortDescription:
      "End-to-end software systems tailored to your operating model and growth plans.",
    quickAnswer:
      "Custom software development is the design and engineering of a system built specifically around a company’s workflows, users, integrations, and long-term goals.",
    idealFor: [
      "Businesses relying on spreadsheets, disconnected tools, or manual processes",
      "Companies that need software tailored to unique operational workflows",
      "Organizations modernizing legacy systems or replacing outdated applications",
      "Teams building a new SaaS platform, internal portal, or customer-facing product",
    ],
    faqs: [
      {
        question: "What is custom software development?",
        answer: "Custom software development is the process of planning, designing, building, testing, and maintaining software created for the specific needs of one business or user group.",
      },
      {
        question: "What types of custom software does EigenSol build?",
        answer: "EigenSol builds business platforms, workflow systems, SaaS products, customer portals, internal tools, APIs, integrations, data-driven applications, and legacy-system replacements.",
      },
      {
        question: "How long does custom software development take?",
        answer: "The timeline depends on scope, integrations, complexity, and validation needs. A focused discovery sprint can take two weeks, while complete product delivery is planned in phased milestones.",
      },
      {
        question: "Can EigenSol modernize an existing software system?",
        answer: "Yes. EigenSol can assess an existing application, improve its architecture and performance, replace fragile components, migrate data, and deliver modernization in controlled stages.",
      },
    ],
    hero: {
      lines: ["Custom Software", "Built Around", "Your Business"],
      badge: "Engineering",
      description:
        "We turn complex operating requirements into dependable software that fits your team, integrates with existing systems, and remains practical to extend.",
    },
    metrics: [
      { value: 6, label: ["Core", "Capabilities"] },
      { value: 4, label: ["Delivery", "Phases"] },
      { value: 1, label: ["Accountable", "Team"] },
    ],
    overview: {
      description:
        "Custom software development replaces fragmented tools and manual work with a system designed around the way your business actually operates. EigenSol connects product strategy, interface design, engineering, integrations, and long-term maintainability in one delivery.",
      approachTitle: "Our Approach to Custom Software",
      steps: [
        "Discovery and domain mapping - understanding workflows, users, constraints, and measurable outcomes.",
        "Architecture and product definition - shaping the system boundaries, data model, integrations, and delivery roadmap.",
        "Iterative engineering - building tested releases in visible milestones with regular stakeholder review.",
        "Launch and evolution - deploying safely, monitoring performance, and improving the product as needs change.",
      ],
    },
    media: {
      banner: "/agntix-service-details/custom-software/custom-software-banner.webp",
      overview: "/agntix-service-details/custom-software/custom-software-overview.webp",
      pair: [
        "/agntix-service-details/custom-software/custom-software-ai-workflow.webp",
        "/agntix-service-details/custom-software/custom-software-development-team.webp",
      ],
    },
    capabilities: [
      {
        title: "Product strategy and architecture",
        categories: ["Discovery workshops", "Technical architecture", "Delivery roadmaps"],
      },
      {
        title: "Full-stack product engineering",
        categories: ["Web platforms", "APIs and integrations", "Data-driven workflows"],
      },
      {
        title: "Modernization and scale",
        categories: ["Legacy modernization", "Performance optimization", "Ongoing delivery"],
      },
    ],
    process: {
      title: ["Software made for", "real operations"],
      steps: [
        {
          number: "01",
          title: ["Research", "And Analysis"],
          description: "Map the business process, users, risks, and technical constraints.",
        },
        {
          number: "02",
          title: ["Design", "And Architecture"],
          description: "Turn requirements into validated flows and a maintainable system design.",
        },
        {
          number: "03",
          title: ["Build", "And Validate"],
          description: "Ship tested increments and review working software throughout delivery.",
        },
        {
          number: "04",
          title: ["Launch", "And Improve"],
          description: "Deploy, observe, support, and evolve the product with real usage.",
        },
      ],
    },
  },
  {
    slug: "web-application-development",
    title: "Web Application Development",
    lines: ["Web Application", "Development"],
    shortDescription:
      "Fast, accessible, and scalable web applications built around real user workflows.",
    quickAnswer:
      "Web application development is the creation of interactive browser-based software that combines responsive interfaces, backend services, databases, authentication, and integrations.",
    idealFor: [
      "Businesses launching a SaaS platform, portal, dashboard, or marketplace",
      "Organizations replacing static websites with interactive user workflows",
      "Teams that need secure authentication, data management, and third-party integrations",
      "Companies improving the speed, accessibility, and scalability of an existing web product",
    ],
    faqs: [
      {
        question: "What is a web application?",
        answer: "A web application is interactive software accessed through a browser. Unlike a basic informational website, it allows users to complete tasks, manage data, sign in, make transactions, or collaborate.",
      },
      {
        question: "Which technologies does EigenSol use for web applications?",
        answer: "EigenSol commonly uses modern technologies such as React, Next.js, TypeScript, secure backend APIs, relational databases, cloud infrastructure, and automated testing tools.",
      },
      {
        question: "Can EigenSol build both the frontend and backend?",
        answer: "Yes. EigenSol provides full-stack delivery covering product flows, responsive interfaces, APIs, databases, authentication, integrations, testing, deployment, and production monitoring.",
      },
      {
        question: "How does EigenSol improve web application performance?",
        answer: "Performance work can include image optimization, efficient rendering, caching, database tuning, API improvements, code splitting, Core Web Vitals testing, and production monitoring.",
      },
    ],
    hero: {
      lines: ["Web Applications", "That Turn Traffic", "Into Growth"],
      badge: "Web Apps",
      description:
        "We design and engineer responsive web products that feel fast, guide users clearly, and give internal teams a stable platform for growth.",
    },
    metrics: [
      { value: 3, label: ["Performance", "Layers"] },
      { value: 4, label: ["Validation", "Gates"] },
      { value: 1, label: ["Product", "Team"] },
    ],
    overview: {
      description:
        "Web application development combines product thinking, responsive interface design, frontend engineering, backend services, and release infrastructure. The result is a usable product rather than a collection of disconnected pages.",
      approachTitle: "Our Approach to Web Applications",
      steps: [
        "User and workflow discovery - defining the journeys, tasks, permissions, and information users need.",
        "Experience and system design - aligning responsive interfaces with APIs, data, and operational requirements.",
        "Full-stack implementation - building accessible frontend experiences and dependable backend services.",
        "Performance and release - validating quality, security, analytics, and production behavior before launch.",
      ],
    },
    media: {
      banner: "/agntix-service-details/web-application/web-application-banner.webp",
      overview:
        "/agntix-service-details/web-application/web-application-responsive-overview.webp",
      pair: [
        "/agntix-service-details/web-application/web-application-development-team.webp",
        "/agntix-service-details/web-application/web-application-dual-screen-coding.webp",
      ],
    },
    capabilities: [
      {
        title: "Product experience design",
        categories: ["Responsive UX", "Interface systems", "Accessibility"],
      },
      {
        title: "Frontend and backend engineering",
        categories: ["React and Next.js", "APIs and services", "Authentication and data"],
      },
      {
        title: "Performance and evolution",
        categories: ["Core Web Vitals", "Quality engineering", "Continuous improvement"],
      },
    ],
    process: {
      title: ["Web products for", "friendly users"],
      steps: [
        {
          number: "01",
          title: ["Research", "And Flows"],
          description: "Identify user goals, conversion paths, content, and operational needs.",
        },
        {
          number: "02",
          title: ["Design", "And Prototype"],
          description: "Validate responsive journeys before committing them to production code.",
        },
        {
          number: "03",
          title: ["Engineer", "And Test"],
          description: "Build the frontend, services, integrations, and automated quality checks.",
        },
        {
          number: "04",
          title: ["Release", "And Optimize"],
          description: "Launch with analytics, monitoring, and a clear improvement backlog.",
        },
      ],
    },
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    lines: ["Mobile App", "Development"],
    shortDescription:
      "Native and cross-platform mobile products designed for iOS and Android.",
    quickAnswer:
      "Mobile app development is the design, engineering, testing, and release of applications built for iOS and Android devices, including their backend services and integrations.",
    idealFor: [
      "Companies launching a consumer or business mobile product",
      "Businesses that need iOS and Android apps from one coordinated team",
      "Organizations requiring notifications, device permissions, offline behavior, or native integrations",
      "Teams extending an existing web platform with a dedicated mobile experience",
    ],
    faqs: [
      {
        question: "Does EigenSol build apps for both iOS and Android?",
        answer: "Yes. EigenSol develops mobile applications for iOS and Android, including cross-platform delivery with React Native and Expo where that approach fits the product requirements.",
      },
      {
        question: "What is the difference between native and cross-platform app development?",
        answer: "Native apps use platform-specific technologies, while cross-platform apps share more code between iOS and Android. The right option depends on performance, device features, timeline, and maintenance goals.",
      },
      {
        question: "Can EigenSol connect a mobile app to an existing backend?",
        answer: "Yes. EigenSol can integrate a mobile application with existing APIs, databases, authentication systems, payment services, analytics, notifications, and other business platforms.",
      },
      {
        question: "Does mobile app development include app-store release support?",
        answer: "Yes. Delivery can include release preparation, signing, store assets, submission support, production monitoring, crash reporting, and improvements after launch.",
      },
    ],
    hero: {
      lines: ["Mobile Experiences", "Made for Everyday", "Momentum"],
      badge: "Mobile",
      description:
        "We build focused iOS and Android experiences that respect mobile behavior, perform reliably, and connect cleanly to the services behind them.",
    },
    metrics: [
      { value: 2, label: ["Mobile", "Platforms"] },
      { value: 4, label: ["Release", "Phases"] },
      { value: 1, label: ["Delivery", "Team"] },
    ],
    overview: {
      description:
        "Mobile app development requires more than fitting a web interface onto a smaller screen. EigenSol considers device behavior, permissions, connectivity, notifications, app-store delivery, backend services, and the moments users return to every day.",
      approachTitle: "Our Approach to Mobile Products",
      steps: [
        "Mobile product discovery - prioritizing core journeys, device capabilities, and platform constraints.",
        "Interaction and prototype design - validating navigation, gestures, states, and edge cases on real screens.",
        "Application and API engineering - building the mobile client, backend services, and secure integrations.",
        "Store release and improvement - preparing submissions, monitoring production, and iterating from usage.",
      ],
    },
    media: {
      overview: "/agntix-service-details/mobile-app/mobile-app-overview.webp",
    },
    capabilities: [
      {
        title: "Mobile product strategy",
        categories: ["Journey definition", "Platform planning", "Release roadmap"],
      },
      {
        title: "iOS and Android delivery",
        categories: ["React Native and Expo", "Native integrations", "Backend APIs"],
      },
      {
        title: "Release and lifecycle",
        categories: ["App-store readiness", "Crash monitoring", "Ongoing releases"],
      },
    ],
    process: {
      title: ["Mobile products for", "everyday use"],
      steps: [
        {
          number: "01",
          title: ["Discover", "And Prioritize"],
          description: "Define the mobile moments that create the most value for users.",
        },
        {
          number: "02",
          title: ["Prototype", "And Validate"],
          description: "Test navigation, gestures, states, and device-specific behavior.",
        },
        {
          number: "03",
          title: ["Build", "And Integrate"],
          description: "Engineer the app, APIs, notifications, permissions, and data flows.",
        },
        {
          number: "04",
          title: ["Publish", "And Improve"],
          description: "Release to stores, monitor behavior, and refine the product.",
        },
      ],
    },
  },
  {
    slug: "ui-ux-design-systems",
    title: "UI/UX Design Systems",
    lines: ["UI/UX Design", "Systems"],
    shortDescription:
      "Research-led product interfaces and reusable systems designed to scale.",
    quickAnswer:
      "UI/UX design combines user research, information architecture, interaction design, visual design, prototyping, and reusable components to create clear and consistent digital products.",
    idealFor: [
      "Teams designing a new web or mobile product",
      "Companies redesigning a confusing or inconsistent user experience",
      "Organizations that need a reusable component library and design standards",
      "Product teams improving collaboration between designers and developers",
    ],
    faqs: [
      {
        question: "What is the difference between UI and UX design?",
        answer: "UX design focuses on user goals, journeys, structure, and usability. UI design focuses on the visual and interactive presentation of screens, components, states, typography, spacing, and color.",
      },
      {
        question: "What is a design system?",
        answer: "A design system is a documented collection of reusable foundations, components, patterns, states, and guidelines that helps teams build consistent digital experiences efficiently.",
      },
      {
        question: "Does EigenSol create clickable prototypes?",
        answer: "Yes. EigenSol can create wireframes and interactive prototypes to validate navigation, workflows, content hierarchy, responsive behavior, and product decisions before development.",
      },
      {
        question: "Can EigenSol improve an existing product interface?",
        answer: "Yes. EigenSol can audit the current experience, identify usability and consistency issues, redesign priority journeys, and create a scalable interface system for future features.",
      },
    ],
    hero: {
      lines: ["Design Systems", "That Make Products", "Feel Effortless"],
      badge: "UI / UX",
      description:
        "We connect user research, product flows, interface craft, and reusable components so teams can build consistent experiences without slowing down.",
    },
    metrics: [
      { value: 1, label: ["Shared Design", "Language"] },
      { value: 4, label: ["Validation", "Stages"] },
      { value: 6, label: ["Core", "Foundations"] },
    ],
    overview: {
      description:
        "UI/UX design systems create a shared language for product teams. They combine evidence-based user journeys with reusable components, states, patterns, and implementation guidance so the product remains coherent as features and teams grow.",
      approachTitle: "Our Approach to Product Design",
      steps: [
        "Research and experience audit - understanding users, product goals, pain points, and interface inconsistencies.",
        "Flows and interaction design - shaping information architecture, journeys, wireframes, and prototypes.",
        "Visual system development - defining typography, color, spacing, components, states, and responsive behavior.",
        "Validation and handoff - testing with users and collaborating closely with engineers through implementation.",
      ],
    },
    capabilities: [
      {
        title: "Research and product direction",
        categories: ["Experience audits", "User journeys", "Information architecture"],
      },
      {
        title: "Interface and interaction design",
        categories: ["Wireframes and prototypes", "Responsive UI", "Motion direction"],
      },
      {
        title: "Design systems at scale",
        categories: ["Component libraries", "Tokens and guidelines", "Developer handoff"],
      },
    ],
    process: {
      title: ["Design systems for", "clear experiences"],
      steps: [
        {
          number: "01",
          title: ["Research", "And Audit"],
          description: "Review user needs, product goals, and the current experience.",
        },
        {
          number: "02",
          title: ["Flow", "And Prototype"],
          description: "Make journeys tangible and testable before visual refinement.",
        },
        {
          number: "03",
          title: ["Systemize", "And Document"],
          description: "Create reusable foundations, components, patterns, and states.",
        },
        {
          number: "04",
          title: ["Validate", "And Support"],
          description: "Test the experience and support faithful implementation.",
        },
      ],
    },
  },
  {
    slug: "cloud-devops",
    title: "Cloud & DevOps",
    lines: ["Cloud &", "DevOps"],
    shortDescription:
      "Reliable infrastructure, deployment automation, observability, and security.",
    quickAnswer:
      "Cloud and DevOps services improve how software is deployed, secured, monitored, scaled, backed up, and operated through reliable infrastructure and delivery automation.",
    idealFor: [
      "Teams with slow, manual, or unreliable deployments",
      "Businesses migrating applications to cloud infrastructure",
      "Organizations that need CI/CD, monitoring, backups, and recovery controls",
      "Product teams improving security, scalability, uptime, or infrastructure cost",
    ],
    faqs: [
      {
        question: "What is DevOps?",
        answer: "DevOps is a set of engineering and operational practices that connects software development with deployment, infrastructure, testing, monitoring, security, and continuous improvement.",
      },
      {
        question: "What cloud platforms can EigenSol work with?",
        answer: "EigenSol can design and operate solutions across major cloud and server environments, selecting infrastructure based on the application, security, reliability, budget, and operational requirements.",
      },
      {
        question: "Can EigenSol automate deployments?",
        answer: "Yes. EigenSol can implement CI/CD pipelines, automated testing, repeatable builds, environment promotion, infrastructure configuration, rollback procedures, and deployment monitoring.",
      },
      {
        question: "Does Cloud and DevOps work include monitoring and backups?",
        answer: "Yes. Engagements can include logs, metrics, alerts, uptime monitoring, access controls, backup schedules, recovery testing, operational runbooks, and incident-response improvements.",
      },
    ],
    hero: {
      lines: ["Cloud Platforms", "Built to Scale with", "Confidence"],
      badge: "Cloud",
      description:
        "We make infrastructure easier to release, observe, secure, and operate so product teams can move quickly without losing control.",
    },
    metrics: [
      { value: 3, label: ["Delivery", "Environments"] },
      { value: 4, label: ["Reliability", "Controls"] },
      { value: 1, label: ["Platform", "Team"] },
    ],
    overview: {
      description:
        "Cloud and DevOps engineering turns infrastructure into a repeatable product capability. EigenSol connects cloud architecture, automated delivery, security controls, observability, and operational ownership to reduce release risk and improve reliability.",
      approachTitle: "Our Approach to Cloud Delivery",
      steps: [
        "Platform assessment - reviewing architecture, deployment paths, environments, security, and operational risks.",
        "Infrastructure design - defining cloud resources, networking, data services, access, and recovery strategy.",
        "Delivery automation - implementing repeatable builds, tests, deployments, and environment promotion.",
        "Observability and operations - adding logs, metrics, alerts, runbooks, and continuous reliability improvements.",
      ],
    },
    capabilities: [
      {
        title: "Cloud architecture and migration",
        categories: ["Platform assessment", "Cloud foundations", "Migration planning"],
      },
      {
        title: "Delivery automation",
        categories: ["CI/CD pipelines", "Infrastructure as code", "Environment strategy"],
      },
      {
        title: "Reliability and security",
        categories: ["Observability", "Access controls", "Backup and recovery"],
      },
    ],
    process: {
      title: ["Infrastructure made", "predictable"],
      steps: [
        {
          number: "01",
          title: ["Assess", "And Baseline"],
          description: "Review the platform, release flow, risks, and operational load.",
        },
        {
          number: "02",
          title: ["Architect", "And Automate"],
          description: "Define infrastructure and encode repeatable environment delivery.",
        },
        {
          number: "03",
          title: ["Secure", "And Observe"],
          description: "Add access controls, telemetry, alerts, and recovery safeguards.",
        },
        {
          number: "04",
          title: ["Operate", "And Improve"],
          description: "Use production evidence to strengthen cost, speed, and reliability.",
        },
      ],
    },
  },
  {
    slug: "ai-machine-learning",
    title: "AI & Machine Learning",
    lines: ["AI & Machine", "Learning"],
    shortDescription:
      "Applied intelligence and automation built around measurable business value.",
    quickAnswer:
      "AI and machine learning services use data, models, automation, and application engineering to improve decisions, accelerate workflows, and add intelligent features to digital products.",
    idealFor: [
      "Businesses automating repetitive knowledge or data-processing work",
      "Teams adding AI assistants, search, recommendations, or document intelligence",
      "Organizations that need measurable evaluation before deploying an AI solution",
      "Companies integrating machine learning or large language models into existing products",
    ],
    faqs: [
      {
        question: "What AI solutions does EigenSol build?",
        answer: "EigenSol can build AI assistants, document-processing workflows, intelligent search, classification systems, recommendation features, machine-learning pipelines, and AI-powered business automation.",
      },
      {
        question: "How does EigenSol decide whether an AI use case is practical?",
        answer: "EigenSol evaluates the business outcome, available data, expected quality, cost, latency, risks, user workflow, and fallback requirements before recommending a production approach.",
      },
      {
        question: "Can AI be integrated into an existing application?",
        answer: "Yes. EigenSol can connect AI capabilities to existing products through APIs, permissions, user interfaces, databases, workflow rules, monitoring, and human-review controls.",
      },
      {
        question: "How is AI quality measured after launch?",
        answer: "Production AI can be monitored using task-specific evaluation criteria, user feedback, failure rates, latency, cost, safety checks, fallback usage, and reviewed real-world examples.",
      },
    ],
    hero: {
      lines: ["Applied AI", "That Turns Data", "Into Decisions"],
      badge: "AI / ML",
      description:
        "We build practical AI workflows, intelligent features, and production pipelines around a clear business outcome rather than a disconnected experiment.",
    },
    metrics: [
      { value: 3, label: ["Model", "Stages"] },
      { value: 4, label: ["Quality", "Gates"] },
      { value: 1, label: ["Production", "Team"] },
    ],
    overview: {
      description:
        "AI and machine learning delivery starts with the decision or workflow that needs to improve. EigenSol connects data readiness, model or provider selection, application engineering, evaluation, monitoring, and human oversight into one production system.",
      approachTitle: "Our Approach to Applied AI",
      steps: [
        "Opportunity and data discovery - defining the business outcome, available evidence, risks, and success measures.",
        "Prototype and evaluation - testing model approaches against representative inputs and measurable quality criteria.",
        "Product integration - connecting intelligence to user workflows, APIs, permissions, and operational controls.",
        "Production monitoring - tracking quality, cost, latency, failures, and feedback after release.",
      ],
    },
    media: {
      overview:
        "/agntix-service-details/ai-machine-learning/ai-machine-learning-overview.webp",
    },
    capabilities: [
      {
        title: "AI product strategy",
        categories: ["Use-case discovery", "Data readiness", "Evaluation design"],
      },
      {
        title: "Intelligent product engineering",
        categories: ["LLM applications", "Machine learning pipelines", "Workflow automation"],
      },
      {
        title: "Production AI operations",
        categories: ["Quality monitoring", "Cost and latency control", "Human oversight"],
      },
    ],
    process: {
      title: ["Intelligence made for", "real workflows"],
      steps: [
        {
          number: "01",
          title: ["Define", "And Measure"],
          description: "Choose the decision, workflow, data, and quality target that matter.",
        },
        {
          number: "02",
          title: ["Prototype", "And Evaluate"],
          description: "Test approaches against representative inputs and clear criteria.",
        },
        {
          number: "03",
          title: ["Integrate", "And Guard"],
          description: "Connect the model to the product with permissions and fallback paths.",
        },
        {
          number: "04",
          title: ["Monitor", "And Improve"],
          description: "Track quality, cost, latency, failures, and real user feedback.",
        },
      ],
    },
  },
  {
    slug: "digital-marketing-content-creation",
    title: "Digital Marketing & Content Creation",
    lines: ["Digital Marketing", "& Content Creation"],
    shortDescription:
      "Strategy, campaigns, and content systems that grow visibility, engagement, and qualified demand.",
    quickAnswer:
      "Digital marketing uses search, social media, paid advertising, content, analytics, and conversion optimization to attract the right audience and generate measurable business growth.",
    idealFor: [
      "Businesses that need more qualified leads, traffic, or online visibility",
      "Brands launching a new product, service, or market campaign",
      "Companies that need consistent social, search, and website content",
      "Teams improving paid advertising, SEO, analytics, or conversion performance",
    ],
    faqs: [
      {
        question: "What is included in EigenSol digital marketing services?",
        answer: "Services can include audience research, campaign strategy, paid media, SEO content, social media content, copywriting, creative production, analytics, reporting, and conversion optimization.",
      },
      {
        question: "How long does digital marketing take to show results?",
        answer: "Paid campaigns can begin generating measurable traffic quickly, while SEO, organic content, brand visibility, and audience growth usually require consistent work over a longer period.",
      },
      {
        question: "Does EigenSol provide both content creation and campaign management?",
        answer: "Yes. EigenSol can connect content planning and production with organic publishing, paid campaigns, targeting, landing pages, performance analysis, and ongoing optimization.",
      },
      {
        question: "How is digital marketing performance measured?",
        answer: "Performance is measured against agreed goals such as qualified leads, conversions, cost per acquisition, search visibility, engagement, website behavior, campaign return, and revenue contribution.",
      },
    ],
    hero: {
      lines: ["Digital Marketing", "Built to Earn", "Attention & Growth"],
      badge: "Growth",
      description:
        "We combine audience insight, channel strategy, creative production, and performance analysis to help brands attract the right people and turn attention into measurable growth.",
    },
    metrics: [
      { value: 5, label: ["Core", "Channels"] },
      { value: 4, label: ["Campaign", "Phases"] },
      { value: 1, label: ["Integrated", "Team"] },
    ],
    overview: {
      description:
        "Digital marketing and content creation work best as one connected system. EigenSol aligns positioning, campaign strategy, search visibility, social media, paid acquisition, creative production, and analytics around clear business goals instead of disconnected posts and short-term activity.",
      approachTitle: "Our Approach to Digital Growth",
      steps: [
        "Audience and market discovery - understanding customers, competitors, channels, positioning, and conversion goals.",
        "Campaign and content strategy - defining messages, formats, publishing plans, channel roles, budgets, and success measures.",
        "Creative production and activation - producing content and launching coordinated organic and paid campaigns.",
        "Measurement and optimization - reviewing performance, improving creative, refining targeting, and scaling what works.",
      ],
    },
    media: {
            overview:
              "/agntix-service-details/digital-marketing/Digital-marketing-1024x576.jpg",
            banner:
              "/agntix-service-details/digital-marketing/banner.jpg",
            pair: [
              "/agntix-service-details/digital-marketing/images.jpg",
              "/agntix-service-details/digital-marketing/Digital-marketing-1024x576.jpg",
            ],
          },
          capabilities: [
      {
        title: "Marketing strategy and acquisition",
        categories: ["Campaign strategy", "Paid media", "Audience targeting"],
      },
      {
        title: "Content and brand storytelling",
        categories: ["Social content", "Copywriting", "Creative production"],
      },
      {
        title: "Search, analytics, and optimization",
        categories: ["SEO content", "Performance reporting", "Conversion optimization"],
      },
    ],
    process: {
      title: ["Content and campaigns", "built for growth"],
      steps: [
        {
          number: "01",
          title: ["Research", "And Insights"],
          description: "Understand the audience, market, competitors, channels, and growth opportunity.",
        },
        {
          number: "02",
          title: ["Strategy", "And Planning"],
          description: "Define positioning, campaign priorities, content pillars, and measurable targets.",
        },
        {
          number: "03",
          title: ["Create", "And Launch"],
          description: "Produce platform-ready content and activate coordinated organic and paid campaigns.",
        },
        {
          number: "04",
          title: ["Measure", "And Improve"],
          description: "Analyze results, refine creative and targeting, and scale the strongest opportunities.",
        },
      ],
    },
  },

] as const;

export const getServiceBySlug = (slug: string) =>
  serviceOfferings.find((service) => service.slug === slug);
