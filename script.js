/* ==============================================
   NAVIGATION — scroll state + mobile menu
   ============================================== */
const nav       = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ==============================================
   SCROLL REVEAL — Intersection Observer
   ============================================== */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.section').forEach(el => revealObs.observe(el));

document.querySelectorAll('.tl-item').forEach((el, i) => {
  el.style.transitionDelay = `${i * 90}ms`;
  revealObs.observe(el);
});

document.querySelectorAll('.proj-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 80}ms`;
  revealObs.observe(el);
});

/* ==============================================
   EXPAND / COLLAPSE
   ============================================== */
document.querySelectorAll('.expand-btn').forEach(btn => {
  const targetId = btn.dataset.target;
  const detail   = document.getElementById(targetId);
  const label    = btn.querySelector('.ebl');
  const isProject = !!btn.closest('.proj-card');

  btn.addEventListener('click', () => {
    const opening = !detail.classList.contains('open');
    detail.classList.toggle('open', opening);
    btn.classList.toggle('open', opening);
    label.textContent = opening
      ? 'Collapse'
      : isProject ? 'Read case study' : 'View details';
  });
});

/* ==============================================
   TERMINAL
   ============================================== */
const termBody  = document.getElementById('term-body');
const termInput = document.getElementById('term-input');
const termWin   = document.getElementById('term-win');

let history = [];
let histIdx = -1;

