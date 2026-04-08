import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * tts-generate — Server-side text-to-speech via Google Cloud TTS API.
 *
 * Accepts an array of text lines, concatenates them with SSML pauses,
 * sends to Google Cloud TTS, returns MP3 audio as binary stream.
 *
 * Request body:
 *   { lines: string[], voice?: string, speed?: number }
 *
 * Response:
 *   Binary MP3 audio (Content-Type: audio/mpeg)
 *
 * Voices (Google Cloud TTS):
 *   nova    → en-US-Neural2-F (female, warm)
 *   shimmer → en-US-Neural2-C (female, friendly)
 *   echo    → en-US-Neural2-D (male, calm)
 *   onyx    → en-US-Neural2-J (male, confident)
 *
 * Cost: WaveNet/Neural2 ~$16 per 1M chars, Standard ~$4 per 1M chars
 * Free tier: 1M WaveNet chars/month
 */

// Map our friendly voice names to Google Cloud TTS voice IDs
const VOICE_MAP: Record<string, { name: string; ssmlGender: string }> = {
  nova:    { name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
  shimmer: { name: 'en-US-Neural2-C', ssmlGender: 'FEMALE' },
  echo:    { name: 'en-US-Neural2-D', ssmlGender: 'MALE' },
  onyx:    { name: 'en-US-Neural2-J', ssmlGender: 'MALE' },
}

/**
 * Build SSML from content lines.
 * Our content format uses '...' for pauses — convert to SSML <break> tags.
 * SSML gives much better control over pacing than plain text.
 */
function buildSSML(lines: string[]): string {
  const parts: string[] = ['<speak>']

  for (const line of lines) {
    if (line === '...') {
      parts.push('<break time="1800ms"/>')
    } else if (line && line.trim()) {
      // Escape XML special characters
      const escaped = line.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
      parts.push(`<s>${escaped}</s>`)
      // Small pause between sentences for natural rhythm
      parts.push('<break time="400ms"/>')
    }
  }

  parts.push('</speak>')
  return parts.join('\n')
}

/**
 * Get Google Cloud access token from service account key.
 * Uses JWT grant flow (no oauth library needed).
 */
async function getGoogleAccessToken(serviceAccountKey: string): Promise<string> {
  const sa = JSON.parse(serviceAccountKey)
  const now = Math.floor(Date.now() / 1000)

  // Create JWT header + payload
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  // Base64url encode
  const b64url = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const unsignedJwt = `${b64url(header)}.${b64url(payload)}`

  // Sign with RSA private key
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedJwt)
  )

  const sig64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const jwt = `${unsignedJwt}.${sig64}`

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Google auth failed: ${tokenRes.status} ${err}`)
  }

  const tokenData = await tokenRes.json()
  return tokenData.access_token
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Auth check ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- Parse body ---
    const { lines, voice = 'nova', speed = 1.0 } = await req.json()

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return new Response(JSON.stringify({ error: 'lines array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Resolve voice
    const voiceConfig = VOICE_MAP[voice] || VOICE_MAP.nova

    // Clamp speed (Google supports 0.25 - 4.0)
    const selectedSpeed = Math.max(0.25, Math.min(4.0, speed))

    // --- Build SSML ---
    const ssml = buildSSML(lines)

    // Google Cloud TTS has a 5000 byte SSML limit per request.
    // For longer content, we need to chunk.
    const MAX_SSML_BYTES = 4800 // Leave some headroom
    const ssmlBytes = new TextEncoder().encode(ssml).length

    // --- Get Google auth token ---
    const GCP_SERVICE_ACCOUNT_KEY = Deno.env.get('GCP_SERVICE_ACCOUNT_KEY')
    if (!GCP_SERVICE_ACCOUNT_KEY) {
      return new Response(JSON.stringify({ error: 'TTS service not configured. Set GCP_SERVICE_ACCOUNT_KEY.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const accessToken = await getGoogleAccessToken(GCP_SERVICE_ACCOUNT_KEY)

    // --- Chunk if needed ---
    const ssmlChunks: string[] = []

    if (ssmlBytes <= MAX_SSML_BYTES) {
      ssmlChunks.push(ssml)
    } else {
      // Split lines into chunks, each wrapped in <speak>
      let currentLines: string[] = []
      let currentSize = 0
      const overhead = 40 // <speak></speak> + margins

      for (const line of lines) {
        // Estimate SSML size for this line
        const lineSSML = line === '...'
          ? '<break time="1800ms"/>'
          : `<s>${line.trim()}</s><break time="400ms"/>`
        const lineBytes = new TextEncoder().encode(lineSSML).length

        if (currentSize + lineBytes + overhead > MAX_SSML_BYTES && currentLines.length > 0) {
          // Flush current chunk
          ssmlChunks.push(buildSSML(currentLines))
          currentLines = []
          currentSize = 0
        }

        currentLines.push(line)
        currentSize += lineBytes
      }

      if (currentLines.length > 0) {
        ssmlChunks.push(buildSSML(currentLines))
      }
    }

    // --- Call Google Cloud TTS API ---
    const audioChunks: Uint8Array[] = []

    for (let i = 0; i < ssmlChunks.length; i++) {
      const chunk = ssmlChunks[i]

      // Retry up to 2 times per chunk (3 attempts total)
      let lastError = ''
      let success = false

      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, attempt * 1000))
        }

        try {
          const ttsResponse = await fetch(
            'https://texttospeech.googleapis.com/v1/text:synthesize',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: { ssml: chunk },
                voice: {
                  languageCode: 'en-US',
                  name: voiceConfig.name,
                  ssmlGender: voiceConfig.ssmlGender,
                },
                audioConfig: {
                  audioEncoding: 'MP3',
                  speakingRate: selectedSpeed,
                  pitch: 0,
                  // Slightly boost volume for clarity
                  volumeGainDb: 1.0,
                },
              }),
            }
          )

          if (!ttsResponse.ok) {
            lastError = `Google TTS ${ttsResponse.status}: ${await ttsResponse.text()}`
            console.error(`TTS chunk ${i + 1}/${ssmlChunks.length} attempt ${attempt + 1} failed:`, lastError)
            continue
          }

          const result = await ttsResponse.json()
          // Google returns base64-encoded audio in audioContent field
          const audioBytes = Uint8Array.from(
            atob(result.audioContent),
            (c) => c.charCodeAt(0)
          )
          audioChunks.push(audioBytes)
          success = true
          break
        } catch (fetchErr) {
          lastError = (fetchErr as Error).message || 'Network error'
          console.error(`TTS chunk ${i + 1}/${ssmlChunks.length} attempt ${attempt + 1} fetch error:`, lastError)
        }
      }

      if (!success) {
        return new Response(JSON.stringify({
          error: `TTS generation failed on chunk ${i + 1}/${ssmlChunks.length}`,
          detail: lastError,
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Combine audio chunks into single MP3 buffer
    const totalLength = audioChunks.reduce((sum, c) => sum + c.length, 0)
    const combined = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of audioChunks) {
      combined.set(chunk, offset)
      offset += chunk.length
    }

    // Return binary MP3 audio
    return new Response(combined.buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'X-TTS-Voice': voiceConfig.name,
        'X-TTS-Speed': String(selectedSpeed),
        'X-TTS-Chars': String(lines.filter(l => l !== '...').join(' ').length),
        'X-TTS-Chunks': String(ssmlChunks.length),
      },
    })

  } catch (err) {
    console.error('tts-generate error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
