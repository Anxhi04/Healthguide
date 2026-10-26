// Service-account JWTs use the system clock for both issuance and cache expiry.
export function assertFirebaseClock(localTime: number, googleTime: number) {
  const skewSeconds = Math.round((googleTime - localTime) / 1000);
  if (Math.abs(skewSeconds) > 300) {
    const error = new Error(
      `System clock differs from Google by ${skewSeconds} seconds. Synchronize the system clock and restart the backend; Firebase service-account tokens require accurate UTC time.`
    ) as Error & { code: string };
    error.code = "FIREBASE_CLOCK_SKEW";
    throw error;
  }
}

export async function verifyFirebaseClock() {
  let lastError: unknown;
  for (const endpoint of ["https://www.googleapis.com/oauth2/v3/certs", "https://oauth2.googleapis.com/token"]) {
    try {
      const started = Date.now();
      const response = await fetch(`${endpoint}?clockcheck=${started}`, {
        headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(5000),
      });
      const finished = Date.now();
      await response.body?.cancel();
      // HTTP error responses also carry a valid server clock (GET /token is not an OAuth exchange).
      const date = Date.parse(response.headers.get("date") || "");
      const age = Number(response.headers.get("age") || "0");
      if (!Number.isFinite(date) || !Number.isFinite(age) || age < 0) {
        throw new Error("Firebase clock check did not return a valid server Date header");
      }
      assertFirebaseClock((started + finished) / 2, date + age * 1000);
      return;
    } catch (error) {
      if ((error as { code?: string }).code === "FIREBASE_CLOCK_SKEW") throw error;
      lastError = error;
    }
  }
  throw lastError;
}
