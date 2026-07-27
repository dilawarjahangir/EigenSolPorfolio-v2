# Component Breakdown

## Counts

The project contains 44 TSX component files under `src/components`.

| Component category | Count | Scope |
|---|---:|---|
| Page and feature components | 25 | Page-specific compositions, sections, forms, galleries, and content displays. |
| Shared site components | 8 | Header, footer, shells, legal layout, page hero, CTA, and shared section heading. |
| Experience and animation wrappers | 5 | Route-level smooth scrolling, loading coordination, and GSAP setup. |
| Reusable UI atoms and helpers | 5 | Theme control, counters, back-to-top behavior, and small visual primitives. |
| Routing and scroll utility | 1 | Resets scroll behavior after route changes. |
| **Total** | **44** | All TSX files within `src/components`. |

## Page and Feature Components

- **Home components:** Eight section components compose the landing page from hero through testimonials.
  - **HeroSection:** Main introduction and primary calls to action.
  - **PositioningBanner:** Animated positioning statement, metrics, and carousel.
  - **ServicesSection:** Service cards and links to service routes.
  - **VideoSection:** Media-led technology showcase.
  - **CreativeProjectsSection:** Featured portfolio grid and cursor behavior.
  - **FunFactsSection:** Statistics and image composition.
  - **CreativeTeamSection:** Team member presentation.
  - **ClientTestimonialsSection:** Swiper-based client feedback.

- **About components:** Components under `components/about` support the company profile page.
  - **AboutUsPage:** Main page composition.
  - **AboutTeamCarousel:** Reusable team carousel.
  - **SelectedWorkRail:** Draggable project rail.

- **Blog components:** Components under `components/blogs` handle listing and detail experiences.
  - **BlogGridPage:** Article listing composition.
  - **BlogDetailsPage:** Full article presentation.
  - **BlogComments:** Comment display.
  - **BlogReplyForm:** Client-side reply form.
  - **BlogVideoButton:** Video modal trigger and portal.

- **Case-study components:** Components under `components/case-studies` support portfolio browsing and detail media.
  - **MetroWorkPage:** Main portfolio page composition.
  - **MetroProjectRow:** Reusable project list row.
  - **CaseStudiesExplorer:** Filterable project exploration variant.
  - **ProjectGallery:** Gallery carousel and expanded viewer.

- **Contact components:** Components under `components/contact` provide two form implementations and the active contact page.
  - **AgntixContactPage:** Current contact page composition.
  - **AgntixContactForm:** Current project enquiry form.
  - **ContactForm:** Alternate reusable contact form.

- **Service components:** Components under `components/services` build service landing and detail pages.
  - **ServiceFourPage:** Main services composition with several internal sections.
  - **ServiceDetailsPage:** Data-driven service detail composition.

## Shared Site Components

- **Header:** Global navigation, responsive menu, active route state, and theme toggle.
- **CreativeStudioFooter:** Global footer, navigation, social links, and back-to-top action.
- **SitePageShell:** Shared wrapper that automatically includes header and footer.
- **PageHero:** Reusable inner-page hero with optional media and actions.
- **PageCta:** Reusable closing call-to-action section.
- **ShowcaseSectionHeader:** Shared heading pattern used by showcase sections.
- **LegalPage:** Shared renderer for privacy and terms content.
- **HistoryBackButton:** Reusable browser-history action used by the 404 page.

## Experience and Animation Wrappers

- **HomePageExperience:** Initializes home-page loading, smooth scroll, and GSAP effects.
- **AboutUsExperience:** Provides the same behavior for the about route.
- **MetroWorkExperience:** Adds portfolio-specific scroll and split-text effects.
- **ServiceFourExperience:** Adds service-specific scrolling and motion-path behavior.
- **AgntixInnerPageExperience:** Shared animated wrapper for blogs and contact pages.

## UI Atoms and Helpers

- **ThemeToggle:** Small reusable light and dark theme control.
- **CountUpNumber:** In-view animated number primitive.
- **AnimatedCounter:** Service-specific counter helper.
- **BackToTopLink:** Smooth-scroll-aware top navigation helper.
- **BlueprintLogoReveal:** Decorative reusable logo reveal primitive.

## Utility

- **RouteScrollReset:** Resets native and GSAP-managed scroll positions after navigation.
