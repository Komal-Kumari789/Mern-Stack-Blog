const rawApiBaseUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
const apiBaseUrl = rawApiBaseUrl === "/api" ? "" : rawApiBaseUrl;

function buildApiUrl(path) {
  if (apiBaseUrl.endsWith("/api") && path.startsWith("/api/")) {
    return `${apiBaseUrl}${path.slice(4)}`;
  }
  return `${apiBaseUrl}${path}`;
}

async function request(path, options) {
  const response = await fetch(buildApiUrl(path), {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json();
}

export function getPosts() {
  return request("/api/posts");
}

export function createPost(post) {
  return request("/api/posts", {
    method: "POST",
    body: JSON.stringify(post),
  });
}
