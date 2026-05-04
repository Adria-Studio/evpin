"use client";

import { useEffect, useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { useSound } from "@web-kits/audio/react";
import { uiClick } from "@/lib/ui-sounds";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Tracker", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Spexbook", href: "#" },
  { label: "Changelog", href: "#" },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [darkBg, setDarkBg] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const playClick = useSound(uiClick);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 4);

      const hero = document.querySelector("section");
      const navHeight = 72;
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom + y;
        setDarkBg(y + navHeight < heroBottom);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className="group/nav fixed inset-x-0 top-0 z-[60] w-full text-white transition-colors duration-200 data-[dark-bg=false]:text-[#0c0c09]"
      data-dark-bg={darkBg && !mobileOpen ? "true" : "false"}
      data-scrolled={scrolled ? "true" : "false"}
    >
      {/* Progressive blur + tint, only after scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-200 group-data-[scrolled=true]/nav:opacity-100"
      >
        <div className="absolute inset-0 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)]" />
        <div className="absolute inset-0 backdrop-blur-[5px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_70%)]" />
        <div className="absolute inset-0 backdrop-blur-[9px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_40%)]" />
        <div className="absolute inset-0 bg-black/[0.14] [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] group-data-[dark-bg=false]/nav:bg-white/[0.45]" />
      </div>

      <div className="relative mx-auto flex w-[1280px] max-w-full items-center justify-between gap-6 px-6 py-5 md:py-6">
        {/* Left: logo + (desktop) primary nav. */}
        <div className="flex min-w-0 items-center gap-8">
          <a href="#" className="shrink-0" aria-label="EVPin home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/figma/nav-logo.svg"
              alt="EVPin"
              width={23}
              height={32}
              className="h-8 w-auto group-data-[dark-bg=false]/nav:invert"
              draggable={false}
            />
          </a>

          <NavigationMenu viewport={false} className="hidden md:flex">
            <NavigationMenuList className="gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <NavigationMenuItem key={label}>
                  <NavigationMenuLink
                    href={href}
                    className="bg-transparent p-0 text-[14px] font-bold leading-5 tracking-[-0.01em] text-inherit transition-colors duration-150 hover:bg-transparent hover:text-white/80 focus:bg-transparent group-data-[dark-bg=false]/nav:hover:text-[#0c0c09]/80"
                  >
                    {label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: (desktop) CTAs / (mobile) hamburger. */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => playClick()}
              className="h-[34px] cursor-pointer rounded-full bg-black/25 px-4 text-[14px] font-medium leading-5 text-inherit backdrop-blur-[10px] transition-colors duration-150 group-data-[dark-bg=false]/nav:bg-[#0c0c09]/[0.08]"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => playClick()}
              className="h-[34px] cursor-pointer rounded-full bg-white px-4 text-[14px] font-medium leading-5 text-[#0c0c09] transition-colors duration-150 group-data-[dark-bg=false]/nav:bg-[#0c0c09] group-data-[dark-bg=false]/nav:text-white"
            >
              Create Account
            </button>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => playClick()}
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-inherit transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40 group-data-[dark-bg=false]/nav:hover:bg-black/5 md:hidden"
            >
              {mobileOpen ? (
                <XIcon className="size-5" />
              ) : (
                <MenuIcon className="size-5" />
              )}
            </SheetTrigger>

            <SheetContent
              side="top"
              showCloseButton={false}
              className="flex h-dvh w-full flex-col gap-0 border-b-0 bg-white p-0 pt-[72px] text-[#0c0c09]"
            >
              <SheetTitle className="sr-only">Site navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Browse the site or sign in.
              </SheetDescription>

              <nav className="mx-auto flex w-[1280px] max-w-full flex-col gap-1 px-3">
                {NAV_LINKS.map(({ label, href }) => (
                  <SheetClose asChild key={label}>
                    <a
                      href={href}
                      className="rounded-lg px-3 py-3 text-[18px] font-semibold leading-6 tracking-[-0.01em] text-[#0c0c09] transition-colors duration-150 hover:bg-[#0c0c09]/[0.05]"
                    >
                      {label}
                    </a>
                  </SheetClose>
                ))}
              </nav>

              <div className="mx-auto mt-auto flex w-[1280px] max-w-full flex-col gap-2 p-6">
                <SheetClose asChild>
                  <button
                    type="button"
                    onClick={() => playClick()}
                    className="h-11 cursor-pointer rounded-full bg-[#0c0c09]/[0.08] px-4 text-[14px] font-medium leading-5 text-[#0c0c09] transition-colors duration-150 hover:bg-[#0c0c09]/[0.14]"
                  >
                    Log In
                  </button>
                </SheetClose>
                <SheetClose asChild>
                  <button
                    type="button"
                    onClick={() => playClick()}
                    className="h-11 cursor-pointer rounded-full bg-[#0c0c09] px-4 text-[14px] font-medium leading-5 text-white transition-colors duration-150 hover:bg-[#0c0c09]/90"
                  >
                    Create Account
                  </button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
