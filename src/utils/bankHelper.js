/**
 * Utility to map well-known regional bank names to their official domain logo URLs.
 * Uses Hunter.io Logo API (free, no API key required).
 * 
 * If the bank name is not in the predefined list, it cleans the name and attempts
 * to guess the domain (e.g., "Alex Bank" -> "alex.com"). If the guess fails to load,
 * the frontend's @error fallback will render the default bank SVG icon.
 * 
 * @param {string} bankName - The raw name of the bank.
 * @returns {string} The logo image URL, or an empty string if not mapped.
 */
export function getBankLogo(bankName) {
  if (!bankName) return "";
  const name = bankName.toLowerCase().trim();

  // 1. Predefined mappings for well-known regional banks
  if (name.includes("national bank of egypt") || name.includes("nbe")) {
    return "https://logos.hunter.io/nbe.com.eg";
  }
  if (name.includes("banque misr")) {
    return "https://logos.hunter.io/banquemisr.com";
  }
  if (name.includes("commercial international bank") || name.includes("cib")) {
    return "https://logos.hunter.io/cibeg.com";
  }
  if (name.includes("qnb")) {
    return "https://logos.hunter.io/qnbalahli.com";
  }
  if (name.includes("hsbc")) {
    return "https://logos.hunter.io/hsbc.com";
  }
  if (name.includes("adcb") || name.includes("abu dhabi commercial bank")) {
    return "https://logos.hunter.io/adcb.com";
  }
  if (name.includes("emirates nbd") || name.includes("nbd")) {
    return "https://logos.hunter.io/emiratesnbd.com";
  }
  if (name.includes("fab") || name.includes("first abu dhabi bank")) {
    return "https://logos.hunter.io/bankfab.com";
  }
  if (name.includes("mashreq")) {
    return "https://logos.hunter.io/mashreqbank.com";
  }
  if (name.includes("dubai islamic bank") || name.includes("dib")) {
    return "https://logos.hunter.io/dib.ae";
  }
  if (name.includes("al rajhi") || name.includes("rajhi")) {
    return "https://logos.hunter.io/alrajhibank.com.sa";
  }
  if (
    name.includes("snb") ||
    name.includes("saudi national bank") ||
    name.includes("alahli")
  ) {
    return "https://logos.hunter.io/alahli.com";
  }
  if (name.includes("riyad")) {
    return "https://logos.hunter.io/riyadbank.com";
  }
  if (name.includes("alinma")) {
    return "https://logos.hunter.io/alinma.com";
  }
  if (name.includes("sab ") || name.includes("awwal")) {
    return "https://logos.hunter.io/sab.com";
  }

  // 2. Generic Guess Fallback Strategy
  // Clean special characters and keep alphanumeric strings
  let cleanName = name
    .replace(/[^a-z0-9\s]/g, "") // remove special chars but keep spaces
    .replace(/\s+/g, " ")       // normalize spaces
    .trim();

  // If the name ends with "bank", remove it to get the brand domain (e.g. "alex bank" -> "alex")
  if (cleanName.endsWith(" bank") && cleanName.length > 5) {
    cleanName = cleanName.slice(0, -5).trim();
  }

  // Remove spaces to construct the domain (e.g. "cairo bank" -> "cairo")
  const domainPrefix = cleanName.replace(/\s+/g, "");
  if (!domainPrefix) return "";

  // Return guessed domain Logo URL
  return `https://logos.hunter.io/${domainPrefix}.com`;
}
