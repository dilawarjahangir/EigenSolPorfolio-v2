# Pages and Sections

## Application Shell

- **Root layout:** Sets global metadata, theme bootstrap, global styles, and route scroll reset.
- **Shared chrome:** Most pages use the reusable header and creative studio footer.
- **Not found:** Provides a branded 404 screen with home and history-back actions.

## Routes

- **Home — `/`:** Main marketing and portfolio landing page.
  - **Hero:** Introduces EigenSol with primary navigation actions and logo reveal.
  - **Positioning:** Presents company positioning, metrics, and supporting carousel content.
  - **Services:** Summarizes core software, web, mobile, cloud, design, and AI offerings.
  - **Video showcase:** Displays visual product and technology media.
  - **Projects:** Highlights featured portfolio projects with custom cursor interaction.
  - **Fun facts:** Shows company statistics and supporting imagery.
  - **Team:** Introduces team members through a visual grid.
  - **Testimonials:** Displays client feedback in an autoplay carousel.

- **About — `/about`:** Company story, capabilities, work, metrics, and team presentation.
  - **About introduction:** Presents the company overview and visual identity.
  - **Metrics:** Reuses animated counters and the fun-facts presentation.
  - **Selected work:** Provides a draggable rail of portfolio projects.
  - **Team carousel:** Displays team members through Swiper.

- **Services — `/services`:** Full services landing page with interactive service exploration.
  - **Service hero:** Introduces the overall offering and positioning.
  - **Interactive services:** Links users to individual service detail routes.
  - **Capabilities:** Displays scrolling capability marquees.
  - **Solutions:** Summarizes service outcomes and technical strengths.
  - **Process:** Explains the working and delivery process.
  - **Engagements:** Describes available engagement models.
  - **Partners:** Displays partner logos in a carousel.

- **Service detail — `/services/[serviceId]`:** Data-driven detail page generated from `src/data/services.ts`.
  - **Hero and banner:** Uses service-specific titles, descriptions, and media.
  - **Overview:** Explains the service and expected outcomes.
  - **Capabilities:** Lists service-specific technical capabilities.
  - **Process:** Describes the delivery stages.
  - **Engagements:** Presents supported collaboration models.
  - **Related media:** Uses paired images and animated counters.

- **Case studies — `/case-studies`:** Portfolio explorer driven by `src/data/projects.ts`.
  - **Work introduction:** Establishes the portfolio theme and project count.
  - **Project rows:** Renders reusable project rows with category and navigation details.
  - **Animated experience:** Adds smooth scrolling, split text, and scroll-triggered effects.

- **Case study detail — `/case-studies/[projectId]`:** Data-driven project narrative and gallery.
  - **Project hero:** Shows project identity, category, links, and cover image.
  - **Overview:** Summarizes role, client, status, and engagement context.
  - **Challenge and solution:** Explains the operating problem and delivered approach.
  - **Features and architecture:** Lists product features and technical structure.
  - **Impact:** Highlights project outcomes.
  - **Gallery:** Provides carousel navigation and expanded image viewing.
  - **Related projects:** Links to additional case studies.

- **Blogs — `/blogs`:** Article index generated from `src/data/blogs.ts`.
  - **Blog hero:** Introduces EigenSol insights and editorial themes.
  - **Article grid:** Lists posts with metadata, images, and navigation.
  - **Video interaction:** Opens supported video content in a modal portal.

- **Blog detail — `/blogs/[slug]`:** Static article detail route generated from blog data.
  - **Article header:** Displays title, author, metadata, and feature media.
  - **Article body:** Renders structured editorial content.
  - **Social links:** Provides reusable social icon actions.
  - **Comments:** Displays sample discussion content.
  - **Reply form:** Provides a client-side comment form.
  - **Next article:** Links to the next available post.

- **Contact — `/contact`:** Contact page with optional prefilled message query parameter.
  - **Contact introduction:** Presents contact details and supporting imagery.
  - **Contact form:** Collects project and enquiry information.
  - **Locations:** Displays office and location content.

- **Careers — `/careers`:** Recruitment page built directly in its route file.
  - **Career hero:** Introduces the team and employment proposition.
  - **Values:** Lists cultural principles.
  - **Benefits:** Summarizes employee benefits and work practices.
  - **Open positions:** Displays current roles and application links.
  - **CTA:** Directs general applicants to the contact page.

- **Privacy policy — `/privacy-policy`:** Structured legal content rendered through `LegalPage`.
- **Terms and conditions — `/terms-and-conditions`:** Structured legal content rendered through `LegalPage`.
