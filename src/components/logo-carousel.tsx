"use client";

/**
 * Horizontal marquee of partner logos pulled from Figma.
 * - Fully uses the SVGs downloaded from the Figma MCP.
 * - Edges fade via a horizontal mask gradient.
 * - Pauses on hover so users can read a specific logo.
 */

type LogoSpec = {
  src: string;
  alt: string;
  /** Rendered height in px; width scales with the SVG's intrinsic aspect ratio. */
  h: number;
};

const logos: LogoSpec[] = [
  { src: "/figma/logo-chargepoint.svg", alt: "ChargePoint", h: 30 },
  { src: "/figma/logo-evcs.svg", alt: "EVCS", h: 36 },
  { src: "/figma/logo-revel.svg", alt: "Revel", h: 24 },
  { src: "/figma/logo-lynkwell.svg", alt: "Lynkwell", h: 36 },
  { src: "/figma/logo-xcharge.svg", alt: "XCharge", h: 30 },
  { src: "/figma/logo-xcharge2.png", alt: "Xcharge", h: 28 },
  { src: "/figma/logo-gorevel.svg", alt: "Gorevel", h: 20 },
  { src: "/figma/logo-dollande.png", alt: "Dollande", h: 27 },
  { src: "/figma/logo-mn.svg", alt: "MN:", h: 26 },
  { src: "/figma/logo-everged.png", alt: "eVerged", h: 24 },
  { src: "/figma/logo-suncoast.svg", alt: "Suncoast Charging", h: 30 },
  { src: "/figma/logo-eos.png", alt: "EOS", h: 28 },
];

export function LogoCarousel() {
  // Duplicate the list so the translate animation can loop seamlessly at -50%
  const loop = [...logos, ...logos];

  return (
    <div
      className="group relative w-full overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, black 10%, black 90%, transparent 100%)",
      }}
    >
      <div
        className="flex w-max items-center gap-[60px] py-1 animate-[logo-scroll_45s_linear_infinite] [animation-play-state:running] group-hover:[animation-play-state:paused]"
      >
        {loop.map((l, i) => (
          <div
            key={`${l.alt}-${i}`}
            className="flex shrink-0 items-center"
            style={{ height: 40 }}
            aria-hidden={i >= logos.length ? true : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={l.src}
              alt={l.alt}
              draggable={false}
              style={{ height: l.h, width: "auto" }}
              className="block select-none opacity-60 grayscale transition-[opacity,filter] duration-200 hover:opacity-100 hover:grayscale-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
