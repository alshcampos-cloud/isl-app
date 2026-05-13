// flow-clip-download-helper.js
// ----------------------------
// Paste this entire file into the Chrome DevTools Console while you're on
// a Flow project page (https://labs.google/fx/tools/flow/project/<ID>).
//
// What it does:
//   1. Enumerates every <video> element on the current Flow project page.
//   2. For each one, opens the source URL in a new tab — Chrome will
//      auto-redirect to the actual storage URL and let you Save Page As / use
//      the native "Save Video As" right-click option.
//
// Why it's manual: Flow's tRPC media endpoint returns 401 to scripted fetches
// but works inside <video> elements (different auth flow). We can't bulk-fetch
// blobs from JS, so the pragmatic recovery is one-clip-at-a-time via the
// browser's own native download.
//
// Quick alternative — record while playing:
//   1. Play each clip in Flow at 1× speed.
//   2. Use macOS Screen Recording (Cmd+Shift+5) to capture the video area.
//   3. Quality is lossy but recoverable for paid amplification.
//
// Best path: use Flow's own "More options → Download" UI for each clip.
// This helper just lists what's on the page so you don't miss any.

(async () => {
  // Scroll the page to make sure all clips are rendered (lazy-loading)
  const scroller = document.scrollingElement || document.documentElement;
  for (let i = 0; i < 4; i++) {
    scroller.scrollTo(0, scroller.scrollHeight);
    await new Promise(r => setTimeout(r, 800));
    scroller.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 500));
  }

  const videos = Array.from(document.querySelectorAll('video'));
  console.log(`%c=== Flow clip download helper ===`, 'font-weight:bold; color:#0E1D30');
  console.log(`Found ${videos.length} <video> elements on this page.`);

  const projectMatch = location.pathname.match(/\/project\/([^/]+)/);
  const projectId = projectMatch ? projectMatch[1].substring(0, 8) : 'unknown';
  const tabTitle = document.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);

  const seen = new Set();
  const clips = [];
  videos.forEach((v, i) => {
    const src = v.currentSrc || v.src;
    if (!src || seen.has(src)) return;
    seen.add(src);
    const uuid = (src.match(/name=([^&]+)/) || [])[1] || ('idx' + i);
    clips.push({
      idx: i + 1,
      uuid: uuid.substring(0, 8),
      src,
      w: v.videoWidth || v.width,
      h: v.videoHeight || v.height,
      dur: v.duration || 0,
      poster: v.poster || '',
    });
  });

  console.log(`Unique clips: ${clips.length}`);
  console.table(clips.map(c => ({ idx: c.idx, uuid: c.uuid, dims: `${c.w}x${c.h}`, dur: c.dur.toFixed(1), src: c.src.substring(0, 80) })));

  // Save the inventory as a JSON download so you have a manifest.
  const inventory = {
    project_id: projectId,
    project_title: document.title,
    captured_at: new Date().toISOString(),
    clip_count: clips.length,
    clips: clips.map((c, i) => ({
      suggested_filename: `flow_${projectId}_${tabTitle}_${String(i + 1).padStart(2, '0')}_${c.uuid}.mp4`,
      url: c.src,
      dimensions: `${c.w}x${c.h}`,
      duration_sec: c.dur,
      poster_url: c.poster,
    })),
  };
  const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `flow_inventory_${projectId}_${tabTitle}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  console.log(`%cSaved inventory to: ${a.download}`, 'font-weight:bold; color:green');

  // Open each clip URL in a new tab — Chrome's redirect will land on actual storage URL,
  // and the user can then "Save As" via right-click or native Cmd+S.
  console.log(`%cOpening each clip in a new tab (you'll see ${clips.length} new tabs)`, 'color:#0E1D30');
  console.log(`On each tab: right-click the video → "Save Video As..." → save with the suggested filename`);
  console.log(`Inventory JSON has the suggested filenames.`);
  for (const c of clips) {
    window.open(c.src, '_blank');
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(`%cAll ${clips.length} tabs opened. Save each video, then close.`, 'font-weight:bold; color:green');
})();
