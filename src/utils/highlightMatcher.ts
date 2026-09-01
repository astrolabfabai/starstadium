import { HighlightVideoItem, HighlightCategory, YtPlaylistScraperConfig } from '../types';
import { SCHEDULES_DATA, NFL_TEAMS } from '../data/sportsDataMock';

/**
 * Parses raw YouTube Playlist/Video titles into structured NFL game entities
 * Derived from the Python & regex logic in the user's chat PDFs
 */
export function parseYouTubeVideoTitle(title: string, uploadDate?: string) {
  // Season extraction: 2024, 2025, 2026
  let season = '2026_Season';
  const seasonMatch = title.match(/(20\d{2})/);
  if (seasonMatch) {
    season = `${seasonMatch[1]}_Season`;
  } else if (uploadDate && uploadDate.length >= 4) {
    season = `${uploadDate.slice(0, 4)}_Season`;
  }

  // Week extraction: "Week 1", "Week 01", "Week 14"
  let week = 'Week_01';
  const weekMatch = title.match(/Week\s*(\d+)/i);
  if (weekMatch) {
    week = `Week_${parseInt(weekMatch[1], 10).toString().padStart(2, '0')}`;
  }

  // Category classification
  let category: HighlightCategory = 'GAME_RECAP';
  const lower = title.toLowerCase();
  if (lower.includes("mic'd up") || lower.includes('micd up') || lower.includes('wired')) {
    category = 'MIC_D_UP';
  } else if (lower.includes('touchdown') || lower.includes(' td ') || lower.includes('all tds')) {
    category = 'TOUCHDOWNS';
  } else if (lower.includes('red zone') || lower.includes('redzone')) {
    category = 'REDZONE_DRIVES';
  } else if (lower.includes('pick-six') || lower.includes('interception') || lower.includes('pick 6')) {
    category = 'INTERCEPTIONS';
  } else if (lower.includes('sack') || lower.includes('defense') || lower.includes('stops')) {
    category = 'DEFENSIVE_STOPS';
  } else if (lower.includes('top plays') || lower.includes('best plays') || lower.includes('electric')) {
    category = 'BIG_PLAYS';
  }

  // Find matching NFL Teams
  let matchedHomeTeam = 'KC';
  let matchedAwayTeam = 'BAL';
  let matchedGameKey = '202610101';
  let matchConfidence = 60;

  const foundTeams: string[] = [];
  NFL_TEAMS.forEach((team) => {
    const keyMatch = new RegExp(`\\b${team.Key}\\b`, 'i').test(title);
    const cityMatch = new RegExp(`\\b${team.City}\\b`, 'i').test(title);
    const nameMatch = new RegExp(`\\b${team.Name}\\b`, 'i').test(title);

    if (keyMatch || cityMatch || nameMatch) {
      foundTeams.push(team.Key);
    }
  });

  if (foundTeams.length >= 2) {
    matchedAwayTeam = foundTeams[0];
    matchedHomeTeam = foundTeams[1];
    matchConfidence = 95;

    // Check if matching game key exists in schedule
    const schedGame = SCHEDULES_DATA.find(
      (g) =>
        (g.HomeTeam === matchedHomeTeam && g.AwayTeam === matchedAwayTeam) ||
        (g.HomeTeam === matchedAwayTeam && g.AwayTeam === matchedHomeTeam)
    );
    if (schedGame) {
      matchedGameKey = schedGame.GameKey;
      matchConfidence = 99;
    }
  } else if (foundTeams.length === 1) {
    matchedHomeTeam = foundTeams[0];
    matchConfidence = 80;
    const schedGame = SCHEDULES_DATA.find(
      (g) => g.HomeTeam === matchedHomeTeam || g.AwayTeam === matchedHomeTeam
    );
    if (schedGame) {
      matchedGameKey = schedGame.GameKey;
      matchedAwayTeam = schedGame.HomeTeam === matchedHomeTeam ? schedGame.AwayTeam : schedGame.HomeTeam;
    }
  }

  return {
    season,
    week,
    category,
    matchedHomeTeam,
    matchedAwayTeam,
    matchedGameKey,
    matchConfidence
  };
}

/**
 * Generate Smart yt-dlp Bash Download Script (as detailed in PDF Page 7-9)
 */
