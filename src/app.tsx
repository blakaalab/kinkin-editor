import { MotionConfig } from "motion/react";

import { SiteShell } from "./site/layout";
import { DocsPage } from "./site/pages/docs";
import { HomePage } from "./site/pages/home";
import { PlaygroundPage } from "./site/pages/playground";
import { ROUTES, useRoute } from "./site/router";

export function App() {
  const route = useRoute();

  // `reducedMotion="user"` makes every motion/react animation on the site honour
  // prefers-reduced-motion; the CSS-driven ones opt out in `styles/global.css`.
  return (
    <MotionConfig reducedMotion="user">
      {route === ROUTES.playground ? (
        <SiteShell fill>
          <PlaygroundPage />
        </SiteShell>
      ) : (
        <SiteShell>
          {route === ROUTES.docs ? <DocsPage /> : <HomePage />}
        </SiteShell>
      )}
    </MotionConfig>
  );
}
