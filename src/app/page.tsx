import { LogoCarousel } from "@/components/logo-carousel";
import { HeroChecklist } from "@/components/hero-checklist";
import { ScrollTestimonial } from "@/components/scroll-testimonial";
import { HeroScene } from "@/components/hero-scene";
import { SiteNav } from "@/components/site-nav";
import { CrosshairCursor } from "@/components/crosshair-cursor";
import { ModeProvider } from "@/components/mode-context";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <ModeProvider>
    <div className="flex flex-col font-sans">
      {/* Sticky nav sits above every section. At the top of the page it
          blends with the hero; as the user scrolls it fades to a
          semi-opaque scrim with a hairline bottom border. */}
      <SiteNav />

      {/* Hero is edge-to-edge and sized to 90% of the viewport height.
          The fixed nav overlays the top of the hero. */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "max(720px, 90vh)", backgroundColor: "#aad1e2" }}
      >
        {/* Parallax-driven basemap + pins. Both layers share the same
            motion values so they move in lockstep with the cursor, and
            the drift is frozen while a station popup is open. */}
        <HeroScene />

        {/* Explore / Create mode toggle — floats at the bottom centre of
            the hero, above the map. */}
        <div
          className="pointer-events-none absolute inset-x-0 z-[70] flex justify-center"
          style={{ bottom: 32 }}
        >
          <ModeToggle />
        </div>

        {/* Hero copy block — pushed down 248px (148 + 100) from the top of
            the section. The checklist now lives inline 32px below the
            CTA row. */}
        <div
          className="pointer-events-none relative z-20 flex w-full justify-center px-6 pb-12"
          style={{ paddingTop: 248 }}
        >
          <div className="w-[1280px] max-w-full">
            <div className="flex w-[707px] max-w-full flex-col gap-8">
              <div className="flex flex-col gap-6 text-white">
                {/* Trust pill above the headline. */}
                <div
                  className="pointer-events-auto inline-flex h-8 w-fit items-center justify-center rounded-full px-[10px] text-[14px] font-medium leading-5 text-white"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.24)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <span className="px-1">Used by 1,200+ businesses worldwide</span>
                </div>
                <h1 className="text-[64px] font-semibold leading-[72px] tracking-[-1.28px]">
                  The industry standard for finding prime EV charging sites
                </h1>
                <p className="w-[545px] max-w-full text-[16px] font-medium leading-6">
                  Find and deploy sites with confidence. Station utilization data, to-scale layouts, and cost estimates, packaged into a shareable report in minutes.
                </p>
              </div>
              <div className="pointer-events-auto flex items-start gap-4">
                <button
                  type="button"
                  className="h-10 cursor-pointer rounded-full bg-white px-4 text-[14px] font-medium leading-5 text-neutral-950 transition-colors duration-150 hover:bg-neutral-200 active:bg-neutral-300"
                >
                  Start for Free
                </button>
                <button
                  type="button"
                  className="h-10 cursor-pointer rounded-full bg-black/25 px-4 text-[14px] font-medium leading-5 text-white transition-colors duration-150 hover:bg-black/55 active:bg-black/70"
                >
                  View Pricing
                </button>
              </div>
              {/* Checklist now sits 32px below the CTA row (gap-8 already
                  provides 32px separation from the button flex above). */}
              <div className="pointer-events-none">
                <HeroChecklist />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="flex w-full justify-center pb-10 pt-9"
        style={{ backgroundColor: "hsl(255, 25%, 98%)" }}
      >
        <div className="flex w-[1280px] max-w-full flex-col items-center gap-6 px-6">
          <p className="text-[14px] font-medium leading-5 text-neutral-950">
            Trusted by half of the EV charging industry
          </p>
          <LogoCarousel />
        </div>
      </section>

      <ScrollTestimonial />

      {/* Page-wide custom cursor overlay. Only visible while hovering over
          a `data-crosshair-zone` or a charging-station pin. */}
      <CrosshairCursor />
    </div>
    </ModeProvider>
  );
}
