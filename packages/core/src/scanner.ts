import { Finding, Rule, RuleContext, RuleMatch, ScanOptions } from './types.js';
import { standardRules } from './rules/index.js';
import { maskSecret } from './placeholders.js';

interface LineInfo {
  lineNumber: number; // 1-indexed
  startOffset: number;
  endOffset: number;
  text: string;
  hasIgnore: boolean;
}

function computeLines(text: string): LineInfo[] {
  const lines: LineInfo[] = [];
  let currentStart = 0;

  // Split by newline while keeping track of indices
  const parts = text.split('\n');
  for (let i = 0; i < parts.length; i++) {
    const lineText = parts[i];
    const endOffset = currentStart + lineText.length;
    lines.push({
      lineNumber: i + 1,
      startOffset: currentStart,
      endOffset,
      text: lineText,
      hasIgnore: lineText.includes('scan:ignore'),
    });
    // Account for the \n character
    currentStart = endOffset + 1;
  }

  return lines;
}

function findLine(lines: LineInfo[], offset: number): LineInfo {
  let low = 0;
  let high = lines.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const line = lines[mid];
    if (offset < line.startOffset) {
      high = mid - 1;
    } else if (offset > line.endOffset) {
      // Could be the newline char itself
      if (mid < lines.length - 1 && offset < lines[mid + 1].startOffset) {
        return line;
      }
      low = mid + 1;
    } else {
      return line;
    }
  }

  return lines[lines.length - 1] || {
    lineNumber: 1,
    startOffset: 0,
    endOffset: 0,
    text: '',
    hasIgnore: false,
  };
}

interface InternalCandidate {
  finding: Finding;
  value: string;
  score: number;
}

const SEVERITY_SCORE = { high: 30, medium: 20, low: 10 };
const CONFIDENCE_SCORE = { high: 3, medium: 2, low: 1 };

export function scan(text: string, options: ScanOptions = {}): Finding[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lines = computeLines(text);

  // Active rules
  const allRules: Rule[] = [
    ...standardRules,
    ...(options.customRules || []),
  ];

  const activeRules = allRules.filter((rule) => {
    if (options.pii === false && rule.category === 'pii') {
      return false;
    }
    if (options.include && options.include.length > 0) {
      if (!options.include.includes(rule.id)) return false;
    }
    if (options.exclude && options.exclude.length > 0) {
      if (options.exclude.includes(rule.id)) return false;
    }
    return true;
  });

  const candidates: InternalCandidate[] = [];

  for (const rule of activeRules) {
    // Reset regex state
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      const lineInfo = findLine(lines, matchIndex);

      // Inline ignore: skip lines containing scan:ignore
      if (lineInfo.hasIgnore) {
        if (!regex.global) break;
        continue;
      }

      const context: RuleContext = {
        options,
        line: lineInfo.text,
        lineNumber: lineInfo.lineNumber,
      };

      let start = matchIndex;
      let end = matchIndex + match[0].length;
      let value = match[0];

      if (rule.validator) {
        const validationResult = rule.validator(match, text, context);
        if (!validationResult) {
          if (!regex.global) break;
          continue;
        }
        if (typeof validationResult === 'object' && 'start' in validationResult) {
          const m = validationResult as RuleMatch;
          start = m.start;
          end = m.end;
          value = m.value;
        }
      }

      // Check allowlist
      if (options.allowlist && options.allowlist.length > 0) {
        const isAllowed = options.allowlist.some(
          (allowed) => allowed === value || allowed === match![0]
        );
        if (isAllowed) {
          if (!regex.global) break;
          continue;
        }
      }

      const valLine = findLine(lines, start);
      if (valLine.hasIgnore) {
        if (!regex.global) break;
        continue;
      }

      const column = start - valLine.startOffset + 1;
      const preview = maskSecret(value);

      // Rule scoring to disambiguate overlaps
      let score = (SEVERITY_SCORE[rule.severity] || 0) + (CONFIDENCE_SCORE[rule.confidence] || 0);
      if (rule.id !== 'generic-secret-key-value') {
        score += 10; // Provider-specific rules take priority over generic keyword match
      }

      candidates.push({
        finding: {
          ruleId: rule.id,
          label: rule.label,
          severity: rule.severity,
          confidence: rule.confidence,
          start,
          end,
          preview,
          line: valLine.lineNumber,
          column,
        },
        value,
        score,
      });

      if (!regex.global) break;
    }
  }

  if (candidates.length === 0) {
    return [];
  }

  // Resolve overlaps by sorting by score descending, then picking non-overlapping or resolving
  // First sort candidates by start position ascending, then score descending
  candidates.sort((a, b) => {
    if (a.finding.start !== b.finding.start) {
      return a.finding.start - b.finding.start;
    }
    return b.score - a.score;
  });

  const selected: InternalCandidate[] = [];

  for (const cand of candidates) {
    const cStart = cand.finding.start;
    const cEnd = cand.finding.end;

    // Check overlap with already selected
    let overlaps = false;
    let overlapIdx = -1;

    for (let i = 0; i < selected.length; i++) {
      const s = selected[i];
      const sStart = s.finding.start;
      const sEnd = s.finding.end;

      // Overlap condition: not completely before and not completely after
      if (!(cEnd <= sStart || cStart >= sEnd)) {
        overlaps = true;
        overlapIdx = i;
        break;
      }
    }

    if (!overlaps) {
      selected.push(cand);
    } else {
      // Compare score with the overlapping candidate
      const existing = selected[overlapIdx];
      if (cand.score > existing.score) {
        selected[overlapIdx] = cand;
      }
    }
  }

  // Re-sort selected findings by start offset ascending
  selected.sort((a, b) => a.finding.start - b.finding.start);

  return selected.map((c) => c.finding);
}