/* ---- Command definitions ---- */
const cmds = {
  help: () => `
<p><span class="tb">Available commands:</span></p><br>
<p>&nbsp;&nbsp;<span class="th">whoami</span>                 — who is Manikanta?</p>
<p>&nbsp;&nbsp;<span class="th">cat about.txt</span>          — background &amp; philosophy</p>
<p>&nbsp;&nbsp;<span class="th">ls</span>                     — list directory</p>
<p>&nbsp;&nbsp;<span class="th">ls projects/</span>           — list projects</p>
<p>&nbsp;&nbsp;<span class="th">cat projects/[name]</span>    — project deep-dive</p>
<p>&nbsp;&nbsp;<span class="th">cat experience/[name]</span>  — experience detail</p>
<p>&nbsp;&nbsp;<span class="th">cat resume.json</span>        — structured resume</p>
<p>&nbsp;&nbsp;<span class="th">echo $SKILLS</span>          — technical skills</p>
<p>&nbsp;&nbsp;<span class="th">git log --oneline</span>      — career history</p>
<p>&nbsp;&nbsp;<span class="th">./contact.sh</span>          — get in touch</p>
<p>&nbsp;&nbsp;<span class="th">clear</span>                  — clear terminal</p><br>
<p>&nbsp;&nbsp;<span class="tb">Bonus:</span> try <span class="th">sudo hire-me</span> or <span class="th">man manikanta</span></p>
`,

  whoami: () => `
<p><span class="tb">Manikanta Reddy Venna</span></p>
<p>Backend Engineer · Computer Science @ USF · Tampa, FL</p><br>
<p>I don't just study CS — I ship production software.</p>
<p>Former SWE Intern @ Automox. Current TA for C/Unix. USF Senator.</p>
<p>4.0 GPA because I actually care about depth, not just grades.</p><br>
<p>Seeking: Summer 2026 backend / platform engineering internships.</p>
`,

  'cat about.txt': () => `
<p><span class="tb">about.txt</span></p><br>
<p>I approach software the way I approach everything — with rigor.</p><br>
<p>At Automox, I didn't just write code. I reduced manual config time by 40%.</p>
<p>I built a diagnostics tool that cut debugging from 2 hours to 20 minutes.</p>
<p>I shipped 8+ production fixes with 95%+ test coverage.</p><br>
<p>As a TA, I've debugged 100+ C codebases. That means I can read code fast,</p>
<p>identify root causes, and explain clearly. All of that transfers to engineering.</p><br>
<p>I build things that work in production, not just in demos.</p>
<p>I test because I care about correctness. I document because I respect future readers.</p><br>
<p>GPA: <span class="th">4.0/4.0</span> · Dean's List (all semesters) · Green &amp; Gold Presidential Award</p>
`,

  ls: () => `
<p>projects/&nbsp;&nbsp;&nbsp;&nbsp;experience/&nbsp;&nbsp;&nbsp;&nbsp;resume.json&nbsp;&nbsp;&nbsp;&nbsp;contact.txt</p>
`,

  'ls projects/': () => `
<p>neuralcloud.md&nbsp;&nbsp;&nbsp;&nbsp;stylemate.md&nbsp;&nbsp;&nbsp;&nbsp;inventory.md</p><br>
<p>Use <span class="th">cat projects/[name]</span> to read a case study.</p>
`,

  'ls experience/': () => `
<p>automox.md&nbsp;&nbsp;&nbsp;&nbsp;ta-usf.md&nbsp;&nbsp;&nbsp;&nbsp;senator.md</p><br>
<p>Use <span class="th">cat experience/[name]</span> to read details.</p>
`,

  'cat projects/neuralcloud.md': () => `
<p><span class="tb">NeuralCloud — Browser ML Training &amp; Deployment</span></p>
<p><span class="ta">Stack:</span> React · TensorFlow.js · WebGPU · Node.js · PostgreSQL · AWS S3 · Docker</p><br>
<p><span class="tb">Problem:</span> ML training requires expensive GPU cloud instances.</p>
<p>Researchers hit cost barriers before they can even test a hypothesis.</p><br>
<p><span class="tb">Solution:</span> Browser-native ML training via WebGPU compute shaders.</p>
<p>Real-time training metrics. Model persistence via PostgreSQL + AWS S3.</p>
<p>Dockerized with automated tests and CI/CD.</p><br>
<p><span class="tb">Why it's hard:</span> WebGPU is bleeding-edge. Getting TF.js to leverage hardware</p>
<p>acceleration in-browser requires understanding compute pipelines at a low level.</p>
<p>Most devs don't go this deep. I did.</p>
`,

  'cat projects/stylemate.md': () => `
<p><span class="tb">StyleMate — AI Outfit Stylist</span></p>
<p><span class="ta">Stack:</span> React · Node.js/Express · TensorFlow.js · MongoDB Atlas · Cloudinary · JWT</p><br>
<p><span class="tb">Problem:</span> Personal styling is expensive and inaccessible at scale.</p><br>
<p><span class="tb">Solution:</span> Custom CNN — <span class="th">90% accuracy</span> on 550 test images.</p>
<p>Full-stack platform with JWT auth, Cloudinary CDN, deployed on Vercel + Render.</p><br>
<p><span class="tb">Highlights:</span> Refresh token rotation · MongoDB aggregation pipelines ·</p>
<p>Real classification, not just a wrapper around an existing API.</p>
`,

  'cat projects/inventory.md': () => `
<p><span class="tb">Smart Home Inventory &amp; Expiration Tracker</span></p>
<p><span class="ta">Stack:</span> C# · .NET Core · PostgreSQL · Entity Framework Core · Hangfire · xUnit</p><br>
<p><span class="tb">Problem:</span> ~30% of household food wasted from untracked expiration dates.</p><br>
<p><span class="tb">Solution:</span> Barcode-driven inventory — zero manual entry. Automated expiration</p>
<p>alerts via Hangfire background jobs. Surfaces items <em>before</em> they expire.</p><br>
<p><span class="tb">Engineering:</span> Clean architecture (domain/app/infra).</p>
<p>75% xUnit coverage including integration tests for the full alert pipeline.</p>
`,

  'cat experience/automox.md': () => `
<p><span class="tb">Software Engineering Intern — Automox</span></p>
<p>Jun – Aug 2025 · Backend · Remote</p><br>
<p>→ REST API endpoints → <span class="th">40%</span> reduction in manual config time</p>
<p>→ Python diagnostics utility → 2 hours to <span class="th">20 minutes</span> debugging</p>
<p>→ 8+ production edge cases → <span class="th">95%+</span> test coverage</p><br>
<p>Automox is an IT automation platform. Real production code, real users, real impact.</p>
`,

  'cat experience/ta-usf.md': () => `
<p><span class="tb">C Programming Teaching Assistant — USF</span></p>
<p>Aug 2025 – Present · Unix/Linux Systems</p><br>
<p>→ Debugged <span class="th">100+</span> student C codebases (segfaults, leaks, pointer errors)</p>
<p>→ Code reviews improved avg scores by <span class="th">15%</span></p>
<p>→ Standardized rubrics across 4-person TA team</p><br>
<p>Tools: C · GDB · Valgrind · Linux</p>
`,

  'cat experience/senator.md': () => `
<p><span class="tb">Senator — USF Student Government</span></p>
<p>Aug 2025 – Present</p><br>
<p>→ Senator of the Month for leading committee initiatives</p>
<p>→ Organized cross-campus Senate meeting rotations</p>
<p>→ Represents student interests at the institutional level</p>
`,

  'cat resume.json': () => `
<p><span class="ta">{</span></p>
<p>&nbsp;&nbsp;"name": <span class="th">"Manikanta Reddy Venna"</span>,</p>
<p>&nbsp;&nbsp;"email": <span class="th">"manikantarv54@gmail.com"</span>,</p>
<p>&nbsp;&nbsp;"phone": <span class="th">"+1 813 405 9902"</span>,</p>
<p>&nbsp;&nbsp;"location": <span class="th">"Tampa, FL"</span>,</p>
<p>&nbsp;&nbsp;"gpa": <span class="th">4.0</span>,</p>
<p>&nbsp;&nbsp;"university": <span class="th">"University of South Florida"</span>,</p>
<p>&nbsp;&nbsp;"graduation": <span class="th">"May 2027"</span>,</p>
<p>&nbsp;&nbsp;"experience": [</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;{ "role": <span class="th">"SWE Intern"</span>, "company": <span class="th">"Automox"</span>, "year": 2025 },</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;{ "role": <span class="th">"C Programming TA"</span>, "company": <span class="th">"USF"</span>, "year": 2025 },</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;{ "role": <span class="th">"Senator"</span>, "company": <span class="th">"USF SG"</span>, "year": 2025 }</p>
<p>&nbsp;&nbsp;],</p>
<p>&nbsp;&nbsp;"seeking": <span class="th">"Summer 2026 Backend / Platform Engineering Internship"</span></p>
<p><span class="ta">}</span></p>
`,

  'echo $skills': () => `
<p><span class="tb">Languages:</span>   C · C# · Python · JavaScript · SQL · PowerShell · HTML/CSS</p>
<p><span class="tb">Frameworks:</span>  .NET Core · Entity Framework · React · Node.js/Express · TensorFlow.js</p>
<p><span class="tb">Databases:</span>   PostgreSQL · MongoDB</p>
<p><span class="tb">Tools:</span>       Docker · Git · Linux/Unix · GDB · AWS S3 · Cloudinary · JWT · CI/CD</p>
<p><span class="tb">Testing:</span>     xUnit · Integration testing · 95%+ coverage shipped to production</p>
`,

  'git log': () => `
<p><span class="ta">commit a3f9d12</span> (HEAD → main)</p>
<p>Date:&nbsp;&nbsp;&nbsp;Aug 2025</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;intern: ship production APIs @ Automox, 40% perf improvement</p><br>
<p><span class="ta">commit 7e2b841</span></p>
<p>Date:&nbsp;&nbsp;&nbsp;Aug 2025</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;feat: C Programming TA @ USF, debug 100+ codebases</p><br>
<p><span class="ta">commit 5c1a093</span></p>
<p>Date:&nbsp;&nbsp;&nbsp;May 2025</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;feat: NeuralCloud — browser ML training with WebGPU</p><br>
<p><span class="ta">commit 2d8f176</span></p>
<p>Date:&nbsp;&nbsp;&nbsp;Jan 2025</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;feat: StyleMate — 90% accuracy CNN clothing classifier</p><br>
<p><span class="ta">commit 1a4c222</span></p>
<p>Date:&nbsp;&nbsp;&nbsp;Aug 2023</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;init: enrolled @ USF CS — 4.0 GPA streak begins</p>
`,

  'git log --oneline': () => `
<p><span class="ta">a3f9d12</span> intern: ship production APIs @ Automox</p>
<p><span class="ta">7e2b841</span> feat: C Programming TA @ USF</p>
<p><span class="ta">5c1a093</span> feat: NeuralCloud browser ML training</p>
<p><span class="ta">2d8f176</span> feat: StyleMate AI outfit stylist</p>
<p><span class="ta">1a4c222</span> init: USF CS — 4.0 GPA streak begins</p>
`,

  './contact.sh': () => `
<p><span class="ts">✓ Contact information loaded</span></p><br>
<p><span class="tb">Email:</span>&nbsp;&nbsp;&nbsp;&nbsp;<a href="mailto:manikantarv54@gmail.com" style="color:#818cf8">manikantarv54@gmail.com</a></p>
<p><span class="tb">Phone:</span>&nbsp;&nbsp;&nbsp;&nbsp;+1 813 405 9902</p>
<p><span class="tb">LinkedIn:</span> <a href="https://linkedin.com/in/manikantavenna" target="_blank" style="color:#818cf8">linkedin.com/in/manikantavenna</a></p>
<p><span class="tb">GitHub:</span>&nbsp;&nbsp;&nbsp;<a href="https://github.com/ManiKantaVenna" target="_blank" style="color:#818cf8">github.com/ManiKantaVenna</a></p><br>
<p>Open to: Summer 2026 · Backend / Platform Engineering Internships</p>
`,

  'sudo hire-me': () => `
<p><span class="ta">[sudo] password for manikanta:</span> ••••••••••</p><br>
<p><span class="ts">✓ Authentication successful</span></p>
<p><span class="ts">✓ Initiating offer-letter.sh</span></p>
<p>Loading compensation benchmarks... <span class="th">████████████ 100%</span></p><br>
<p>Just kidding. But I'm very serious about Summer 2026.</p>
<p>→ <a href="mailto:manikantarv54@gmail.com" style="color:#818cf8">manikantarv54@gmail.com</a></p>
`,

  'ping manikanta': () => `
<p>PING manikanta.venna (813.405.9902.usf): 56 data bytes</p>
<p>64 bytes from manikanta: icmp_seq=0 ttl=64 time=<span class="ts">0.42 ms</span></p>
<p>64 bytes from manikanta: icmp_seq=1 ttl=64 time=<span class="ts">0.38 ms</span></p>
<p>64 bytes from manikanta: icmp_seq=2 ttl=64 time=<span class="ts">0.41 ms</span></p><br>
<p>--- manikanta.venna ping statistics ---</p>
<p>3 packets transmitted, 3 received, <span class="ts">0% packet loss</span></p>
<p>Response guaranteed. Response time: always.</p>
`,

  'man manikanta': () => `
<p><span class="tb">MANIKANTA(1)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;User Commands&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MANIKANTA(1)</span></p><br>
<p><span class="tb">NAME</span></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;manikanta — backend engineer, debugger, system builder</p><br>
<p><span class="tb">SYNOPSIS</span></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;manikanta [--internship] [--backend] [--summer-2026]</p><br>
<p><span class="tb">DESCRIPTION</span></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A highly reliable engineering unit with 4.0 GPA, Automox production</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;experience, and a consistent habit of shipping working software.</p><br>
<p><span class="tb">OPTIONS</span></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--internship    Open to Summer 2026 opportunities</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--backend       Specialization: backend / platform engineering</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--gpa           4.0/4.0. Every semester. No exceptions.</p><br>
<p><span class="tb">SEE ALSO</span></p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;./contact.sh, cat resume.json, whoami</p>
`,

  'uname -a': () => `
<p>Manikanta 4.0 SWE-INTERN-AUTOMOX #DEANS-LIST USF-CS aarch64 GNU/Linux</p>
`,
};

