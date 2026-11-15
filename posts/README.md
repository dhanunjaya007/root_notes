# Rootnotes Posts

Each post in Rootnotes lives in its own dedicated file inside this `posts/` directory.

## Current Posts
- `center-of-gravity.js`: The Center of Gravity method: an optimizer with no learning rate
- `silent-data-leakage.js`: Silent Failures: Where Data Leakage Actually Hides in Machine Learning

---

## How to Add a New Post

1. **Create a new file** in `posts/`, e.g. `posts/my-new-post.js`.
2. **Follow this template**:

```javascript
(function () {
  var r = String.raw; // Allows using LaTeX backslashes without double-escaping
  (window.POSTS = window.POSTS || []).push({
    id: "my-new-post",              // Used for URL hash, e.g. #my-new-post
    title: "Your Post Title Here",
    date: "15 November 2026",
    tags: ["Category", "Topic"],
    summary: "A concise 1-2 sentence hook and summary.",
    body: [
      { h: "Section Heading" },
      r`Paragraph of text with inline math like $f(x) = \sin(x)$.`,
      { eq: r`\min_{x \in X} f(x)` }, // Display KaTeX math block
      {
        tbl: [
          ["Column A", "Column B"],
          ["Row 1", "Data 1"],
          ["Row 2", "Data 2"],
        ],
      },
      {
        code: `def example():\n    return True`,
      },
      {
        diagram: {
          figure: "1.1",
          label: "Architecture Flow",
          svg: `<svg viewBox="0 0 700 200">...</svg>`,
          caption: "A descriptive explanation of the diagram.",
        },
      },
      {
        list: [
          "First item",
          "Second item",
        ],
      },
    ],
  });
})();
```

3. **Register the post in `index.html`**:
Add the `<script>` tag in `index.html` under `<!-- Post Data -->`:
```html
<script src="posts/my-new-post.js"></script>
```

That's it! The home page grid and routing will automatically pick up your new post.
