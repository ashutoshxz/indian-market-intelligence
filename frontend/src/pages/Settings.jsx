import { useState } from "react";
import {
  Settings,
  Bell,
  Palette,
  Shield,
  Database,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  MessageSquare,
  Save,
  RefreshCw,
  User,
  Key,
  Globe,
  Clock,
} from "lucide-react";
import { SectionCard, Badge } from "@components/common/Card";
import clsx from "clsx";
import toast from "react-hot-toast";

// ================================
// Indian Market Intelligence Platform
// frontend/src/pages/Settings.jsx
// ================================

// ---- Section categories ----
const SECTIONS = [
  { key: "profile",       label: "Profile",        icon: User     },
  { key: "notifications", label: "Notifications",   icon: Bell     },
  { key: "appearance",    label: "Appearance",      icon: Palette  },
  { key: "data",          label: "Data & Privacy",  icon: Shield   },
  { key: "api",           label: "API Access",      icon: Key      },
];

// ---- Toggle switch ----
function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
      <div className="min-w-0 mr-4">
        <p className="text-sm text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={clsx(
          "relative w-9 h-5 rounded-full transition-colors shrink-0",
          enabled ? "bg-cyan-500" : "bg-slate-700"
        )}
      >
        <span className={clsx(
          "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
          enabled ? "translate-x-4" : "translate-x-0.5"
        )} />
      </button>
    </div>
  );
}

// ---- Select option ----
function SelectRow({ label, description, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
      <div className="min-w-0 mr-4">
        <p className="text-sm text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 transition-colors shrink-0"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ---- Input row ----
function InputRow({ label, description, value, onChange, type = "text", placeholder }) {
  return (
    <div className="py-3 border-b border-slate-800/50 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
      />
    </div>
  );
}

// ---- Theme picker ----
function ThemePicker({ value, onChange }) {
  const themes = [
    { key: "dark",   label: "Dark",    icon: Moon    },
    { key: "light",  label: "Light",   icon: Sun     },
    { key: "system", label: "System",  icon: Monitor },
  ];

  return (
    <div className="flex gap-2 py-3 border-b border-slate-800/50">
      {themes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={clsx(
            "flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border text-xs font-medium transition-all",
            value === key
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
              : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
          )}
        >
          <Icon size={16} />
          {label}
          {value === key && <Check size={10} className="text-cyan-400" />}
        </button>
      ))}
    </div>
  );
}

