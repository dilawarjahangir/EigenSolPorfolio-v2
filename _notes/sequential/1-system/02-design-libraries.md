# Libraries and Design Usage

Libraries are ordered by their visible influence on the current interface.

| Priority | Library or approach | Current usage | Design role |
|---:|---|---:|---|
| 1 | CSS Modules | 29 module stylesheets | Primary styling system for page layouts, sections, themes, responsive rules, and component states. |
| 2 | GSAP suite | 9 components | Smooth scrolling, scroll triggers, text splitting, timelines, motion paths, and custom interactions. |
| 3 | Next.js Image | 23 imports | Responsive image delivery across heroes, portfolios, team content, blogs, and galleries. |
| 4 | Lucide React | 22 imports | Main icon library for navigation, controls, actions, metadata, and form affordances. |
| 5 | Swiper | 4 components | Carousels for testimonials, team members, positioning content, and service partners. |
| 6 | Motion | 3 imports | In-view detection and lightweight React animation through `motion/react`. |
| 7 | imagesLoaded | 5 components | Delays animation and smooth-scroll setup until page media is ready. |
| 8 | Tailwind CSS 4 | Configured, lightly used | Supplies global utility support, while most visual styling remains in CSS Modules. |
| 9 | Next.js and React | Application-wide | Provide routing, rendering, metadata, links, images, portals, and client state. |
| 10 | TypeScript | Application-wide | Defines component props, route parameters, and structured project, service, and blog data. |

## Animation Notes

- **Primary motion engine:** GSAP is the dominant animation system.
- **Smooth scrolling:** Multiple experience wrappers initialize `ScrollSmoother` and `ScrollTrigger`.
- **Text animation:** `SplitText` is used on high-visibility landing experiences.
- **Supplementary motion:** Motion handles smaller in-view and counter behaviors.
- **Carousel motion:** Swiper manages repeatable slide-based interactions.

## Styling Notes

- **Component scope:** Most components pair with a colocated `.module.css` file.
- **Global layer:** `src/app/globals.css` handles global variables, resets, fonts, and Tailwind integration.
- **Theme support:** Light and dark modes are initialized before rendering and exposed through `ThemeToggle`.
- **Typography:** Local Clash Display, Inter, and decorative font assets are stored under `public/fonts`.
