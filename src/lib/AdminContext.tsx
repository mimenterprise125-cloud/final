import React, { createContext, useState, useContext, useEffect, useRef } from 'react';import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

import supabase from './supabase';import supabase from './s      } catch (err) {

        // silently handle polling errors

export interface PricingTier {      }

  id: string;    }, 10000);

  name: string;

  price: number;    return () => {

  features: string[];      try {

  locked_sections: string[];        supabase.removeChannel(channel);

}      } catch (e) {

        // ignore cleanup errors

export interface AdminSettings {      }

  pricing_enabled: boolean;      try {

  pricing_tiers: PricingTier[];        if (pollingRef.current) window.clearInterval(pollingRef.current);

  maintenance_mode: boolean;      } catch (e) {

  propfirm_locked: boolean;        // ignore

  journal_locked: boolean;      }

  performance_analytics_locked: boolean;    };t interface PricingTier {

  lockType: 'development' | 'premium';  id: string;

  propfirm_lock_type: 'development' | 'premium';  name: string;

  journal_lock_type: 'development' | 'premium';  price: number;

  performance_lock_type: 'development' | 'premium';  features: string[];

  active_user_count: number;  locked_sections: string[];

  total_user_count: number;}

  error_logs: ErrorLog[];

  locked_sections: string[];export interface AdminSettings {

}  pricing_enabled: boolean;

  pricing_tiers: PricingTier[];

export interface ErrorLog {  maintenance_mode: boolean;

  id: string;  propfirm_locked: boolean;

  message: string;  journal_locked: boolean;

  severity: 'low' | 'medium' | 'high' | 'critical';  performance_analytics_locked: boolean;

  timestamp: string;  lockType: 'development' | 'premium'; // Legacy - kept for backward compatibility

  stack_trace?: string;  propfirm_lock_type: 'development' | 'premium';

  user_id?: string;  journal_lock_type: 'development' | 'premium';

  page?: string;  performance_lock_type: 'development' | 'premium';

}  active_user_count: number;

  total_user_count: number;

interface AdminContextType {  error_logs: ErrorLog[];

  adminSettings: AdminSettings;  locked_sections: string[];

  loading: boolean;}

  error: string | null;

  updateSettings: (updates: Partial<AdminSettings>) => Promise<void>;export interface ErrorLog {

  toggleMaintenanceMode: () => Promise<void>;  id: string;

  togglePricingEnabled: () => Promise<void>;  message: string;

  togglePropFirmLock: () => Promise<void>;  severity: 'low' | 'medium' | 'high' | 'critical';

  toggleJournalLock: () => Promise<void>;  timestamp: string;

  togglePerformanceAnalyticsLock: () => Promise<void>;  stack_trace?: string;

  addErrorLog: (error: Omit<ErrorLog, 'id' | 'timestamp'>) => Promise<void>;  user_id?: string;

  clearErrorLogs: () => Promise<void>;  page?: string;

  updatePricingTiers: (tiers: PricingTier[]) => Promise<void>;}

}

interface AdminContextType {

const AdminContext = createContext<AdminContextType | undefined>(undefined);  adminSettings: AdminSettings;

