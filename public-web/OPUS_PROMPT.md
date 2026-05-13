Build a polished single-page public marketing website for the product in this repo: **JDK Manager**.

Context from the codebase:
- This is a Windows-first Java version manager.
- It has a Rust CLI binary named `jdkman`.
- It also has a Tauri desktop app built with React.
- The CLI supports:
  - `list`
  - `add <alias> <path>`
  - `remove <alias>`
  - `use <alias>`
  - `current`
  - `scan --auto-add`
  - `doctor`
  - `export-shell <alias> --shell powershell|cmd`
- The product value is managing multiple JDK installations on Windows without manually fighting `JAVA_HOME` and `PATH`.
- The scanner checks the Windows registry, `JAVA_HOME`, and common vendor directories such as:
  - `C:\Program Files\Java`
  - Eclipse Adoptium
  - Zulu
  - Amazon Corretto
  - BellSoft
  - GraalVM
  - SapMachine
- The desktop app has pages for:
  - Dashboard
  - Versions
  - Scan
  - Diagnostics / Doctor
  - Settings
- Real product behaviors that should shape the copy:
  - It can auto-discover installed JDKs.
  - It can import an existing `JAVA_HOME`.
  - It can validate whether configured JDK paths are real and usable.
  - It can switch the active JDK by updating the Windows user environment.
  - It explains that already-open terminals may need to be reopened.
  - It can emit inline shell commands for PowerShell or CMD.
  - It warns when system-wide changes need Administrator access.

What I want:
- Create a **single-page Next.js website** in the `app` router style.
- This is a **public presentation / landing page**, not the product app itself.
- The site should feel like a serious developer tool brand.
- The page should be visually strong, modern, and memorable, but still credible for engineers.
- It should work well on both desktop and mobile.

Design direction:
- Avoid generic AI-looking SaaS layouts.
- Avoid default white-purple startup styling.
- Use a distinctive visual identity with strong typography, subtle atmosphere, and a Windows/dev-tool feel.
- Make it feel fast, sharp, and product-led.
- A warm industrial palette is welcome: off-white, deep slate, teal/green, and one energetic accent like orange.
- Prefer layered backgrounds, subtle grid/panel motifs, and terminal/product-inspired framing.

Content structure:
1. Hero
   - Strong headline about switching Java versions on Windows without environment-variable pain.
   - Supporting copy that explains the problem and the solution quickly.
   - Primary CTA for download or GitHub.
   - Secondary CTA for docs or CLI usage.
2. Core value section
   - Explain why JDK Manager exists.
   - Emphasize both CLI and desktop app.
3. Features section
   - Auto-discovery of installed JDKs
   - Alias-based version switching
   - Diagnostics / doctor
   - PATH and `JAVA_HOME` visibility
   - Import existing `JAVA_HOME`
   - Session export commands
4. CLI showcase
   - Include tasteful terminal snippets using real commands from the repo.
5. Desktop app section
   - Present the Dashboard, Versions, Scan, Diagnostics, and Settings flows.
6. Audience / use cases
   - Developers working across Java 8/11/17/21
   - Teams onboarding across multiple projects
   - People recovering from broken Java environments
7. Final CTA section
   - Ready for download / GitHub / docs links

Implementation constraints:
- Use Next.js App Router components only.
- Keep it as a single page.
- Use clean semantic sections.
- Use Tailwind CSS for styling.
- Do not add unnecessary libraries unless clearly justified.
- Keep code readable and production-quality.
- Use metadata appropriate for the product.
- Use expressive fonts, not the default system font stack.
- Make sure spacing, contrast, and responsive behavior feel intentional.

Tone of copy:
- Clear
- technical but approachable
- confident
- not overhyped
- written for developers

Important:
- Base the messaging on the actual capabilities above.
- Do not invent cloud features, team sync, AI features, or cross-platform claims that are not supported.
- This product is specifically strongest on Windows, so lean into that honestly.
- Leave placeholder hrefs where release/download/doc links are not yet known.

Deliver:
- `app/page.tsx`
- `app/globals.css` if needed
- `app/layout.tsx` metadata and fonts if needed

Produce the final code directly.
