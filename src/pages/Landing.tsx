import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield,
  Copy,
  BookOpen,
  DollarSign,
  BarChart3,
  TrendingUp,
  Instagram,
  Youtube,
  Mail,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { useSocialLinks } from "@/lib/useSocialLinks";
import { useEffect } from "react";
import ParticleNetworkBackground from "@/components/ParticleNetworkBackground";
import { Navbar } from "@/components/layout/Navbar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CONTACTS from "@/lib/contacts";
import Typewriter from "typewriter-effect";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { communityLinks } = useSocialLinks();

  // Helper function to get platform logos with original colors
  const getPlatformLogo = (label: string): JSX.Element => {
    switch (label) {
      case 'Discord':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 4.492c-1.53-.742-3.17-1.297-4.885-1.58a.06.06 0 0 0-.063.03c-.211.378-.445.879-.607 1.27a18.27 18.27 0 0 0-5.487 0c-.165-.39-.395-.892-.607-1.27a.064.064 0 0 0-.063-.029c-1.715.283-3.354.838-4.885 1.58a.06.06 0 0 0-.028.027C1.873 8.38.986 12.147 1.545 15.86a.065.065 0 0 0 .025.045 20.51 20.51 0 0 0 6.223 3.154.06.06 0 0 0 .066-.022c.43-.587.81-1.207 1.124-1.852a.06.06 0 0 0-.033-.084 13.37 13.37 0 0 1-1.905-.912.06.06 0 0 1-.006-.1l.479-.361a.06.06 0 0 1 .063-.007c4 1.876 8.333 1.876 12.283 0a.06.06 0 0 1 .064.007l.479.361a.06.06 0 0 1-.006.1 12.532 12.532 0 0 1-1.905.912.06.06 0 0 0-.033.085c.315.645.694 1.265 1.124 1.852a.06.06 0 0 0 .066.022 20.46 20.46 0 0 0 6.223-3.154.06.06 0 0 0 .025-.045c.645-3.897-.108-7.736-2.568-10.933a.06.06 0 0 0-.028-.027zM8.02 13.231c-.924 0-1.684-.847-1.684-1.887 0-1.04.752-1.887 1.684-1.887.937 0 1.697.847 1.684 1.887 0 1.04-.752 1.887-1.684 1.887zm7.968 0c-.924 0-1.684-.847-1.684-1.887 0-1.04.752-1.887 1.684-1.887.937 0 1.697.847 1.684 1.887 0 1.04-.747 1.887-1.684 1.887z" />
          </svg>
        );
      case 'YouTube':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'Instagram':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="url(#instagram-gradient)" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FD5949" />
                <stop offset="5%" stopColor="#D6249F" />
                <stop offset="45%" stopColor="#285AEB" />
              </linearGradient>
            </defs>
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 11.5h-4.89a.5.5 0 0 1-.5-.5v-4.89a.5.5 0 0 1 .5-.5h4.89a.5.5 0 0 1 .5.5v4.89a.5.5 0 0 1-.5.5zm0 7h-4.89a.5.5 0 0 1-.5-.5v-4.89a.5.5 0 0 1 .5-.5h4.89a.5.5 0 0 1 .5.5v4.89a.5.5 0 0 1-.5.5z" />
          </svg>
        );
      case 'Telegram':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0088cc" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.161.16-.295.295-.605.295-.362 0-.3-.137-.423-.486l-1.888-6.205c-.128-.427.096-.662.427-.662l9.52-3.674c.405-.143.763.099.656.693z" />
          </svg>
        );
      case 'Slack':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#E01E5A" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 0C2.688 0 0 2.688 0 6c0 3.312 2.688 6 6 6h6V6C12 2.688 9.312 0 6 0zm0 16C2.688 16 0 18.688 0 22c0 3.312 2.688 6 6 6s6-2.688 6-6v-6H6zm18-10C24 2.688 21.312 0 18 0c-3.312 0-6 2.688-6 6v6h6c3.312 0 6-2.688 6-6zm-6 16v-6c0 3.312 2.688 6 6 6s6-2.688 6-6-2.688-6-6-6h-6z" />
          </svg>
        );
      case 'WhatsApp':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.226l-.308.156-3.19-.836.851 3.115-.201.32a9.747 9.747 0 00-1.746 5.25c0 5.495 4.47 9.952 9.944 9.952 2.654 0 5.148-.997 7.038-2.822 1.887-1.824 2.923-4.32 2.923-6.993 0-5.493-4.47-9.952-9.944-9.952m8.236 18.733C19.712 23.727 16.265 25 12.582 25 5.813 25 .294 19.488.294 12.72.294 9.643 1.51 6.795 3.588 4.75 5.665 2.705 8.296 1.5 11.195 1.5c6.769 0 12.287 5.512 12.287 12.282 0 2.96-1.037 5.78-2.938 8.083" />
          </svg>
        );
      case 'Twitter':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.637l-5.1-6.65-5.856 6.65H2.556l7.73-8.835L1.75 2.25h6.844l4.866 6.032 5.331-6.032zM17.83 18.965h1.843L5.957 4.15H4.028l12.802 14.815z" />
          </svg>
        );
      case 'LinkedIn':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.469v6.766z" />
          </svg>
        );
      case 'GitHub':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#181717" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#999999" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          </svg>
        );
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Scroll to hash when navigating to the landing page (so nav links work from other pages)
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        // small timeout to allow layout/animations to settle
        setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          80
        );
      }
    }
  }, [location]);

  const features = [
    {
      icon: BarChart3,
      title: "Unified Dashboard",
      description: "Monitor all your prop firm accounts in one centralized location",
    },
    {
      icon: Copy,
      title: "Trade Copier",
      description:
        "Automatically replicate trades across multiple accounts with custom risk settings",
    },
    {
      icon: DollarSign,
      title: "Payout Tracker",
      description: "Track and manage payouts from all your funded accounts",
    },
    {
      icon: BookOpen,
      title: "Trading Journal",
      description: "Log and analyze your trades with detailed performance metrics",
    },
    {
      icon: Shield,
      title: "Multi-Prop Support",
      description: "Works with MT4, MT5, and cTrader across all major prop firms",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Advanced charts and insights to improve your trading strategy",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Particle Network Background */}
      <ParticleNetworkBackground />

      {/* Fixed Navbar at top (shared component) */}
      <Navbar onMenuClick={() => {}} showAuthLinks />

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
        {/* Content overlay on top of particle background */}
        <div className="relative z-20 container mx-auto px-4 text-center mt-6 md:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* 👇 NEW TYPEWRITER TITLE */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              <Typewriter
                options={{
                  strings: [
                    "Journal Trades",
                    "Track Performance",
                    "Analyze Results",
                    "Improve Strategy",
                    "Manage Accounts",
                    "Trade Smarter",
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 35,
                }}
              />
            </h1>

            {/* updated but same position/size as before */}
            <h2 className="hidden sm:block text-sm md:text-base lg:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Journal trades, manage accounts, track performance – all in one dashboard.
            </h2>

            <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Journal Trades • Manage Prop Firms • Track Performance • Improve as a Trader
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 py-4 gradient-btn">
                  Get Started — Free
                </Button>
              </Link>

              {/* Community modal trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-6 py-3"
                  >
                    Join Community
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm bg-background/20 backdrop-blur-lg border border-white/10 rounded-lg p-4 shadow-lg">
                  <DialogHeader>
                    <DialogTitle>Join Our Community</DialogTitle>
                    <DialogDescription>
                      Select a platform to join or follow us
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 mt-4">
                    {communityLinks.length > 0 ? (
                      communityLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-md bg-gradient-to-r from-white/5 to-white/2 hover:from-white/10 hover:to-white/4 transition"
                        >
                          {getPlatformLogo(link.label)}
                          <span>{link.label}</span>
                        </a>
                      ))
                    ) : (
                      <>
                        {/* Fallback to original hardcoded links if no admin links exist */}
                        <a
                          href={CONTACTS.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-md bg-gradient-to-r from-white/5 to-white/2 hover:from-white/10 hover:to-white/4 transition"
                        >
                          <Instagram className="w-5 h-5 text-pink-400" />
                          <span>Instagram</span>
                        </a>
                        <a
                          href={CONTACTS.discord}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-md bg-gradient-to-r from-white/5 to-white/2 hover:from-white/10 hover:to-white/4 transition"
                        >
                          {/* Discord logo */}
                          <svg
                            className="w-5 h-5 text-indigo-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M20.317 4.369A19.791 19.791 0 0016.5 3c-.2.35-.433.81-.6 1.166-1.64.013-3.281.013-4.921 0-.165-.355-.397-.816-.598-1.166A19.736 19.736 0 003.68 4.37C2.06 8.99 2.347 13.59 3.77 17.97 6.39 18.84 9.02 18.88 11.64 18.5c.22-.03.44-.06.66-.1.22.04.44.07.66.1 2.62.38 5.25.34 7.88-.53 1.42-4.38 1.71-8.98.01-13.09zM8.02 13.5c-.93 0-1.68-.86-1.68-1.91 0-1.04.75-1.9 1.68-1.9.94 0 1.69.86 1.68 1.9 0 1.05-.74 1.91-1.68 1.91zm7.96 0c-.93 0-1.68-.86-1.68-1.91 0-1.04.75-1.9 1.68-1.9.94 0 1.69.86 1.68 1.9 0 1.05-.74 1.91-1.68 1.91z" />
                          </svg>
                          <span>Discord</span>
                        </a>
                        <a
                          href={CONTACTS.youtube}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-md bg-gradient-to-r from-white/5 to-white/2 hover:from-white/10 hover:to-white/4 transition"
                        >
                          <Youtube className="w-5 h-5 text-red-400" />
                          <span>YouTube</span>
                        </a>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section (unchanged) */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground">
              Professional tools for serious prop firm traders
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-transparent backdrop-blur-md p-6 hover:scale-105 transition-transform duration-300">
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (unchanged) */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-transparent backdrop-blur-md p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Level Up Your Trading?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of prop firm traders managing their accounts efficiently
              </p>
              <Link to="/signup">
                <Button size="lg" className="text-lg px-12 py-6">
                  Start Your Free Trial
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Informational transparent cards (unchanged) */}
      <section className="py-24 relative z-30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Explore TradeOne</h2>

          <div className="max-w-6xl mx-auto space-y-8">
            {/* 1. PLATFORM */}
            <article
              id="platform"
              className="bg-transparent backdrop-blur-md p-6 rounded-lg border border-white/10 shadow-sm flex flex-col md:flex-row gap-4 items-start"
            >
              <img
                src="/platform.svg"
                alt="Platform mockup"
                className="w-full md:w-56 h-40 object-cover rounded-md flex-shrink-0"
              />
              <div>
                <h3 className="text-lg font-semibold">PLATFORM</h3>
                <p className="text-sm font-medium text-primary mb-2">
                  Your Trading Command Center
                </p>
                <p className="text-sm text-muted-foreground">
                  “TradeOne is a unified hub for managing all your prop firm accounts —
                  funded, evaluation, and personal. View real-time balances, daily
                  drawdown, equity curves, open trades, payout dates, and more. Designed
                  for speed, clarity, and complete control.”
                </p>
              </div>
            </article>

            {/* 2. FEATURES */}
            <article
              id="features"
              className="bg-transparent backdrop-blur-md p-6 rounded-lg border border-white/10 shadow-sm flex flex-col md:flex-row gap-4 items-start"
            >
              {/* Features image intentionally placed on the left and slightly larger */}
              <img
                src="/features.svg"
                alt="Features mockup"
                className="w-full md:w-72 h-48 object-cover rounded-md flex-shrink-0 md:order-last md:ml-6"
              />
              <div className="md:order-first">
                <h3 className="text-lg font-semibold">FEATURES</h3>
                <p className="text-sm font-medium text-primary mb-2">
                  Tools Built for Prop Traders
                </p>
                <p className="text-sm text-muted-foreground">
                  “Everything you need in one place — Trade Copier, Journals, Payout
                  Tracker, Risk Alerts, Multi-Platform Support (MT4/MT5/cTrader), Equity
                  Analytics, and Performance Insights. A full suite of professional
                  trading tools without the clutter.”
                </p>
              </div>
            </article>

            {/* 3. ROADMAP */}
            <article
              id="roadmap"
              className="bg-transparent backdrop-blur-md p-6 rounded-lg border border-white/10 shadow-sm flex flex-col md:flex-row gap-4 items-start"
            >
              <img
                src="/roadmap.svg"
                alt="Roadmap mockup"
                className="w-full md:w-56 h-40 object-cover rounded-md flex-shrink-0"
              />
              <div>
                <h3 className="text-lg font-semibold">ROADMAP</h3>
                <p className="text-sm font-medium text-primary mb-2">
                  Building the Future of Prop Trading
                </p>
                <p className="text-sm text-muted-foreground">
                  “Our commitment: evolving TradeOne into the most powerful prop-trading
                  OS. Upcoming upgrades include: AI-assisted journaling, advanced risk
                  engine, smart copier modes, prop leaderboards, funding health score,
                  integration with more firms, mobile apps, and cloud-synced trading
                  modules.”
                </p>
              </div>
            </article>

            {/* 4. CONTACT */}
            <article
              id="contact"
              className="bg-transparent backdrop-blur-md p-6 rounded-lg border border-white/10 shadow-sm flex flex-col gap-4 items-start"
            >
              <div>
                <h3 className="text-lg font-semibold">CONTACT</h3>
                <p className="text-sm font-medium text-primary mb-2">
                  We’re Here to Help
                </p>
                <p className="text-sm text-muted-foreground">
                  “Questions? Need support? Want integrations for your prop firm? Reach
                  us anytime — we respond quickly and are committed to supporting traders
                  at every stage.”
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() =>
                      window.open(
                        CONTACTS.gmailComposeUrl(CONTACTS.gmail),
                        "_blank"
                      )
                    }
                    className="bg-primary text-white"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </Button>

                  {/* Reuse the same community modal trigger used in hero */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="btn border border-white/10 text-sm px-4 py-2 rounded-md">
                        Join Community
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Join Our Community</DialogTitle>
                        <DialogDescription>
                          Select a platform to join or follow us
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-3 mt-4">
                        <a
                          href={CONTACTS.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-md bg-background/10 hover:bg-background/20"
                        >
                          <svg
                            className="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="20"
                              height="20"
                              x="2"
                              y="2"
                              rx="5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <span>Instagram</span>
                        </a>
                        <a
                          href={CONTACTS.discord}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-md bg-background/10 hover:bg-background/20"
                        >
                          <svg
                            className="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM19 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Discord</span>
                        </a>
                        <a
                          href={CONTACTS.youtube}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-md bg-background/10 hover:bg-background/20"
                        >
                          <svg
                            className="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 7.5s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.1-.9C15.7 4 12 4 12 4s-3.7 0-6.9.3c-.5 0-1.4.1-2.1.9C2.2 5.9 2 7.5 2 7.5S2 9.4 2 11.3v1.4c0 1.9 0 3.8 0 3.8s.2 1.6.8 2.3c.8.8 1.8.8 2.3.9 1.7.2 7.1.3 7.1.3s3.7 0 6.9-.3c.5 0 1.4-.1 2.1-.9.6-.7.8-2.3.8-2.3s0-1.9 0-3.8v-1.4c0-1.9 0-3.8 0-3.8z"
                              stroke="currentColor"
                              strokeWidth="0.5"
                            />
                          </svg>
                          <span>YouTube</span>
                        </a>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Footer (back in!) */}
      <footer className="border-t border-border py-8 w-full relative z-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TradeOne. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
