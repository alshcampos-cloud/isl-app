#!/usr/bin/env node
/**
 * generate-lesson-audio.js — Pre-generate MP3 audio for all Learn lessons
 *
 * Uses Google Cloud Text-to-Speech API to generate high-quality audio files
 * from the lesson scripts in learningContent.js.
 *
 * Output: 25 MP3 files (one per lesson) in /public/audio/lessons/
 * Format: MP3, 32kbps mono (speech-optimized, ~625KB per 4-min lesson)
 * Total: ~15 MB for all 25 lessons
 *
 * Cost: $0 (41,500 chars falls within Google Cloud TTS free tier of 1M chars/month)
 *
 * Prerequisites:
 *   1. Google Cloud project with Text-to-Speech API enabled
 *   2. GOOGLE_TTS_API_KEY environment variable set
 *      OR service account JSON at GOOGLE_APPLICATION_CREDENTIALS
 *
 * Usage:
 *   GOOGLE_TTS_API_KEY=your-key node scripts/generate-lesson-audio.js
 *
 *   # Or with service account:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/generate-lesson-audio.js
 *
 * Options:
 *   --lesson 1-1    Generate only a specific lesson
 *   --voice en-US-Neural2-D   Use a specific voice (default: en-US-Neural2-D)
 *   --dry-run       Show what would be generated without calling the API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── Configuration ───────────────────────────────────────────
const VOICE = process.argv.includes('--voice')
  ? process.argv[process.argv.indexOf('--voice') + 1]
  : 'en-US-Neural2-D'; // Male, professional, clear enunciation

const SPEAKING_RATE = 0.95; // Slightly slower than natural for learning
const PITCH = -1.0; // Slightly lower pitch for authority
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio', 'lessons');
const DRY_RUN = process.argv.includes('--dry-run');
const SINGLE_LESSON = process.argv.includes('--lesson')
  ? process.argv[process.argv.indexOf('--lesson') + 1]
  : null;

// ─── Load lesson content ─────────────────────────────────────
// We need to extract the audioScript arrays from learningContent.js
// Since it uses ESM exports, we'll parse it differently
function loadLessons() {
  const contentPath = path.join(__dirname, '..', 'src', 'utils', 'learningContent.js');
  const content = fs.readFileSync(contentPath, 'utf8');

  // Extract all audioScript arrays using regex
  const lessons = [];
  const lessonRegex = /id:\s*'(\d+-\d+)',\s*\n\s*title:\s*'([^']+)',[\s\S]*?audioScript:\s*\[([\s\S]*?)\],\s*\n\s*keyTakeaways/g;

  let match;
  while ((match = lessonRegex.exec(content)) !== null) {
    const id = match[1];
    const title = match[2];
    const scriptRaw = match[3];

    // Parse the audioScript array entries
    const lines = [];
    const lineRegex = /"([^"]*?)"|'([^']*?)'/g;
    let lineMatch;
    while ((lineMatch = lineRegex.exec(scriptRaw)) !== null) {
      const line = lineMatch[1] || lineMatch[2];
      if (line === '...') {
        lines.push('<break time="2s"/>'); // SSML pause
      } else if (line && line.trim()) {
        lines.push(line);
      }
    }

    lessons.push({ id, title, lines });
  }

  return lessons;
}

// ─── Build SSML from lesson lines ────────────────────────────
function buildSSML(lines) {
  let ssml = '<speak>';
  for (const line of lines) {
    if (line.startsWith('<break')) {
      ssml += line;
    } else {
      ssml += `<s>${line}</s> `;
    }
  }
  ssml += '</speak>';
  return ssml;
}

// ─── Call Google Cloud TTS API ───────────────────────────────
function generateAudio(ssml, outputPath) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      reject(new Error('GOOGLE_TTS_API_KEY environment variable not set'));
      return;
    }

    const requestBody = JSON.stringify({
      input: { ssml },
      voice: {
        languageCode: 'en-US',
        name: VOICE,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: SPEAKING_RATE,
        pitch: PITCH,
        sampleRateHertz: 24000,
      },
    });

    const options = {
      hostname: 'texttospeech.googleapis.com',
      path: `/v1/text:synthesize?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`TTS API error: ${response.error.message}`));
            return;
          }
          if (!response.audioContent) {
            reject(new Error('No audio content in response'));
            return;
          }

          // Write MP3 file
          const audioBuffer = Buffer.from(response.audioContent, 'base64');
          fs.writeFileSync(outputPath, audioBuffer);
          resolve(audioBuffer.length);
        } catch (e) {
          reject(new Error(`Failed to parse TTS response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('📚 InterviewAnswers.ai — Lesson Audio Generator');
  console.log(`   Voice: ${VOICE}`);
  console.log(`   Speed: ${SPEAKING_RATE}x`);
  console.log(`   Output: ${OUTPUT_DIR}`);
  console.log('');

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Load lessons
  const lessons = loadLessons();
  console.log(`   Found ${lessons.length} lessons\n`);

  if (lessons.length === 0) {
    console.error('❌ No lessons found! Check learningContent.js format.');
    process.exit(1);
  }

  // Filter to single lesson if specified
  const toGenerate = SINGLE_LESSON
    ? lessons.filter(l => l.id === SINGLE_LESSON)
    : lessons;

  if (SINGLE_LESSON && toGenerate.length === 0) {
    console.error(`❌ Lesson "${SINGLE_LESSON}" not found`);
    process.exit(1);
  }

  let totalChars = 0;
  let totalBytes = 0;

  for (const lesson of toGenerate) {
    const ssml = buildSSML(lesson.lines);
    const charCount = lesson.lines.join(' ').length;
    totalChars += charCount;

    const outputPath = path.join(OUTPUT_DIR, `lesson-${lesson.id}.mp3`);

    if (DRY_RUN) {
      console.log(`   [DRY RUN] ${lesson.id}: "${lesson.title}" — ${charCount} chars, ${lesson.lines.length} lines`);
      continue;
    }

    process.stdout.write(`   Generating ${lesson.id}: "${lesson.title}" (${charCount} chars)... `);

    try {
      const bytes = await generateAudio(ssml, outputPath);
      totalBytes += bytes;
      const sizeKB = Math.round(bytes / 1024);
      console.log(`✅ ${sizeKB} KB`);
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }

    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('');
  console.log(`   Total characters: ${totalChars.toLocaleString()}`);
  if (!DRY_RUN) {
    console.log(`   Total audio size: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  }
  console.log(`   Estimated TTS cost: $${(totalChars * 16 / 1000000).toFixed(2)} (Neural2 rate)`);
  console.log(`   Free tier covers: ${(1000000 / totalChars).toFixed(0)}x this amount`);
  console.log('');
  console.log('   Upload files to Supabase Storage:');
  console.log('   supabase storage cp public/audio/lessons/* storage://lesson-audio/');
  console.log('');
  console.log('🎉 Done!');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
