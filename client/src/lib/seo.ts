export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  structuredData?: object;
}

export function applyPageMeta(meta: PageMeta): void {
  document.title = meta.title;

  setMeta("name", "description", meta.description);

  setCanonical(meta.canonical);

  setMeta("property", "og:title", meta.ogTitle ?? meta.title);
  setMeta("property", "og:description", meta.ogDescription ?? meta.description);
  setMeta("property", "og:url", meta.ogUrl ?? meta.canonical);

  setMeta("name", "twitter:title", meta.ogTitle ?? meta.title);
  setMeta("name", "twitter:description", meta.ogDescription ?? meta.description);

  if (meta.structuredData) {
    let el = document.getElementById("ld-page") as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = "ld-page";
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(meta.structuredData);
  }
}

function setMeta(attrName: string, attrValue: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string): void {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
