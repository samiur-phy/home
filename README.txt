Samiur R. Mir — site notes
==========================

Files
-----
index.html          Home
research.html       Research topics
publications.html   Selected papers (hand-edited) + full list from INSPIRE
talks.html          Seminars and talks
profile.html        CV and profile links
main.css            Shared styles for every page
inspire.js          Fetches the publication list from the INSPIRE-HEP API
webpics/            Portrait, paper figures, placeholder.svg

Adding a page
-------------
Copy any existing page, then change three things:
  1. <title>
  2. The aria-current="page" attribute in the nav — move it to the new page's
     link, and add the new link to the nav on EVERY page.
  3. The contents of <main class="page">.

The masthead (name, affiliations, emails) is duplicated in every file. That is
the cost of plain HTML with no build step: when you change your affiliation you
change it in five places. Search for "EDIT:" to find every spot.

Adding a publication card
-------------------------
Paste this inside <ul class="entry-list"> on publications.html. Drop the
<a class="entry-figure"> block and add class="no-figure" to the <li> if you
have no figure for that paper.

  <li class="entry">
    <a class="entry-figure" href="https://arxiv.org/abs/XXXX.XXXXX">
      <img src="webpics/your-figure.png" alt="Short description of the figure" />
    </a>
    <div>
      <p class="entry-date">12 Aug 2026</p>
      <h3 class="entry-title">
        <a href="https://arxiv.org/abs/XXXX.XXXXX">Paper title</a>
      </h3>
      <p class="entry-authors">
        First Author, <span class="self">Samiur R. Mir</span>, Third Author
      </p>
      <p class="entry-meta">
        <a href="https://arxiv.org/abs/XXXX.XXXXX">arXiv:XXXX.XXXXX</a>
        <a href="https://doi.org/...">DOI</a>
      </p>
    </div>
  </li>

Figures
-------
Export plots at roughly 800x600 px, PNG, on a white or transparent background.
The card uses object-fit: contain, so odd aspect ratios letterbox rather than
crop — nothing gets cut off, but very wide figures will look small.

Testing
-------
  python3 -m http.server
then open http://localhost:8000 — opening files over file:// blocks the
INSPIRE fetch on CORS.
