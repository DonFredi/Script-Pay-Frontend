export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // JSON.stringify escapes quotes but not "<", so a value containing
        // "</script>" would close this tag early and hand the rest to the HTML
        // parser. < is an equivalent escape to any JSON-LD consumer and
        // can't terminate the tag. Matters the moment anything tenant-supplied
        // (a business name) reaches structured data.
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
