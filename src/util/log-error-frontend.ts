export async function logErrorFrontend({
  url,
  error,
}: {
  url: string;
  error: Record<string, unknown>;
}) {
  try {
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, error }),
    });
  } catch (err) {
    console.error("Failed to report frontend error", err);
  }
}
