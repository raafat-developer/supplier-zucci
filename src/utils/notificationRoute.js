/**
 * Helper to validate and normalize notification action URLs against the system router.
 * Handles dynamic ID parameters (e.g. /orders/:id, /products/:id, /brands/:id),
 * API prefix stripping (/supplier/catalog/products/:id -> /app/products/:id),
 * and missing /app prefixes.
 *
 * If the URL is null, empty, or unresolvable, it safely falls back to '/app/notifications'.
 */
export function getValidNotificationUrl(url, router) {
  if (!url || typeof url !== "string" || !url.trim()) {
    return "/app/notifications";
  }

  let trimmed = url.trim();

  // 1. External URLs (e.g. https://domain.com)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Ensure leading slash
  if (!trimmed.startsWith("/")) {
    trimmed = "/" + trimmed;
  }

  // 2. Strip API prefixes from backend notification URLs
  if (trimmed.startsWith("/supplier/catalog/products")) {
    trimmed = trimmed.replace("/supplier/catalog/products", "/products");
  } else if (trimmed.startsWith("/supplier/products")) {
    trimmed = trimmed.replace("/supplier/products", "/products");
  } else if (trimmed.startsWith("/supplier/orders")) {
    trimmed = trimmed.replace("/supplier/orders", "/orders");
  } else if (trimmed.startsWith("/supplier/business")) {
    trimmed = "/settings/business";
  } else if (trimmed.startsWith("/supplier/brands")) {
    trimmed = trimmed.replace("/supplier/brands", "/settings/brands");
  } else if (trimmed.startsWith("/supplier/")) {
    trimmed = "/" + trimmed.slice("/supplier/".length);
  }

  // 3. Map settings shortcuts
  if (trimmed.startsWith("/brands")) {
    trimmed = "/settings" + trimmed;
  } else if (trimmed.startsWith("/business")) {
    trimmed = "/settings" + trimmed;
  } else if (trimmed.startsWith("/team")) {
    trimmed = "/settings" + trimmed;
  } else if (trimmed.startsWith("/integrations")) {
    trimmed = "/settings" + trimmed;
  }

  // 4. Ensure /app prefix
  if (
    !trimmed.startsWith("/app/") &&
    trimmed !== "/app" &&
    !trimmed.startsWith("/login") &&
    !trimmed.startsWith("/register") &&
    !trimmed.startsWith("/pending")
  ) {
    trimmed = "/app" + trimmed;
  }

  // 5. Verify route with Vue Router if provided
  if (router && typeof router.resolve === "function") {
    try {
      const resolved = router.resolve(trimmed);
      const isValid =
        resolved &&
        resolved.matched &&
        resolved.matched.length > 0 &&
        resolved.name !== "NotFound" &&
        !resolved.matched.some(
          (m) =>
            m.name === "NotFound" ||
            (m.path && (m.path.includes(":pathMatch") || m.path.includes("catchAll"))),
        );

      if (isValid) {
        return trimmed;
      }

      // If the route is not registered in the system router, safely fallback to notifications
      return "/app/notifications";
    } catch (_) {
      return "/app/notifications";
    }
  }

  // If path starts with /app, return normalized path directly
  if (trimmed.startsWith("/app")) {
    return trimmed;
  }

  return "/app/notifications";
}
