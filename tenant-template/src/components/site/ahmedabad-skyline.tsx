/**
 * Illustrated Ahmedabad skyline used as the hero fallback background when a broker
 * hasn't uploaded a real hero photo (branding.hero_image_url). Deliberately drawn as
 * flat art, not a photo stand-in: Sabarmati riverfront with the Atal (sail) bridge,
 * an SG Highway-style high-rise line, and Uttarayan kites for local flavour.
 *
 * viewBox is a wide, short 1600x640 (not a tall square) to match how a hero banner
 * actually crops with `xMidYMid slice` -- a taller canvas here just gets its top and
 * bottom sliced off by real hero-section aspect ratios, hiding most of the art.
 */
export function AhmedabadSkyline() {
  return (
    <svg
      viewBox="0 0 1600 640"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="Illustrated skyline of Ahmedabad with the Sabarmati riverfront at dusk"
    >
      <defs>
        <linearGradient id="ahm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1f33" />
          <stop offset="45%" stopColor="#1a3a56" />
          <stop offset="72%" stopColor="#3d5f74" />
          <stop offset="100%" stopColor="#c98a53" />
        </linearGradient>
        <linearGradient id="ahm-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a5a3e" />
          <stop offset="100%" stopColor="#0c1f33" />
        </linearGradient>
      </defs>

      <rect width="1600" height="640" fill="url(#ahm-sky)" />

      {/* far skyline, low contrast */}
      <g fill="#2c4f6e" opacity="0.75">
        <rect x="20" y="330" width="64" height="180" />
        <rect x="100" y="300" width="48" height="210" />
        <rect x="175" y="350" width="72" height="160" />
        <rect x="1390" y="310" width="58" height="200" />
        <rect x="1460" y="345" width="82" height="165" />
        <rect x="1290" y="360" width="52" height="150" />
      </g>

      {/* mid skyline — SG Highway style high-rise line, bright enough to read clearly */}
      <g fill="#3d6688">
        <rect x="250" y="250" width="50" height="260" />
        <rect x="312" y="210" width="36" height="300" />
        <rect x="362" y="270" width="62" height="240" />
        <rect x="436" y="180" width="42" height="330" />
        <rect x="488" y="240" width="54" height="270" />
        <rect x="1040" y="230" width="46" height="280" />
        <rect x="1098" y="190" width="38" height="320" />
        <rect x="1148" y="260" width="60" height="250" />
        <rect x="1220" y="220" width="42" height="290" />
        <rect x="1272" y="270" width="50" height="240" />
      </g>
      <g>
        {[270, 328, 384, 456, 510, 1060, 1116, 1170, 1240, 1292].map((x, i) => (
          <rect key={i} x={x} y={210 + (i % 4) * 22} width="7" height="9" fill="#f7c869" opacity="0.85" />
        ))}
      </g>

      {/* Uttarayan kites — high enough in the frame to survive a wide-crop hero */}
      <g fill="#f7c869" opacity="0.95">
        <path d="M780,70 L802,92 L780,124 L758,92 Z" />
        <path d="M910,40 L928,60 L910,88 L892,60 Z" />
        <path d="M1060,90 L1076,108 L1060,134 L1044,108 Z" />
        <path d="M590,55 L606,73 L590,99 L574,73 Z" />
      </g>
      <g stroke="#f7c869" strokeWidth="1.5" opacity="0.6">
        <path d="M780,124 Q768,165 800,198" fill="none" />
        <path d="M910,88 Q898,126 924,152" fill="none" />
        <path d="M1060,134 Q1048,170 1075,194" fill="none" />
        <path d="M590,99 Q580,134 606,159" fill="none" />
      </g>

      {/* Sabarmati riverfront band */}
      <rect x="0" y="500" width="1600" height="140" fill="url(#ahm-river)" />
      <g stroke="#c98a53" strokeWidth="1.5" opacity="0.4">
        <line x1="0" y1="522" x2="1600" y2="522" />
        <line x1="0" y1="548" x2="1600" y2="548" />
        <line x1="0" y1="578" x2="1600" y2="578" />
      </g>

      {/* Atal Bridge — sail-shaped riverfront bridge, distinctly Ahmedabad */}
      <g transform="translate(660,430)">
        <path d="M0,90 L300,90" stroke="#1a3350" strokeWidth="10" fill="none" />
        {[0, 42, 84, 126, 168, 210, 252, 300].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="90" stroke="#f0e4d4" strokeWidth="2" opacity="0.7" />
        ))}
        <path d="M0,90 Q150,-90 300,90" stroke="#fdf6ea" strokeWidth="5" fill="none" opacity="0.95" />
        <path d="M22,90 Q150,-50 278,90" stroke="#fdf6ea" strokeWidth="3" fill="none" opacity="0.7" />
      </g>

      {/* near, dark foreground buildings framing the hero */}
      <g fill="#0a1a2c">
        <rect x="-20" y="400" width="100" height="240" />
        <rect x="80" y="440" width="66" height="200" />
        <rect x="1500" y="380" width="110" height="260" />
        <rect x="1430" y="430" width="66" height="210" />
      </g>
    </svg>
  );
}