export function generateYtdlpBashScript(videos: HighlightVideoItem[], config?: Partial<YtPlaylistScraperConfig>): string {
  const outputDir = config?.outputDir || '~/NFL/downloads';
  const format = config?.outputFormat === 'mp3' ? '--extract-audio --audio-format mp3 --audio-quality 192K' : '-f "bv*+ba/b" --merge-output-format mp4';

  const urlsBlock = videos.map((v) => `# [${v.season}/${v.week}] ${v.title}\n"${v.youtubeUrl}"`).join('\n');

  return `#!/usr/bin/env bash
# ==============================================================================
# 🏈 StarStadium & yt-dlp Automated NFL Highlights Downloader
# Auto-matched against SportsData.io Live Schedules & Scores
# ==============================================================================

set -o pipefail
OUTPUT_DIR="${outputDir}"
LOG_FILE="$OUTPUT_DIR/logs/download_$(date +%Y%m%d_%H%M%S).log"
ARCHIVE_FILE="$OUTPUT_DIR/data/archive.txt"

mkdir -p "$OUTPUT_DIR" "$OUTPUT_DIR/logs" "$OUTPUT_DIR/data"

echo "============================================================" | tee -a "$LOG_FILE"
echo " 🎬 NFL HIGHLIGHTS BATCH DOWNLOAD PIPELINE" | tee -a "$LOG_FILE"
echo " Target Folder: $OUTPUT_DIR" | tee -a "$LOG_FILE"
echo " Date: $(date)" | tee -a "$LOG_FILE"
echo "============================================================" | tee -a "$LOG_FILE"

# Check yt-dlp & ffmpeg
command -v yt-dlp >/dev/null 2>&1 || { echo "[ERROR] yt-dlp is not installed. Install with: pip install yt-dlp" | tee -a "$LOG_FILE"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "[WARNING] ffmpeg not found. Format transcoding may be limited." | tee -a "$LOG_FILE"; }

# Batch URLs array
URLS=(
${urlsBlock}
)

echo "[*] Total matched highlight clips to download: \${#URLS[@]}" | tee -a "$LOG_FILE"

for url in "\${URLS[@]}"; do
  echo "------------------------------------------------------------" | tee -a "$LOG_FILE"
  echo "▶ Processing: \$url" | tee -a "$LOG_FILE"

  yt-dlp \\
    --continue \\
    --no-mtime \\
    --retries 10 \\
    --fragment-retries 10 \\
    --retry-sleep 5 \\
    --ignore-errors \\
    --download-archive "$ARCHIVE_FILE" \\
    ${format} \\
    -o "$OUTPUT_DIR/%(uploader)s/%(playlist_title)s/%(title)s.%(ext)s" \\
    "\$url" \\
    2>&1 | tee -a "$LOG_FILE"

  if [ \$? -eq 0 ]; then
    echo "✅ [SUCCESS] \$url" | tee -a "$LOG_FILE"
  else
    echo "❌ [FAILED] \$url" | tee -a "$LOG_FILE"
  fi
done

echo "============================================================" | tee -a "$LOG_FILE"
echo "🎉 Highlight batch download completed. Archive saved to $ARCHIVE_FILE" | tee -a "$LOG_FILE"
`;
}

/**
 * Generate Python Scraper + Matcher script (as detailed in PDF Page 17-21)
 */