  loading: boolean;

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {  error: string | null;

  const [adminSettings, setAdminSettings] = useState<AdminSettings>({  updateSettings: (updates: Partial<AdminSettings>) => Promise<void>;

    pricing_enabled: false,  toggleMaintenanceMode: () => Promise<void>;

    pricing_tiers: [],  togglePricingEnabled: () => Promise<void>;

    maintenance_mode: false,  togglePropFirmLock: () => Promise<void>;

    propfirm_locked: false,  toggleJournalLock: () => Promise<void>;

    journal_locked: false,  togglePerformanceAnalyticsLock: () => Promise<void>;

    performance_analytics_locked: false,  addErrorLog: (error: Omit<ErrorLog, 'id' | 'timestamp'>) => Promise<void>;

    lockType: 'development',  clearErrorLogs: () => Promise<void>;

    propfirm_lock_type: 'development',  updatePricingTiers: (tiers: PricingTier[]) => Promise<void>;

    journal_lock_type: 'development',}

    performance_lock_type: 'development',

    active_user_count: 0,const AdminContext = createContext<AdminContextType | undefined>(undefined);

    total_user_count: 0,

    error_logs: [],export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    locked_sections: [],  const [adminSettings, setAdminSettings] = useState<AdminSettings>({

  });    pricing_enabled: false,

  const [loading, setLoading] = useState(true);    pricing_tiers: [],

  const [error, setError] = useState<string | null>(null);    maintenance_mode: false,

    propfirm_locked: false,

  const lastRealtimeAt = useRef(0);    journal_locked: false,

  const pollingRef = useRef<number | null>(null);    performance_analytics_locked: false,

    lockType: 'development',

  useEffect(() => {    propfirm_lock_type: 'development',

    fetchAdminSettings(true);    journal_lock_type: 'development',

    performance_lock_type: 'development',

    const channel = supabase.channel('admin_settings_changes')    active_user_count: 0,

      .on(    total_user_count: 0,

        'postgres_changes',    error_logs: [],

        {    locked_sections: [],

          event: '*',  });

          schema: 'public',  const [loading, setLoading] = useState(true);

          table: 'admin_settings',  const [error, setError] = useState<string | null>(null);

          filter: 'id=eq.default',

        },  // Track realtime activity for polling fallback

        (payload) => {  const lastRealtimeAt = useRef(0);

          lastRealtimeAt.current = Date.now();  const pollingRef = useRef<number | null>(null);

          fetchAdminSettings(false);

        }  // Fetch admin settings on mount and subscribe to real-time changes

      )  useEffect(() => {

      .subscribe((status) => {    fetchAdminSettings(true); // Show loading on initial mount

        // subscription status tracked but not logged

      });    // Subscribe to real-time updates using Supabase RealtimePostgresChangesPayload

    const channel = supabase.channel('admin_settings_changes')

    pollingRef.current = window.setInterval(() => {      .on(

      try {        'postgres_changes',

        const now = Date.now();        {

        if (!lastRealtimeAt.current || now - lastRealtimeAt.current > 10000) {          event: '*',

          fetchAdminSettings(false);          schema: 'public',

        }          table: 'admin_settings',

      } catch (err) {          filter: 'id=eq.default',

        // silently handle polling errors        },

      }        (payload) => {

    }, 10000);          // mark realtime as seen and refetch silently

          lastRealtimeAt.current = Date.now();

    return () => {          fetchAdminSettings(false);

      try {        }

        supabase.removeChannel(channel);      )

      } catch (e) {      .subscribe((status) => {

        // ignore cleanup errors        // subscription status tracked but not logged

      }      });

      try {

        if (pollingRef.current) window.clearInterval(pollingRef.current);    // Conservative polling fallback: if no realtime event seen, poll every 10s

      } catch (e) {    // This handles environments where realtime isn't delivered reliably.

        // ignore    pollingRef.current = window.setInterval(() => {

      }      try {

    };        const now = Date.now();

  }, []);        // If we've never seen a realtime event or it's been >10s since last one, refetch

        if (!lastRealtimeAt.current || now - lastRealtimeAt.current > 10000) {

  const fetchAdminSettings = async (showLoading = true) => {          console.log('� Polling fallback: fetching admin settings (no recent realtime)');

    try {          fetchAdminSettings(false);

      if (showLoading) setLoading(true);        }

      const { data, error: fetchError } = await supabase      } catch (err) {

        .from('admin_settings')        console.warn('Polling fallback error:', err);

        .select('*')      }

        .single();    }, 10000);



      if (fetchError && fetchError.code !== 'PGRST116') {    return () => {

        // Admin settings table may not exist yet      console.log('�🔌 Unsubscribing from admin_settings_changes and stopping polling');

      }      try {

        supabase.removeChannel(channel);

      if (data) {      } catch (e) {

        setAdminSettings({        console.warn('Failed to remove supabase channel:', e);

          pricing_enabled: data.pricing_enabled || false,      }

          pricing_tiers: data.pricing_tiers || [],      try {

          maintenance_mode: data.maintenance_mode || false,        if (pollingRef.current) window.clearInterval(pollingRef.current as number);

          propfirm_locked: data.propfirm_locked || false,      } catch (e) {

          journal_locked: data.journal_locked || false,        // ignore

          performance_analytics_locked: data.performance_analytics_locked || false,      }

          lockType: data.lock_type || 'development',    };

          propfirm_lock_type: data.propfirm_lock_type || 'development',  }, []);

          journal_lock_type: data.journal_lock_type || 'development',

          performance_lock_type: data.performance_lock_type || 'development',  const fetchAdminSettings = async (showLoading = true) => {

          active_user_count: data.active_user_count || 0,    try {

          total_user_count: data.total_user_count || 0,      if (showLoading) setLoading(true);

          error_logs: data.error_logs || [],      const { data, error: fetchError } = await supabase

          locked_sections: data.locked_sections || [],        .from('admin_settings')

        });        .select('*')

      }        .single();



      await fetchUserCounts();      console.log('📥 Fetched admin settings from database:', data);

      await fetchErrorLogs();

    } catch (err) {      // If table doesn't exist (406) or no data found (PGRST116), just use defaults

      setError('Admin settings table not yet created. Run the migration.');      if (fetchError && fetchError.code !== 'PGRST116') {

    } finally {        console.warn('Admin settings table may not exist yet. Using defaults.', fetchError);

      if (showLoading) setLoading(false);      }

    }

  };      if (data) {

        console.log('✓ Lock status - propfirm_locked:', data.propfirm_locked, 'journal_locked:', data.journal_locked);

  const fetchUserCounts = async () => {        setAdminSettings({

    try {          pricing_enabled: data.pricing_enabled || false,

      const { data: { user } } = await supabase.auth.getUser();          pricing_tiers: data.pricing_tiers || [],

                maintenance_mode: data.maintenance_mode || false,

      if (!user) {          propfirm_locked: data.propfirm_locked || false,

        setAdminSettings((prev) => ({          journal_locked: data.journal_locked || false,

          ...prev,          performance_analytics_locked: data.performance_analytics_locked || false,

          total_user_count: 0,          lockType: data.lock_type || 'development',

          active_user_count: 0,          propfirm_lock_type: data.propfirm_lock_type || 'development',

        }));          journal_lock_type: data.journal_lock_type || 'development',

        return;          performance_lock_type: data.performance_lock_type || 'development',

      }          active_user_count: data.active_user_count || 0,

          total_user_count: data.total_user_count || 0,

      const { count, error: countError } = await supabase          error_logs: data.error_logs || [],

        .from('profiles')          locked_sections: data.locked_sections || [],

        .select('*', { count: 'exact', head: true });        });

      }

      if (!countError && count) {

        setAdminSettings((prev) => ({      // Fetch active user count

          ...prev,      await fetchUserCounts();

          total_user_count: count,

          active_user_count: Math.floor(count * 0.65),      // Fetch error logs

        }));      await fetchErrorLogs();

      }    } catch (err) {

    } catch (err) {      console.warn('Failed to fetch admin settings:', err);

      // User count fetch skipped      setError('Admin settings table not yet created. Run the migration.');

    }    } finally {

  };      if (showLoading) setLoading(false);

    }

