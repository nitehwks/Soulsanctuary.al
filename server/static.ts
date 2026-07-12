import express, { type Express } from "express";
import fs from "fs";
import path from "path";

interface RouteMetadata {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageAlt: string;
  jsonLd: object[];
  staticBodyContent: string;
}

const ROUTE_METADATA: Record<string, RouteMetadata> = {
  "/": {
    title: "SoulSanctuary – Christian AI Companion for Faith & Healing",
    description:
      "SoulSanctuary is a faith-integrated AI companion combining Christian prayer, scripture, and evidence-based therapy to help you find peace, healing, and spiritual growth.",
    ogTitle: "SoulSanctuary – Christian AI Companion for Faith & Healing",
    ogDescription:
      "Your trusted confidant combining faith-based support with evidence-based therapy. Prayer, scripture, and therapeutic tools — all in one private, secure AI companion.",
    ogUrl: "https://soulsanctuary.app/",
    twitterTitle: "SoulSanctuary – Christian AI Companion for Faith & Healing",
    twitterDescription:
      "Your trusted confidant combining faith-based support with evidence-based therapy. Prayer, scripture, and therapeutic tools — all in one private, secure AI companion.",
    twitterImageAlt:
      "SoulSanctuary – faith-integrated AI companion for Christian prayer, scripture, and healing",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "SoulSanctuary",
        url: "https://soulsanctuary.app/",
        description:
          "Faith-integrated AI companion combining Christian prayer, scripture meditation, and evidence-based therapeutic support.",
        sameAs: [],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "SoulSanctuary",
        url: "https://soulsanctuary.app/",
        description:
          "Find your sanctuary within. A faith-integrated AI companion offering prayer, scripture, and therapeutic support.",
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "SoulSanctuary",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web, iOS, Android",
        url: "https://soulsanctuary.app/",
        description:
          "Faith-integrated AI companion offering prayer, scripture, and evidence-based therapeutic support including DBT, CBT, ACT, and mindfulness techniques.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free beta access — limited seats available.",
        },
        featureList: [
          "Christian prayer and scripture guidance",
          "DBT, CBT, ACT therapeutic techniques",
          "Mindfulness and grounding exercises",
          "Crisis detection and safety protocols",
          "Private and encrypted conversations",
          "Faith-based and secular support modes",
        ],
      },
    ],
    staticBodyContent: `
<noscript>
  <header>
    <nav><a href="/">SoulSanctuary</a></nav>
  </header>
  <main>
    <h1>Find Your Sanctuary Within</h1>
    <p>Your trusted confidant combining faith-based support with evidence-based therapy. Be lifted up, find healing, and grow in faith and strength.</p>
    <p><em>"The Lord is close to the brokenhearted and saves those who are crushed in spirit." — Psalm 34:18</em></p>
    <h2>Faith-Integrated AI Companion</h2>
    <p>SoulSanctuary blends Christian prayer, scripture meditation, and proven therapeutic practices — DBT, CBT, ACT, mindfulness, and grounding — into a private, secure AI companion available 24/7.</p>
    <ul>
      <li>Prayer and scripture guidance rooted in your faith</li>
      <li>Evidence-based therapy techniques (DBT, CBT, ACT)</li>
      <li>Mindfulness, box breathing, and grounding exercises</li>
      <li>Crisis detection with built-in safety protocols</li>
      <li>AES-256 encrypted, private conversations</li>
      <li>Optional secular mode — faith features can be disabled</li>
    </ul>
    <p><a href="/sign-in">Sign In</a> or <a href="/sales">See Plans &amp; Pricing</a></p>
  </main>
</noscript>
`,
  },
  "/sales": {
    title: "SoulSanctuary Plans & Pricing – Faith-Integrated AI Therapy",
    description:
      "Explore SoulSanctuary plans and pricing. Get always-on Christian AI therapy, prayer, scripture, and evidence-based care. Free beta access available — limited seats.",
    ogTitle: "SoulSanctuary Plans & Pricing – Faith-Integrated AI Therapy",
    ogDescription:
      "Always-on Christian AI therapy and companionship. Prayer, scripture, DBT, CBT, and mindfulness — in one secure app. Free beta access available.",
    ogUrl: "https://soulsanctuary.app/sales",
    twitterTitle:
      "SoulSanctuary Plans & Pricing – Faith-Integrated AI Therapy",
    twitterDescription:
      "Always-on Christian AI therapy and companionship. Prayer, scripture, DBT, CBT, and mindfulness — in one secure app. Free beta access available.",
    twitterImageAlt:
      "SoulSanctuary pricing and plans for faith-integrated AI therapy and Christian companionship",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "SoulSanctuary – Faith-Integrated AI Companion",
        serviceType: "AI Therapy & Spiritual Companion",
        provider: {
          "@type": "Organization",
          name: "SoulSanctuary",
          url: "https://soulsanctuary.app/",
        },
        url: "https://soulsanctuary.app/sales",
        description:
          "Always-on AI trusted confidant and therapist offering prayers, scripture, and evidence-based care. Combines Christian faith guidance with DBT, CBT, ACT, and mindfulness therapy.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free beta — limited seats available.",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is SoulSanctuary?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "SoulSanctuary is a faith-integrated AI companion that combines Christian prayer, scripture, and evidence-based therapeutic techniques such as DBT, CBT, ACT, and mindfulness to provide emotional support and spiritual growth.",
            },
          },
          {
            "@type": "Question",
            name: "Is SoulSanctuary free?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "SoulSanctuary is currently in free beta with limited seats available. Sign up now to secure your place.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use SoulSanctuary without faith content?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. SoulSanctuary offers a secular support mode where faith-based features such as prayer and scripture can be disabled, providing evidence-based therapeutic support without religious content.",
            },
          },
        ],
      },
    ],
    staticBodyContent: `
<noscript>
  <header>
    <nav><a href="/">SoulSanctuary</a> &nbsp;|&nbsp; <a href="/sales">Plans &amp; Pricing</a></nav>
  </header>
  <main>
    <h1>Process the heaviest emotions with an AI companion that remembers, prays with you, and never flinches.</h1>
    <p>SoulSanctuary is your always-on AI trusted confidant and therapist — offering prayers, scripture, and evidence-based care. Pour out everything: trauma, triggers, doubts about God, and the things you've never said out loud.</p>
    <h2>Why SoulSanctuary?</h2>
    <ul>
      <li>Listens, remembers context across sessions, and never judges</li>
      <li>Prays with you and offers scripture relevant to your situation</li>
      <li>Applies DBT, CBT, ACT, and mindfulness techniques</li>
      <li>Available 24/7 — no appointments, no waitlists</li>
      <li>Private and encrypted; your data is never sold</li>
      <li>Secular mode available — faith features can be disabled</li>
    </ul>
    <h2>Pricing</h2>
    <p>Currently in <strong>free beta</strong> with limited seats. <a href="/sign-in">Sign up now</a> to secure your place before paid plans launch.</p>
    <p><em>"Come to me, all you who are weary and burdened, and I will give you rest." — Matthew 11:28</em></p>
  </main>
</noscript>
`,
  },
};

