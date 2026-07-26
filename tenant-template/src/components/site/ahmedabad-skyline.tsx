/**
 * Illustrated Ahmedabad skyline used as the hero fallback background when a broker
 * hasn't uploaded a real hero photo (branding.hero_image_url). Deliberately drawn as
 * flat art, not a photo stand-in: Sabarmati riverfront with the Atal (sail) bridge,
 * an SG Highway-style high-rise line, and Uttarayan kites for local flavour.
 */
export function AhmedabadSkyline() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Illustrated skyline of Ahmedabad with the Sabarmati riverfront"
    >
      <defs>
        <linearGradient id="ahm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1a2b" />
          <stop offset="55%" stopColor="#12283f" />
          <stop offset="100%" stopColor="#1c3a56" />
        </linearGradient>
        <linearGradient id="ahm-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#20455f" />
          <stop offset="100%" stopColor="#0b1a2b" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#ahm-sky)" />

      {/* far skyline, low contrast */}
      <g fill="#1f3a52" opacity="0.7">
        <rect x="40" y="560" width="60" height="180" />
        <rect x="120" y="520" width="46" height="220" />
        <rect x="190" y="580" width="70" height="160" />
        <rect x="1400" y="540" width="56" height="200" />
        <rect x="1470" y="590" width="80" height="150" />
        <rect x="1300" y="600" width="50" height="140" />
      </g>

      {/* mid skyline — SG Highway style high-rise line */}
      <g fill="#28496a">
        <rect x="260" y="480" width="48" height="270" />
        <rect x="320" y="440" width="34" height="310" />
        <rect x="368" y="500" width="60" height="250" />
        <rect x="440" y="410" width="40" height="340" />
        <rect x="490" y="470" width="52" height="280" />
        <rect x="1050" y="460" width="44" height="290" />
        <rect x="1105" y="420" width="36" height="330" />
        <rect x="1150" y="490" width="58" height="260" />
        <rect x="1220" y="450" width="40" height="300" />
        <rect x="1270" y="500" width="48" height="250" />
      </g>
      <g fill="#28496a" opacity="0.9">
        {[280, 336, 388, 456, 508, 1066, 1120, 1170, 1236, 1286].map((x, i) => (
          <rect key={i} x={x} y={430 + (i % 3) * 20} width="6" height="8" fill="#f2c76d" opacity="0.5" />
        ))}
      </g>

      {/* Sabarmati riverfront band */}
      <rect x="0" y="750" width="1600" height="150" fill="url(#ahm-river)" />
      <g stroke="#3a6285" strokeWidth="1.5" opacity="0.35">
        <line x1="0" y1="775" x2="1600" y2="775" />
        <line x1="0" y1="800" x2="1600" y2="800" />
        <line x1="0" y1="828" x2="1600" y2="828" />
      </g>

      {/* Atal Bridge — sail-shaped riverfront bridge, distinctly Ahmedabad */}
      <g transform="translate(680,700)">
        <path d="M0,90 L280,90" stroke="#1a3350" strokeWidth="10" fill="none" />
        {[0, 40, 80, 120, 160, 200, 240, 280].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="90" stroke="#3a6285" strokeWidth="2" opacity="0.6" />
        ))}
        <path d="M0,90 Q140,-70 280,90" stroke="#e8eef4" strokeWidth="4" fill="none" opacity="0.9" />
        <path d="M20,90 Q140,-40 260,90" stroke="#e8eef4" strokeWidth="2.5" fill="none" opacity="0.6" />
      </g>

      {/* near, dark foreground buildings framing the hero */}
      <g fill="#0e2036">
        <rect x="-20" y="620" width="90" height="220" />
        <rect x="70" y="660" width="60" height="180" />
        <rect x="1520" y="600" width="100" height="240" />
        <rect x="1450" y="650" width="60" height="190" />
      </g>

      {/* Uttarayan kites — small, scattered, unmistakably Ahmedabad */}
      <g fill="#f2c76d" opacity="0.85">
        <path d="M780,140 L800,160 L780,190 L760,160 Z" />
        <path d="M900,90 L916,108 L900,134 L884,108 Z" />
        <path d="M1050,160 L1064,176 L1050,200 L1036,176 Z" />
        <path d="M600,110 L614,126 L600,150 L586,126 Z" />
      </g>
      <g stroke="#f2c76d" strokeWidth="1" opacity="0.5">
        <path d="M780,190 Q770,230 800,260" fill="none" />
        <path d="M900,134 Q890,170 915,195" fill="none" />
        <path d="M1050,200 Q1040,235 1065,258" fill="none" />
        <path d="M600,150 Q592,182 615,205" fill="none" />
      </g>
    </svg>
  );
}