  const fetchErrorLogs = async () => {  };

    try {

      const { data, error: logsError } = await supabase  const fetchUserCounts = async () => {

        .from('error_logs')    try {

        .select('*')      // Get current user to verify authentication

        .order('timestamp', { ascending: false })      const { data: { user } } = await supabase.auth.getUser();

        .limit(100);      

      // If table doesn't exist or user not authenticated, set defaults

      if (logsError) {      if (!user) {

        return;        setAdminSettings((prev) => ({

      }          ...prev,

          total_user_count: 0,

      setAdminSettings((prev) => ({          active_user_count: 0,

        ...prev,        }));

        error_logs: data || [],        return;

      }));      }

    } catch (err) {

      // Error logs fetch skipped      // Count users from auth.users table through profiles table if available

    }      const { count, error: countError } = await supabase

  };        .from('profiles') // or any user-related table

        .select('*', { count: 'exact', head: true });

  const updateSettings = async (updates: Partial<AdminSettings>) => {

    try {      if (!countError && count) {

      const dbUpdates: Record<string, any> = {};        setAdminSettings((prev) => ({

                ...prev,

      if (updates.propfirm_locked !== undefined) {          total_user_count: count,

        dbUpdates.propfirm_locked = updates.propfirm_locked;          active_user_count: Math.floor(count * 0.65), // Estimate active users

      }        }));

      if (updates.journal_locked !== undefined) {      }

        dbUpdates.journal_locked = updates.journal_locked;    } catch (err) {

      }      console.warn('User count fetch skipped - table may not exist yet:', err);

      if (updates.performance_analytics_locked !== undefined) dbUpdates.performance_analytics_locked = updates.performance_analytics_locked;      // Don't throw error, just use defaults

      if (updates.propfirm_lock_type !== undefined) dbUpdates.propfirm_lock_type = updates.propfirm_lock_type;    }

      if (updates.journal_lock_type !== undefined) dbUpdates.journal_lock_type = updates.journal_lock_type;  };

      if (updates.performance_lock_type !== undefined) dbUpdates.performance_lock_type = updates.performance_lock_type;

      if (updates.pricing_enabled !== undefined) dbUpdates.pricing_enabled = updates.pricing_enabled;  const fetchErrorLogs = async () => {

      if (updates.maintenance_mode !== undefined) dbUpdates.maintenance_mode = updates.maintenance_mode;    try {

      if (updates.pricing_tiers !== undefined) dbUpdates.pricing_tiers = updates.pricing_tiers;      const { data, error: logsError } = await supabase

      if (updates.locked_sections !== undefined) dbUpdates.locked_sections = updates.locked_sections;        .from('error_logs')

              .select('*')

      dbUpdates.updated_at = new Date().toISOString();        .order('timestamp', { ascending: false })

        .limit(100);

      const { error: updateError } = await supabase

        .from('admin_settings')      if (logsError) {

        .update(dbUpdates)        console.warn('Error logs table may not exist yet:', logsError);

        .eq('id', 'default')        return;

        .select();      }



      if (updateError) {      setAdminSettings((prev) => ({

        setError(`Failed to save settings: ${updateError.message}`);        ...prev,

      }        error_logs: data || [],

      }));

      setAdminSettings((prev) => ({ ...prev, ...updates }));    } catch (err) {

    } catch (err) {      console.warn('Failed to fetch error logs - table may not exist yet:', err);

      setError(`Error updating settings: ${err}`);    }

      setAdminSettings((prev) => ({ ...prev, ...updates }));  };

    }

  };  const updateSettings = async (updates: Partial<AdminSettings>) => {

    try {

  const toggleMaintenanceMode = async () => {      console.log('📝 Attempting to update settings with:', updates);

    await updateSettings({      

      maintenance_mode: !adminSettings.maintenance_mode,      // Map frontend field names to database column names

    });      const dbUpdates: Record<string, any> = {};

  };      

      if (updates.propfirm_locked !== undefined) {

  const togglePricingEnabled = async () => {        dbUpdates.propfirm_locked = updates.propfirm_locked;

    await updateSettings({        console.log('✏️ Setting propfirm_locked to:', updates.propfirm_locked);

      pricing_enabled: !adminSettings.pricing_enabled,      }

    });      if (updates.journal_locked !== undefined) {

  };        dbUpdates.journal_locked = updates.journal_locked;

        console.log('✏️ Setting journal_locked to:', updates.journal_locked);

  const togglePropFirmLock = async () => {      }

    await updateSettings({      if (updates.performance_analytics_locked !== undefined) dbUpdates.performance_analytics_locked = updates.performance_analytics_locked;

      propfirm_locked: !adminSettings.propfirm_locked,      if (updates.propfirm_lock_type !== undefined) dbUpdates.propfirm_lock_type = updates.propfirm_lock_type;

    });      if (updates.journal_lock_type !== undefined) dbUpdates.journal_lock_type = updates.journal_lock_type;

  };      if (updates.performance_lock_type !== undefined) dbUpdates.performance_lock_type = updates.performance_lock_type;

      if (updates.pricing_enabled !== undefined) dbUpdates.pricing_enabled = updates.pricing_enabled;

  const toggleJournalLock = async () => {      if (updates.maintenance_mode !== undefined) dbUpdates.maintenance_mode = updates.maintenance_mode;

    await updateSettings({      if (updates.pricing_tiers !== undefined) dbUpdates.pricing_tiers = updates.pricing_tiers;

      journal_locked: !adminSettings.journal_locked,      if (updates.locked_sections !== undefined) dbUpdates.locked_sections = updates.locked_sections;

    });      

  };      dbUpdates.updated_at = new Date().toISOString();



  const togglePerformanceAnalyticsLock = async () => {      console.log('🗄️ Sending to database:', dbUpdates);

    await updateSettings({

      performance_analytics_locked: !adminSettings.performance_analytics_locked,      const { error: updateError, data: updateData } = await supabase

    });        .from('admin_settings')

  };        .update(dbUpdates)

        .eq('id', 'default')

  const addErrorLog = async (errorData: Omit<ErrorLog, 'id' | 'timestamp'>) => {        .select();

    try {

      const { error: insertError } = await supabase      if (updateError) {

        .from('error_logs')        console.error('❌ Failed to update admin settings:', updateError);

        .insert([        setError(`Failed to save settings: ${updateError.message}`);

          {      } else {

            ...errorData,        console.log('✅ Database update successful:', updateData);

            timestamp: new Date().toISOString(),      }

          },

        ]);      // Update local state

      setAdminSettings((prev) => ({ ...prev, ...updates }));

      if (insertError) throw insertError;    } catch (err) {

      console.error('❌ Failed to update settings:', err);

      await fetchErrorLogs();      setError(`Error updating settings: ${err}`);

    } catch (err) {      // Still update local state

      // error logging silently failed      setAdminSettings((prev) => ({ ...prev, ...updates }));

    }    }

  };  };



  const clearErrorLogs = async () => {  const toggleMaintenanceMode = async () => {

    try {    await updateSettings({

      const { error: deleteError } = await supabase      maintenance_mode: !adminSettings.maintenance_mode,

        .from('error_logs')    });

        .delete()  };

        .neq('id', '');

  const togglePricingEnabled = async () => {

      if (deleteError) throw deleteError;    await updateSettings({

      pricing_enabled: !adminSettings.pricing_enabled,

      setAdminSettings((prev) => ({    });

        ...prev,  };

        error_logs: [],

      }));  const togglePropFirmLock = async () => {

    } catch (err) {    await updateSettings({

      setError('Failed to clear error logs');      propfirm_locked: !adminSettings.propfirm_locked,

      throw err;    });

    }  };

  };

  const toggleJournalLock = async () => {

  const updatePricingTiers = async (tiers: PricingTier[]) => {    await updateSettings({

    await updateSettings({      journal_locked: !adminSettings.journal_locked,

      pricing_tiers: tiers,    });

    });  };

  };

  const togglePerformanceAnalyticsLock = async () => {

  return (    await updateSettings({

    <AdminContext.Provider      performance_analytics_locked: !adminSettings.performance_analytics_locked,

      value={{    });

        adminSettings,  };

        loading,

        error,  const addErrorLog = async (errorData: Omit<ErrorLog, 'id' | 'timestamp'>) => {

        updateSettings,    try {

        toggleMaintenanceMode,      const { error: insertError } = await supabase

        togglePricingEnabled,        .from('error_logs')

        togglePropFirmLock,        .insert([

        toggleJournalLock,          {

        togglePerformanceAnalyticsLock,            ...errorData,

        addErrorLog,            timestamp: new Date().toISOString(),

        clearErrorLogs,          },

        updatePricingTiers,        ]);

      }}

    >      if (insertError) throw insertError;

      {children}

    </AdminContext.Provider>      await fetchErrorLogs();

  );    } catch (err) {

};      console.error('Failed to add error log:', err);

    }

export const useAdmin = () => {  };

  const context = useContext(AdminContext);

  if (!context) {  const clearErrorLogs = async () => {

    throw new Error('useAdmin must be used within AdminProvider');    try {

  }      const { error: deleteError } = await supabase

  return context;        .from('error_logs')

};        .delete()

        .neq('id', '');

      if (deleteError) throw deleteError;

      setAdminSettings((prev) => ({
        ...prev,
        error_logs: [],
      }));
    } catch (err) {
      console.error('Failed to clear error logs:', err);
      setError('Failed to clear error logs');
      throw err;
    }
  };

  const updatePricingTiers = async (tiers: PricingTier[]) => {
    await updateSettings({
      pricing_tiers: tiers,
    });
  };

  return (
    <AdminContext.Provider
      value={{
        adminSettings,
        loading,
        error,
        updateSettings,
        toggleMaintenanceMode,
        togglePricingEnabled,
        togglePropFirmLock,
        toggleJournalLock,
        togglePerformanceAnalyticsLock,
        addErrorLog,
        clearErrorLogs,
        updatePricingTiers,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