/* ---- Command normalization ---- */
function resolveCmd(raw) {
  const c = raw.trim().toLowerCase();

  if (c === 'clear') return 'clear';
  if (c === '' ) return '';

  // Exact match
  if (cmds[c]) return c;

  // Aliases / variants
  const aliases = {
    'ls projects': 'ls projects/',
    'ls ./projects': 'ls projects/',
    'ls ./projects/': 'ls projects/',
    'ls experience': 'ls experience/',
    'ls ./experience': 'ls experience/',
    'ls ./experience/': 'ls experience/',
    'cat about': 'cat about.txt',
    'cat ./about.txt': 'cat about.txt',
    'git log': 'git log',
    'git log --oneline': 'git log --oneline',
    'echo $skills': 'echo $skills',
    'help': 'help',
    '-h': 'help',
    '--help': 'help',
    'h': 'help',
    'contact': './contact.sh',
    './contact': './contact.sh',
    'ping': 'ping manikanta',
    'sudo': 'sudo hire-me',
    'hire': 'sudo hire-me',
    'hire-me': 'sudo hire-me',
  };
  if (aliases[c]) return aliases[c];

  // Pattern: cat projects/<name>
  const projMatch = c.match(/^cat\s+projects\/(.+?)(?:\.md)?$/);
  if (projMatch) {
    const key = `cat projects/${projMatch[1]}.md`;
    if (cmds[key]) return key;
  }

  // Pattern: cat experience/<name>
  const expMatch = c.match(/^cat\s+experience\/(.+?)(?:\.md)?$/);
  if (expMatch) {
    const name = expMatch[1];
    const key = `cat experience/${name}.md`;
    if (cmds[key]) return key;
    // TA alias
    if (name === 'ta' || name === 'ta_usf') return 'cat experience/ta-usf.md';
  }

  return null; // not found
}

