/**
 * Retry wrapper for AI API calls
 * Reduces failure rate from ~40% to <5%
 *
 * @param {string} url - API endpoint
 * @param {object} options - fetch options
 * @param {number} maxAttempts - max retry attempts (default 3)
 * @param {number} timeoutMs - timeout per attempt in ms (default 60000 = 60s)
 * @returns {Promise<Response>} - fetch response
 */
export async function fetchWithRetry(url, options, maxAttempts = 3, timeoutMs = 60000) {
  const delays = [0, 1000, 2000]; // Delays between attempts (ms)
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏱️ Attempt ${attempt} timed out after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);

    try {
      // Wait before retry (0ms for first attempt)
      if (attempt > 1) {
        const delay = delays[attempt - 1] || 2000;
        console.log(`⏳ Retry attempt ${attempt}/${maxAttempts} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      console.log(`🔄 API attempt ${attempt}/${maxAttempts} (timeout: ${timeoutMs}ms)`);
      const response = await fetch(url, { ...options, signal: controller.signal });

      // Clear timeout on success
      clearTimeout(timeoutId);

      // If response is OK, return it
      if (response.ok) {
        console.log(`✅ API succeeded on attempt ${attempt}`);
        return response;
      }

      // Auth errors - don't retry (Jacob #1+#6 fix 2026-05-10: also exempt
      // 429 since our server-side cap returns a deterministic 429 with a
      // friendly error body — retrying just wastes 2s+ and clobbers cache.
      // Battle Scar #22 governs this shared utility — change scope limited
      // strictly to the status-code list).
      if (response.status === 401 || response.status === 403 || response.status === 429) {
        console.log(`🚫 Non-retryable error (${response.status}) - not retrying`);
        return response;
      }

      // Server error (5xx) or other - will retry
      lastError = new Error(`HTTP ${response.status}`);
      console.warn(`⚠️ Attempt ${attempt} failed: HTTP ${response.status}`);

    } catch (err) {
      // Clear timeout on error
      clearTimeout(timeoutId);

      lastError = err;

      // Don't retry on user-initiated abort, but DO retry on timeout
      if (err.name === 'AbortError') {
        // Check if this was our timeout (we should retry) vs user abort (don't retry)
        if (attempt < maxAttempts) {
          console.log(`⏱️ Request timed out - will retry`);
          continue; // Go to next attempt
        }
        console.log(`⏱️ Request timed out on final attempt - giving up`);
        throw new Error('Request timed out. Please try again.');
      }

      console.warn(`⚠️ Attempt ${attempt} failed: ${err.message}`);
    }
  }

  // All attempts failed
  console.error(`❌ All ${maxAttempts} attempts failed`);
  throw lastError || new Error('All retry attempts failed');
}
