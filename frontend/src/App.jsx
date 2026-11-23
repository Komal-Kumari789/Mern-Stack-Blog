import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPost, getPosts } from "./api.js";

function formatDate(value) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default function App() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", author: "", content: "" });
  const postsQuery = useQuery({ queryKey: ["posts"], queryFn: getPosts });
  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      setForm({ title: "", author: "", content: "" });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submitPost(event) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="/">FIELDNOTES<span>.</span></a>
        <span className="header-note">Ideas worth keeping</span>
      </header>

      <section className="intro">
        <p className="eyebrow">A COMMUNITY BLOG</p>
        <h1>Stories, thoughts<br />and <em>everything between.</em></h1>
        <p className="intro-copy">A little corner of the internet for things you want to share.</p>
      </section>

      <div className="content-grid">
        <section className="posts-section" aria-labelledby="latest-heading">
          <div className="section-heading">
            <h2 id="latest-heading">Latest notes</h2>
            <span>{postsQuery.data ? `${postsQuery.data.length} posts` : "From the community"}</span>
          </div>

          {postsQuery.isPending && <p className="notice">Loading stories…</p>}
          {postsQuery.isError && <p className="notice error">Could not load posts: {postsQuery.error.message}</p>}
          {postsQuery.data?.length === 0 && <p className="notice">No posts yet. Share the first story.</p>}

          <div className="post-list">
            {postsQuery.data?.map((post) => (
              <article className="post-card" key={post._id}>
                <p className="post-meta">{post.author || "Anonymous"} <span>·</span> {formatDate(post.createdAt)}</p>
                <h3>{post.title}</h3>
                <p className="post-content">{post.content}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="form-panel">
          <p className="eyebrow">YOUR TURN</p>
          <h2>Write a note</h2>
          <p className="form-hint">Have something on your mind? Put it into words.</p>
          <form onSubmit={submitPost}>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={updateField} maxLength="160" required />
            <label htmlFor="author">Your name <span>(optional)</span></label>
            <input id="author" name="author" value={form.author} onChange={updateField} maxLength="80" />
            <label htmlFor="content">Your note</label>
            <textarea id="content" name="content" value={form.content} onChange={updateField} rows="6" maxLength="20000" required />
            {createMutation.isError && <p className="form-error">{createMutation.error.message}</p>}
            <button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Publishing…" : "Publish note"} <span aria-hidden="true">→</span>
            </button>
            {createMutation.isSuccess && <p className="success-message">Your note is live. Thank you for sharing.</p>}
          </form>
        </aside>
      </div>

      <footer>Made for curious minds <span>·</span> Assignment 4</footer>
    </main>
  );
}
