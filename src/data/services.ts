export type ServiceSlug =
  | "custom-software-development"
  | "web-application-development"
  | "mobile-app-development"
  | "ui-ux-design-systems"
  | "cloud-devops"
  | "ai-machine-learning";

export type ServiceMetric = {
  value: number;
  suffix?: string;
  label: readonly [string, string];
};

export type ServiceCapability = {
  title: string;
  categories: readonly string[];
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
] as const;

export const getServiceBySlug = (slug: string) =>
  serviceOfferings.find((service) => service.slug === slug);
