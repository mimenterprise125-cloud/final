import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { compressImageFileToWebP, uploadJournalImage } from "@/lib/image-utils";
import supabase from "@/lib/supabase";

interface AddJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const nowLocal = () => new Date().toISOString().slice(0, 16);

export const AddJournalDialog = ({ open, onOpenChange, onSaved }: AddJournalDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>({
  symbol: "",
  entry_at: nowLocal(),
  exit_at: nowLocal(),
    session: "London",
    setup_name: "",
    setup_rating: "B",
    execution_type: "",
    stop_loss_price: "",
    target_price: "",
    // points-based optional inputs
    stop_loss_points: "",
    target_points: "",
    // link to account
    account_id: "",
    // trade quality
    rule_followed: false,
    confirmation: false,
    loss_reason: "",
    direction: "Buy",
    result: "TP",
    manualOutcome: "Profit",
    manualAmount: "",
    notes: "",
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [setups, setSetups] = useState<{name: string; description?: string}[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  // add-symbol popover state
  const [addSymOpen, setAddSymOpen] = useState(false);
  const [addSymInput, setAddSymInput] = useState("");
  // add-setup modal state
  const [addSetupOpen, setAddSetupOpen] = useState(false);
  const [newSetupInput, setNewSetupInput] = useState("");
  const [newSetupDescription, setNewSetupDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    // load saved symbols and setups
    (async () => {
      try {
        const { data: symData, error: symErr } = await supabase
          .from("symbols")
          .select("name")
          .order("created_at", { ascending: false })
          .limit(1000);
        if (!symErr && symData) {
          const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            const seen = new Map<string,string>();
            for (const r of symData) {
              // prefer user-visible name if available; fall back to name
              const rawName = r.name || "";
              // use normalized_name if available from DB
              const n = (r.normalized_name && String(r.normalized_name).trim().length > 0) ? String(r.normalized_name).toUpperCase() : normalize(rawName);
              if (!seen.has(n) && rawName) seen.set(n, rawName);
            }
            setSymbols(Array.from(seen.values()));
        }

        const { data: stData, error: stErr } = await supabase
          .from("setups")
          .select("name, description")
          .order("created_at", { ascending: false })
          .limit(1000);
        if (!stErr && stData) {
          const uniq: {name: string; description?: string}[] = [];
          const seenSet = new Set<string>();
          for (const r of stData) {
            const name = (r.name || "").trim();
            const key = name.toLowerCase();
            if (name && !seenSet.has(key)) { 
              seenSet.add(key); 
              uniq.push({ name, description: r.description || undefined }); 
            }
          }
          setSetups(uniq);
        }
        // load user's trading accounts for account-based filtering
        try {
          const { data: accData, error: accErr } = await supabase.from('trading_accounts').select('id, name, account_identifier').order('created_at', { ascending: false });
          if (!accErr && accData) setAccounts(accData as any[]);
        } catch (e) {}
      } catch (e) {
        // ignore load errors
      }
    })();
  }, [open]);

  // build preview URLs for selected files (create on files change, revoke on cleanup)
  useEffect(() => {
    // revoke previous previews and create new ones
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return urls;
    });
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  // validate form data
  useEffect(() => {
    const errs: Record<string,string> = {};
    if (!formData.symbol || formData.symbol.trim() === '') errs.symbol = 'Symbol is required';
    try {
      if (formData.entry_at && formData.exit_at) {
        if (new Date(formData.exit_at) <= new Date(formData.entry_at)) errs.time = 'Exit must be after entry';
      }
    } catch (e) {}

    if (formData.result === 'MANUAL') {
      if (!formData.manualAmount || Number(formData.manualAmount) === 0) errs.manual = 'Enter manual amount';
    } else if (formData.result === 'TP') {
      if (!formData.target_price || Number(formData.target_price) === 0) errs.target = 'Enter target amount';
    } else if (formData.result === 'SL') {
      if (!formData.stop_loss_price || Number(formData.stop_loss_price) === 0) errs.stop_loss = 'Enter stop loss amount';
    }

    setErrors(errs);
  }, [formData]);

  // Triggered when Save is clicked from the small add-symbol popover
  const handleAddSymbol = async () => {
    const raw = addSymInput?.trim();
    if (!raw) {
      toast({ title: "Invalid symbol" });
      return;
    }

    // Check if user is authenticated
    const user = (await supabase.auth.getUser()).data?.user;
    if (!user?.id) {
      toast({ title: "Authentication required", description: "Please log in to add symbols", variant: "destructive" });
      return;
    }

    const input = raw.replace(/\s+/g, ' ');
    const nInput = normalizeSymbolKey(input);
    const display = formatSymbolDisplay(input);

    try {
      // try to read normalized_name; if not present, fall back to name-only queries
      let all: any[] = [];
      let hasNormalized = true;
      try {
        const res = await supabase.from('symbols').select('name, normalized_name').limit(1000);
        if (res.error) throw res.error;
        all = res.data || [];
      } catch (e) {
        hasNormalized = false;
        const res2 = await supabase.from('symbols').select('name').limit(1000);
        if (res2.error) throw res2.error;
        all = res2.data || [];
      }

      // find existing symbol
      const found = (all || []).find((r:any) => {
        if (hasNormalized && r.normalized_name) return String(r.normalized_name).toUpperCase() === nInput;
        return normalizeSymbolKey(r.name || '') === nInput;
      });
      if (found) {
        const existingName = found.name || (found.normalized_name ? formatSymbolDisplay(String(found.normalized_name)) : formatSymbolDisplay(found.name || ''));
        setSymbols((s) => [existingName, ...s.filter((x) => normalizeSymbolKey(x) !== nInput)]);
        setFormData((f: any) => ({ ...f, symbol: existingName }));
        setAddSymOpen(false);
        setAddSymInput('');
        toast({ title: 'Symbol exists', description: existingName });
        return;
      }

      // User is already authenticated (checked at start of handleAddSymbol)
      const userId = user?.id;

      if (hasNormalized) {
        const payload: any = { name: display, normalized_name: nInput };
        payload.user_id = userId;
        const { data: insertData, error: insertErr } = await supabase.from('symbols').insert([payload]).select('*');
        if (insertErr) {
          console.warn('Symbol insert error (with normalized_name)', insertErr);
          // try to locate existing symbol by normalized_name
          try {
            const foundRows = await supabase.from('symbols').select('name, normalized_name').eq('normalized_name', nInput).limit(1);
            if (!foundRows.error && foundRows.data && foundRows.data.length > 0) {
              const existingName = foundRows.data[0].name;
              setSymbols((s) => [existingName, ...s.filter((x) => normalizeSymbolKey(x) !== nInput)]);
              setFormData((f: any) => ({ ...f, symbol: existingName }));
              setAddSymOpen(false);
              setAddSymInput('');
              toast({ title: 'Symbol exists', description: existingName });
              return;
            }
          } catch (e) {
            // ignore
          }
          // retry insert without normalized_name
          const payload2: any = { name: display };
          payload2.user_id = userId;
          const { data: insertData2, error: insertErr2 } = await supabase.from('symbols').insert([payload2]).select('*');
          if (insertErr2) {
            // If FK error, try without user_id (symbols table may not require FK association)
            if (insertErr2.message && insertErr2.message.includes('user_id')) {
              console.warn('FK constraint on user_id, trying without it', insertErr2.message);
              const payload3: any = { name: display };
              const { data: insertData3, error: insertErr3 } = await supabase.from('symbols').insert([payload3]).select('*');
              if (insertErr3) throw insertErr3;
            } else {
              throw insertErr2;
            }
          }
          setSymbols((s) => [display, ...s.filter((x) => normalizeSymbolKey(x) !== nInput)]);
          setFormData((f: any) => ({ ...f, symbol: display }));
          setAddSymOpen(false);
          setAddSymInput('');
          toast({ title: 'Symbol saved', description: display });
        } else {
          setSymbols((s) => [display, ...s.filter((x) => normalizeSymbolKey(x) !== nInput)]);
          setFormData((f: any) => ({ ...f, symbol: display }));
          setAddSymOpen(false);
          setAddSymInput('');
          toast({ title: 'Symbol saved', description: display });
        }
      } else {
        const payload: any = { name: display };
        payload.user_id = userId;
        const { data: insertData, error: insertErr } = await supabase.from('symbols').insert([payload]).select('*');
        if (insertErr) {
          // If FK error, try without user_id
          if (insertErr.message && insertErr.message.includes('user_id')) {
            console.warn('FK constraint on user_id, trying without it', insertErr.message);
            const payload2: any = { name: display };
            const { data: insertData2, error: insertErr2 } = await supabase.from('symbols').insert([payload2]).select('*');
            if (insertErr2) throw insertErr2;
          } else {
            throw insertErr;
          }
        }
        setSymbols((s) => [display, ...s.filter((x) => normalizeSymbolKey(x) !== nInput)]);
        setFormData((f: any) => ({ ...f, symbol: display }));
        setAddSymOpen(false);
        setAddSymInput('');
        toast({ title: 'Symbol saved', description: display });
      }
    } catch (err: any) {
      toast({ title: 'Add symbol failed', description: err?.message || String(err), variant: 'destructive' });
    }
  };

  const handleAddSetup = async () => {
    const setupName = newSetupInput.trim();
    const setupDesc = newSetupDescription.trim();

    if (!setupName) {
      toast({ title: 'Invalid setup name', description: 'Please enter a setup name', variant: 'destructive' });
      return;
    }

    // Check if setup already exists (case-insensitive)
    if (setups.some(s => s.name.toLowerCase() === setupName.toLowerCase())) {
      toast({ title: 'Setup already exists', description: `"${setupName}" is already in your list`, variant: 'destructive' });
      return;
    }

    try {
      const user = (await supabase.auth.getUser()).data?.user;
      if (!user?.id) {
        toast({ title: 'Authentication required', description: 'Please log in to save setups', variant: 'destructive' });
        return;
      }

      // Save to database
      const { data, error } = await supabase
        .from('setups')
        .insert([{
          name: setupName,
          description: setupDesc || null,
          user_id: user.id
        }])
        .select('*');

      if (error) throw error;

      // Add the new setup to local state
      setSetups([...setups, { name: setupName, description: setupDesc || undefined }]);
      setFormData({ ...formData, setup_name: setupName });
      setNewSetupInput('');
      setNewSetupDescription('');
      setAddSetupOpen(false);
      toast({ title: 'Setup saved', description: `"${setupName}" has been saved to your setups` });
    } catch (err: any) {
      toast({ title: 'Failed to save setup', description: err?.message || String(err), variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const user = (await supabase.auth.getUser()).data?.user;
      if (!user?.id) {
        toast({ title: "Authentication required", description: "Please log in to save journal entries", variant: "destructive" });
        setIsUploading(false);
        return;
      }
      const userId = user.id;

      // upload screenshots
      const screenshotUrls: string[] = [];
      for (const f of files) {
        const blob = await compressImageFileToWebP(f, { maxWidth: 1200, quality: 0.75 });
        const up = await uploadJournalImage(blob, userId ?? "anonymous");
        if (up.publicUrl) screenshotUrls.push(up.publicUrl);
      }

      // compute realized amount
      let realized_amount = 0;
      if (formData.result === "TP") realized_amount = Number(formData.target_price || 0);
      else if (formData.result === "SL") realized_amount = -Number(formData.stop_loss_price || 0);
      else if (formData.result === "BREAKEVEN") realized_amount = 0;
      else if (formData.result === "MANUAL") {
        const amt = Number(formData.manualAmount || 0);
        realized_amount = formData.manualOutcome === "Profit" ? amt : -amt;
      }

      // duration in minutes
      let duration_minutes: number | null = null;
      if (formData.entry_at && formData.exit_at) {
        const start = new Date(formData.entry_at);
        const end = new Date(formData.exit_at);
        const diff = (end.getTime() - start.getTime()) / 60000;
        duration_minutes = Number.isFinite(diff) ? Math.max(0, Math.round(diff)) : null;
      }

  const payload: any = {
  title: formData.symbol || null,
  symbol: formData.symbol || null,
        session: formData.session,
  setup: formData.setup_name || null,
        setup_rating: formData.setup_rating,
        execution_type: formData.execution_type,
    stop_loss_price: formData.stop_loss_price ? Number(formData.stop_loss_price) : null,
    target_price: formData.target_price ? Number(formData.target_price) : null,
    stop_loss_points: formData.stop_loss_points ? Number(formData.stop_loss_points) : null,
    target_points: formData.target_points ? Number(formData.target_points) : null,
        direction: formData.direction,
        result: formData.result,
    realized_amount: realized_amount,
    // realized points: prefer explicit points input, fallback to prices for backward compatibility or manual
    realized_points: (formData.result === 'MANUAL') ? (Number(formData.manualAmount || 0) * (formData.manualOutcome === 'Profit' ? 1 : -1)) : (formData.result === 'TP' ? (formData.target_points ? Number(formData.target_points) : Number(formData.target_price || 0)) : (formData.result === 'SL' ? (formData.stop_loss_points ? -Number(formData.stop_loss_points) : -Number(formData.stop_loss_price || 0)) : 0)),
    win: ((formData.result === 'MANUAL') ? (formData.manualOutcome === 'Profit') : ( (formData.result === 'TP') ? true : (formData.result === 'SL' ? false : false) )),
    account_id: formData.account_id || null,
    rule_followed: !!formData.rule_followed,
    confirmation: !!formData.confirmation,
    loss_reason: formData.loss_reason || null,
        duration_minutes: duration_minutes,
        notes: formData.notes || null,
        screenshot_urls: screenshotUrls,
        created_at: new Date().toISOString(),
      };

  // Include optional timestamp fields if provided (entry_at, exit_at may not exist in all schemas)
  if (formData.entry_at) payload.entry_at = new Date(formData.entry_at).toISOString();
  if (formData.exit_at) payload.exit_at = new Date(formData.exit_at).toISOString();

  // include user_id since we now require authentication
  payload.user_id = userId;

  const { error } = await supabase.from("journals").insert([payload]);
      if (error) {
        // If insert fails due to unknown columns, retry without entry_at/exit_at
        if (error.message && (error.message.includes('entry_at') || error.message.includes('exit_at'))) {
          console.warn('entry_at/exit_at columns not supported, retrying without them', error.message);
          delete payload.entry_at;
          delete payload.exit_at;
          const { error: retryError } = await supabase.from("journals").insert([payload]);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      // save setup if new and not already in list
      if (formData.setup_name && !setups.includes(formData.setup_name)) {
        try {
          const rows = [{ name: formData.setup_name, user_id: userId }];
          await supabase.from("setups").insert(rows);
          setSetups(s => [formData.setup_name, ...s]);
        } catch (e) {
          // ignore
        }
      }

      toast({ title: "Entry added", description: "Journal entry has been added successfully." });
      setFiles([]);
      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err?.message || String(err), variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // compute duration for UI
  const getDurationMinutes = () => {
    try {
      if (formData.entry_at && formData.exit_at) {
        const start = new Date(formData.entry_at);
        const end = new Date(formData.exit_at);
        const diff = (end.getTime() - start.getTime()) / 60000;
        return Number.isFinite(diff) ? Math.max(0, Math.round(diff)) : null;
      }
    } catch (e) {}
    return null;
  };

  const durationMinutes = getDurationMinutes();
  const durationStr = durationMinutes == null ? "" : (durationMinutes >= 60 ? `${Math.floor(durationMinutes/60)}h ${durationMinutes%60}m (${durationMinutes} min)` : `${durationMinutes} min`);

  // helpers to split/merge ISO datetime for separate date/time inputs
  const isoToDate = (iso?: string) => {
    try {
      if (!iso) return "";
      return new Date(iso).toISOString().slice(0,10); // YYYY-MM-DD
    } catch (e) { return "" }
  }
  const isoToTime = (iso?: string) => {
    try {
      if (!iso) return "";
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2,'0');
      const mm = String(d.getMinutes()).padStart(2,'0');
      return `${hh}:${mm}`;
    } catch (e) { return "" }
  }

  const setEntryDate = (dateStr: string) => {
    const time = isoToTime(formData.entry_at) || '00:00';
    setFormData((f:any)=> ({...f, entry_at: dateStr ? `${dateStr}T${time}` : ''}));
  }
  const setEntryTime = (timeStr: string) => {
    const date = isoToDate(formData.entry_at) || new Date().toISOString().slice(0,10);
    setFormData((f:any)=> ({...f, entry_at: timeStr ? `${date}T${timeStr}` : ''}));
  }

  const setExitDate = (dateStr: string) => {
    const time = isoToTime(formData.exit_at) || '00:00';
    setFormData((f:any)=> ({...f, exit_at: dateStr ? `${dateStr}T${time}` : ''}));
  }
  const setExitTime = (timeStr: string) => {
    const date = isoToDate(formData.exit_at) || new Date().toISOString().slice(0,10);
    setFormData((f:any)=> ({...f, exit_at: timeStr ? `${date}T${timeStr}` : ''}));
  }

  // symbol formatting helpers
  const normalizeSymbolKey = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const formatSymbolDisplay = (s: string) => {
    if (!s) return s;
    // if already contains a slash, normalize spacing and uppercase
    if (/[\/]/.test(s)) return s.replace(/\s+/g, '').replace(/\\/g, '/').toUpperCase();
    const raw = normalizeSymbolKey(s);
    if (raw.length === 6) return `${raw.slice(0,3)}/${raw.slice(3)}`;
    // fallback: split in the middle if even length > 0
    if (raw.length > 1 && raw.length % 2 === 0) return `${raw.slice(0, raw.length/2)}/${raw.slice(raw.length/2)}`;
    return raw;
  }

  // Custom DateTime picker using Popover + Calendar + time list
  const DateTimePicker = ({ value, onChange, placeholder }: { value?: string; onChange: (iso:string) => void; placeholder?: string }) => {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
    const [selectedTime, setSelectedTime] = useState<string>(value ? isoToTime(value) : "");

    useEffect(() => {
      setSelectedDate(value ? new Date(value) : undefined);
      setSelectedTime(value ? isoToTime(value) : "");
    }, [value]);

    const apply = () => {
      if (!selectedDate) return;
      const dateStr = selectedDate.toISOString().slice(0,10);
      const timeStr = selectedTime || '00:00';
      onChange(`${dateStr}T${timeStr}`);
      setOpen(false);
    }

    // replace numeric inputs with dropdowns (12-hour with AM/PM) and dropdown minutes
    const [hour12, setHour12] = useState<string>('12');
    const [minuteSel, setMinuteSel] = useState<string>('00');
    const [meridiem, setMeridiem] = useState<'AM'|'PM'>('AM');

    const parse24To12 = (t24: string) => {
      if (!t24) return { h12: '12', m: '00', mer: 'AM' as 'AM'|'PM' };
      const [hh, mm] = t24.split(':');
      let h = Number(hh);
      const mer = h >= 12 ? 'PM' : 'AM';
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;
      return { h12: String(h12), m: mm || '00', mer };
    }
    const to24 = (h12: string, mm: string, mer: 'AM'|'PM') => {
      let h = Number(h12);
      if (mer === 'AM' && h === 12) h = 0;
      if (mer === 'PM' && h < 12) h = h + 12;
      return `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
    }

    useEffect(()=>{
      const t = selectedTime || '00:00';
      const parsed = parse24To12(t);
  setHour12(parsed.h12);
  setMinuteSel(parsed.m);
  setMeridiem(parsed.mer as 'AM'|'PM');
    }, [selectedTime]);

    const applyWithValidation = () => {
      if (!selectedDate) { toast({ title: 'No date selected', description: 'Please pick a date first', variant: 'destructive' }); return; }
      // validate minute and hour
      const okH = /^([1-9]|1[0-2])$/.test(hour12);
      const okM = /^([0-5]\d)$/.test(minuteSel);
      if (!okH || !okM) { toast({ title: 'Invalid time', description: 'Choose hour and minute from the dropdowns', variant: 'destructive' }); return; }
      const t24 = to24(hour12, minuteSel, meridiem);
      const dateStr = selectedDate.toISOString().slice(0,10);
      onChange(`${dateStr}T${t24}`);
      setOpen(false);
    }

    // build minute options (00..59)
    const minuteOptions = Array.from({length:60}).map((_,i) => String(i).padStart(2,'0'));
    const hourOptions = Array.from({length:12}).map((_,i) => String(i+1));

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="journal-trigger w-full text-left flex items-center gap-3 bg-transparent border border-white/10 rounded-md px-3 py-2 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 transition">
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{value ? `${isoToDate(value)} ${isoToTime(value)}` : (placeholder || 'Select date & time')}</div>
            </div>
            <div className="text-white text-xs">⏷</div>
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-[540px]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Calendar mode="single" selected={selectedDate} onSelect={(d:any)=> setSelectedDate(d || undefined)} />
            </div>
            <div className="w-full sm:w-56">
              <div className="text-xs font-medium mb-2 text-slate-600 dark:text-slate-300">Time</div>
              <div className="mb-2">
                <div className="inline-flex items-center gap-2 p-2 rounded-md border border-white/10 bg-transparent">
                  <select aria-label="Hour" value={hour12} onChange={(e)=> setHour12(e.target.value)} className="h-10 w-16 rounded-md border-0 px-2 text-white bg-transparent font-medium">
                    {hourOptions.map(h => <option key={h} value={h} className="text-white">{h}</option>)}
                  </select>
                  <div className="text-sm font-medium text-white">:</div>
                  <select aria-label="Minute" value={minuteSel} onChange={(e)=> setMinuteSel(e.target.value)} className="h-10 w-16 rounded-md border-0 px-2 text-white bg-transparent font-medium">
                    {minuteOptions.map(m => <option key={m} value={m} className="text-white">{m}</option>)}
                  </select>
                </div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <button type="button" onClick={()=> setMeridiem('AM')} className={`flex-1 h-9 rounded-md ${meridiem==='AM' ? 'bg-sky-600 text-white' : 'border bg-transparent text-white'}`}>AM</button>
                    <button type="button" onClick={()=> setMeridiem('PM')} className={`flex-1 h-9 rounded-md ${meridiem==='PM' ? 'bg-sky-600 text-white' : 'border bg-transparent text-white'}`}>PM</button>
                  </div>
                  </div>
                </div>
                <div className="mb-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">Or type exact time (hh:mm) — it'll sync on Apply.</div>
                <Input aria-label="Time text" placeholder="HH:MM" value={selectedTime} onChange={(e)=> setSelectedTime(e.target.value)} className="h-10 mt-1 text-white bg-transparent" />
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={applyWithValidation}>Apply</Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="glass-strong w-full max-w-3xl sm:max-w-2xl md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-hidden border border-border/40 p-4 sm:p-6">
        <style>{`.journal-dt input[type="date"], .journal-dt input[type="time"]{ -webkit-appearance: none; appearance: none; }
.journal-dt input::-webkit-calendar-picker-indicator{ filter: grayscale(40%) brightness(0.6); opacity:0.9 }
.journal-dt .picker-input{ z-index:50 }
/* hide native scrollbars while preserving scroll behavior */
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
`}</style>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Add Trade Entry</DialogTitle>
          <DialogDescription className="text-sm">Log your trade details to build your trading journal</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="max-h-[calc(90vh-160px)] overflow-y-auto hide-scrollbar pr-3 space-y-6">
          
          {/* Section 1: Trade Basics - Symmetric Layout */}
          <div className="bg-background/40 rounded-xl p-5 border border-border/30 space-y-4">
            <div className="text-sm font-semibold text-accent mb-3"> Trade Setup</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Symbol */}
              <div className="flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Symbol</Label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 h-10 px-3 text-sm bg-background/50 text-foreground border border-border/50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {symbols.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <Popover open={addSymOpen} onOpenChange={setAddSymOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="h-10 border-border/50 hover:bg-accent/20">➕</Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-[280px] glass-strong border-border/40">
                      <div className="flex flex-col gap-3">
                        <div className="text-sm font-semibold">Add Symbol</div>
                        <input value={addSymInput} onChange={(e) => setAddSymInput(e.target.value)} placeholder="e.g. EUR/USD" className="h-10 px-3 rounded-lg border border-border/50 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setAddSymOpen(false); setAddSymInput(''); }}>Cancel</Button>
                          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={handleAddSymbol}>Save</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.symbol && <div className="text-rose-400 text-xs">{errors.symbol}</div>}
              </div>

              {/* Entry Time */}
              <div className="flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Entry Time</Label>
                <DateTimePicker value={formData.entry_at} onChange={(iso)=> setFormData((f:any)=>({...f, entry_at: iso}))} placeholder="Entry" />
              </div>

              {/* Exit Time */}
              <div className="flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Exit Time</Label>
                <DateTimePicker value={formData.exit_at} onChange={(iso)=> setFormData((f:any)=>({...f, exit_at: iso}))} placeholder="Exit" />
                {errors.time && <div className="text-rose-400 text-xs">{errors.time}</div>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Direction</Label>
                <select className="h-10 px-3 text-sm bg-background/50 text-foreground border border-border/50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-accent" value={formData.direction} onChange={(e) => setFormData({ ...formData, direction: e.target.value })}>
                  <option>Buy</option>
                  <option>Sell</option>
                </select>
              </div>
              <div className="col-span-2 flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Duration <span className="text-accent text-xs">(Auto-calculated)</span></Label>
                {durationMinutes ? (
                  <div className="h-10 flex items-center px-3 rounded-lg bg-gradient-to-r from-accent/15 to-accent/10 border border-accent/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-50"></div>
                    <span className="text-sm font-semibold text-accent relative z-10">⏱️ {Math.floor(durationMinutes/60)}h {durationMinutes%60}m</span>
                  </div>
                ) : (
                  <div className="h-10 flex items-center px-3 rounded-lg bg-background/50 border border-border/30 border-dashed text-muted-foreground text-xs">
                    ⏳ Set entry & exit time to calculate
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Session</Label>
              <select className="h-10 px-3 text-sm bg-background/50 text-foreground border border-border/50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-accent" value={formData.session} onChange={(e) => setFormData({ ...formData, session: e.target.value })}>
                <option>London</option>
                <option>NY</option>
                <option>Asia</option>
                
              </select>
            </div>

            <div className="flex flex-col space-y-2 col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground">Setup Name</Label>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <div className="relative">
                    <select 
                      value={formData.setup_name || ''} 
                      onChange={(e) => setFormData({ ...formData, setup_name: e.target.value })}
                      className="w-full h-10 px-3 pr-10 text-sm bg-background/50 text-foreground border border-border/50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors cursor-pointer"
                    >
                      <option value="">Select or create setup...</option>
                      {setups.map((s) => (
                        <option key={s.name} value={s.name} title={s.description || ''}>
                          {s.description ? `${s.name} - ${s.description.substring(0, 40)}...` : s.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddSetupOpen(true)} 
                  size="sm" 
                  className="h-10 border-border/50 hover:bg-accent/20 flex-shrink-0"
                >
                  ➕ Add
                </Button>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Setup Rating</Label>
              <div className="flex gap-2">
                {['B', 'B+', 'A-', 'A', 'A+'].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, setup_rating: rating })}
                    className={`flex-1 h-10 rounded-lg font-semibold text-sm transition-all ${
                      formData.setup_rating === rating
                        ? 'bg-accent/40 border border-accent/50 text-accent'
                        : 'bg-background/50 border border-border/50 text-muted-foreground hover:border-accent/30'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Execution Type</Label>
              <div className="relative">
                <select className="w-full h-10 px-3 pr-10 text-sm bg-background/50 text-foreground border border-border/50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors cursor-pointer" value={formData.execution_type} onChange={(e) => setFormData({ ...formData, execution_type: e.target.value })}>
                  <option value="">Market</option>
                  <option>Limit</option>
                  <option>Stop</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Result</Label>
              <div className="relative">
                <select className="w-full h-10 px-3 pr-10 text-sm bg-background/50 text-foreground border border-border/50 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors cursor-pointer" value={formData.result} onChange={(e) => setFormData({ ...formData, result: e.target.value })}>
                  <option value="TP">✅ Take Profit</option>
                  <option value="SL">❌ Stop Loss</option>
                  <option value="BREAKEVEN">⚖️ Breakeven</option>
                  <option value="MANUAL">📝 Manual Exit</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {formData.result === "MANUAL" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label className="mb-1">Manual outcome</Label>
                <select className="h-10 px-3 text-sm bg-transparent text-white border border-white/20 rounded-md appearance-none" value={formData.manualOutcome} onChange={(e) => setFormData({ ...formData, manualOutcome: e.target.value })}>
                  <option value="Profit">Profit</option>
                  <option value="Loss">Loss</option>
                </select>
              </div>
              <div className="flex flex-col">
                <Label className="mb-1">Manual amount</Label>
                <Input className="h-10 px-3 text-sm bg-transparent text-white border border-white/20 rounded-md" type="number" step="0.01" value={formData.manualAmount} onChange={(e) => setFormData({ ...formData, manualAmount: e.target.value })} />
              </div>
            </div>
          )}


          {/* Section 3: P&L & Risk Management */}
          <div className="bg-background/40 rounded-xl p-5 border border-border/30 space-y-4">
            <div className="text-sm font-semibold text-accent mb-3">💰 P&L & Risk</div>
            
            {/* Amount-based P&L */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-rose-400">Stop Loss ($$)</Label>
                <Input 
                  className="h-10 px-3 text-sm bg-background/50 text-rose-400 border border-rose-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400/50" 
                  type="number" 
                  step="0.01" 
                  value={formData.stop_loss_price} 
                  onChange={(e) => setFormData({ ...formData, stop_loss_price: e.target.value })} 
                  disabled={formData.result === "MANUAL"} 
                  placeholder="0.00"
                />
                {errors.stop_loss && <div className="text-rose-400 text-xs">{errors.stop_loss}</div>}
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-emerald-400">Target ($$)</Label>
                <Input 
                  className="h-10 px-3 text-sm bg-background/50 text-emerald-400 border border-emerald-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50" 
                  type="number" 
                  step="0.01" 
                  value={formData.target_price} 
                  onChange={(e) => setFormData({ ...formData, target_price: e.target.value })} 
                  disabled={formData.result === "MANUAL"}
                  placeholder="0.00"
                />
                {errors.target && <div className="text-rose-400 text-xs">{errors.target}</div>}
              </div>
            </div>

            {/* Points-based P&L */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-rose-400">Stop Loss (pts)</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="h-10 px-3 text-sm bg-background/50 text-rose-400 border border-rose-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                  value={formData.stop_loss_points}
                  onChange={(e)=> setFormData({...formData, stop_loss_points: e.target.value})}
                  disabled={formData.result === "MANUAL"}
                  placeholder="0.0"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-xs font-semibold text-emerald-400">Target (pts)</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="h-10 px-3 text-sm bg-background/50 text-emerald-400 border border-emerald-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  value={formData.target_points}
                  onChange={(e)=> setFormData({...formData, target_points: e.target.value})}
                  disabled={formData.result === "MANUAL"}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Trade Quality */}
          <div className="bg-background/40 rounded-xl p-5 border border-border/30 space-y-4">
            <div className="text-sm font-semibold text-accent mb-3"> Trade Quality</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-accent/50 cursor-pointer transition">
                <input type="checkbox" id="rule_followed" className="w-4 h-4 cursor-pointer" checked={!!formData.rule_followed} onChange={(e)=> setFormData({...formData, rule_followed: e.target.checked})} />
                <label htmlFor="rule_followed" className="text-sm font-medium cursor-pointer flex-1">Followed rules</label>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-accent/50 cursor-pointer transition">
                <input type="checkbox" id="confirmation" className="w-4 h-4 cursor-pointer" checked={!!formData.confirmation} onChange={(e)=> setFormData({...formData, confirmation: e.target.checked})} />
                <label htmlFor="confirmation" className="text-sm font-medium cursor-pointer flex-1">Had confirmation</label>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Loss Reason (if SL)</Label>
              <input 
                list="loss-reason-list" 
                className="h-10 px-3 text-sm bg-background/50 text-foreground border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent" 
                value={formData.loss_reason} 
                onChange={(e)=> setFormData({...formData, loss_reason: e.target.value})} 
                placeholder="Select or type..."
              />
              <datalist id="loss-reason-list">
                <option>Early entry</option>
                <option>Late entry</option>
                <option>Rushed entry</option>
                <option>Wrong bias</option>
                <option>No confirmation</option>
                <option>News volatility</option>
                <option>Other</option>
              </datalist>
            </div>
          </div>


          {/* Section 5: Notes & Evidence */}
          <div className="bg-background/40 rounded-xl p-5 border border-border/30 space-y-4">
            <div className="text-sm font-semibold text-accent mb-3"> Notes & Evidence</div>
            
            <div className="flex flex-col space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Trade Notes</Label>
              <Textarea
                className="bg-background/50 text-sm text-foreground border border-border/50 rounded-lg mt-1 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent placeholder-muted-foreground"
                rows={6}
                placeholder="Add trade notes, observations, or analysis..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex flex-col space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground">📸 Screenshots</Label>
              <label htmlFor="screenshot-input" className="flex flex-col gap-3 p-4 rounded-lg border-2 border-dashed border-border/50 hover:border-accent/50 bg-background/50 cursor-pointer transition-colors">
                <div className="text-center">
                  <div className="text-2xl mb-2">📷</div>
                  <p className="text-sm font-medium text-foreground">Upload screenshots</p>
                  <p className="text-xs text-muted-foreground">Click to select images (PNG, JPG, WebP)</p>
                </div>
              </label>
              <input
                id="screenshot-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const picked = e.target.files ? Array.from(e.target.files) : [];
                  if (picked.length === 0) return;
                  setFiles((prev) => {
                    const combined = [...prev];
                    for (const f of picked) {
                      if (!combined.some(cf => cf.name === f.name && cf.size === f.size)) combined.push(f);
                    }
                    return combined;
                  });
                  (e.target as HTMLInputElement).value = "";
                }}
                className="hidden"
              />
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-border/50 bg-background/50">
                        <img src={url} className="object-cover w-full h-full" alt={`screenshot-${idx}`} />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newFiles = files.slice(); 
                          newFiles.splice(idx,1); 
                          setFiles(newFiles);
                        }} 
                        className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isUploading || Object.keys(errors).length > 0}>{isUploading ? 'Saving...' : 'Add Entry'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Custom Setup Modal */}
      <Dialog open={addSetupOpen} onOpenChange={setAddSetupOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-accent">Add New Setup</DialogTitle>
            <DialogDescription>Create a new trading setup with its description</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="setup-name" className="text-xs font-semibold text-foreground">Setup Name <span className="text-rose-400">*</span></Label>
              <Input
                id="setup-name"
                placeholder="e.g., Breakout, Pullback, Mean Reversion..."
                value={newSetupInput}
                onChange={(e) => setNewSetupInput(e.target.value)}
                className="h-10 bg-background/50 border-border/50 text-foreground focus:ring-accent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSetup();
                  }
                }}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="setup-desc" className="text-xs font-semibold text-foreground">What it does</Label>
              <Textarea
                id="setup-desc"
                placeholder="Describe how this setup works and when you use it..."
                value={newSetupDescription}
                onChange={(e) => setNewSetupDescription(e.target.value)}
                className="min-h-[100px] bg-background/50 border-border/50 text-foreground focus:ring-accent resize-none"
              />
              <p className="text-xs text-muted-foreground">Optional: helps you remember what makes this setup unique</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setAddSetupOpen(false);
                setNewSetupInput('');
                setNewSetupDescription('');
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              className="bg-accent hover:bg-accent/90"
              onClick={handleAddSetup}
            >
              Save Setup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default AddJournalDialog;