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
                    "Journal Your Trades With Clarity",
                    "Manage Your Prop Firms in One Place",
                    "Track Every Prop Firm Account Effortlessly",
                    "Be a More Disciplined, Profitable Trader",
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 55,
                  deleteSpeed: 40,
                }}
              />
            </h1>

            {/* updated but same position/size as before */}
            <h2 className="text-sm md:text-base lg:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Journal trades, manage prop firm accounts, track payouts and risk – all in a
              single clean dashboard built for funded traders.
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
