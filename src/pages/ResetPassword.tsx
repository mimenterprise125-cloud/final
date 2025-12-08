import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import supabase, { isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import ParticleNetworkBackground from "@/components/ParticleNetworkBackground";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If Supabase hasn't been configured or the session isn't set, warn user.
    if (!isSupabaseConfigured) {
      toast({ title: 'Supabase not configured', description: 'Please configure VITE_SUPABASE_* env vars', variant: 'destructive' })
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // supabase.auth.updateUser will set the new password for the authenticated user.
      // When following the reset link Supabase should have created a temporary session.
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'Reset failed', description: err.message || String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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

            <h2 className="text-3xl font-bold text-center mb-2">Set a New Password</h2>
            <p className="text-muted-foreground text-center mb-8">Enter a new password to complete the reset flow.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-background/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="bg-background/50" />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? 'Updating…' : 'Set New Password'}</Button>
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

export default ResetPassword;
