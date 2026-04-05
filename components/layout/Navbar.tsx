"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { SITE } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

const SERVICES_ITEMS = [
  { label: "Teacher Training & Schools", href: "/services/schools",   icon: "🎓", desc: "Certifications & teacher training programs" },
  { label: "Retreat Centers",            href: "/services/retreats",   icon: "🌿", desc: "Yoga retreats around the world" },
  { label: "Products",                   href: "/services/products",   icon: "🪷", desc: "Mats, props, apparel & more" },
  { label: "Workshops & Events",         href: "/services/workshops",  icon: "✨", desc: "Intensives, workshops & special events" },
];

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [servicesOpen,  setServicesOpen]  = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-400",
          scrolled
            ? "bg-[#fafaf5]/90 backdrop-blur-[16px] shadow-[0_2px_20px_rgba(26,28,25,0.06)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <Image
                src={SITE.logo}
                alt={SITE.name}
                width={140}
                height={56}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/studios"
                className="font-sans text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-300"
              >
                Studios
              </Link>
              <Link
                href="/teachers"
                className="font-sans text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-300"
              >
                Teachers
              </Link>

              {/* Services Dropdown */}
              <div ref={servicesRef} className="relative">
                <button
                  onClick={() => setServicesOpen(v => !v)}
                  className="flex items-center gap-1 font-sans text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                >
                  Services
                  <ChevronDown
                    size={14}
                    className={cn("transition-transform duration-300", servicesOpen && "rotate-180")}
                  />
                </button>

                {/* Dropdown Panel */}
                <div
                  className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72",
                    "bg-surface-card rounded-2xl shadow-card overflow-hidden",
                    "border border-outline-variant/20",
                    "transition-all duration-300 origin-top",
                    servicesOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  )}
                >
                  <div className="p-2">
                    {SERVICES_ITEMS.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setServicesOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-surface-low transition-colors duration-200 group"
                      >
                        <span className="text-lg mt-0.5">{item.icon}</span>
                        <div>
                          <p className="font-sans text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {item.label}
                          </p>
                          <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/community"
                className="font-sans text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-300"
              >
                Community
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-1.5 font-sans text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors duration-300"
              >
                <User size={15} />
                Sign In
              </Link>
              <Link
                href="/submit"
                className="px-5 py-2 rounded-full font-sans text-sm font-semibold text-white transition-all duration-300 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
              >
                List Your Space
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-400",
          mobileOpen ? "visible" : "invisible"
        )}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity duration-400",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-80 max-w-full bg-[#fafaf5] shadow-float",
            "transition-transform duration-400",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col h-full pt-20 pb-8 px-6 overflow-y-auto">
            <nav className="flex flex-col gap-1">
              <MobileNavLink href="/studios" onClick={() => setMobileOpen(false)}>Studios</MobileNavLink>
              <MobileNavLink href="/teachers" onClick={() => setMobileOpen(false)}>Teachers</MobileNavLink>

              {/* Services Group */}
              <div className="pt-2 pb-1">
                <p className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase px-3 mb-2">
                  Services
                </p>
                {SERVICES_ITEMS.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <MobileNavLink href="/community" onClick={() => setMobileOpen(false)}>Community</MobileNavLink>
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-outline-variant/30">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 rounded-full font-sans text-sm font-semibold text-on-surface border border-outline-variant/40 hover:bg-surface-low transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/submit"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 rounded-full font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
              >
                List Your Space
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-3 rounded-xl font-sans text-base font-medium text-on-surface hover:bg-surface-low transition-colors"
    >
      {children}
    </Link>
  );
}
