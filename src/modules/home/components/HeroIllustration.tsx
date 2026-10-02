/**
 * Decorative dashboard preview for the homepage hero. Drawn as SVG (not a
 * raster) so the brand mark is the real asset from public/brand/, every colour
 * follows the theme tokens, and it stays sharp at any width. The figures are
 * illustrative placeholder data, not live numbers.
 */
const bars = [22, 34, 40, 58, 44, 66];
const xLabels = [
  { x: 104, label: "May 1" },
  { x: 188, label: "May 8" },
  { x: 272, label: "May 15" },
  { x: 356, label: "May 22" },
  { x: 440, label: "May 29" },
];
const yLabels = [
  { y: 246, label: "1.5K" },
  { y: 264, label: "1K" },
  { y: 282, label: "500" },
  { y: 300, label: "0" },
];

const linePath =
  "M104 288 C132 252 158 248 182 268 S226 284 258 266 S300 238 336 262 S392 284 420 268 S462 262 484 256";

export default function HeroIllustration() {
  return (
    <div
      className="w-full"
      style={{ transform: "perspective(1800px) rotateX(10deg) rotateY(-14deg) rotateZ(2deg)" }}
    >
      <svg
        viewBox="0 0 550 356"
        role="img"
        aria-label="ScriptPesa dashboard preview"
        className="h-auto w-full overflow-visible"
        style={{ fontFamily: "var(--font-primary), system-ui, sans-serif" }}
      >
        <defs>
          <linearGradient id="hero-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="var(--primary)" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* dashboard window */}
        <g filter="url(#hero-shadow)">
          <rect x="40" y="26" width="470" height="304" rx="18" className="fill-card stroke-border" />
        </g>

        {/* header: brand mark + skeleton title + controls */}
        <image href="/brand/scriptpesa-mark.svg" x="62" y="46" width="35" height="30.6" />
        <rect x="110" y="52" width="150" height="9" rx="4.5" className="fill-primary/20" />
        <rect x="110" y="67" width="90" height="7" rx="3.5" className="fill-primary/10" />
        <rect x="384" y="52" width="50" height="20" rx="10" className="fill-muted" />
        <rect x="444" y="52" width="50" height="20" rx="10" className="fill-muted" />
        <line x1="40" y1="92" x2="510" y2="92" className="stroke-border" />

        {/* revenue card */}
        <rect x="58" y="106" width="222" height="90" rx="12" className="fill-card stroke-border" />
        <circle cx="90" cy="151" r="19" className="fill-primary/10" />
        <rect x="81" y="144" width="18" height="14" rx="3" className="fill-primary" />
        <text x="122" y="140" fontSize="11" className="fill-muted-foreground">
          Total Revenue
        </text>
        <text x="122" y="168" fontSize="25" fontWeight="700" className="fill-foreground">
          KES 2.4M
        </text>
        <text x="122" y="185" fontSize="11" fontWeight="600" className="fill-success">
          ↑ 12.5%
        </text>

        {/* bar chart card */}
        <rect x="294" y="106" width="202" height="90" rx="12" className="fill-card stroke-border" />
        {bars.map((h, i) => (
          <rect key={i} x={316 + i * 28} y={180 - h} width="14" height={h} rx="3" fill="url(#hero-bar)" />
        ))}

        {/* line chart card */}
        <rect x="58" y="210" width="438" height="106" rx="12" className="fill-card stroke-border" />
        <text x="76" y="230" fontSize="11" fontWeight="500" className="fill-foreground">
          Transactions Over Time
        </text>
        {yLabels.map(({ y, label }) => (
          <g key={label}>
            <text x="76" y={y + 3} fontSize="8" className="fill-muted-foreground">
              {label}
            </text>
            <line x1="104" y1={y} x2="484" y2={y} strokeDasharray="3 4" className="stroke-border" />
          </g>
        ))}
        <path d={`${linePath} L484 300 L104 300 Z`} fill="url(#hero-area)" />
        <path d={linePath} fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-primary" />
        {xLabels.map(({ x, label }) => (
          <text key={label} x={x} y="311" fontSize="8" textAnchor="middle" className="fill-muted-foreground">
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
