import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Target, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useShareLink } from '@/lib/useShareLink';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

interface Trade {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  entry_price: number;
  exit_price: number;
  quantity: number;
  setup: string;
  result: 'win' | 'loss' | 'breakeven';
  profit_loss: number;
  created_at: string;
  notes?: string;
  confirmed?: boolean;
  rule_followed?: boolean;
  setup_rating?: number;
}

interface ShareLinkData {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  last_accessed_at?: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
}

export default function SharedJournal() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { getShareLinkByToken } = useShareLink();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedJournal = async () => {
      try {
        if (!token) {
          setError('Invalid share link');
          setLoading(false);
          return;
        }

        const link = await getShareLinkByToken(token);
        
        if (!link) {
          setError('This share link is no longer available');
          setLoading(false);
          return;
        }

        if (!link.is_active) {
          setError('This share link has been disabled');
          setLoading(false);
          return;
        }

        if (link.expires_at && new Date(link.expires_at) < new Date()) {
          setError('This share link has expired');
          setLoading(false);
          return;
        }

        setShareLink(link);
        
        // Fetch user's name
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', link.user_id)
          .single();

        if (userData?.full_name) {
          setUserName(userData.full_name);
        } else {
          // Fallback: get from auth.users
          const { data: authData } = await supabase.auth.admin.getUserById(link.user_id);
          if (authData?.user?.user_metadata?.full_name) {
            setUserName(authData.user.user_metadata.full_name);
          }
        }
        
        // Fetch trades directly from Supabase
        const { data, error: tradesError } = await supabase
          .from('journals')
          .select('*')
          .eq('user_id', link.user_id)
          .order('created_at', { ascending: false });

        if (tradesError) {
          console.error('Supabase error:', tradesError);
          throw tradesError;
        }

        setTrades(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching shared journal:', err);
        setError('Failed to load shared journal');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedJournal();
  }, [token]);

  const calculateStats = () => {
    if (trades.length === 0) return { total: 0, wins: 0, losses: 0, profit: 0, loss: 0 };
    
    const wins = trades.filter(t => t.result === 'win').length;
    const losses = trades.filter(t => t.result === 'loss').length;
    const totalProfit = trades.filter(t => t.profit_loss && t.profit_loss > 0).reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const totalLoss = trades.filter(t => t.profit_loss && t.profit_loss < 0).reduce((sum, t) => sum + Math.abs(t.profit_loss || 0), 0);
    
    return {
      total: trades.length,
      wins,
      losses,
      profit: totalProfit,
      loss: totalLoss,
      winRate: trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : 0
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-8 px-3 sm:px-4 md:px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-5 w-64" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{error}</h1>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4 text-sm sm:text-base">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pt-6 sm:pt-8 px-3 sm:px-4 md:px-6 pb-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors mb-3 sm:mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="mb-3">
              {userName && (
                <p className="text-xs sm:text-sm text-slate-400 mb-1">
                  {userName}'s Trading Journal
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 break-words">
                {shareLink?.title || 'Trading Journal'}
              </h1>
            </div>
            {shareLink?.description && (
              <p className="text-xs sm:text-sm text-slate-300">{shareLink.description}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm bg-blue-500/10 border-blue-500/30 text-blue-300 whitespace-nowrap flex-shrink-0">
            {stats.total} Trades
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          {/* Total Trades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-colors p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-slate-400 font-medium">Total Trades</span>
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.total}</p>
            </Card>
          </motion.div>

          {/* Win Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-colors p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-slate-400 font-medium">Win Rate</span>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.winRate}%</p>
            </Card>
          </motion.div>

          {/* Total Profit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-colors p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-slate-400 font-medium">Profit</span>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-400">
                +${stats.profit.toFixed(2)}
              </p>
            </Card>
          </motion.div>

          {/* Total Loss */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-colors p-3 sm:p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-slate-400 font-medium">Loss</span>
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-400">
                -${stats.loss.toFixed(2)}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Trade History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <div className="p-3 sm:p-4 md:p-5 border-b border-slate-700/50">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white">Trade History</h2>
            </div>
            
            <div className="divide-y divide-slate-700/30">
              {trades.length > 0 ? (
                trades.map((trade, idx) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {/* Main Trade Row */}
                    <div
                      onClick={() => setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id)}
                      className="cursor-pointer hover:bg-slate-700/20 transition-colors"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 items-center">
                        {/* Direction & Symbol */}
                        <div className="col-span-1 flex items-center gap-2">
                          {trade.direction === 'long' ? (
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                          ) : (
                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                          )}
                          <span className="text-xs sm:text-sm font-bold text-white truncate">{trade.symbol}</span>
                        </div>

                        {/* Setup */}
                        <div className="hidden sm:block text-xs text-slate-400">
                          <span className="text-slate-500 text-xs">Setup</span>
                          <p className="truncate">{trade.setup || '-'}</p>
                        </div>

                        {/* Result Badge */}
                        <div className="flex justify-center">
                          <Badge 
                            className="text-xs"
                            variant={
                              trade.result === 'win' ? 'default' : 
                              trade.result === 'loss' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {trade.result}
                          </Badge>
                        </div>

                        {/* P&L - Result like +1$ -2$ */}
                        <div className={`text-sm sm:text-base font-bold text-right ${
                          trade.profit_loss && trade.profit_loss > 0 ? 'text-emerald-400' : 
                          trade.profit_loss && trade.profit_loss < 0 ? 'text-red-400' : 
                          'text-slate-300'
                        }`}>
                          {trade.profit_loss ? (
                            <>
                              {trade.profit_loss > 0 ? '+' : ''}{trade.profit_loss.toFixed(0)}$
                            </>
                          ) : (
                            '0$'
                          )}
                        </div>

                        {/* Expand Icon */}
                        <div className="flex justify-end">
                          <ChevronDown 
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              expandedTradeId === trade.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Notes & Details Row */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: expandedTradeId === trade.id ? 'auto' : 0,
                        opacity: expandedTradeId === trade.id ? 1 : 0
                      }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-slate-900/20 border-t border-slate-700/30 p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">

                        {/* Setup Info */}
                        <div>
                          <span className="text-xs text-slate-500">Setup</span>
                          <p className="text-sm text-slate-300">{trade.setup || '-'}</p>
                        </div>

                        {/* Trade Metadata */}
                        {(trade.confirmed || trade.rule_followed || trade.setup_rating) && (
                          <div className="flex flex-wrap gap-2">
                            {trade.confirmed && (
                              <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30 text-blue-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Confirmed
                              </Badge>
                            )}
                            {trade.rule_followed && (
                              <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Rules Followed
                              </Badge>
                            )}
                            {trade.setup_rating && (
                              <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-300">
                                ⭐ {trade.setup_rating}/5
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Trade Notes */}
                        {trade.notes && (
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                            <span className="text-xs text-slate-500 block mb-2">Trade Notes</span>
                            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{trade.notes}</p>
                          </div>
                        )}

                        {/* Date & Time */}
                        <div className="text-xs">
                          <span className="text-slate-500">Date & Time</span>
                          <p className="text-slate-200 font-medium">
                            {new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} at {new Date(trade.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400">No trades yet</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-700/50 text-center"
        >
          <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">
            Interested in tracking your own trades?
          </p>
          <Button
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Join Us Today
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
