import { useState } from 'react';
import { X, Settings as SettingsIcon, Monitor, Sliders, AlertTriangle, ArrowDownUp, RotateCcw, Key, Plus, Trash2 } from 'lucide-react';
import { loadCustomModels, saveCustomModelsToStorage, type CustomModel } from '../lib/projects';

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  language: 'auto' | 'english' | 'tamil' | 'hindi';
  systemPrompt: string;
  fontSize: 'sm' | 'base' | 'lg';
  temperature: number;
  topP: number;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'auto',
  systemPrompt: '',
  fontSize: 'base',
  temperature: 0.8,
  topP: 0.95,
  maxTokens: 0,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

type Tab = 'general' | 'display' | 'sampling' | 'penalties' | 'import-export' | 'custom-models';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <SettingsIcon size={15} /> },
  { id: 'display', label: 'Display', icon: <Monitor size={15} /> },
  { id: 'sampling', label: 'Sampling', icon: <Sliders size={15} /> },
  { id: 'penalties', label: 'Penalties', icon: <AlertTriangle size={15} /> },
  { id: 'import-export', label: 'Import/Export', icon: <ArrowDownUp size={15} /> },
  { id: 'custom-models', label: 'Custom Models', icon: <Key size={15} /> },
];

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}

function SliderRow({ label, value, min, max, step, onChange, hint }: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 px-2 py-1 text-xs rounded-lg border border-border bg-surface-3 text-text-primary text-right focus:outline-none focus:border-accent/50"
        />
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
      />
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

function CustomModelsTab() {
  const [models, setModels] = useState<CustomModel[]>(() => loadCustomModels());
  const [form, setForm] = useState({ name: '', model: '', baseUrl: 'https://openrouter.ai/api/v1', apiKey: '' });

  const save = () => {
    if (!form.name || !form.model) return;
    const updated = [...models, { ...form, id: Date.now().toString() }];
    setModels(updated);
    saveCustomModelsToStorage(updated);
    setForm({ name: '', model: '', baseUrl: 'https://openrouter.ai/api/v1', apiKey: '' });
  };

  const remove = (id: string) => {
    const updated = models.filter(m => m.id !== id);
    setModels(updated);
    saveCustomModelsToStorage(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-primary">Add Custom Model</p>
        <input
          placeholder="Display Name (e.g. GPT-4o)"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-3 text-sm text-text-primary focus:outline-none focus:border-accent/50"
        />
        <input
          placeholder="Model ID (e.g. openai/gpt-4o)"
          value={form.model}
          onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-3 text-sm text-text-primary focus:outline-none focus:border-accent/50"
        />
        <input
          placeholder="Base URL"
          value={form.baseUrl}
          onChange={e => setForm(p => ({ ...p, baseUrl: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-3 text-sm text-text-primary focus:outline-none focus:border-accent/50"
        />
        <input
          type="password"
          placeholder="API Key (optional)"
          value={form.apiKey}
          onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-border bg-surface-3 text-sm text-text-primary focus:outline-none focus:border-accent/50"
        />
        <button
          onClick={save}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm hover:bg-accent-hover transition-colors"
        >
          <Plus size={13} /> Add Model
        </button>
      </div>
      {models.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted font-medium">Saved Models</p>
          {models.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-2">
              <div>
                <p className="text-sm font-medium text-text-primary">{m.name}</p>
                <p className="text-xs text-text-muted">{m.model}</p>
              </div>
              <button
                onClick={() => remove(m.id)}
                className="text-text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SettingsProps {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
  onExport: () => void;
  onClearHistory: () => void;
}

export function Settings({ settings, onSave, onClose, onExport, onClearHistory }: SettingsProps) {
  const [draft, setDraft] = useState<AppSettings>({ ...settings });
  const [tab, setTab] = useState<Tab>('general');

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <SettingsIcon size={16} className="text-accent" />
            <span className="font-semibold text-text-primary">Settings</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-3 text-text-muted hover:text-text-primary transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex h-[440px]">
          {/* Sidebar */}
          <div className="w-44 border-r border-border p-2 space-y-0.5 flex-shrink-0">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                  tab === t.id
                    ? 'bg-surface-3 text-text-primary font-medium'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {tab === 'general' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Theme</label>
                  <select
                    value={draft.theme}
                    onChange={e => update('theme', e.target.value as AppSettings['theme'])}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-3 text-sm text-text-primary focus:outline-none focus:border-accent/50"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                  <p className="text-xs text-text-muted">Choose between System, Light, or Dark.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Response Language</label>
                  <select
                    value={draft.language}
                    onChange={e => update('language', e.target.value as AppSettings['language'])}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-3 text-sm text-text-primary focus:outline-none focus:border-accent/50"
                  >
                    <option value="auto">Auto (model decides)</option>
                    <option value="english">English</option>
                    <option value="tamil">Tamil — தமிழ்</option>
                    <option value="hindi">Hindi — हिन्दी</option>
                  </select>
                  <p className="text-xs text-text-muted">Prepends a language instruction to every API call.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">System Prompt</label>
                  <textarea
                    value={draft.systemPrompt}
                    onChange={e => update('systemPrompt', e.target.value)}
                    placeholder="You are a helpful assistant..."
                    rows={5}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none"
                  />
                  <p className="text-xs text-text-muted">Added as the first system message in every conversation.</p>
                </div>
              </>
            )}

            {tab === 'display' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Font Size</label>
                  <div className="flex gap-2">
                    {(['sm', 'base', 'lg'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => update('fontSize', s)}
                        className={`flex-1 py-2 rounded-xl border text-sm transition-colors ${
                          draft.fontSize === s
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-surface-2 text-text-secondary hover:bg-surface-3'
                        }`}
                      >
                        {s === 'sm' ? 'Small' : s === 'base' ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === 'sampling' && (
              <>
                <SliderRow label="Temperature" value={draft.temperature} min={0} max={2} step={0.05}
                  onChange={v => update('temperature', v)}
                  hint="Controls randomness. Lower = more focused, higher = more creative." />
                <SliderRow label="Top P" value={draft.topP} min={0} max={1} step={0.01}
                  onChange={v => update('topP', v)}
                  hint="Nucleus sampling threshold. 0.95 is usually a good default." />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-text-primary">Max Tokens</label>
                    <input
                      type="number"
                      value={draft.maxTokens}
                      min={0}
                      onChange={e => update('maxTokens', parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 text-xs rounded-lg border border-border bg-surface-3 text-text-primary text-right focus:outline-none focus:border-accent/50"
                    />
                  </div>
                  <p className="text-xs text-text-muted">Maximum tokens in the response. Set to 0 for unlimited.</p>
                </div>
              </>
            )}

            {tab === 'penalties' && (
              <>
                <SliderRow label="Presence Penalty" value={draft.presencePenalty} min={-2} max={2} step={0.05}
                  onChange={v => update('presencePenalty', v)}
                  hint="Positive values penalize tokens that have appeared, encouraging new topics." />
                <SliderRow label="Frequency Penalty" value={draft.frequencyPenalty} min={-2} max={2} step={0.05}
                  onChange={v => update('frequencyPenalty', v)}
                  hint="Positive values penalize repeated tokens based on their frequency." />
              </>
            )}

            {tab === 'import-export' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-border bg-surface-2 space-y-3">
                  <p className="text-sm font-medium text-text-primary">Export conversations</p>
                  <p className="text-xs text-text-muted">Download all your conversations as a JSON file.</p>
                  <button onClick={onExport} className="px-4 py-2 rounded-xl bg-accent text-white text-sm hover:bg-accent-hover transition-colors">
                    Export JSON
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
                  <p className="text-sm font-medium text-red-400">Danger zone</p>
                  <p className="text-xs text-text-muted">Permanently delete all conversations. This cannot be undone.</p>
                  <button onClick={onClearHistory} className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
                    Clear all history
                  </button>
                </div>
              </div>
            )}

            {tab === 'custom-models' && (
              <CustomModelsTab />
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <button
            onClick={() => setDraft({ ...DEFAULT_SETTINGS })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors"
          >
            <RotateCcw size={13} />
            Reset to default
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-2 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { onSave(draft); onClose(); }}
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm hover:bg-accent-hover transition-colors"
            >
              Save settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
