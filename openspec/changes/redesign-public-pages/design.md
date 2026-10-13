## Design direction
The user requested a revision on 2026-10-13: simple, direct text aimed at 12-year-olds, with a more colourful and fun appearance. Use literal page headings such as “Join the club”, “Club projects”, and “When and where we meet”. Avoid promotional slogans and abstract claims.

The homepage says “Make games. Learn to code.” and explains what kids can do at the club. Its main actions remain joining and planning a visit. Purple actions, blue/yellow/pink/purple topic cards, stronger borders, offset shadows, and a subtle dot pattern make the design more playful. Dark mode retains the same colour families with readable text and bright accents. Existing photography and branding remain in use.

## Page map and content
| Existing URL | Page | Content direction |
| --- | --- | --- |
| `/home.html` | Home | Introduction, joining and visit actions, club photograph, essential facts, links to all public sections |
| `/_about.html` | About | Volunteer-led learning, teamwork, show-and-tell, “Above all: be cool”, supporters and donation path |
| `/_join.html` | Join | Ages 7+, beginner welcome, existing expression-of-interest form, invitation/registration steps, volunteer contact |
| `/_whenwhere.html` | Visit | Existing Saturday 10–12 term-time information, CBS Primary School, accompanying adults for ages 12 and under, calendar and directions |
| `/_topics.html` | Explore | Compact topic groups for coding, games, web, 3D and electronics; curated existing resources and local download links |
| `/_members.html` | Members & projects | Brief introduction plus existing publicly returned member/mentor GitHub entries, with loading, empty, and error states |
| `/_news.html` | News | Facebook as the update source; older mentor notes clearly labeled as an archive |
| `/_contact.html` | Contact | Email and Facebook, with clear descriptive link text |
| `/_privacy.html` | Privacy | Plain-language organization of existing policy content, retaining material disclosures and contact details |

Do not assert that an intake is open or a particular session is upcoming. Use the existing calendar and contact channels for current availability. Keep legal policy modernization separate from this visual/content redesign if it would require a substantive policy decision.

## Structure and styling
Use standalone static HTML because this is the existing public boundary and the user explicitly requests HTML without embedded CSS. Preserve current URLs to avoid introducing Vue routes or touching member layouts and application-wide styles.

Each document contains a skip link, shared header and labeled navigation, one main landmark, one h1, logical sections/headings, and a shared footer. Use semantic elements appropriate to the content and descriptive CSS classes; IDs serve anchor and accessibility relationships only. The active page uses `aria-current="page"`. Navigation wraps on narrow screens and remains usable without JavaScript.

Every page loads only `/css/public.css`. All visual choices live in custom properties and reusable classes in that file. Use a light baseline, dark variable overrides under `prefers-color-scheme: dark`, `color-scheme: light dark`, mobile-first grids, responsive type, visible focus states, and appropriately sized link targets. Avoid animation unless it serves a clear purpose, and honor `prefers-reduced-motion`.

## Existing behavior
The GitHub directory continues to use `/api/githubaccounts`, its existing published response, and safe text/URL construction. A public-only data helper owns fetching and state, keeping presentation separate from data access. No new endpoint or database query is needed. Inspect the actual endpoint contract before implementation.

Preserve member sign-in at its current destination. Preserve old modal hashes on `/home.html` by mapping known hashes to the corresponding standalone pages with a small public-only script. Scripts must not inject inline CSS. Leave `js/app.js`, old theme files, and excluded pages unchanged.

## Verification
Check nine documents for semantic landmarks, heading order, a single shared CSS link, absence of embedded presentation, and resolvable internal links/assets. Verify all navigation and existing hash destinations, directory success/empty/error states, and current external integration paths. Inspect desktop and 360px mobile views in light and dark mode; check keyboard access, text zoom, contrast, and horizontal overflow. Run the production build when dependencies are available. Do not run the repository's format or test scripts automatically.
