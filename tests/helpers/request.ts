export function jsonRequest(url: string, body: unknown, init: RequestInit = {}) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    body: JSON.stringify(body),
    ...init,
  });
}

export function parseSetCookies(response: Response) {
  const raw = (response.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
  const cookies: Record<string, string> = {};
  for (const line of raw) {
    const [pair] = line.split(";");
    const [name, value] = pair.split("=");
    cookies[name.trim()] = value;
  }
  return cookies;
}
