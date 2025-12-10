import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
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
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
