export type Severity = 'high' | 'medium' | 'low';
export type Confidence = 'high' | 'medium' | 'low';
export type Category = 'secret' | 'pii';

export interface Finding {
  ruleId: string;
  label: string;
  severity: Severity;
  confidence: Confidence;
  start: number;
  end: number;
  preview: string; // masked, never the full secret
  line: number;    // 1-indexed
  column: number;  // 1-indexed
}

export interface RuleContext {
  options: ScanOptions;
  line: string;
  lineNumber: number;
}

export interface RuleMatch {
  start: number;
  end: number;
  value: string;
}

export interface Rule {
  id: string;
  label: string;
  description: string;
  category: Category;
  severity: Severity;
  confidence: Confidence;
  regex: RegExp;
  /**
   * Optional custom extractor or validator.
   * If returns false or null, match is rejected.
   * If returns RuleMatch, custom start/end/value are used.
   */
  validator?: (
    match: RegExpExecArray,
    text: string,
    context: RuleContext
  ) => boolean | RuleMatch;
  docsUrl?: string;
  isExperimental?: boolean;
  placeholderPrefix?: string;
}

export interface ScanOptions {
  include?: string[];
  exclude?: string[];
  pii?: boolean; // default true
  entropy?: boolean; // default true
  customRules?: Rule[];
  allowlist?: string[];
}

export interface RedactResult {
  text: string;
  findings: Finding[];
}