/* ---- Tab completion ---- */
function tabComplete(partial) {
  const all = Object.keys(cmds).concat([
    'ls projects/', 'ls experience/', 'cat about.txt',
    'cat resume.json', './contact.sh', 'sudo hire-me',
    'git log --oneline', 'echo $SKILLS',
  ]);
  const p = partial.toLowerCase();
  const matches = all.filter(k => k.startsWith(p));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1 && partial.length > 0) {
    // Find common prefix
    let common = matches[0];
    for (const m of matches) {
      let i = 0;
      while (i < common.length && i < m.length && common[i] === m[i]) i++;
      common = common.slice(0, i);
    }
    return common.length > partial.length ? common : partial;
  }
  return partial;
}

/* ---- DOM helpers ---- */
function escHtml(text) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(text));
  return d.innerHTML;
}

function appendCommandLine(rawInput) {
  const line = document.createElement('div');
  line.className = 'tl';
  line.innerHTML = `<span class="tp">manikanta@portfolio:~$</span><span class="tc"> ${escHtml(rawInput)}</span>`;
  termBody.appendChild(line);
}

function appendOutput(html) {
  const out = document.createElement('div');
  out.className = 'to';
  out.innerHTML = html;
  termBody.appendChild(out);
}

function scrollBottom() {
  termBody.scrollTop = termBody.scrollHeight;
}

