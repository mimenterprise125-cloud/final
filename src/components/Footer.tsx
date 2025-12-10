import React from "react";
import { Link } from "react-router-dom";
import { useSocialLinks } from "@/lib/useSocialLinks";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const { footerLinks } = useSocialLinks();

  // Platform logos with original brand colors
  const getPlatformLogo = (label: string) => {
    switch (label) {
      case 'GitHub':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#181717" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case 'Twitter':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.637l-5.1-6.65-5.856 6.65H2.556l7.73-8.835L1.75 2.25h6.844l4.866 6.032 5.331-6.032zM17.83 18.965h1.843L5.957 4.15H4.028l12.802 14.815z" />
          </svg>
        );
      case 'LinkedIn':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0077B5" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.469v6.766z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#999999" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        );
    }
  };

  return (
    <footer className="border-t border-border py-6 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="text-xs sm:text-sm text-muted-foreground">© {year} TradeOne. All rights reserved.</div>

        <div className="flex items-center gap-4">
          <nav className="flex gap-3 text-xs sm:text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </nav>

          <div className="flex items-center gap-2">
            {footerLinks.length > 0 ? (
              footerLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={link.label}
                >
                  {getPlatformLogo(link.label)}
                </a>
              ))
            ) : (
              <>
                {/* Fallback to original links if no admin links exist */}
                <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
                  {getPlatformLogo('GitHub')}
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)" className="text-muted-foreground hover:text-foreground">
                  {getPlatformLogo('Twitter')}
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
                  {getPlatformLogo('LinkedIn')}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
