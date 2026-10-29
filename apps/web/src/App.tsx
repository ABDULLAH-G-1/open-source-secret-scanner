import React, { useState, useMemo, useEffect } from 'react';
import { scan, redact, Finding } from 'cloakkit';
import { generateSampleText } from './sample';
import {
  ShieldCheck,
  Copy,
  Check,
  Moon,
  Sun,
  Github,
  Trash2,
  FileText,
  Lock,
  Eye,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [text, setText] = useState('');
  const [piiEnabled, setPiiEnabled] = useState(true);
  const [entropyEnabled, setEntropyEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'redacted' | 'findings'>('preview');
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cloakkit_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Sync dark class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('cloakkit_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('cloakkit_theme', 'light');
    }
  }, [isDark]);

  // Run live scan & redact locally (Your text never leaves your browser. The page makes no network requests after it loads.)
  const scanOptions = useMemo(
    () => ({
      pii: piiEnabled,
      entropy: entropyEnabled,
    }),
    [piiEnabled, entropyEnabled]
  );

  const findings: Finding[] = useMemo(() => {
    return scan(text, scanOptions);
  }, [text, scanOptions]);

  const redactResult = useMemo(() => {
    return redact(text, scanOptions);
  }, [text, scanOptions]);

  const stats = useMemo(() => {
    const high = findings.filter((f) => f.severity === 'high').length;
    const medium = findings.filter((f) => f.severity === 'medium').length;
    const low = findings.filter((f) => f.severity === 'low').length;
    return { high, medium, low, total: findings.length };
  }, [findings]);

  const handleCopyRedacted = async () => {
    if (!redactResult.text) return;
    try {
      await navigator.clipboard.writeText(redactResult.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleLoadSample = () => {
    setText(generateSampleText());
  };

  const handleClear = () => {
    setText('');
  };

  // Render highlighted text chunks
  const renderedHighlightedText = useMemo(() => {
    if (!text) return null;
    if (findings.length === 0) {
      return <span>{text}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    findings.forEach((finding, idx) => {
      // Preceding normal text
      if (finding.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{text.slice(lastIndex, finding.start)}</span>
        );
      }

      // Secret highlight
      const secretChunk = text.slice(finding.start, finding.end);
      const sevClass =
        finding.severity === 'high'
          ? 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-500/40 ring-rose-500/30'
          : finding.severity === 'medium'
          ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 ring-amber-500/30'
          : 'bg-sky-500/20 text-sky-800 dark:text-sky-200 border-sky-500/40 ring-sky-500/30';

      elements.push(
        <mark
          key={`highlight-${idx}`}
          title={`${finding.label} (${finding.severity.toUpperCase()} severity) at line ${finding.line}, col ${finding.column}`}
          className={`relative inline-block px-1 py-0.5 rounded font-mono text-xs border ring-1 transition-all group cursor-pointer ${sevClass}`}
        >
          {secretChunk}
          <span className="sr-only">({finding.label})</span>
        </mark>
      );

      lastIndex = finding.end;
    });

    if (lastIndex < text.length) {
      elements.push(<span key={`text-end`}>{text.slice(lastIndex)}</span>);
    }

    return elements;
  }, [text, findings]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                  CloakKit
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-300 dark:border-emerald-800">
                  Zero-Dependency
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Local-only secret and PII redactor for AI prompts & code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Network Security badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
              title="Your text never leaves your browser. The page makes no network requests after it loads."
            >
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="hidden lg:inline">Your text never leaves your browser. The page makes no network requests after it loads.</span>
              <span className="lg:hidden">100% Client-Side</span>
            </div>

            {/* Dark / Light toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* GitHub link */}
            <a
              href="https://github.com/ABDULLAH-G-1/open-source-secret-scanner"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Repository"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Load Sample (Fake)
            </button>

            {text && (
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Toggles */}
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={piiEnabled}
                onChange={(e) => setPiiEnabled(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>PII Detection</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={entropyEnabled}
                onChange={(e) => setEntropyEnabled(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Entropy Filtering</span>
            </label>
          </div>

          {/* Finding summary badges */}
          <div className="flex items-center gap-2 text-xs">
            {stats.total === 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> All Clean
              </span>
            ) : (
              <>
                {stats.high > 0 && (
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                    {stats.high} High
                  </span>
                )}
                {stats.medium > 0 && (
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-900">
                    {stats.medium} Med
                  </span>
                )}
                {stats.low > 0 && (
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-900">
                    {stats.low} Low
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dual Editor / Inspection Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Input Panel */}
          <div className="flex flex-col h-[560px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Input Text (.env, Prompt, Log, CLAUDE.md)
              </span>
              <span className="text-xs text-slate-400">
                {text.length} chars • {text ? text.split('\n').length : 0} lines
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste prompt, .env variables, bearer tokens, or logs here..."
              className="flex-1 w-full p-4 font-mono text-xs sm:text-sm bg-transparent resize-none border-0 focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 leading-relaxed overflow-auto"
              spellCheck={false}
            />
          </div>

          {/* Results Panel */}
          <div className="flex flex-col h-[560px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Tabs Header */}
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Highlights
                </button>
                <button
                  onClick={() => setActiveTab('redacted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'redacted'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Redacted Output
                </button>
                <button
                  onClick={() => setActiveTab('findings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'findings'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Findings ({findings.length})
                </button>
              </div>

              {/* Action Button for Copying */}
              <button
                onClick={handleCopyRedacted}
                disabled={!text}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                }`}
                title="Copy consistent redacted text to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Redacted Text'}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs sm:text-sm leading-relaxed">
              {activeTab === 'preview' && (
                <div className="whitespace-pre-wrap break-all text-slate-800 dark:text-slate-200">
                  {text ? (
                    renderedHighlightedText
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 font-sans italic">
                      Paste text on the left or click &quot;Load Sample&quot; to inspect live highlights.
                    </span>
                  )}
                </div>
              )}

              {activeTab === 'redacted' && (
                <div className="whitespace-pre-wrap break-all text-slate-800 dark:text-slate-200">
                  {text ? (
                    redactResult.text
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 font-sans italic">
                      Redacted text will appear here with numbered, consistent placeholders like [OPENAI_KEY_1].
                    </span>
                  )}
                </div>
              )}

              {activeTab === 'findings' && (
                <div className="space-y-3 font-sans">
                  {findings.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500/50 mb-2" />
                      <p className="text-sm font-medium">No secrets or PII detected.</p>
                      <p className="text-xs mt-1">Text appears clean according to active rules.</p>
                    </div>
                  ) : (
                    findings.map((f, i) => {
                      const badgeColor =
                        f.severity === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-900'
                          : f.severity === 'medium'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-900'
                          : 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-900';

                      return (
                        <div
                          key={`finding-card-${i}`}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}
                              >
                                {f.severity}
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                                {f.label}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {f.confidence} confidence
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span>
                                Line {f.line}, Col {f.column}
                              </span>
                              <span>•</span>
                              <span className="font-mono bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                Preview: {f.preview}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400 font-mono self-start sm:self-auto">
                            rule: {f.ruleId}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verifiable Security & Privacy Notice */}
        <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-950/10 via-teal-950/10 to-transparent dark:from-emerald-950/30 dark:via-teal-950/20 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Your text never leaves your browser. The page makes no network requests after it loads.</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                connect-src &apos;none&apos;
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              CloakKit executes completely inside your browser via pure JavaScript.
              The Content Security Policy prevents this page from initiating any outbound HTTP,
              WebSocket, or fetch requests. Your text never leaves your browser. The page makes no network requests after it loads.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ABDULLAH-G-1/open-source-secret-scanner"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://github.com/ABDULLAH-G-1/open-source-secret-scanner/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              MIT License
            </a>
          </div>

          <p className="text-center sm:text-right font-medium">
            Best effort, not a guarantee. Review text before you send it.
          </p>
        </div>
      </footer>
    </div>
  );
}