const SEO_BLOCK_RE = /<!--__SEO_START__-->[\s\S]*?<!--__SEO_END__-->/;
const ROUTE_BODY_PLACEHOLDER = "<!--__ROUTE_BODY__-->";

function buildRouteHead(meta: RouteMetadata): string {
  const jsonLdBlocks = meta.jsonLd
    .map(
      (schema) =>
        `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
    )
    .join("\n    ");

  return `<!--__SEO_START__-->
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta property="og:site_name" content="SoulSanctuary" />
    <meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(meta.ogUrl)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="/opengraph.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.twitterTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.twitterDescription)}" />
    <meta name="twitter:image" content="/opengraph.jpg" />
    <meta name="twitter:image:alt" content="${escapeHtml(meta.twitterImageAlt)}" />
    ${jsonLdBlocks}
    <!--__SEO_END__-->`;
}

function buildRouteHtml(template: string, meta: RouteMetadata): string {
  return template
    .replace(SEO_BLOCK_RE, buildRouteHead(meta))
    .replace(ROUTE_BODY_PLACEHOLDER, meta.staticBodyContent);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Disable automatic index.html serving so our explicit route handlers
  // for "/" and "/sales" always take precedence over express.static's default.
  app.use(express.static(distPath, { index: false }));

  const indexPath = path.resolve(distPath, "index.html");
  const indexTemplate = fs.readFileSync(indexPath, "utf-8");

  for (const [route, meta] of Object.entries(ROUTE_METADATA)) {
    const html = buildRouteHtml(indexTemplate, meta);
    app.get(route, (_req, res) => {
      res.status(200).type("text/html").send(html);
    });
  }

  const clientRoutes = new Set([
    "/",
    "/sales",
    "/sign-in",
    "/sign-up",
    "/dashboard",
    "/settings",
    "/docs",
    "/addons",
    "/groups",
    "/analytics",
    "/clinician",
    "/feature-flags",
  ]);
  app.use("*", (req, res) => {
    const pathname = req.path;
    const isSpaRoute =
      clientRoutes.has(pathname) ||
      pathname.startsWith("/sign-in/") ||
      pathname.startsWith("/sign-up/");
    const status = isSpaRoute ? 200 : 404;
    res.status(status).sendFile(indexPath);
  });
}
