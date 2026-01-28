// prettier-ignore
const ANIMAL_EMOJIS = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
  "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒",
  "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗",
  "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🪰",
  "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀",
  "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆",
  "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘",
  "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🐐", "🦌", "🐕",
  "🐩", "🦮", "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦗", "🕷", "🦂",
];

const PREAMBLES = [
  "The Cloudflare soothsayers said",
  "The Cloudflare daemons said",
  "The Cloudflare admins said",
  "The Cloudflare contractors said",
  "The Cloudflare oracles announced",
  "The Cloudflare seers divined",
  "The Cloudflare augurs proclaimed",
  "The Cloudflare mystics revealed",
  "The Cloudflare prophets declared",
  "The Cloudflare wise ones pronounced",
  "The Cloudflare ancients whispered",
];

const SPIRIT_ANIMAL_LABELS = [
  "spirit animal for this request:",
  "animal guide for this request:",
  "companion animal for this request:",
  "mystical being of this moment:",
  "animal guardian for this request:",
  "creature companion of this moment:",
];

const QUALIFIERS = [
  "roughly",
  "most likely",
  "probably",
  "kinda",
  "sorta",
  "seemingly",
  "vaguely",
  "supposedly",
  "somewhere around",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getUtcOffset(timezone) {
  if (!timezone) return "UTC+??:??";
  try {
    const parts = new Intl.DateTimeFormat("en-AU", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const raw =
      parts.find((p) => p.type === "timeZoneName")?.value ?? "UTC+??:??";
    // Convert GMT±X or GMT±X:XX to UTC±XX:XX for standard display.
    return raw
      .replace("GMT", "UTC")
      .replace(/([+-])(\d)(?=:|$)/, "$10$2")
      .replace(/([+-]\d{2})$/, "$1:00");
  } catch {
    return "UTC+??:??";
  }
}

function formatResponse(intro, body) {
  const preamble = pick(PREAMBLES);
  const qualifier = pick(QUALIFIERS);
  const animal = pick(ANIMAL_EMOJIS);
  const spiritLabel = pick(SPIRIT_ANIMAL_LABELS);
  return `${preamble} ${intro} ${qualifier}:\n\n${body}\n\n${spiritLabel} ${animal}`;
}

function formatLocationResponse(request) {
  if (!request.cf) {
    return "Unable to retrieve location data";
  }
  const { country, region, city, latitude, longitude, postalCode, colo } =
    request.cf;

  // Handle missing fields gracefully.
  const safeValue = (val) => val ?? "unknown";

  return formatResponse(
    "your location is",
    `country: ${safeValue(country)}
region: ${safeValue(region)}
city: ${safeValue(city)}
latitude: ${safeValue(latitude)}
longitude: ${safeValue(longitude)}
postcode: ${safeValue(postalCode)}
cf colo: ${safeValue(colo)}`,
  );
}

function formatTimeResponse(request) {
  if (!request.cf) {
    return "Unable to retrieve timezone data";
  }
  const { timezone, colo } = request.cf;

  // Handle missing timezone gracefully.
  const safeValue = (val) => val ?? "unknown";
  let localTime = "unknown";

  if (timezone) {
    try {
      localTime = new Date().toLocaleString("en-AU", { timeZone: timezone });
    } catch {
      localTime = "unknown";
    }
  }

  return formatResponse(
    "your time is",
    `local time: ${localTime}
timezone: ${safeValue(timezone)}
utc offset: ${getUtcOffset(timezone)}
cf colo: ${safeValue(colo)}`,
  );
}

function formatRootPage() {
  const animal = pick(ANIMAL_EMOJIS);

  return `<!DOCTYPE html>
<html>
<head>
  <title>Vaguely</title>
  <style>
    body { padding: 2em; font-family: monospace; color: #333; }
    h1 { color: #f6821f; }
    .route { margin: 1em 0; }
    .path { font-weight: bold; color: #0066cc; }
    .desc { color: #666; margin-left: 2em; }
  </style>
</head>
<body>
  <h1>Vaguely ${animal}</h1>
  <p>A service for vague information.</p>

  <h2>Abilities:</h2>

  <div class="route">
    <div class="path">/where</div>
    <div class="desc">Where you are, roughly.</div>
  </div>

  <div class="route">
    <div class="path">/when</div>
    <div class="desc">When you are, mostly.</div>
  </div>
</body>
</html>`;
}

const ROUTES = {
  "/": () => ({ body: formatRootPage(), type: "text/html" }),
  "/where": (req) => ({
    body: formatLocationResponse(req),
    type: "text/plain",
  }),
  "/when": (req) => ({ body: formatTimeResponse(req), type: "text/plain" }),
};

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const route = ROUTES[pathname] || ROUTES[pathname === "" ? "/" : null];

    if (!route) {
      return new Response("404 - Unknown path. Try /where or /when", {
        status: 404,
        headers: { "content-type": "text/plain;charset=UTF-8" },
      });
    }

    const { body, type } = route(request);
    return new Response(body, {
      headers: { "content-type": `${type};charset=UTF-8` },
    });
  },
};

// Export functions for testing.
export {
  pick,
  getUtcOffset,
  formatResponse,
  formatLocationResponse,
  formatTimeResponse,
  formatRootPage,
};
