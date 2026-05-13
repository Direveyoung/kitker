const URL_RE = /(https?:\/\/[^\s]+)/g;
const IMG_EXT = /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i;

export function AutoLink({ text }: { text: string }) {
  if (!text) return null;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let key = 0;
  const matches = [...text.matchAll(URL_RE)];
  for (const m of matches) {
    if (m.index === undefined) continue;
    if (m.index > lastIdx) {
      nodes.push(
        <span key={key++} className="whitespace-pre-wrap">
          {text.slice(lastIdx, m.index)}
        </span>,
      );
    }
    const url = m[0];
    if (IMG_EXT.test(url)) {
      nodes.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="my-1 block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            loading="lazy"
            className="max-h-48 rounded-md border object-cover"
          />
        </a>,
      );
    } else {
      nodes.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="break-all text-primary underline underline-offset-2 hover:text-[var(--accent-sage-deep)]"
        >
          {url}
        </a>,
      );
    }
    lastIdx = m.index + url.length;
  }
  if (lastIdx < text.length) {
    nodes.push(
      <span key={key++} className="whitespace-pre-wrap">
        {text.slice(lastIdx)}
      </span>,
    );
  }
  return <>{nodes}</>;
}
