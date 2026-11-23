const apiBaseUrl = import.meta.env.VITE_API_URL || "";

async function request(path, options) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
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
