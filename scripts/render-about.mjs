import { readFile, writeFile } from 'node:fs/promises';

const README_PATH = new URL('../README.md', import.meta.url);
const ABOUT_PATH = new URL('../about.html', import.meta.url);

const readme = await readFile(README_PATH, 'utf8');
const markdown = readme.replace(/^---\n[\s\S]*?\n---\n+/, '').trim();

const titleMatch = markdown.match(/^#\s+(.+)$/m);
const pageTitle = `${titleMatch ? titleMatch[1].trim() : '打牌计分器'} - 使用说明`;

const response = await fetch('https://api.github.com/markdown', {
  method: 'POST',
  headers: {
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'scorecard-about-generator',
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  },
  body: JSON.stringify({
    text: markdown,
    mode: 'gfm',
    context: 'lingceng/scorecard',
  }),
});

if (!response.ok) {
  throw new Error(`GitHub Markdown API failed: ${response.status} ${response.statusText}`);
}

const content = await response.text();

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pageTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0c0c18;
  color: #eaeaea;
  min-height: 100vh;
  line-height: 1.75;
}
.container {
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}
header {
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding-bottom: 16px;
  margin-bottom: 32px;
}
header h1 { font-size: 22px; font-weight: 700; }
header a {
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  color: #6b7394;
  text-decoration: none;
}
header a:hover { color: #eaeaea; }
h1 { font-size: 28px; font-weight: 900; margin: 28px 0 14px; }
h2 { font-size: 18px; font-weight: 700; margin: 28px 0 10px; color: #eaeaea; }
h3 { font-size: 15px; font-weight: 600; margin: 18px 0 6px; }
p { margin: 8px 0; color: #c5c9d6; font-size: 15px; }
ul, ol { padding-left: 20px; margin: 8px 0; }
li { margin: 4px 0; color: #c5c9d6; font-size: 15px; }
strong { color: #eaeaea; }
a { color: #e94560; text-decoration: none; }
a:hover { text-decoration: underline; }
code {
  background: #1c1c34;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
img {
  max-width: 100%;
  border-radius: 12px;
  margin: 16px 0;
  display: block;
}
.container > :first-child { margin-top: 0; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>打牌计分器</h1>
    <a href="./">← 返回应用</a>
  </header>
  ${content}
</div>
</body>
</html>
`;

await writeFile(ABOUT_PATH, `${html}\n`);

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
