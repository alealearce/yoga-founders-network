import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Facebook, Mail } from "lucide-react";
import { SITE, COPY } from "@/lib/config/site";
import NewsletterSignup from "@/components/newsletter/NewsletterSignup";

const FOOTER_LINKS = {
  directory: [
    { label: "Studios",    href: "/yogastudio" },
    { label: "Teachers",   href: "/yogateacher" },
    { label: "Schools",    href: "/yogaschool" },
    { label: "Retreats",   href: "/retreatcenter" },
    { label: "Products",   href: "/yogaproducts" },
    { label: "Workshops",  href: "/yogaworkshops" },
  ],
  community: [
    { label: "The Journal",    href: "/community" },
    { label: "Resources",      href: "/resources" },
    { label: "About Us",       href: "/about" },
    { label: "List Your Space",href: "/submit" },
    { label: "Sign In",        href: "/login" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use",   href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-low">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">

          {/* Brand */}
          <div className="lg:max-w-xs">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={SITE.logo}
                alt={SITE.name}
                width={120}
                height={48}
                className="h-9 w-auto object-contain opacity-80"
              />
            </Link>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
              {COPY.footer.tagline}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mb-6">
              <SocialLink href={SITE.social.instagram} aria="Instagram">
                <Instagram size={16} />
              </SocialLink>
              <SocialLink href={SITE.social.linkedin} aria="LinkedIn">
                <Linkedin size={16} />
              </SocialLink>
              <SocialLink href={SITE.social.facebook} aria="Facebook">
                <Facebook size={16} />
              </SocialLink>
              <SocialLink href={`mailto:${SITE.email}`} aria="Email">
                <Mail size={16} />
              </SocialLink>
            </div>
            {/* Newsletter */}
            <p className="font-sans text-xs text-on-surface-variant/60 mb-3 leading-relaxed">
              Curated yoga wisdom, Community Stories &amp; Resources
            </p>
            <NewsletterSignup variant="compact" />
          </div>

          {/* Link columns — right side */}
          <div className="flex gap-16">
            {/* Community */}
            <div>
              <h4 className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-5">
                Community
              </h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.community.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Directory */}
            <div>
              <h4 className="font-sans text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-5">
                Directory
              </h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.directory.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-on-surface-variant/60">
            © {new Date().getFullYear()} Yoga Founders Network. All rights reserved. Managed by{' '}
            <a href="https://alejandroarce.com" target="_blank" rel="noopener noreferrer" className="hover:text-on-surface-variant transition-colors underline underline-offset-2">
              arce.ca
            </a>
          </p>
          <div className="flex items-center gap-6">
            {FOOTER_LINKS.legal.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-xs text-on-surface-variant/60 hover:text-on-surface-variant transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, aria, children }: { href: string; aria: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={aria}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-card text-on-surface-variant hover:text-primary hover:bg-secondary-container transition-all duration-300"
    >
      {children}
    </a>
  );
}
