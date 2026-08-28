export function flagUrl(code) {
  if (!code) return "";
  return `https://cdn.jsdelivr.net/gh/HatScripts/circle-flags@2.6.0/flags/${String(code).toLowerCase()}.svg`;
}

const MARKET_EMOJI_FLAGS = {
  AE: "🇦🇪",
  SA: "🇸🇦",
  EG: "🇪🇬",
  QA: "🇶🇦",
  KW: "🇰🇼",
  BH: "🇧🇭",
  OM: "🇴🇲",
};

export function marketFlag(code) {
  if (!code) return "🌐";
  return MARKET_EMOJI_FLAGS[String(code).toUpperCase()] || "🌐";
}

export function marketInfo(code) {
  const normalized = String(code || "").toUpperCase();
  return {
    code: normalized,
    flag: marketFlag(normalized),
    flagUrl: flagUrl(normalized),
  };
}
