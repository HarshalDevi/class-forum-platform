// improve-server/index.js
// Grammar/rewrite API with NO TIMEOUTS.
// Engines: Ollama (chat → generate → openai-compatible) → LanguageTool + polish (fallback)
// Returns ONLY corrected output (text in→text out, HTML in→HTML out).

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---------- Config ----------
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b'; // use llama3.2:3b if you want faster

// ---------- Utils ----------
const hasHtmlTag = (s = '') => /<[^>]+>/.test(s);

function stripCodeFences(s = '') {
  return s
    .replace(/```(?:html)?([\s\S]*?)```/gi, '$1')
    .replace(/```([\s\S]*?)```/g, '$1')
    .trim();
}

function extractHtmlOnly(s = '') {
  if (!s) return '';
  s = stripCodeFences(s);
  const firstTag = s.indexOf('<');
  if (firstTag > 0) s = s.slice(firstTag);
  const lastGt = s.lastIndexOf('>');
  if (lastGt > 0) s = s.slice(0, lastGt + 1);
  return s.trim();
}

function extractTextOnly(s = '') {
  if (!s) return '';
  s = stripCodeFences(s);
  s = s.replace(/^\s*(here('?s)?|this is|corrected)[:\-\s]*/i, '');
  s = s.replace(/^["“”]+|["“”]+$/g, '');
  return s.replace(/\s+/g, ' ').trim();
}

function htmlToText(html = '') {
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function textToHtml(text = '') {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br/>').trim()}</p>`)
    .join('');
  return paras || '<p></p>';
}

function applyLTReplacements(original = '', matches = []) {
  const sorted = [...matches].sort((a, b) => b.offset - a.offset);
  let out = original;
  for (const m of sorted) {
    const rep = m?.replacements?.[0]?.value;
    if (rep === undefined) continue;
    out = out.slice(0, m.offset) + rep + out.slice(m.offset + m.length);
  }
  return out;
}

// Light polish so LT/LLM output reads better
function polishText(s = '') {
  s = s.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();

  const fixes = [
    [/\blookalike\b/gi, 'looks like'],
    [/\blookslike\b/gi, 'looks like'],
    [/\bdoing good\b/gi, 'doing well'],
    [/\bok\b/gi, 'OK'],
    [/\bpls\b|\bplz\b/gi, 'please'],
    [/\bthx\b/gi, 'thanks'],
    [/\biam\b/gi, "I'm"],
    [/\bdont\b/gi, "don't"],
    [/\bdoesnt\b/gi, "doesn't"],
    [/\bcant\b/gi, "can't"],
    [/\binterstingb?\b/gi, 'interesting'],
    [/\bthigs\b/gi, 'things'],
    [/\bi hope you are doing good\b/gi, 'I hope you are doing well'],
    [/\ba\s+(ok)\b/gi, 'an $1'],
    [/\bbought\s+some\s+apple\b/gi, 'bought some apples'],
    [/\bit not was\b/gi, "it wasn't"],

    // --- NEW: awkward quantifier fixes ---
    [/\bmultiple numbers of\b/gi, 'many'],
    [/\bmultiple number of\b/gi, 'many'],
    [/\bnumbers of ([a-z]+?)s\b/gi, 'many $1s'],
  ];
  for (const [re, rep] of fixes) s = s.replace(re, rep);

  // Some subject/tense nudges for common mistakes
  s = s.replace(/\b([A-Za-z]+)\s+and I was\b/gi, '$1 and I were');

  // Sentence casing & punctuation
  let tokens = s
    .split(/([.?!])\s*/)
    .reduce((acc, cur, i, arr) => {
      if (i % 2 === 0) acc.push((cur + (arr[i + 1] || '')).trim());
      return acc;
    }, [])
    .filter(Boolean);

  if (!tokens.length) tokens = [s];

  tokens = tokens.map((t) => {
    let x = t.trim();
    if (!/[.?!]$/.test(x)) {
      if (/^(can|could|would|will|do|does|did|is|are|am|have|has|may|might|should|shall)\b/i.test(x)) x += '?';
      else x += '.';
    }
    x = x.charAt(0).toUpperCase() + x.slice(1);
    x = x.replace(/\s+([,.;!?])/g, '$1');
    return x;
  });

  return tokens.join(' ');
}


// ---------- Engines ----------
async function ollamaRewrite(input, wantHtml) {
  const prompt = wantHtml
    ? `Correct the grammar and phrasing of the following HTML.
Return ONLY the corrected HTML. No explanations, no markdown fences, no extra text.

HTML:
${input}`
    : `Correct the grammar and phrasing of the following text.
Return ONLY the corrected text. No explanations, no markdown fences, no quotes.

TEXT:
${input}`;

  // 1) Preferred: native /api/chat
  let r = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      options: { temperature: 0.2 },
      messages: [
        { role: 'system', content: wantHtml ? 'Return only corrected HTML.' : 'Return only corrected text.' },
        { role: 'user', content: prompt }
      ],
      stream: false
    })
  });

  // 2) If not available, use /api/generate (widely supported)
  if (!r.ok && r.status === 404) {
    r = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.2 }
      })
    });
  }

  // 3) If still not OK, try OpenAI-compatible /v1/chat/completions
  if (!r.ok && r.status === 404) {
    r = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: wantHtml ? 'Return only corrected HTML.' : 'Return only corrected text.' },
          { role: 'user', content: prompt }
        ]
      })
    });
  }

  if (!r.ok) throw new Error(`Ollama HTTP ${r.status}`);

  const out = await r.json();
  const raw =
    out?.message?.content?.trim() ||   // /api/chat
    out?.response?.trim() ||           // /api/generate
    out?.choices?.[0]?.message?.content?.trim() || // /v1/chat/completions
    '';

  return hasHtmlTag(input) ? extractHtmlOnly(raw) : extractTextOnly(raw);
}

async function languageToolRewrite(input, wantHtml) {
  const text = wantHtml ? htmlToText(input) : input;

  const params = new URLSearchParams({
    text,
    language: 'en-US',
    level: 'picky',
    enabledOnly: 'false'
  });

  const resp = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!resp.ok) throw new Error(`LanguageTool ${resp.status}`);
  const data = await resp.json();
  const fixed = applyLTReplacements(text, data.matches);
  const polished = polishText(fixed);

  return wantHtml ? extractHtmlOnly(textToHtml(polished)) : extractTextOnly(polished);
}

// ---------- Routes ----------
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/improve', async (req, res) => {
  try {
    const { contentHtml } = req.body || {};
    if (!contentHtml) return res.status(400).json({ error: 'Missing contentHtml' });

    const wantHtml = hasHtmlTag(contentHtml);

    // 1) Ollama (no timeout)
    try {
      const result = await ollamaRewrite(contentHtml, wantHtml);
      if (result) return res.json({ suggestion: result });
    } catch (e) {
      console.warn('Ollama path failed:', e.message);
    }

    // 2) Fallback: LanguageTool + polish
    const lt = await languageToolRewrite(contentHtml, wantHtml);
    return res.json({ suggestion: lt });
  } catch (e) {
    console.error('Improve API error:', e?.message || e);
    return res.status(500).json({ error: 'Internal error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Improve server listening on http://localhost:${PORT}`));
