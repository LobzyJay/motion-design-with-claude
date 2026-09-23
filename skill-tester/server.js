import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.resolve(__dirname, '..', 'skills');

// Load .env if present (no dotenv dep — quick parser)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
const USE_API = process.env.USE_API === '1' && API_KEY;
const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const PORT = process.env.PORT || 3737;

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { name: '', description: '', body: content, raw: content };
  const fm = match[1];
  const body = match[2].trim();
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  return {
    name: nameMatch ? nameMatch[1].trim() : '',
    description: descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, '') : '',
    body,
    raw: content
  };
}

function readSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => {
      const skillPath = path.join(SKILLS_DIR, e.name, 'SKILL.md');
      if (!fs.existsSync(skillPath)) return null;
      const content = fs.readFileSync(skillPath, 'utf-8');
      const parsed = parseFrontmatter(content);
      return { id: e.name, ...parsed };
    })
    .filter(Boolean);
}

async function callAnthropic(body) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`Anthropic ${resp.status}: ${text}`);
  return JSON.parse(text);
}

// Run via `claude` CLI — uses user's Claude Code subscription, no API key needed
function callClaudeCLI({ system, userMsg, model }) {
  return new Promise((resolve, reject) => {
    const args = ['-p', '--output-format', 'json'];
    if (model) args.push('--model', model);
    if (system) args.push('--append-system-prompt', system);
    args.push(userMsg);

    const proc = spawn(CLAUDE_BIN, args, { env: { ...process.env } });
    let out = '', err = '';
    proc.stdout.on('data', d => out += d);
    proc.stderr.on('data', d => err += d);
    proc.on('error', reject);
    proc.on('close', code => {
      if (code !== 0) return reject(new Error(`claude CLI exit ${code}: ${(err || out).slice(0, 400)}`));
      try {
        const j = JSON.parse(out);
        if (j.is_error) return reject(new Error(`claude CLI error: ${j.result || j.subtype}`));
        resolve({ content: [{ type: 'text', text: j.result || '' }], stop_reason: j.stop_reason || 'end_turn' });
      } catch (e) {
        reject(new Error(`claude CLI parse error: ${e.message} — output: ${out.slice(0, 200)}`));
      }
    });
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Skills discovery
  if (url.pathname === '/api/skills' && req.method === 'GET') {
    try {
      json(res, 200, readSkills());
    } catch (e) {
      json(res, 500, { error: e.message });
    }
    return;
  }

  // Claude proxy — defaults to CLI (uses user's subscription), falls back to API if USE_API=1
  if (url.pathname === '/api/claude' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const { system, messages, model = 'claude-sonnet-4-6' } = JSON.parse(raw);
      let result;
      if (USE_API) {
        const payload = { model, max_tokens: 2048, messages };
        if (system) payload.system = system;
        result = await callAnthropic(payload);
      } else {
        const userMsg = messages?.find(m => m.role === 'user')?.content || '';
        result = await callClaudeCLI({ system, userMsg, model });
      }
      json(res, 200, result);
    } catch (e) {
      json(res, 500, { error: e.message });
    }
    return;
  }

  // Static files
  if (req.method === 'GET') {
    let filePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    filePath = path.join(__dirname, filePath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.md': 'text/plain' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404); res.end('Not found');
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\nSkill QA Tool  http://localhost:${PORT}`);
  console.log(`Skills dir:    ${SKILLS_DIR}`);
  console.log(`Mode:          ${USE_API ? 'Anthropic API' : 'claude CLI (uses your subscription)'}`);
});
