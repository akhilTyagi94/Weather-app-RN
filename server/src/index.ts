export interface Env {
  OWM_API_KEY: string;
  PROXY_SHARED_SECRET: string;
}

const OWM_HOST = "https://api.openweathermap.org";

// Only these OpenWeatherMap path prefixes may be requested through this
// proxy -- keeps it from being usable as an open proxy to arbitrary hosts.
const ALLOWED_PREFIXES = ["data/2.5/", "data/3.0/", "geo/1.0/"];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/owm") {
      return new Response("Not found", { status: 404 });
    }

    // Not a secret the OWM key needs to stay hidden behind -- this just
    // keeps strangers from burning through the Worker's free-tier quota by
    // hitting the public URL directly.
    const clientKey = request.headers.get("X-Client-Key");
    if (!clientKey || clientKey !== env.PROXY_SHARED_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const target = url.searchParams.get("target");
    if (!target) {
      return new Response("Missing target", { status: 400 });
    }

    if (!ALLOWED_PREFIXES.some((prefix) => target.startsWith(prefix))) {
      return new Response("Forbidden target", { status: 403 });
    }

    const separator = target.includes("?") ? "&" : "?";
    const owmUrl = `${OWM_HOST}/${target}${separator}appid=${env.OWM_API_KEY}`;

    const owmResponse = await fetch(owmUrl);
    const body = await owmResponse.text();

    return new Response(body, {
      status: owmResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  },
};