export function generatePythonScraperScript(config: YtPlaylistScraperConfig): string {
  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NFL YouTube Playlists & Highlight Matcher
Automated scraper powered by yt-dlp + BeautifulSoup
Matches NFL YouTube Playlists to SportsData.io Game Schedules
"""

import os
import sys
import json
import csv
import re
import time
import subprocess

try:
    import yt_dlp as ytdlp
except ImportError:
    print("[ERROR] yt-dlp library missing. Run: pip install yt-dlp")
    sys.exit(1)

CHANNEL_URL = "${config.channelUrl}"
KEYWORDS = ${JSON.stringify(config.keywords)}
OUTPUT_DIR = "${config.outputDir}"
SEASON = "${config.selectedSeason}"
WEEK = "${config.selectedWeek}"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_playlists(channel_url):
    print(f"[*] Enumerating playlists from {channel_url}...")
    ydl_opts = {
        "quiet": True,
        "extract_flat": True,
        "skip_download": True,
        "nocheckcertificate": True,
    }
    with ytdlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(channel_url, download=False)
        entries = info.get("entries") or []
        
        matched_playlists = []
        for e in entries:
            title = e.get("title") or ""
            # Keyword filter check
            if any(kw.lower() in title.lower() for kw in KEYWORDS):
                url = e.get("webpage_url") or e.get("url") or f"https://www.youtube.com/playlist?list={e.get('id')}"
                matched_playlists.append({
                    "title": title,
                    "url": url,
                    "id": e.get("id"),
                    "count": e.get("playlist_count") or e.get("n_entries")
                })
        print(f"✅ Found {len(matched_playlists)} matching NFL highlight playlists.")
        return matched_playlists

def download_playlist_videos(playlists):
    results = []
    for pl in playlists:
        print(f"\\n▶ Downloading playlist videos: {pl['title']}")
        safe_title = re.sub(r'[^a-zA-Z0-9_]+', '_', pl['title'])
        target_dir = os.path.join(OUTPUT_DIR, f"{SEASON}_Season", f"Week_{WEEK.zfill(2)}", safe_title)
        os.makedirs(target_dir, exist_ok=True)
        
        cmd = [
            "yt-dlp",
            "-o", f"{target_dir}/%(title)s.%(ext)s",
            "-f", "bestvideo+bestaudio/best",
            "--merge-output-format", "mp4",
            "--continue",
            pl["url"]
        ]
        try:
            subprocess.run(cmd, check=True)
            results.append({"title": pl["title"], "url": pl["url"], "status": "SUCCESS", "path": target_dir})
        except subprocess.CalledProcessError as err:
            results.append({"title": pl["title"], "url": pl["url"], "status": f"FAILED: {err}", "path": target_dir})

    # Save summary report
    report_csv = os.path.join(OUTPUT_DIR, "nfl_youtube_download_report.csv")
    with open(report_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["title", "url", "status", "path"])
        writer.writeheader()
        writer.writerows(results)
    print(f"\\n📊 Download process complete. Report saved to {report_csv}")

if __name__ == "__main__":
    playlists = fetch_playlists(CHANNEL_URL)
    if playlists:
        download_playlist_videos(playlists)
    else:
        print("⚠️ No playlists found matching keyword criteria.")
`;
}

/**
 * Generate n8n Automation Workflow JSON (as detailed in PDF Page 12-16 & 23-24)
 */
export function generateN8nWorkflowJson(config: YtPlaylistScraperConfig): string {
  const workflow = {
    name: "001 - NFL YouTube Playlists & Highlight Downloader via yt-dlp",
    nodes: [
      {
        parameters: {
          path: "nfl-yt-highlights",
          methods: ["POST", "GET"],
          responseMode: "lastNode",
          options: {
            responseData: "={{$json}}"
          }
        },
        id: "node_webhook",
        name: "01 - Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [200, 200]
      },
      {
        parameters: {
          keepOnlySet: false,
          values: {
            string: [
              {
                name: "channel_url",
                value: "={{$json.query.url || $json.body.url || '" + config.channelUrl + "'}}"
              },
              {
                name: "keywords",
                value: "={{$json.query.keywords || $json.body.keywords || '" + config.keywords.join(",") + "'}}"
              },
              {
                name: "output_dir",
                value: "={{$json.query.output_dir || $json.body.output_dir || '" + config.outputDir + "'}}"
              }
            ]
          }
        },
        id: "node_setform",
        name: "02 - Set Form & Keywords",
        type: "n8n-nodes-base.set",
        typeVersion: 2,
        position: [440, 200]
      },
      {
        parameters: {
          command: "bash -lc '\nset -o pipefail\nmkdir -p " + config.outputDir + "\nyt-dlp --flat-playlist -J \"{{ $json.channel_url }}\" | jq -r \".entries[] | select(.title | test(\\\"" + config.keywords.join("|") + "\\\"; \\\"i\\\")) | .webpage_url\" > " + config.outputDir + "/urls.txt\nyt-dlp -a " + config.outputDir + "/urls.txt -f \"bv*+ba/b\" --merge-output-format mp4 -o \"" + config.outputDir + "/%(title)s.%(ext)s\"\n'"
        },
        id: "node_exec",
        name: "03 - Execute yt-dlp Download",
        type: "n8n-nodes-base.executeCommand",
        typeVersion: 1,
        position: [700, 200]
      },
      {
        parameters: {
          fromEmail: "analytics@starstadium.app",
          toEmail: "coach@starstadium.app",
          subject: "🏈 NFL Game Highlights Batch Download Completed",
          text: "The automated highlight matcher downloaded the latest matched videos to " + config.outputDir,
          options: {
            allowUnauthorizedCerts: true
          }
        },
        id: "node_email",
        name: "04 - Email Completion Notification",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2,
        position: [940, 200]
      }
    ],
    connections: {
      "01 - Webhook Trigger": {
        main: [[{ node: "02 - Set Form & Keywords", type: "main", index: 0 }]]
      },
      "02 - Set Form & Keywords": {
        main: [[{ node: "03 - Execute yt-dlp Download", type: "main", index: 0 }]]
      },
      "03 - Execute yt-dlp Download": {
        main: [[{ node: "04 - Email Completion Notification", type: "main", index: 0 }]]
      }
    },
    settings: {
      timezone: "America/Chicago"
    }
  };

  return JSON.stringify(workflow, null, 2);
}

/**
 * Generate Browser Add-on / WebExtension code (from PDF Page 25-26)
 */
export function generateWebExtensionFiles(config: YtPlaylistScraperConfig) {
  const manifest = {
    manifest_version: 3,
    name: "StarStadium NFL YouTube Highlight Harvester",
    version: "1.0.0",
    description: "1-Click Collect and Match NFL Highlights from YouTube Playlists",
    permissions: ["activeTab", "scripting", "downloads"],
    action: { default_popup: "popup.html" },
    host_permissions: ["https://www.youtube.com/*", "https://m.youtube.com/*"]
  };

  const popupHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>NFL Highlight Harvester</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-width: 280px; padding: 12px; background: #09090b; color: #e4e4e7; }
    h3 { margin: 0 0 8px; font-size: 14px; color: #f59e0b; display: flex; align-items: center; gap: 6px; }
    button { width: 100%; padding: 8px; border-radius: 8px; background: #f59e0b; color: #09090b; border: none; font-weight: bold; cursor: pointer; }
    button:hover { background: #fbbf24; }
    p { font-size: 11px; color: #a1a1aa; margin: 8px 0 0; }
  </style>
</head>
<body>
  <h3>🏈 NFL Highlight Harvester</h3>
  <button id="collect">⚡ Extract & Match URLs</button>
  <p id="status">Ready. Open @NFL/playlists tab.</p>
  <script src="popup.js"></script>
</body>
</html>`;

  const popupJs = `async function run() {
  document.getElementById('status').textContent = 'Extracting highlight links...';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const aTags = [...document.querySelectorAll('a[href]')];
      const rows = [];
      for (const a of aTags) {
        const href = a.getAttribute('href');
        if (!href) continue;
        const url = href.startsWith('http') ? href : new URL(href, location.origin).href;
        if (url.includes('/playlist?list=') || url.includes('/watch?v=')) {
          const title = (a.getAttribute('title') || a.textContent || '').trim();
          rows.push({ title, url });
        }
      }
      return rows;
    }
  }).then(async (injectionResults) => {
    const rows = injectionResults[0].result || [];
    const uniq = {};
    const dedup = [];
    for (const r of rows) {
      if (!uniq[r.url]) { uniq[r.url] = 1; dedup.push(r); }
    }
    const jsonBlob = new Blob([JSON.stringify(dedup, null, 2)], { type: 'application/json' });
    const csv = ['title,url', ...dedup.map(r => \`"\${(r.title||'').replace(/"/g, '""')}","\${(r.url||'').replace(/"/g, '""')}"\`)].join('\\n');
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    
    chrome.downloads.download({ url: URL.createObjectURL(jsonBlob), filename: 'nfl_highlight_urls.json' });
    chrome.downloads.download({ url: URL.createObjectURL(csvBlob), filename: 'nfl_highlight_urls.csv' });
    document.getElementById('status').textContent = \`✅ Success! Exported \${dedup.length} matched URLs.\`;
  });
}
document.getElementById('collect').addEventListener('click', run);`;

  return {
    manifest: JSON.stringify(manifest, null, 2),
    popupHtml,
    popupJs
  };
}
