import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useState } from "react";
import supabase, { isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import ParticleNetworkBackground from "@/components/ParticleNetworkBackground";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      if (!isSupabaseConfigured) {
        toast({ title: 'Supabase not configured', description: 'Please configure VITE_SUPABASE_* env vars', variant: 'destructive' })
        return
      }

      try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
        if (error) throw error;
        toast({ title: 'Password reset email sent', description: 'Check your inbox for reset instructions' })
        navigate('/login')
      } catch (err: any) {
        toast({ title: 'Request failed', description: err.message || String(err), variant: 'destructive' })
      }
    })()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <ParticleNetworkBackground />
      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-20">
          <Card className="bg-transparent backdrop-blur-md p-8">
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold">TradeOne</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2">Reset Password</h2>
            <p className="text-muted-foreground text-center mb-8">Enter your account email and we'll send password reset instructions.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/50" />
              </div>

              <Button type="submit" className="w-full" size="lg">Send Reset Email</Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">Remembered your password? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
            </div>
          </Card>
        </motion.div>
      </main>
      <footer className="border-t border-border py-8 w-full relative z-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TradeOne. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;
