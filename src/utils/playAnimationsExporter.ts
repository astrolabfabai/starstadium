import { PlayByPlayEvent } from '../types';
import { getPlayTacticalConcept } from '../data/footballDiagramsData';

/**
 * Generates and downloads a self-contained, standalone interactive HTML file containing
 * all play-by-play animations, SVG field diagrams, and player stats for offline viewing.
 */
export function exportPlayAnimationsAsHtml(
  plays: PlayByPlayEvent[],
  gameTitle: string = 'KC vs BAL - 2026 Season Game Reel',
  season: string = '2026REG'
) {
  const conceptsWithPlays = plays.map((play) => {
    const concept = getPlayTacticalConcept(play);
    return {
      play,
      concept
    };
  });

  const payloadJson = JSON.stringify(conceptsWithPlays);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${gameTitle} &bull; StarStadium Play-by-Play Animation Reel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #09090b; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.9; }
      50% { opacity: 0.4; }
    }
    .pulse-glow { animation: pulseGlow 1.5s infinite; }
  </style>
</head>
<body class="p-4 sm:p-8 max-w-6xl mx-auto">
  <!-- Header -->
  <header class="mb-6 pb-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono border border-emerald-500/20 mb-2">
        🏈 Standalone NFL Play-By-Play Animation Reel &bull; ${season}
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">${gameTitle}</h1>
      <p class="text-xs text-zinc-400 font-mono mt-1">Exported with full tactical vector diagrams, route trajectories & EPA metrics.</p>
    </div>

    <!-- Stepper Controls -->
    <div class="flex flex-wrap items-center gap-2 bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
      <button id="btnPrev" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1 transition">
        ◄ Prev Play
      </button>
      <button id="btnPlayPause" class="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1 transition">
        ▶ Auto Reel
      </button>
      <button id="btnNext" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1 transition">
        Next Play ►
      </button>
      <div class="text-xs font-mono px-2 text-amber-400 font-bold" id="playCounter">Play 1 of ${plays.length}</div>
    </div>
  </header>

  <!-- Play Metadata Banner -->
  <div id="playMeta" class="mb-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
    <!-- Rendered dynamically -->
  </div>

  <!-- SVG Field Animation Stage -->
  <div class="bg-[#0b130e] border-2 border-emerald-600/40 rounded-2xl p-4 shadow-2xl mb-6">
    <div id="fieldContainer" class="w-full aspect-[16/9] min-h-[320px] sm:min-h-[460px] bg-[#164326] relative rounded-xl border border-emerald-500/40 overflow-hidden shadow-inner select-none">
      <!-- SVG Canvas inserted here -->
    </div>
  </div>

  <!-- Play Commentary & Tactical Keys -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 class="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono mb-2">📋 Coaching Keys &amp; Read Progression</h3>
      <ul id="coachingKeys" class="text-xs text-zinc-300 space-y-1.5"></ul>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 class="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono mb-2">🎯 Formation &amp; Scheme Breakdown</h3>
      <div id="schemeBreakdown" class="text-xs text-zinc-300 space-y-2 font-mono"></div>
    </div>
  </div>

  <!-- Play Timeline Scrubber -->
  <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
    <h3 class="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono mb-3">All Plays in Game (${plays.length} Total)</h3>
    <div id="playTimeline" class="flex gap-2 overflow-x-auto pb-2"></div>
  </div>

  <!-- Embedded Data & Interactive JavaScript Engine -->
  <script>
    const data = ${payloadJson};
    let currentIndex = 0;
    let isAutoPlaying = false;
    let autoInterval = null;
    let ballProgress = 0;
    let ballTimer = null;

    function renderCurrentPlay() {
      const item = data[currentIndex];
      const p = item.play;
      const c = item.concept;

      document.getElementById('playCounter').textContent = \`Play \${currentIndex + 1} of \${data.length}\`;

      // Meta
      document.getElementById('playMeta').innerHTML = \`
        <div>
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Q\${p.Quarter} • \${p.TimeRemaining}
            </span>
            <span class="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              \${p.Possession} \${p.Down} & \${p.Distance} at \${p.YardLineSide} \${p.YardLine}
            </span>
            \${p.IsBigPlay ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">⚡ BIG PLAY</span>' : ''}
          </div>
          <h2 class="text-lg font-bold text-white">\${c.name}</h2>
          <p class="text-xs text-zinc-400 mt-0.5 font-sans">\${p.Description}</p>
        </div>
        <div class="flex items-center gap-3 font-mono text-xs shrink-0">
          <div class="bg-black/50 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span class="text-zinc-500">Gain: </span>
            <strong class="\${p.YardsGained >= 15 ? 'text-amber-400' : 'text-emerald-400'} font-bold">+\${p.YardsGained} YDS</strong>
          </div>
          <div class="bg-black/50 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span class="text-zinc-500">EPA: </span>
            <strong class="\${p.epa >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold">\${p.epa >= 0 ? '+' : ''}\${p.epa || 0}</strong>
          </div>
          <div class="bg-black/50 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span class="text-zinc-500">Win Prob: </span>
            <strong class="text-amber-400 font-bold">\${Math.round(p.WinProbabilityPct)}%</strong>
          </div>
        </div>
      \`;

      // Keys
      const keysUl = document.getElementById('coachingKeys');
      keysUl.innerHTML = (c.keys || []).map(k => \`<li class="flex items-start gap-2"><span class="text-emerald-400">✓</span><span>\${k}</span></li>\`).join('');

      // Scheme
      document.getElementById('schemeBreakdown').innerHTML = \`
        <div><span class="text-zinc-500">Formation:</span> <strong class="text-white">\${c.formation}</strong></div>
        <div><span class="text-zinc-500">Personnel:</span> <strong class="text-white">\${c.personnel}</strong></div>
        <div><span class="text-zinc-500">Coverage:</span> <strong class="text-rose-400">\${c.defensiveCoverage}</strong></div>
        <div><span class="text-zinc-500">Category:</span> <strong class="text-emerald-400">\${c.category}</strong></div>
      \`;

      // Timeline cards
      const timeline = document.getElementById('playTimeline');
      timeline.innerHTML = data.map((d, i) => {
        const isSel = i === currentIndex;
        return \`
          <button onclick="goToPlay(\${i})" class="shrink-0 p-2.5 rounded-xl border text-left text-xs font-mono transition min-w-[130px] \${isSel ? 'bg-emerald-950/60 border-emerald-500 text-white' : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-600'}">
            <div class="flex justify-between text-[10px]">
              <span class="font-bold">#\${i+1} Q\${d.play.Quarter}</span>
              <span class="text-amber-400">\${d.play.TimeRemaining}</span>
            </div>
            <div class="text-white font-bold my-0.5">\${d.play.Possession} +\${d.play.YardsGained}y</div>
            <div class="text-[10px] text-zinc-500 truncate">\${d.play.PlayType}</div>
          </button>
        \`;
      }).join('');

      renderSvgCanvas(c, p);
    }

    function renderSvgCanvas(c, p) {
      const container = document.getElementById('fieldContainer');
      const los = c.losYard;
      const fd = c.firstDownYard;
      const yards = p.YardsGained || (fd - los);
      const forwardProgress = Math.min(90, Math.max(10, los + yards));

      let routesSvg = '';
      (c.offensiveNodes || []).forEach(n => {
        if (!n.routePath || n.routePath.length === 0) return;
        let d = \`M \${n.startX} \${n.startY}\`;
        n.routePath.forEach(pt => { d += \` L \${pt.x} \${pt.y}\`; });
        const color = n.passTarget ? '#f59e0b' : '#38bdf8';
        routesSvg += \`
          <path d="\${d}" fill="none" stroke="\${color}" stroke-width="0.6" stroke-linecap="round" stroke-dasharray="2 1" class="pulse-glow" />
          <circle cx="\${n.routePath[n.routePath.length - 1].x}" cy="\${n.routePath[n.routePath.length - 1].y}" r="0.8" fill="\${color}" stroke="#fff" stroke-width="0.2" />
        \`;
      });

      let offPlayersSvg = '';
      (c.offensiveNodes || []).forEach(n => {
        const fill = n.role === 'QB' ? '#f59e0b' : n.passTarget ? '#3b82f6' : '#1e40af';
        offPlayersSvg += \`
          <circle cx="\${n.startX}" cy="\${n.startY}" r="1.4" fill="\${fill}" stroke="#93c5fd" stroke-width="0.25" />
          <text x="\${n.startX}" y="\${n.startY + 0.4}" fill="#ffffff" font-size="0.95" font-weight="bold" text-anchor="middle">\${n.label.split(' ')[0]}</text>
        \`;
      });

      let defPlayersSvg = '';
      (c.defensiveNodes || []).forEach(n => {
        defPlayersSvg += \`
          <circle cx="\${n.startX}" cy="\${n.startY}" r="1.35" fill="#991b1b" stroke="#fca5a5" stroke-width="0.25" />
          <text x="\${n.startX}" y="\${n.startY + 0.4}" fill="#ffffff" font-size="0.9" font-weight="bold" text-anchor="middle">\${n.label.split(' ')[0]}</text>
        \`;
      });

      container.innerHTML = \`
        <svg class="w-full h-full" viewBox="0 0 100 53.3" preserveAspectRatio="none">
          <!-- Yard Lines -->
          \${[10, 20, 30, 40, 50, 60, 70, 80, 90].map(x => \`
            <line x1="\${x}" y1="0" x2="\${x}" y2="53.3" stroke="#ffffff" stroke-width="0.3" stroke-opacity="0.35" />
            \${x >= 20 && x <= 80 ? \`<text x="\${x}" y="5" fill="#ffffff" fill-opacity="0.4" font-size="2" text-anchor="middle" font-family="monospace">\${x <= 50 ? x-10 : 90-x}</text>\` : ''}
            \${x >= 20 && x <= 80 ? \`<text x="\${x}" y="50" fill="#ffffff" fill-opacity="0.4" font-size="2" text-anchor="middle" font-family="monospace">\${x <= 50 ? x-10 : 90-x}</text>\` : ''}
          \`).join('')}

          <!-- Endzones -->
          <rect x="0" y="0" width="10" height="53.3" fill="#1e3a8a" fill-opacity="0.8" />
          <rect x="90" y="0" width="10" height="53.3" fill="#991b1b" fill-opacity="0.8" />

          <!-- Gain Highlight -->
          \${yards > 0 ? \`
            <rect x="\${Math.min(los, forwardProgress)}" y="2" width="\${Math.abs(forwardProgress - los)}" height="49.3" fill="\${yards >= 15 ? '#f59e0b' : '#10b981'}" fill-opacity="0.15" stroke="\${yards >= 15 ? '#f59e0b' : '#10b981'}" stroke-width="0.25" stroke-dasharray="1 1" />
          \` : ''}

          <!-- Line of Scrimmage -->
          <line x1="\${los}" y1="0" x2="\${los}" y2="53.3" stroke="#38bdf8" stroke-width="0.4" stroke-dasharray="1 1" />
          <!-- 1st Down Line -->
          <line x1="\${fd}" y1="0" x2="\${fd}" y2="53.3" stroke="#eab308" stroke-width="0.5" />

          \${routesSvg}
          \${offPlayersSvg}
          \${defPlayersSvg}

          <!-- Ball Marker -->
          <circle id="liveBall" cx="\${los}" cy="26.6" r="1.3" fill="#f59e0b" stroke="#ffffff" stroke-width="0.3" />
        </svg>
      \`;

      startBallAnimation(c);
    }

    function startBallAnimation(c) {
      if (ballTimer) clearInterval(ballTimer);
      ballProgress = 0;
      const primaryTarget = (c.offensiveNodes || []).find(n => n.passTarget && n.routePath && n.routePath.length > 0) || c.offensiveNodes[0];
      const qb = (c.offensiveNodes || []).find(n => n.role === 'QB') || c.offensiveNodes[0];

      if (!primaryTarget || !primaryTarget.routePath || primaryTarget.routePath.length === 0) return;

      const startX = qb ? qb.startX : c.losYard;
      const startY = qb ? qb.startY : 26.6;
      const endPoint = primaryTarget.routePath[primaryTarget.routePath.length - 1];

      ballTimer = setInterval(() => {
        ballProgress += 0.05;
        if (ballProgress > 1) ballProgress = 0;
        const curX = startX + (endPoint.x - startX) * ballProgress;
        const curY = startY + (endPoint.y - startY) * ballProgress;
        const ball = document.getElementById('liveBall');
        if (ball) {
          ball.setAttribute('cx', curX);
          ball.setAttribute('cy', curY);
        }
      }, 50);
    }

    function goToPlay(idx) {
      currentIndex = idx;
      renderCurrentPlay();
    }

    document.getElementById('btnPrev').addEventListener('click', () => {
      currentIndex = currentIndex <= 0 ? data.length - 1 : currentIndex - 1;
      renderCurrentPlay();
    });

    document.getElementById('btnNext').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % data.length;
      renderCurrentPlay();
    });

    document.getElementById('btnPlayPause').addEventListener('click', () => {
      isAutoPlaying = !isAutoPlaying;
      const btn = document.getElementById('btnPlayPause');
      if (isAutoPlaying) {
        btn.textContent = '❚❚ Pause Reel';
        btn.className = 'px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1 transition';
        autoInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % data.length;
          renderCurrentPlay();
        }, 3500);
      } else {
        btn.textContent = '▶ Auto Reel';
        btn.className = 'px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-1 transition';
        if (autoInterval) clearInterval(autoInterval);
      }
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        currentIndex = currentIndex <= 0 ? data.length - 1 : currentIndex - 1;
        renderCurrentPlay();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        currentIndex = (currentIndex + 1) % data.length;
        renderCurrentPlay();
      }
    });

    // Initial render
    renderCurrentPlay();
  </script>
</body>
</html>`;

  // Trigger browser download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `nfl_play_animations_${gameTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the complete play-by-play telemetry, coordinate paths, and concepts as structured JSON.
 */
export function exportPlayAnimationsAsJson(
  plays: PlayByPlayEvent[],
  gameTitle: string = 'KC_vs_BAL_PlayByPlay'
) {
  const structuredData = plays.map((play) => ({
    ...play,
    tacticalConcept: getPlayTacticalConcept(play)
  }));

  const jsonStr = JSON.stringify(structuredData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${gameTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_data.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a coaching text report summarizing all plays, formations, and gain analytics.
 */
export function exportCoachingReport(
  plays: PlayByPlayEvent[],
  gameTitle: string = 'Game Tactical Breakdown'
) {
  let report = `=======================================================\n`;
  report += `🏈 NEXUS NFL TACTICAL COACHING PLAYBOOK REPORT\n`;
  report += `GAME: ${gameTitle}\n`;
  report += `TOTAL PLAYS ANALYZED: ${plays.length}\n`;
  report += `GENERATED: ${new Date().toLocaleString()}\n`;
  report += `=======================================================\n\n`;

  plays.forEach((p, idx) => {
    const concept = getPlayTacticalConcept(p);
    report += `[PLAY #${idx + 1}] Q${p.Quarter} • ${p.TimeRemaining} | ${p.Possession} ${p.Down}&${p.Distance} at ${p.YardLineSide} ${p.YardLine}\n`;
    report += `RESULT: +${p.YardsGained} YDS | EPA: ${p.epa !== undefined ? (p.epa >= 0 ? `+${p.epa.toFixed(2)}` : p.epa.toFixed(2)) : 'N/A'} | WIN PROB: ${Math.round(p.WinProbabilityPct)}%\n`;
    report += `CONCEPT: ${concept.name}\n`;
    report += `FORMATION: ${concept.formation} | PERSONNEL: ${concept.personnel}\n`;
    report += `COVERAGE: ${concept.defensiveCoverage}\n`;
    report += `DESCRIPTION: ${p.Description}\n`;
    report += `COACHING KEYS:\n`;
    (concept.keys || []).forEach((k) => {
      report += `  - ${k}\n`;
    });
    report += `-------------------------------------------------------\n\n`;
  });

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${gameTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_coaching_report.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
