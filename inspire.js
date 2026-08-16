/* ==========================================================================
   inspire.js — renders a publication list from the INSPIRE-HEP REST API.
   Configure the author record ID and display name below; nothing else
   needs editing.
   ========================================================================== */

(function () {
  "use strict";

  var CONFIG = {
    authorId: "1905709", // INSPIRE author recid
    surname: "Mir", // used to bold your own name in author lists
    profileUrl: "https://inspirehep.net/authors/1905709",
    maxAuthorsShown: 8, // longer lists collapse to "et al."
    maxRecords: 250
  };

  var FIELDS = [
    "titles",
    "authors",
    "collaborations",
    "publication_info",
    "arxiv_eprints",
    "dois",
    "earliest_date",
    "citation_count",
    "document_type",
    "control_number"
  ].join(",");

  function apiUrl(query) {
    return (
      "https://inspirehep.net/api/literature" +
      "?sort=mostrecent" +
      "&size=" +
      CONFIG.maxRecords +
      "&fields=" +
      FIELDS +
      "&q=" +
      encodeURIComponent(query)
    );
  }

  // Tried in order; the first query returning records wins.
  var QUERIES = ["a " + CONFIG.authorId, "a Samiur R. Mir"];

  var statusEl = document.getElementById("pub-status");
  var containerEl = document.getElementById("pub-container");

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function yearOf(meta) {
    if (meta.earliest_date) {
      return meta.earliest_date.slice(0, 4);
    }
    var info = meta.publication_info;
    if (info && info.length && info[0].year) {
      return String(info[0].year);
    }
    return "Undated";
  }

  function authorLine(meta) {
    if (meta.collaborations && meta.collaborations.length) {
      return esc(meta.collaborations[0].value) + " Collaboration";
    }

    var authors = meta.authors || [];
    if (!authors.length) return "";

    var names = authors.map(function (a) {
      var name = a.full_name || "";
      // INSPIRE stores names as "Surname, Given"; flip to "Given Surname".
      var parts = name.split(",");
      if (parts.length === 2) {
        name = parts[1].trim() + " " + parts[0].trim();
      }
      var isSelf = name.indexOf(CONFIG.surname) !== -1;
      return isSelf
        ? '<span class="self">' + esc(name) + "</span>"
        : esc(name);
    });

    if (names.length > CONFIG.maxAuthorsShown) {
      var selfIndex = -1;
      for (var i = 0; i < names.length; i++) {
        if (names[i].indexOf('class="self"') !== -1) selfIndex = i;
      }
      var head = names.slice(0, 3);
      // Keep your own name visible even in a long list.
      if (selfIndex >= 3) head.push(names[selfIndex]);
      return head.join(", ") + " et al.";
    }

    return names.join(", ");
  }

  function referenceLine(meta) {
    var info = meta.publication_info;
    if (!info || !info.length) return "";

    for (var i = 0; i < info.length; i++) {
      var pub = info[i];
      if (!pub.journal_title) continue;

      var ref = pub.journal_title;
      if (pub.journal_volume) ref += " " + pub.journal_volume;
      if (pub.artid) {
        ref += ", " + pub.artid;
      } else if (pub.page_start) {
        ref += ", " + pub.page_start;
      }
      if (pub.year) ref += " (" + pub.year + ")";
      return esc(ref);
    }
    return "";
  }

  function linkPills(meta) {
    var pills = [];

    if (meta.arxiv_eprints && meta.arxiv_eprints.length) {
      var id = meta.arxiv_eprints[0].value;
      pills.push(
        '<a href="https://arxiv.org/abs/' +
          esc(id) +
          '" target="_blank" rel="noopener noreferrer">arXiv:' +
          esc(id) +
          "</a>"
      );
    }

    if (meta.dois && meta.dois.length) {
      pills.push(
        '<a href="https://doi.org/' +
          esc(meta.dois[0].value) +
          '" target="_blank" rel="noopener noreferrer">DOI</a>'
      );
    }

    if (meta.control_number) {
      pills.push(
        '<a href="https://inspirehep.net/literature/' +
          esc(meta.control_number) +
          '" target="_blank" rel="noopener noreferrer">INSPIRE</a>'
      );
    }

    if (meta.citation_count) {
      pills.push(
        '<span class="pub-cites">' +
          meta.citation_count +
          (meta.citation_count === 1 ? " citation" : " citations") +
          "</span>"
      );
    }

    return pills.length
      ? '<div class="pub-links">' + pills.join("") + "</div>"
      : "";
  }

  function entryHtml(meta) {
    var title =
      meta.titles && meta.titles.length ? meta.titles[0].title : "Untitled";
    var href = meta.control_number
      ? "https://inspirehep.net/literature/" + meta.control_number
      : CONFIG.profileUrl;

    var html =
      '<li><div class="pub-title"><a href="' +
      esc(href) +
      '" target="_blank" rel="noopener noreferrer">' +
      esc(title) +
      "</a></div>";

    var authors = authorLine(meta);
    if (authors) html += '<div class="pub-authors">' + authors + "</div>";

    var ref = referenceLine(meta);
    if (ref) html += '<div class="pub-ref">' + ref + "</div>";

    html += linkPills(meta) + "</li>";
    return html;
  }

  function render(hits) {
    var byYear = {};
    var order = [];

    hits.forEach(function (hit) {
      var meta = hit.metadata || {};
      var year = yearOf(meta);
      if (!byYear[year]) {
        byYear[year] = [];
        order.push(year);
      }
      byYear[year].push(meta);
    });

    order.sort(function (a, b) {
      return b.localeCompare(a);
    });

    var html = order
      .map(function (year) {
        return (
          '<h2 class="pub-year">' +
          esc(year) +
          '</h2><ul class="pub-list">' +
          byYear[year].map(entryHtml).join("") +
          "</ul>"
        );
      })
      .join("");

    containerEl.innerHTML = html;
    statusEl.textContent =
      hits.length + (hits.length === 1 ? " record" : " records") + " on INSPIRE.";
  }

  function fail() {
    statusEl.innerHTML =
      'The publication list could not be loaded. The full record is on ' +
      '<a href="' +
      CONFIG.profileUrl +
      '" target="_blank" rel="noopener noreferrer">INSPIRE-HEP</a>.';
  }

  function attempt(index) {
    if (index >= QUERIES.length) {
      fail();
      return;
    }

    fetch(apiUrl(QUERIES[index]), { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        var hits = data && data.hits && data.hits.hits ? data.hits.hits : [];
        if (!hits.length) {
          attempt(index + 1);
          return;
        }
        render(hits);
      })
      .catch(function () {
        attempt(index + 1);
      });
  }

  attempt(0);
})();
