/* aether.nic — shared content rendering
   Reads JSON from /data and renders it into the page.
   Also used by admin.html for live preview of new entries. */

(function (global) {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function inline(str) {
    // very small inline markdown: **bold**
    return escapeHtml(str).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  // Turn a block of text into an array of paragraph strings.
  // Blank lines separate paragraphs; single newlines stay inside one paragraph (<br>).
  function toParagraphs(body) {
    return String(body || "")
      .split(/\n\s*\n/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean);
  }

  function paragraphHtml(p) {
    return "<p>" + inline(p).replace(/\n/g, "<br>") + "</p>";
  }

  // Renders a poem: { title, content } -> HTML for a .poem card's inner content
  function renderPoem(entry) {
    var title = escapeHtml(entry.title || "Untitled");
    var content = escapeHtml(entry.content || "").replace(/\n/g, "<br>");
    return (
      '<div class="poem-title">' + title + "</div>" +
      '<div class="poem-content">' + content + "</div>"
    );
  }

  // Renders a fragment: { meta, body } -> HTML for a .fragment article's inner content
  function renderFragment(entry) {
    var html = "";
    if (entry.meta) {
      html += '<p class="meta">' + inline(entry.meta) + "</p>";
    }
    toParagraphs(entry.body).forEach(function (p) {
      html += paragraphHtml(p);
    });
    return html;
  }

  // Renders a pharmaceutics essay: { title, date, body } with a tiny markdown-lite body
  // "## heading" -> h3, "> quote" -> .highlight, blank-line-separated -> <p>
  function renderEssay(entry) {
    var html = "";
    html += "<h2>" + escapeHtml(entry.title || "Untitled") + "</h2>";
    if (entry.date) {
      html += "<p><em>" + escapeHtml(entry.date) + "</em></p>";
    }
    toParagraphs(entry.body).forEach(function (block) {
      if (/^##\s+/.test(block)) {
        html += "<h3>" + inline(block.replace(/^##\s+/, "")) + "</h3>";
      } else if (/^>\s+/.test(block)) {
        html += '<div class="highlight">' + inline(block.replace(/^>\s+/, "")) + "</div>";
      } else {
        html += paragraphHtml(block);
      }
    });
    return html;
  }

  async function fetchJson(path) {
    var res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load " + path);
    return res.json();
  }

  global.AetherSite = {
    escapeHtml: escapeHtml,
    inline: inline,
    toParagraphs: toParagraphs,
    renderPoem: renderPoem,
    renderFragment: renderFragment,
    renderEssay: renderEssay,
    fetchJson: fetchJson
  };
})(window);
