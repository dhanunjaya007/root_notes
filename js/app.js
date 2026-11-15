(function () {
  var app = document.getElementById("app");
  var POSTS = window.POSTS || [];

  function esc(s) {
    if (typeof s !== "string") return "";
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  // Tags rendered as plain metadata strings separated by middle dots (·)
  function renderTags(p) {
    if (!p.tags || !p.tags.length) return "";
    return (
      '<div class="blueprint-tags">' +
      p.tags
        .map(function (t, i) {
          var tagStr = esc(t.toLowerCase());
          return (i > 0 ? '<span class="dot">&middot;</span>' : '') + '<span>' + tagStr + '</span>';
        })
        .join(" ") +
      "</div>"
    );
  }

  function renderBody(body) {
    var h = "";
    if (body && Array.isArray(body)) {
      body.forEach(function (t) {
        if (typeof t === "string") {
          h += "<p>" + esc(t) + "</p>";
        } else if (t.h) {
          h += "<h2>" + esc(t.h) + "</h2>";
        } else if (t.eq) {
          h += '<div class="eq">$$' + esc(t.eq) + "$$</div>";
        } else if (t.tbl) {
          h += tbl(t.tbl);
        } else if (t.code) {
          h += '<pre class="language-python"><code class="language-python">' + esc(t.code) + "</code></pre>";
        } else if (t.diagram) {
          var d = t.diagram;
          h += '<figure class="diagram-card">';
          if (d.label || d.figure) {
            h +=
              '<div class="diagram-header">' +
              "<span>" +
              esc(d.label || "Architecture Diagram") +
              "</span>" +
              "<span>FIGURE " +
              esc(d.figure || "1.0") +
              "</span>" +
              "</div>";
          }
          h += '<div class="diagram-body">' + (d.svg || "") + "</div>";
          if (d.caption) {
            h += '<figcaption class="diagram-caption">' + d.caption + "</figcaption>";
          }
          h += "</figure>";
        } else if (t.list && Array.isArray(t.list)) {
          h +=
            "<ul>" +
            t.list
              .map(function (item) {
                return "<li>" + esc(item) + "</li>";
              })
              .join("") +
            "</ul>";
        }
      });
    }
    return h;
  }

  function tbl(rows) {
    var h = '<div class="table-wrapper"><table>';
    rows.forEach(function (row, i) {
      var tag = i ? "td" : "th";
      h +=
        "<tr>" +
        row
          .map(function (c) {
            return "<" + tag + ">" + esc(c) + "</" + tag + ">";
          })
          .join("") +
        "</tr>";
    });
    return h + "</table></div>";
  }

  // Quick Read Modal Handlers
  window.openQuickRead = function (id) {
    var p = POSTS.filter(function (x) {
      return x.id === id;
    })[0];
    if (!p) return;

    var modal = document.getElementById("quick-read-modal");
    var titleEl = document.getElementById("modal-post-title");
    var metaEl = document.getElementById("modal-post-meta");
    var bodyEl = document.getElementById("modal-post-body");
    var fullLinkEl = document.getElementById("modal-full-link");

    if (titleEl) titleEl.textContent = p.title;
    if (metaEl) {
      metaEl.innerHTML =
        '<span class="meta-index">' +
        esc(p.date) +
        "</span> &middot; " +
        renderTags(p);
    }
    if (bodyEl) {
      bodyEl.innerHTML =
        '<div class="post-abstract-card"><p>' +
        esc(p.summary) +
        "</p></div>" +
        renderBody(p.body);
    }
    if (fullLinkEl) {
      fullLinkEl.href = "#" + encodeURIComponent(p.id);
      fullLinkEl.onclick = function () {
        window.closeQuickRead();
      };
    }

    if (modal) {
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    // Typeset formulas in modal
    if (window.renderMathInElement && bodyEl) {
      window.renderMathInElement(bodyEl, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
    if (window.Prism && bodyEl) {
      window.Prism.highlightAllUnder(bodyEl);
    }
  };

  window.closeQuickRead = function () {
    var modal = document.getElementById("quick-read-modal");
    if (modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  };

  // Keyboard navigation for modal
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      window.closeQuickRead();
    }
  });

  // One-click RSS Feed Copier
  window.copyRssFeed = function (btn) {
    var feedUrl = new URL("feed.xml", window.location.href).href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(feedUrl).then(function () {
        var original = btn.textContent;
        btn.textContent = "✓ Feed URL Copied";
        setTimeout(function () {
          btn.textContent = original;
        }, 2500);
      });
    } else {
      window.open("feed.xml", "_blank");
    }
  };

  function renderGridCell(p, defaultIndex, fallbackTitle, fallbackDesc, fallbackTag) {
    if (p) {
      return (
        '<article class="blueprint-cell">' +
        '<div>' +
        '<div class="cell-header-meta">' +
        '<span class="meta-index">' + esc(p.date) + '</span>' +
        '<span class="meta-accent-indicator">Note</span>' +
        '</div>' +
        '<h3 class="cell-title-secondary"><a href="#' + encodeURIComponent(p.id) + '">' + esc(p.title) + '</a></h3>' +
        '<p class="cell-body-text">' + esc(p.summary.slice(0, 115)) + '...</p>' +
        renderTags(p) +
        '</div>' +
        '<div class="cell-action-row">' +
        '<a href="#' + encodeURIComponent(p.id) + '" class="text-action-link">Read Note &rarr;</a>' +
        '<button class="text-action-link secondary" onclick="window.openQuickRead(\'' + p.id + '\')">Quick Read &nearr;</button>' +
        '</div>' +
        '</article>'
      );
    }
    return (
      '<article class="blueprint-cell">' +
      '<div>' +
      '<div class="cell-header-meta">' +
      '<span class="meta-index">' + defaultIndex + '</span>' +
      '<span class="meta-accent-indicator">Coming Soon</span>' +
      '</div>' +
      '<h3 class="cell-title-secondary" style="color: var(--ink-muted);">' + fallbackTitle + '</h3>' +
      '<p class="cell-body-text">' + fallbackDesc + '</p>' +
      '<div class="blueprint-tags"><span>' + fallbackTag + '</span><span class="dot">&middot;</span><span>in progress</span></div>' +
      '</div>' +
      '</article>'
    );
  }

  // Home: Blueprint Grid of Notes
  function home() {
    var featured = POSTS[0];

    var h = '<div class="hero-block">';
    h += '<span class="hero-meta-kicker">Machine Learning &middot; Optimization</span>';
    h += '<h1 class="hero-headline">Notes on machine learning and optimization.</h1>';
    h += '<p class="hero-subparagraph">Derivations, algorithmic properties, and practical implementation notes written to understand machine learning from first principles.</p>';
    h += '</div>';

    // Asymmetrical Blueprint Grid
    h += '<div class="blueprint-grid">';

    // 1. Featured Card (Left Column - Taller, spans 3 rows)
    if (featured) {
      h += '<article class="blueprint-cell cell-featured">';
      h += '<div>';
      h += '<div class="cell-header-meta">';
      h += '<span class="meta-index">' + esc(featured.date) + '</span>';
      h += '<span class="meta-accent-indicator">Featured Note</span>';
      h += '</div>';
      h += '<h2 class="cell-title-primary"><a href="#' + encodeURIComponent(featured.id) + '">' + esc(featured.title) + '</a></h2>';
      h += '<p class="cell-body-text" style="font-size: 1.05rem; line-height: 1.8;">' + esc(featured.summary) + '</p>';
      
      // Inline formula callout preview
      h += '<div class="blueprint-formula-callout">';
      h += '<span class="formula-label">Guaranteed Volume Shrinkage Bound</span>';
      h += '$$\\mathrm{vol}(S_t) \\le \\left(1 - \\frac{1}{e}\\right)^{t-1} \\mathrm{vol}(X) \\approx 0.63^{\\,t-1}$$';
      h += '</div>';
      
      h += renderTags(featured);
      h += '</div>';
      
      // Minimal text action links with underline hover
      h += '<div class="cell-action-row">';
      h += '<a href="#' + encodeURIComponent(featured.id) + '" class="text-action-link">Read Full Note &rarr;</a>';
      h += '<button class="text-action-link secondary" onclick="window.openQuickRead(\'' + featured.id + '\')">Quick Read &nearr;</button>';
      h += '</div>';
      h += '</article>';
    }

    // 2. Cell (Row 1, Col 2)
    h += renderGridCell(POSTS[1], "Note 02", "Next Note in Progress", "A new write-up breaking down another machine learning algorithm from first principles.", "draft");

    // 3. Cell (Row 1, Col 3)
    h += renderGridCell(POSTS[2], "Note 03", "Derivations &amp; Proofs", "Step-by-step mathematical guarantees and implementation notes.", "theory");

    // 4. Cell (Row 2, Col 2)
    h += renderGridCell(POSTS[3], "Note 04", "Empirical Notes", "Observations from small experiments, hardware behavior, and loss landscapes.", "experiments");

    // 5. Cell (Row 2, Col 3)
    h += renderGridCell(POSTS[4], "Note 05", "Open Notebook", "1 note published &middot; More in progress. Written slowly, one note at a time.", "open source");

    // 6. Cell: Integrated RSS Feed Grid Block (Row 3, Col 2 & 3 - Spans 2 columns)
    h += '<section class="blueprint-cell cell-wide newsletter-cell">';
    h += '<div>';
    h += '<div class="cell-header-meta">';
    h += '<span class="meta-index">Open Protocol &middot; feed.xml</span>';
    h += '<span class="meta-accent-indicator">100% Private &middot; Zero Logins</span>';
    h += '</div>';
    h += '<h3 class="newsletter-inner-title">Subscribe via RSS</h3>';
    h += '<p class="cell-body-text" style="margin-bottom: 1.25rem;">Subscribe to updates in any RSS reader (NetNewsWire, Feedly, Apple News, Thunderbird). No third-party accounts, zero tracking, and native notifications handled directly by your reader app.</p>';
    h += '<div style="display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap;">';
    h += '<button id="copy-rss-btn" class="text-action-link" onclick="window.copyRssFeed(this)">Copy Feed URL &rarr;</button>';
    h += '<a href="feed.xml" target="_blank" rel="noopener" class="text-action-link secondary">Open feed.xml &nearr;</a>';
    h += '</div>';
    h += '</div>';
    h += '</section>';

    h += '</div>'; // End blueprint-grid
    return h;
  }

  // Dedicated Post Detail View
  function post(p) {
    var h =
      '<a class="back-masthead-link" href="#">&larr; Back to Notes</a>' +
      '<header class="post-header">' +
      '<div class="cell-header-meta">' +
      '<span class="meta-index">' +
      esc(p.date) +
      "</span>" +
      renderTags(p) +
      "</div>" +
      "<h1>" +
      esc(p.title) +
      "</h1>" +
      "</header>" +
      '<div class="post-abstract-card"><p>' +
      esc(p.summary) +
      "</p></div>" +
      '<article class="post-content">' +
      renderBody(p.body) +
      "</article>";
    return h;
  }

  function about() {
    return (
      '<a class="back-masthead-link" href="#">&larr; Back to Notes</a>' +
      '<header class="post-header">' +
      "<h1>About &amp; Disclaimers</h1>" +
      "</header>" +
      '<div class="post-abstract-card" style="margin-bottom: 2.5rem;">' +
      "<p>Rootnotes is a personal collection of notes, derivations, and code implementations in machine learning and optimization.</p>" +
      "<h2>Educational Purpose &amp; Disclaimer</h2>" +
      "<p>All materials, equations, and code are shared for personal study, research, and educational purposes. The content is provided on an \"as is\" basis without warranties of any kind.</p>" +
      "<h2>Privacy</h2>" +
      "<p>This website is a static site hosted via GitHub Pages. It does not use cookies, trackers, or telemetry scripts.</p>" +
      "<h2>Open Source</h2>" +
      "<p>The project files are open source on GitHub. Code snippets and implementations are freely available for reference and study.</p>" +
      "</div>"
    );
  }

  function typeset() {
    if (window.renderMathInElement && app) {
      window.renderMathInElement(app, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
        throwOnError: false,
      });
    }
    if (window.Prism && app) {
      window.Prism.highlightAllUnder(app);
    }
  }

  function render() {
    var id = decodeURIComponent(location.hash.replace("#", ""));
    var p = POSTS.filter(function (x) {
      return x.id === id;
    })[0];
    app.innerHTML = p ? post(p) : id === "about" ? about() : home();
    typeset();
    window.scrollTo(0, 0);
    document.title = p ? p.title + " | Rootnotes" : "Rootnotes | Machine Learning & Optimization Notes";
  }

  window.addEventListener("load", typeset);
  window.addEventListener("hashchange", render);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