/* ---- Process a command ---- */
function processCmd(rawInput) {
  const resolved = resolveCmd(rawInput);

  if (resolved === '') return;

  if (resolved === 'clear') {
    termBody.innerHTML = '';
    return;
  }

  appendCommandLine(rawInput);

  if (resolved === null) {
    appendOutput(
      `<p><span class="te">bash: ${escHtml(rawInput.trim())}: command not found</span></p>` +
      `<p>Type <span class="th">help</span> to see available commands.</p>`
    );
  } else {
    appendOutput(cmds[resolved]());
  }

  scrollBottom();
}

/* ---- Input event handling ---- */
termInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = termInput.value;
    if (val.trim()) {
      history.unshift(val);
      histIdx = -1;
    }
    processCmd(val);
    termInput.value = '';
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < history.length - 1) {
      histIdx++;
      termInput.value = history[histIdx];
      // Move cursor to end on next tick
      requestAnimationFrame(() => {
        termInput.selectionStart = termInput.selectionEnd = termInput.value.length;
      });
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) {
      histIdx--;
      termInput.value = history[histIdx];
    } else {
      histIdx = -1;
      termInput.value = '';
    }
    return;
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    termInput.value = tabComplete(termInput.value);
    return;
  }

  // Ctrl+C clears the input line
  if (e.key === 'c' && e.ctrlKey) {
    appendCommandLine(termInput.value + '^C');
    termInput.value = '';
    histIdx = -1;
    scrollBottom();
  }
});

// Click anywhere on terminal to focus input
termWin.addEventListener('click', () => termInput.focus());
