/**
 * Client-side browser fingerprinting utility
 * Generates a unique hash based on User-Agent and Canvas rendering
 */

export async function generateFingerprint(): Promise<string> {
  try {
    const components: string[] = [];

    // 1. User Agent
    components.push(navigator.userAgent);

    // 2. Screen resolution
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

    // 3. Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // 4. Language
    components.push(navigator.language);

    // 5. Canvas fingerprint
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;

      // Draw text with different styles
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Spotonaut 🚀", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Spotonaut 🚀", 4, 17);

      // Get canvas data
      const canvasData = canvas.toDataURL();
      components.push(canvasData);
    }

    // 6. Platform
    components.push(navigator.platform);

    // 7. Hardware concurrency (CPU cores)
    components.push(String(navigator.hardwareConcurrency || 0));

    // Combine all components and hash
    const combined = components.join("|");
    const fingerprint = await hashString(combined);

    return fingerprint;
  } catch (error) {
    console.error("Error generating fingerprint:", error);
    // Fallback to a random string
    return `fallback-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Hash a string using SHA-256
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Get or generate fingerprint from localStorage
 */
export function getStoredFingerprint(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("spotonaut_fingerprint");
}

/**
 * Store fingerprint in localStorage
 */
export function storeFingerprint(fingerprint: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("spotonaut_fingerprint", fingerprint);
}

/**
 * Get or generate and store fingerprint
 */
export async function getOrCreateFingerprint(): Promise<string> {
  const stored = getStoredFingerprint();
  if (stored) return stored;

  const fingerprint = await generateFingerprint();
  storeFingerprint(fingerprint);
  return fingerprint;
}