// ---- Nav item ----
function NavItem({ section, active, onClick }) {
  const Icon = section.icon;
  return (
    <button
      onClick={() => onClick(section.key)}
      className={clsx(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
        active
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={14} />
        <span className="font-medium">{section.label}</span>
      </div>
      <ChevronRight size={12} className={clsx("transition-transform", active && "rotate-90")} />
    </button>
  );
}

// ---- Main Page ----
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  // ---- Profile state ----
  const [profile, setProfile] = useState({
    name:     "",
    email:    "",
    timezone: "Asia/Kolkata",
  });

  // ---- Notification state ----
  const [notifications, setNotifications] = useState({
    priceAlerts:    true,
    volumeAlerts:   true,
    eventAlerts:    true,
    policyUpdates:  true,
    earningsAlerts: false,
    emailDigest:    false,
    pushEnabled:    true,
    digestFrequency:"daily",
  });

  // ---- Appearance state ----
  const [appearance, setAppearance] = useState({
    theme:         "dark",
    compactMode:   false,
    showAnimations:true,
    chartType:     "candle",
    defaultInterval:"5m",
  });

  // ---- Data state ----
  const [data, setData] = useState({
    dataSaver:       false,
    analyticsOptOut: false,
    cacheEnabled:    true,
    autoRefresh:     true,
    refreshInterval: "15",
  });

  // ---- API state ----
  const [api, setApiState] = useState({
    key: "imip_sk_••••••••••••••••",
    webhookUrl: "",
    rateLimitEnabled: true,
  });

  const setN  = (k, v) => setNotifications((s) => ({ ...s, [k]: v }));
  const setA  = (k, v) => setAppearance((s)    => ({ ...s, [k]: v }));
  const setD  = (k, v) => setData((s)          => ({ ...s, [k]: v }));
  const setAp = (k, v) => setApiState((s)      => ({ ...s, [k]: v }));
  const setP  = (k, v) => setProfile((s)       => ({ ...s, [k]: v }));

  const handleSave = () => {
    // TODO: persist to backend
    setSaved(true);
    toast.success("Settings saved");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">

      {/* ---- Page header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your preferences & account</p>
        </div>
        <button
          onClick={handleSave}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            saved
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
          )}
        >
          {saved ? <Check size={13} /> : <Save size={13} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* ---- Sidebar nav ---- */}
        <div className="lg:col-span-1">
          <SectionCard padding="sm">
            <nav className="space-y-0.5">
              {SECTIONS.map((section) => (
                <NavItem
                  key={section.key}
                  section={section}
                  active={activeSection === section.key}
                  onClick={setActiveSection}
                />
              ))}
            </nav>
          </SectionCard>
        </div>

        {/* ---- Settings panel ---- */}
        <div className="lg:col-span-3 space-y-4">

          {/* Profile */}
          {activeSection === "profile" && (
            <SectionCard title="Profile" subtitle="Your account details">
              <InputRow
                label="Display Name"
                placeholder="Your name"
                value={profile.name}
                onChange={(v) => setP("name", v)}
              />
              <InputRow
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={profile.email}
                onChange={(v) => setP("email", v)}
              />
              <SelectRow
                label="Timezone"
                description="Used for market hours display"
                value={profile.timezone}
                onChange={(v) => setP("timezone", v)}
                options={[
                  { value: "Asia/Kolkata",   label: "IST — India Standard Time" },
                  { value: "UTC",            label: "UTC" },
                  { value: "America/New_York",label: "EST — New York" },
                  { value: "Europe/London",  label: "GMT — London" },
                ]}
              />
              <div className="pt-3">
                <div className="flex items-center gap-2">
                  <Badge variant="info">Free Plan</Badge>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Upgrade to Pro →
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <>
              <SectionCard title="Alert Notifications" subtitle="Choose which alerts notify you">
                <Toggle label="Price Alerts"    description="Notify when price targets are hit"    enabled={notifications.priceAlerts}    onChange={(v) => setN("priceAlerts", v)}    />
                <Toggle label="Volume Alerts"   description="Notify on unusual volume spikes"      enabled={notifications.volumeAlerts}   onChange={(v) => setN("volumeAlerts", v)}   />
                <Toggle label="Event Alerts"    description="Corporate events & announcements"     enabled={notifications.eventAlerts}    onChange={(v) => setN("eventAlerts", v)}    />
                <Toggle label="Policy Updates"  description="RBI, SEBI & government circulars"    enabled={notifications.policyUpdates}  onChange={(v) => setN("policyUpdates", v)}  />
                <Toggle label="Earnings Alerts" description="Upcoming & released earnings results" enabled={notifications.earningsAlerts} onChange={(v) => setN("earningsAlerts", v)} />
              </SectionCard>

              <SectionCard title="Delivery Channels" subtitle="How you receive notifications">
                <Toggle label="Push Notifications" description="Browser or mobile push"  enabled={notifications.pushEnabled}  onChange={(v) => setN("pushEnabled", v)}  />
                <Toggle label="Email Digest"        description="Periodic summary emails" enabled={notifications.emailDigest}  onChange={(v) => setN("emailDigest", v)}  />
                {notifications.emailDigest && (
                  <SelectRow
                    label="Digest Frequency"
                    value={notifications.digestFrequency}
                    onChange={(v) => setN("digestFrequency", v)}
                    options={[
                      { value: "realtime", label: "Real-time"  },
                      { value: "hourly",   label: "Hourly"     },
                      { value: "daily",    label: "Daily"      },
                      { value: "weekly",   label: "Weekly"     },
                    ]}
                  />
                )}
              </SectionCard>
            </>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <>
              <SectionCard title="Theme" subtitle="Choose your display preference">
                <ThemePicker value={appearance.theme} onChange={(v) => setA("theme", v)} />
                <Toggle label="Compact Mode"     description="Denser UI with less padding"    enabled={appearance.compactMode}    onChange={(v) => setA("compactMode", v)}    />
                <Toggle label="Show Animations"  description="Enable transitions and motion"  enabled={appearance.showAnimations} onChange={(v) => setA("showAnimations", v)} />
              </SectionCard>

              <SectionCard title="Chart Preferences" subtitle="Default chart settings">
                <SelectRow
                  label="Default Chart Type"
                  value={appearance.chartType}
                  onChange={(v) => setA("chartType", v)}
                  options={[
                    { value: "candle", label: "Candlestick" },
                    { value: "line",   label: "Line"        },
                    { value: "bar",    label: "Bar"         },
                    { value: "area",   label: "Area"        },
                  ]}
                />
                <SelectRow
                  label="Default Interval"
                  value={appearance.defaultInterval}
                  onChange={(v) => setA("defaultInterval", v)}
                  options={[
                    { value: "1m",  label: "1 Minute"  },
                    { value: "5m",  label: "5 Minutes" },
                    { value: "15m", label: "15 Minutes"},
                    { value: "1h",  label: "1 Hour"    },
                    { value: "1d",  label: "1 Day"     },
                  ]}
                />
              </SectionCard>
            </>
          )}

          {/* Data & Privacy */}
          {activeSection === "data" && (
            <>
              <SectionCard title="Performance" subtitle="Data loading & refresh settings">
                <Toggle label="Auto Refresh"   description="Automatically refresh market data"   enabled={data.autoRefresh}   onChange={(v) => setD("autoRefresh", v)}   />
                {data.autoRefresh && (
                  <SelectRow
                    label="Refresh Interval"
                    value={data.refreshInterval}
                    onChange={(v) => setD("refreshInterval", v)}
                    options={[
                      { value: "5",  label: "5 seconds"  },
                      { value: "15", label: "15 seconds" },
                      { value: "30", label: "30 seconds" },
                      { value: "60", label: "1 minute"   },
                    ]}
                  />
                )}
                <Toggle label="Cache Data"     description="Store data locally for faster loads" enabled={data.cacheEnabled}   onChange={(v) => setD("cacheEnabled", v)}   />
                <Toggle label="Data Saver"     description="Reduce data usage on mobile"         enabled={data.dataSaver}      onChange={(v) => setD("dataSaver", v)}      />
              </SectionCard>

              <SectionCard title="Privacy" subtitle="Control your data usage">
                <Toggle
                  label="Opt Out of Analytics"
                  description="Stop anonymous usage data collection"
                  enabled={data.analyticsOptOut}
                  onChange={(v) => setD("analyticsOptOut", v)}
                />
                <div className="pt-3 flex flex-col gap-2">
                  <button className="text-xs text-red-400 hover:text-red-300 transition-colors text-left">
                    Delete all my data
                  </button>
                  <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors text-left">
                    Download my data
                  </button>
                </div>
              </SectionCard>
            </>
          )}

          {/* API Access */}
          {activeSection === "api" && (
            <SectionCard title="API Access" subtitle="Programmatic access to your data">
              <div className="py-3 border-b border-slate-800/50">
                <p className="text-sm text-slate-200 mb-2">API Key</p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={api.key}
                    readOnly
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono outline-none"
                  />
                  <button
                    onClick={() => toast.success("API key copied")}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-slate-100 hover:border-slate-600 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => toast("New key generated")}
                    className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Keep this key secret. Regenerating will invalidate the old key.</p>
              </div>

              <InputRow
                label="Webhook URL"
                placeholder="https://your-app.com/webhook"
                description="Receive real-time alert events"
                value={api.webhookUrl}
                onChange={(v) => setAp("webhookUrl", v)}
              />

              <Toggle
                label="Rate Limit Protection"
                description="Auto-throttle API calls to prevent abuse"
                enabled={api.rateLimitEnabled}
                onChange={(v) => setAp("rateLimitEnabled", v)}
              />

              <div className="pt-4">
                <a
                  href="/docs/api-spec.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  View API Documentation →
                </a>
              </div>
            </SectionCard>
          )}

        </div>
      </div>
    </div>
  );
}
