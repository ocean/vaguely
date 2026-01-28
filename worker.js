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

function getLocationData(request) {
  if (!request.cf) {
    return null;
  }
  const { country, region, city, latitude, longitude, postalCode, colo } =
    request.cf;

  // Handle missing fields gracefully.
  const safeValue = (val) => val ?? "unknown";

  return {
    country: safeValue(country),
    region: safeValue(region),
    city: safeValue(city),
    latitude: safeValue(latitude),
    longitude: safeValue(longitude),
    postcode: safeValue(postalCode),
    colo: safeValue(colo),
  };
}

function getTimeData(request) {
  if (!request.cf) {
    return null;
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

  return {
    localTime,
    timezone: safeValue(timezone),
    utcOffset: getUtcOffset(timezone),
    colo: safeValue(colo),
  };
}

function formatLocationResponse(request, asJson = false) {
  const data = getLocationData(request);
  if (!data) {
    return asJson
      ? JSON.stringify({ error: "Unable to retrieve location data" })
      : "Unable to retrieve location data";
  }

  if (asJson) {
    return JSON.stringify({
      preamble: pick(PREAMBLES) + " your location is " + pick(QUALIFIERS),
      data,
      spiritAnimal: pick(SPIRIT_ANIMAL_LABELS) + ": " + pick(ANIMAL_EMOJIS),
    });
  }

  return formatResponse(
    "your location is",
    `country: ${data.country}
region: ${data.region}
city: ${data.city}
latitude: ${data.latitude}
longitude: ${data.longitude}
postcode: ${data.postcode}
cf colo: ${data.colo}`,
  );
}

function formatTimeResponse(request, asJson = false) {
  const data = getTimeData(request);
  if (!data) {
    return asJson
      ? JSON.stringify({ error: "Unable to retrieve timezone data" })
      : "Unable to retrieve timezone data";
  }

  if (asJson) {
    return JSON.stringify({
      preamble: pick(PREAMBLES) + " your time is " + pick(QUALIFIERS),
      data,
      spiritAnimal: pick(SPIRIT_ANIMAL_LABELS) + ": " + pick(ANIMAL_EMOJIS),
    });
  }

  return formatResponse(
    "your time is",
    `local time: ${data.localTime}
timezone: ${data.timezone}
utc offset: ${data.utcOffset}
cf colo: ${data.colo}`,
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

function wantsJson(request) {
  const accept = request.headers.get("Accept") || "";
  return accept.includes("application/json");
}

const ROUTES = {
  "/": () => ({ body: formatRootPage(), type: "text/html" }),
  "/where": (req) => {
    const asJson = wantsJson(req);
    return {
      body: formatLocationResponse(req, asJson),
      type: asJson ? "application/json" : "text/plain",
    };
  },
  "/when": (req) => {
    const asJson = wantsJson(req);
    return {
      body: formatTimeResponse(req, asJson),
      type: asJson ? "application/json" : "text/plain",
    };
  },
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
  getLocationData,
  getTimeData,
  formatLocationResponse,
  formatTimeResponse,
  formatRootPage,
  wantsJson,
};
