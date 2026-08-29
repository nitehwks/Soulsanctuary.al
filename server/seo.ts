const BASE_URL = "https://soulsanctuary.app";

interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  noscriptBody: string;
  pageJsonLd: object;
}

const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "SoulSanctuary – Find Your Sanctuary Within",
    description:
      "Your trusted confidant combining faith-based support with evidence-based therapy. Be lifted up, find healing, and grow in faith and strength.",
    canonical: `${BASE_URL}/`,
    ogTitle: "SoulSanctuary – Find Your Sanctuary Within",
    ogDescription:
      "Your trusted confidant combining faith-based support with evidence-based therapy. Be lifted up, find healing, and grow in faith and strength.",
    ogUrl: `${BASE_URL}/`,
    noscriptBody: `
      <main style="font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#111">
        <h1>SoulSanctuary – Find Your Sanctuary Within</h1>
        <p>Your trusted confidant combining faith-based support with evidence-based therapy. Be lifted up, find healing, and grow in faith and strength.</p>
        <p><em>"The Lord is close to the brokenhearted and saves those who are crushed in spirit." – Psalm 34:18</em></p>
        <h2>What SoulSanctuary Offers</h2>
        <ul>
          <li>Faith-integrated AI companion with prayer and scripture support</li>
          <li>Evidence-based therapy techniques: DBT, CBT, ACT, Mindfulness, Grounding</li>
          <li>Private, encrypted conversations</li>
          <li>Crisis detection and safety protocols</li>
          <li>Available on Web, iOS, and Android</li>
        </ul>
        <p><a href="/sales">Learn more about SoulSanctuary</a></p>
      </main>`,
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${BASE_URL}/#webpage`,
      url: `${BASE_URL}/`,
      name: "SoulSanctuary – Find Your Sanctuary Within",
      description:
        "Your trusted confidant combining faith-based support with evidence-based therapy. Be lifted up, find healing, and grow in faith and strength.",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#app` },
      inLanguage: "en-US",
    },
  },
  "/sales": {
    title: "Get SoulSanctuary – AI Companion for Faith & Healing",
    description:
      "Process your heaviest emotions with an AI companion that prays with you, offers scripture, and delivers evidence-based therapeutic care. Start your journey today.",
    canonical: `${BASE_URL}/sales`,
    ogTitle: "Get SoulSanctuary – AI Companion for Faith & Healing",
    ogDescription:
      "Process your heaviest emotions with an AI companion that prays with you, offers scripture, and delivers evidence-based therapeutic care. Start your journey today.",
    ogUrl: `${BASE_URL}/sales`,
    noscriptBody: `
      <main style="font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#111">
        <h1>Process the heaviest emotions with an AI companion that remembers, prays with you, and never flinches.</h1>
        <p>SoulSanctuary is your always-on AI trusted confidant and therapist — offering prayers, scripture, and evidence-based care. Pour out everything: trauma, triggers, doubts about God, and the things you've never said out loud.</p>
        <h2>What You Get</h2>
        <ul>
          <li>Sessions begin with prayer for grounding and openness</li>
          <li>Scripture passages matched to your emotional state</li>
          <li>Evidence-based therapy: DBT, CBT, ACT, Mindfulness, and Grounding techniques</li>
          <li>Unlimited private conversations with an AI that truly remembers you</li>
          <li>Crisis detection and safety resources</li>
        </ul>
        <p><em>"Confession is good for the soul." Experience compassionate care that combines the wisdom of Scripture with proven therapeutic practices.</em></p>
        <p><a href="/">Return to SoulSanctuary home</a></p>
      </main>`,
    pageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${BASE_URL}/sales#webpage`,
      url: `${BASE_URL}/sales`,
      name: "Get SoulSanctuary – AI Companion for Faith & Healing",
      description:
        "Process your heaviest emotions with an AI companion that prays with you, offers scripture, and delivers evidence-based therapeutic care.",
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#app` },
      inLanguage: "en-US",
    },
  },
};

export function injectRouteMeta(html: string, pathname: string): string {
  const meta = ROUTE_META[pathname];
  if (!meta) return html;

  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);

  out = replaceMetaContent(out, 'name="description"', meta.description);
  out = replaceMetaContent(out, 'property="og:title"', meta.ogTitle);
  out = replaceMetaContent(out, 'property="og:description"', meta.ogDescription);
  out = replaceMetaContent(out, 'property="og:url"', meta.ogUrl);
  out = replaceMetaContent(out, 'name="twitter:title"', meta.ogTitle);
  out = replaceMetaContent(out, 'name="twitter:description"', meta.ogDescription);

  out = out.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${meta.canonical}$2`,
  );

  const pageLd = `<script type="application/ld+json" id="ld-page">\n    ${JSON.stringify(meta.pageJsonLd, null, 2)}\n    </script>`;
  out = out.replace("</head>", `  ${pageLd}\n  </head>`);

  out = out.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript>${meta.noscriptBody}\n    </noscript>`,
  );

  return out;
}

function replaceMetaContent(
  html: string,
  attrSelector: string,
  newContent: string,
): string {
  const escaped = newContent.replace(/"/g, "&quot;");
  const re = new RegExp(
    `(<meta\\s[^>]*${attrSelector}[^>]*content=")[^"]*(")|(<meta\\s[^>]*content="[^"]*"[^>]*${attrSelector}[^>]*/?>)`,
    "i",
  );
  return html.replace(re, (match, p1, p2, p3) => {
    if (p1 !== undefined) return `${p1}${escaped}${p2}`;
    return p3.replace(/content="[^"]*"/, `content="${escaped}"`);
  });
}
