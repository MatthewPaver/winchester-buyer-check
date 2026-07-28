const homes = [
  {
    id: "upper-brook",
    name: "Upper Brook Street",
    postcode: "SO23",
    price: 400000,
    beds: 2,
    toilets: 1,
    garden: "Garden",
    station: 10,
    tenure: "Freehold",
    condition: "Cosmetic",
    score: 92,
    status: "Shortlisted",
    evidence: 82,
    soldBand: "£386k–£421k",
    verdict: "Strong fit",
    note: "The shortest station walk in the shortlist, with useful price headroom below the LISA ceiling.",
  },
  {
    id: "coney-green",
    name: "Coney Green",
    postcode: "SO23",
    price: 400000,
    beds: 3,
    toilets: 2,
    garden: "Garden",
    station: 22,
    tenure: "Freehold",
    condition: "Cosmetic",
    score: 88,
    status: "New lead",
    evidence: 74,
    soldBand: "£379k–£418k",
    verdict: "Good value",
    note: "More space for the money, offset by a commute that needs a real door-to-platform test.",
  },
  {
    id: "gordon-avenue",
    name: "Gordon Avenue",
    postcode: "SO23",
    price: 399950,
    beds: 2,
    toilets: 1,
    garden: "Garden",
    station: 24,
    tenure: "Freehold",
    condition: "Cosmetic",
    score: 84,
    status: "New lead",
    evidence: 68,
    soldBand: "£382k–£410k",
    verdict: "Worth viewing",
    note: "A balanced candidate if the slower station journey is acceptable and the source facts check out.",
  },
  {
    id: "imber-road",
    name: "Imber Road",
    postcode: "SO23",
    price: 365000,
    beds: 3,
    toilets: 1,
    garden: "Garden",
    station: 24,
    tenure: "Freehold",
    condition: "Tired",
    score: 81,
    status: "New lead",
    evidence: 72,
    soldBand: "£351k–£391k",
    verdict: "Budget leader",
    note: "The largest cash cushion in the set, but condition and works need a disciplined inspection.",
  },
  {
    id: "eastcliffe",
    name: "Eastcliffe, East Hill",
    postcode: "SO23",
    price: 450000,
    beds: 2,
    toilets: 1,
    garden: "Garden",
    station: 15,
    tenure: "Freehold",
    condition: "Cosmetic",
    score: 79,
    status: "New lead",
    evidence: 78,
    soldBand: "£426k–£462k",
    verdict: "Cap-sensitive",
    note: "A credible commute candidate, but there is no room to bid above the LISA ceiling.",
  },
  {
    id: "fulflood",
    name: "Two-bed terrace near Fulflood",
    postcode: "SO22",
    price: 445000,
    beds: 2,
    toilets: 1,
    garden: "Garden",
    station: 16,
    tenure: "Freehold",
    condition: "Cosmetic",
    score: 76,
    status: "Shortlisted",
    evidence: 51,
    soldBand: "£421k–£456k",
    verdict: "Evidence gap",
    note: "Location and layout are plausible, but photos, tenure evidence and exact address still need confirmation.",
  },
  {
    id: "rockbourne",
    name: "Rockbourne Road",
    postcode: "SO22",
    price: 415000,
    beds: 3,
    toilets: 1,
    garden: "Garden",
    station: 38,
    tenure: "Freehold",
    condition: "Cosmetic",
    score: 72,
    status: "New lead",
    evidence: 75,
    soldBand: "£397k–£432k",
    verdict: "Commute trade-off",
    note: "Good space and an affordable asking price, but the station leg materially weakens the fit.",
  },
  {
    id: "canon-street",
    name: "Canon Street",
    postcode: "SO23",
    price: 450000,
    beds: 2,
    toilets: 1,
    garden: "Patio",
    station: 18,
    tenure: "Freehold",
    condition: "Cosmetic",
    score: 70,
    status: "New lead",
    evidence: 59,
    soldBand: "£432k–£466k",
    verdict: "Verify first",
    note: "At the hard cap with limited outside space, so evidence quality and condition must be unusually strong.",
  },
  {
    id: "hyde-edge",
    name: "Three-bed edge of Hyde",
    postcode: "SO23",
    price: 450000,
    beds: 3,
    toilets: 2,
    garden: "Garden",
    station: 22,
    tenure: "Freehold",
    condition: "Tired",
    score: 68,
    status: "Shortlisted",
    evidence: 63,
    soldBand: "£425k–£468k",
    verdict: "Works risk",
    note: "High potential, but works pressure and the LISA ceiling leave little tolerance for surprises.",
  },
];

const marketRows = [
  { area: "SO23", type: "Terraced", sales: 186, median: 430000, low: 365000, high: 507000 },
  { area: "SO23", type: "Semi-detached", sales: 132, median: 535000, low: 438000, high: 660000 },
  { area: "SO23", type: "Flat", sales: 214, median: 286000, low: 224000, high: 365000 },
  { area: "SO22", type: "Terraced", sales: 154, median: 446000, low: 372000, high: 525000 },
  { area: "SO22", type: "Semi-detached", sales: 183, median: 553000, low: 445000, high: 682000 },
  { area: "SO21", type: "Terraced", sales: 91, median: 386000, low: 318000, high: 452000 },
  { area: "SO21", type: "Detached", sales: 276, median: 724000, low: 548000, high: 965000 },
];

const evidenceTasks = [
  { id: "listing", label: "Listing facts confirmed against the agent source", source: "Agent listing" },
  { id: "sold", label: "Comparable sold prices reviewed", source: "HM Land Registry" },
  { id: "walk", label: "Station walk tested at commute time", source: "Buyer check" },
  { id: "tenure", label: "Title and tenure evidence requested", source: "Conveyancer" },
  { id: "condition", label: "Condition and first-year works checked", source: "Survey/viewing" },
];

const formatMoney = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const state = {
  route: location.hash.replace("#", "") || "homes",
  selectedId: localStorage.getItem("winchester-selected-home") || homes[0].id,
  homeFilter: "all",
  query: "",
  sort: "match",
  evidence: JSON.parse(localStorage.getItem("winchester-evidence") || '["listing","sold"]'),
  plan: {
    askingPrice: 425000,
    salary: 72000,
    deposit: 85000,
    lisaContribution: 4000,
    useLisa: true,
    fees: 5500,
    reserve: 12000,
    works: 15000,
    multiple: 4.5,
    rate: 4.5,
    term: 30,
  },
};

const workspace = document.getElementById("workspace");
const toast = document.getElementById("toast");

function icon(name) {
  const paths = {
    home: '<path d="m4 11 8-7 8 7v9h-6v-6h-4v6H4z"/>',
    train: '<path d="M7 16h10M8 20l2-4m6 4-2-4M6 3h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 7h6"/>',
    bed: '<path d="M3 18v-7m18 7v-5H3v5m3-5V7h6a3 3 0 0 1 3 3v3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    source: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    chart: '<path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/>',
    shield: '<path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-5"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.home}</svg>`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function selectedHome() {
  return homes.find((home) => home.id === state.selectedId) || homes[0];
}

function pageIntro(eyebrow, title, detail) {
  return `
    <div class="page-context" aria-label="Current page">
      <span>${eyebrow}</span><strong>${title}</strong><p>${detail}</p>
    </div>
  `;
}

function setRoute(route) {
  const safeRoute = ["homes", "market", "plan", "review", "evidence"].includes(route) ? route : "homes";
  state.route = safeRoute;
  if (location.hash !== `#${safeRoute}`) history.pushState(null, "", `#${safeRoute}`);
  render();
  workspace.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateNavigation() {
  document.querySelectorAll("[data-route]").forEach((link) => {
    const active = link.dataset.route === state.route;
    link.toggleAttribute("aria-current", active);
  });
}

function homeArtwork(home, index) {
  return `
    <div class="home-art home-art--${(index % 4) + 1}" aria-hidden="true">
      <span class="home-art-sun"></span>
      <span class="home-art-house"><i></i><b></b><em></em></span>
      <span class="home-art-ground"></span>
    </div>
  `;
}

function filteredHomes() {
  const query = state.query.trim().toLowerCase();
  return homes
    .filter((home) => {
      if (query && !`${home.name} ${home.postcode}`.toLowerCase().includes(query)) return false;
      if (state.homeFilter === "under-425") return home.price < 425000;
      if (state.homeFilter === "station") return home.station <= 15;
      if (state.homeFilter === "three-bed") return home.beds >= 3;
      if (state.homeFilter === "evidence") return home.evidence >= 75;
      return true;
    })
    .sort((a, b) => {
      if (state.sort === "price") return a.price - b.price;
      if (state.sort === "station") return a.station - b.station;
      if (state.sort === "evidence") return b.evidence - a.evidence;
      return b.score - a.score;
    });
}

function homeCards() {
  const visible = filteredHomes();
  if (!visible.length) {
    return `<div class="empty-state">${icon("search")}<h3>No homes match</h3><p>Clear the search or change the active filter.</p><button type="button" id="clear-homes">Show every home</button></div>`;
  }
  return visible
    .map((home) => {
      const index = homes.findIndex((item) => item.id === home.id);
      return `
        <article class="home-card">
          <button type="button" data-open-home="${home.id}" aria-label="Review ${home.name}">
            <div class="home-visual">
              ${homeArtwork(home, index)}
              <span class="home-status">${home.status}</span>
              <strong class="home-score">${home.score}% fit</strong>
            </div>
            <div class="home-card-body">
              <div class="price-row">
                <strong>${formatMoney.format(home.price)}</strong>
                <span>${home.price <= 450000 ? "LISA eligible" : "Over LISA cap"}</span>
              </div>
              <h3>${home.name}</h3>
              <p class="postcode">${home.postcode} · ${home.soldBand} sold range</p>
              <div class="home-facts">
                <span>${icon("bed")}${home.beds} bed</span>
                <span>${home.toilets} WC</span>
                <span>${home.garden}</span>
                <span>${icon("train")}${home.station} min</span>
              </div>
              <div class="card-foot"><span>${home.tenure} · ${home.condition}</span><strong>Review ${icon("arrow")}</strong></div>
            </div>
          </button>
        </article>
      `;
    })
    .join("");
}

function renderHomes() {
  workspace.innerHTML = `
    ${pageIntro("Browse", `${homes.length} homes in your shortlist`, "Compare the whole shortlist and open only the homes that earn attention.")}
    <section class="feature-hero feature-hero--homes">
      <div>
        <span class="section-kicker">Your Winchester search</span>
        <h1>Homes worth a closer look.</h1>
        <p>Price, station walk, layout and evidence are visible before a listing becomes an emotional decision.</p>
      </div>
      <dl class="hero-metrics">
        <div><dt>Saved homes</dt><dd>${homes.length}</dd></div>
        <div><dt>Within LISA cap</dt><dd>${homes.filter((home) => home.price <= 450000).length}</dd></div>
        <div><dt>Fast station walk</dt><dd>${homes.filter((home) => home.station <= 15).length}</dd></div>
        <div><dt>Evidence ≥75%</dt><dd>${homes.filter((home) => home.evidence >= 75).length}</dd></div>
      </dl>
    </section>

    <section class="catalogue-controls" aria-label="Find homes">
      <label class="search-control">${icon("search")}<span class="sr-only">Search homes</span><input id="home-search" name="home-search" type="search" placeholder="Search street or postcode" value="${state.query}" /></label>
      <label class="sort-control"><span>Sort</span><select id="home-sort" name="home-sort" aria-label="Sort homes">
        <option value="match" ${state.sort === "match" ? "selected" : ""}>Best fit</option>
        <option value="price" ${state.sort === "price" ? "selected" : ""}>Lowest price</option>
        <option value="station" ${state.sort === "station" ? "selected" : ""}>Station walk</option>
        <option value="evidence" ${state.sort === "evidence" ? "selected" : ""}>Evidence quality</option>
      </select></label>
    </section>
    <div class="filter-row" aria-label="Filter homes">
      ${[
        ["all", "All homes"],
        ["under-425", "Under £425k"],
        ["station", "≤15 min to station"],
        ["three-bed", "3+ bedrooms"],
        ["evidence", "Evidence ≥75%"],
      ]
        .map(([id, label]) => `<button type="button" data-home-filter="${id}" aria-pressed="${state.homeFilter === id}">${label}</button>`)
        .join("")}
    </div>
    <div class="result-count"><strong id="home-result-count">${filteredHomes().length}</strong> homes showing <span>Seeded shortlist · facts require confirmation</span></div>
    <section class="home-grid" id="home-grid" aria-label="Shortlisted homes">${homeCards()}</section>
  `;

  const grid = document.getElementById("home-grid");
  const count = document.getElementById("home-result-count");
  const refresh = () => {
    grid.innerHTML = homeCards();
    count.textContent = filteredHomes().length;
    bindHomeCards();
    document.getElementById("clear-homes")?.addEventListener("click", () => {
      state.query = "";
      state.homeFilter = "all";
      renderHomes();
    });
  };
  document.getElementById("home-search").addEventListener("input", (event) => {
    state.query = event.target.value;
    refresh();
  });
  document.getElementById("home-sort").addEventListener("change", (event) => {
    state.sort = event.target.value;
    refresh();
  });
  document.querySelectorAll("[data-home-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.homeFilter = button.dataset.homeFilter;
      document.querySelectorAll("[data-home-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      refresh();
    });
  });
  bindHomeCards();
}

function bindHomeCards() {
  document.querySelectorAll("[data-open-home]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.openHome;
      localStorage.setItem("winchester-selected-home", state.selectedId);
      setRoute("review");
    });
  });
}

function renderMarket() {
  const maxMedian = Math.max(...marketRows.map((row) => row.median));
  workspace.innerHTML = `
    ${pageIntro("Research", "Winchester sold-price evidence", "Use completed sales to challenge an asking price; do not confuse them with live availability.")}
    <section class="feature-hero feature-hero--market">
      <div>
        <span class="section-kicker">HM Land Registry snapshot</span>
        <h1>See what homes actually sold for.</h1>
        <p>A bundled 2024–2026 demo snapshot covers 2,389 Winchester-district transactions across SO21, SO22 and SO23.</p>
      </div>
      <div class="source-stamp">${icon("shield")}<strong>Official completed-sale data</strong><span>Open Government Licence v3.0</span></div>
    </section>
    <section class="market-layout">
      <div class="market-main">
        <div class="market-toolbar">
          <label>Postcode area<select id="market-area" name="market-area"><option value="all">All areas</option><option>SO21</option><option>SO22</option><option>SO23</option></select></label>
          <label>Property type<select id="market-type" name="market-type"><option value="all">All types</option><option>Terraced</option><option>Semi-detached</option><option>Detached</option><option>Flat</option></select></label>
        </div>
        <div class="market-bars" id="market-bars">
          ${marketRows
            .map(
              (row) => `<article data-market-row data-area="${row.area}" data-type="${row.type}">
                <div><strong>${row.area} · ${row.type}</strong><span>${row.sales} completed sales in demo sample</span></div>
                <div class="bar-track"><span style="width:${Math.round((row.median / maxMedian) * 100)}%"></span></div>
                <b>${formatMoney.format(row.median)}</b>
              </article>`,
            )
            .join("")}
        </div>
      </div>
      <aside class="market-note">
        <span class="section-kicker">How to use it</span>
        <h2>Challenge the listing, not the buyer.</h2>
        <ol>
          <li>Start with the closest property type and postcode.</li>
          <li>Check the spread, not only the median.</li>
          <li>Adjust for condition, tenure, size and sale date.</li>
          <li>Keep listing claims separate from official completed sales.</li>
        </ol>
        <p>Recent months are incomplete because registration can lag completion.</p>
      </aside>
    </section>
    <section class="market-table-wrap">
      <table>
        <thead><tr><th>Area and type</th><th>Sales</th><th>Lower band</th><th>Median</th><th>Upper band</th></tr></thead>
        <tbody id="market-table">${marketRows
          .map(
            (row) => `<tr data-market-row data-area="${row.area}" data-type="${row.type}"><th>${row.area} · ${row.type}</th><td>${row.sales}</td><td>${formatMoney.format(row.low)}</td><td><strong>${formatMoney.format(row.median)}</strong></td><td>${formatMoney.format(row.high)}</td></tr>`,
          )
          .join("")}</tbody>
      </table>
    </section>
  `;
  const update = () => {
    const area = document.getElementById("market-area").value;
    const type = document.getElementById("market-type").value;
    document.querySelectorAll("[data-market-row]").forEach((row) => {
      row.hidden = !((area === "all" || row.dataset.area === area) && (type === "all" || row.dataset.type === type));
    });
  };
  document.getElementById("market-area").addEventListener("change", update);
  document.getElementById("market-type").addEventListener("change", update);
}

function planField(id, label, options = {}) {
  const value = state.plan[id];
  const prefix = options.prefix ? `<span>${options.prefix}</span>` : "";
  const suffix = options.suffix ? `<span>${options.suffix}</span>` : "";
  return `<label>${label}<span class="input-shell">${prefix}<input id="plan-${id}" name="${id}" type="number" min="${options.min ?? 0}" step="${options.step ?? 1}" value="${value}">${suffix}</span></label>`;
}

function planResults() {
  const result = window.BuyerCalculator.calculateAffordability(state.plan);
  const lisaBlocked = state.plan.useLisa && result.askingPrice > 450000;
  const tone = lisaBlocked || result.headroom < 0 ? "shortfall" : result.headroom < 15000 ? "tight" : "ready";
  const decision = lisaBlocked
    ? `${formatMoney.format(result.askingPrice - 450000)} above the LISA purchase cap.`
    : result.headroom < 0
      ? `${formatMoney.format(Math.abs(result.headroom))} purchase-price shortfall before property-specific evidence.`
      : `${formatMoney.format(result.headroom)} of modelled purchase-price headroom before survey findings.`;
  return `
    <div class="decision-card decision-card--${tone}">
      <div class="decision-heading"><span>Decision</span><strong>${lisaBlocked ? "LISA blocked" : result.headroom < 0 ? "Shortfall" : result.headroom < 15000 ? "Tight fit" : "Within model"}</strong></div>
      <p>${decision}</p>
      <dl>
        <div><dt>Modelled max price</dt><dd>${formatMoney.format(result.modelledMaxPrice)}</dd></div>
        <div><dt>Mortgage required</dt><dd>${formatMoney.format(result.mortgageRequired)}</dd></div>
        <div><dt>Monthly at ${state.plan.rate}%</dt><dd>${formatMoney.format(result.monthly)}</dd></div>
        <div><dt>Cash for purchase</dt><dd>${formatMoney.format(result.cashForPrice)}</dd></div>
      </dl>
    </div>
    <div class="scenario-grid">
      <article><span>Bare completion</span><strong>${formatMoney.format(Math.min(450000, result.borrowingCapacity + state.plan.deposit - state.plan.fees))}</strong><p>Fees included; no reserve or works allowance.</p></article>
      <article><span>With reserve</span><strong>${formatMoney.format(Math.min(450000, result.borrowingCapacity + state.plan.deposit - state.plan.fees - state.plan.reserve))}</strong><p>Keeps ${formatMoney.format(state.plan.reserve)} after completion.</p></article>
      <article class="active"><span>Make it mine</span><strong>${formatMoney.format(result.modelledMaxPrice)}</strong><p>Reserve plus ${formatMoney.format(state.plan.works)} first-year works.</p></article>
    </div>
  `;
}

function renderPlan() {
  workspace.innerHTML = `
    ${pageIntro("Plan", "Your buying plan", "Test price, borrowing, cash reserve and works together rather than treating the deposit as the whole decision.")}
    <section class="feature-hero feature-hero--plan">
      <div>
        <span class="section-kicker">Affordability lab</span>
        <h1>Find the usable ceiling.</h1>
        <p>The £450,000 LISA limit is only the outer edge. Borrowing, fees, reserve and first-year works determine the safer number.</p>
      </div>
      <div class="source-stamp">${icon("shield")}<strong>Runs in this browser</strong><span>Inputs are not transmitted</span></div>
    </section>
    <section class="plan-layout">
      <form id="plan-form" class="plan-form">
        <div class="form-section"><span>Property</span><div class="field-grid">
          ${planField("askingPrice", "Asking price", { prefix: "£", step: 1000 })}
          <label class="check-field"><input id="plan-useLisa" name="useLisa" type="checkbox" ${state.plan.useLisa ? "checked" : ""}><span>Use a Lifetime ISA</span></label>
        </div></div>
        <div class="form-section"><span>Borrowing</span><div class="field-grid">
          ${planField("salary", "Expected salary", { prefix: "£", step: 1000 })}
          ${planField("multiple", "Income multiple", { suffix: "×", step: 0.1 })}
          ${planField("rate", "Mortgage rate", { suffix: "%", step: 0.05 })}
          ${planField("term", "Mortgage term", { suffix: "years" })}
        </div></div>
        <div class="form-section"><span>Cash</span><div class="field-grid">
          ${planField("deposit", "Cash deposit", { prefix: "£", step: 1000 })}
          ${planField("lisaContribution", "Annual LISA contribution", { prefix: "£", step: 500 })}
          ${planField("fees", "Buying fees", { prefix: "£", step: 100 })}
          ${planField("reserve", "Keep-back reserve", { prefix: "£", step: 1000 })}
          ${planField("works", "First-year works", { prefix: "£", step: 1000 })}
        </div></div>
      </form>
      <div class="plan-output" id="plan-output">${planResults()}</div>
    </section>
  `;
  document.querySelectorAll("#plan-form input").forEach((input) => {
    input.addEventListener("input", () => {
      state.plan[input.name] = input.type === "checkbox" ? input.checked : Number(input.value);
      document.getElementById("plan-output").innerHTML = planResults();
    });
  });
}

function reviewSummary(home) {
  const offerTarget = Math.min(home.price, Math.round((home.price * (home.evidence < 65 ? 0.95 : 0.975)) / 500) * 500);
  const opening = Math.round((offerTarget * 0.975) / 500) * 500;
  return { offerTarget, opening, walkAway: Math.min(450000, home.price + (home.price < 430000 ? 5000 : 0)) };
}

function renderReview() {
  const home = selectedHome();
  const offer = reviewSummary(home);
  workspace.innerHTML = `
    ${pageIntro("Review", home.name, "Affordability, source quality, viewing checks and negotiation in one decision record.")}
    <section class="review-hero">
      <div class="review-art">${homeArtwork(home, homes.indexOf(home))}</div>
      <div class="review-title">
        <span class="section-kicker">${home.postcode} · ${home.status}</span>
        <h1>${home.name}</h1>
        <p>${home.note}</p>
        <label>Review another home<select id="review-home" name="review-home">${homes.map((item) => `<option value="${item.id}" ${item.id === home.id ? "selected" : ""}>${item.name}</option>`).join("")}</select></label>
      </div>
      <div class="review-score"><span>Decision fit</span><strong>${home.score}</strong><small>/ 100</small><b>${home.verdict}</b></div>
    </section>
    <section class="review-facts">
      <div><span>Asking price</span><strong>${formatMoney.format(home.price)}</strong></div>
      <div><span>Station walk</span><strong>${home.station} min</strong></div>
      <div><span>Layout</span><strong>${home.beds} bed · ${home.toilets} WC</strong></div>
      <div><span>Condition</span><strong>${home.condition}</strong></div>
      <div><span>Sold-price band</span><strong>${home.soldBand}</strong></div>
      <div><span>Evidence quality</span><strong>${home.evidence}%</strong></div>
    </section>
    <section class="review-grid">
      <div class="review-column">
        <div class="section-heading"><span class="section-kicker">Agent council</span><h2>What changes the decision</h2></div>
        <div class="agent-list">
          <article><span>Finance</span><strong>${home.price === 450000 ? "Hard ceiling" : `${formatMoney.format(450000 - home.price)} below LISA cap`}</strong><p>${home.price === 450000 ? "Do not let an offer or fixture negotiation push the purchase price above the qualifying limit." : "Keep the remaining cash for fees, reserve and condition risk rather than treating it as bidding room."}</p></article>
          <article><span>Commute</span><strong>${home.station <= 15 ? "Strong station fit" : home.station <= 22 ? "Test the route" : "Material trade-off"}</strong><p>The model keeps the property-to-station leg separate from Winchester-to-Waterloo and the onward desk journey.</p></article>
          <article><span>Evidence</span><strong>${home.evidence >= 75 ? "Reviewable" : "Gaps remain"}</strong><p>${home.evidence >= 75 ? "Enough source coverage exists for a viewing decision, but not for an unconditional offer." : "Resolve title, condition or listing-fact gaps before relying on the score."}</p></article>
        </div>
      </div>
      <aside class="negotiation-card">
        <span class="section-kicker">Negotiation frame</span>
        <h2>Keep an evidence-led range.</h2>
        <dl>
          <div><dt>Opening position</dt><dd>${formatMoney.format(offer.opening)}</dd></div>
          <div><dt>Target deal</dt><dd>${formatMoney.format(offer.offerTarget)}</dd></div>
          <div><dt>Walk-away price</dt><dd>${formatMoney.format(offer.walkAway)}</dd></div>
        </dl>
        <p>Illustrative planning range only. A survey, broker and conveyancer must replace assumptions with verified facts.</p>
        <button type="button" id="copy-review">Copy review summary</button>
        <button type="button" class="secondary" id="mark-viewing">Mark ready for viewing</button>
      </aside>
    </section>
  `;
  document.getElementById("review-home").addEventListener("change", (event) => {
    state.selectedId = event.target.value;
    localStorage.setItem("winchester-selected-home", state.selectedId);
    renderReview();
  });
  document.getElementById("copy-review").addEventListener("click", async () => {
    const text = `${home.name}\n${formatMoney.format(home.price)} · ${home.score}/100 · ${home.verdict}\nStation ${home.station} min · Evidence ${home.evidence}%\nTarget deal ${formatMoney.format(offer.offerTarget)}\n\nSeeded Winchester House Hunter demo. Verify all facts before acting.`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Review summary copied");
    } catch {
      showToast("Copy was blocked by this browser");
    }
  });
  document.getElementById("mark-viewing").addEventListener("click", () => showToast(`${home.name} marked ready in this browser`));
}

function renderEvidence() {
  const complete = evidenceTasks.filter((task) => state.evidence.includes(task.id)).length;
  const readiness = Math.round((complete / evidenceTasks.length) * 100);
  workspace.innerHTML = `
    ${pageIntro("Verify", "Evidence centre", "Keep official records, source claims and buyer observations separate before relying on a recommendation.")}
    <section class="feature-hero feature-hero--evidence">
      <div>
        <span class="section-kicker">Decision record</span>
        <h1>Know what is fact, inference and still missing.</h1>
        <p>The demo models provenance and gaps rather than turning a thin listing into a confident recommendation.</p>
      </div>
      <div class="readiness-ring" style="--readiness:${readiness * 3.6}deg"><span><strong id="readiness-value">${readiness}%</strong>review ready</span></div>
    </section>
    <section class="evidence-layout">
      <div>
        <div class="section-heading"><span class="section-kicker">Checks for ${selectedHome().name}</span><h2>Before the viewing decision</h2></div>
        <div class="check-list" id="evidence-checks">
          ${evidenceTasks
            .map(
              (task) => `<label class="${state.evidence.includes(task.id) ? "complete" : ""}">
                <input type="checkbox" value="${task.id}" ${state.evidence.includes(task.id) ? "checked" : ""}>
                <span class="check-mark">${icon("check")}</span>
                <span><strong>${task.label}</strong><small>${task.source}</small></span>
              </label>`,
            )
            .join("")}
        </div>
      </div>
      <aside class="source-register">
        <span class="section-kicker">Source register</span>
        <h2>Four different levels of reliance.</h2>
        <article><b class="source-dot official"></b><div><strong>HM Land Registry</strong><span>Official · completed sales · bundled demo snapshot</span></div><em>High</em></article>
        <article><b class="source-dot supplied"></b><div><strong>Agent listing</strong><span>Supplied claim · current availability requires recheck</span></div><em>Medium</em></article>
        <article><b class="source-dot model"></b><div><strong>Affordability model</strong><span>Calculated from explicit buyer assumptions</span></div><em>Inspect</em></article>
        <article><b class="source-dot missing"></b><div><strong>Survey and title</strong><span>Not yet supplied in this seeded journey</span></div><em>Missing</em></article>
      </aside>
    </section>
    <section class="boundary-note">
      ${icon("shield")}
      <div><strong>Demo boundary</strong><p>No live portal scraping, customer account, mortgage decision or offer is created here. Checklist changes stay in this browser.</p></div>
    </section>
  `;
  document.querySelectorAll("#evidence-checks input").forEach((input) => {
    input.addEventListener("change", () => {
      state.evidence = [...document.querySelectorAll("#evidence-checks input:checked")].map((item) => item.value);
      localStorage.setItem("winchester-evidence", JSON.stringify(state.evidence));
      renderEvidence();
    });
  });
}

function render() {
  updateNavigation();
  if (state.route === "market") renderMarket();
  else if (state.route === "plan") renderPlan();
  else if (state.route === "review") renderReview();
  else if (state.route === "evidence") renderEvidence();
  else renderHomes();
  updateNavigation();
}

document.addEventListener("click", (event) => {
  const routeLink = event.target.closest("[data-route]");
  if (!routeLink) return;
  event.preventDefault();
  setRoute(routeLink.dataset.route);
});

window.addEventListener("hashchange", () => {
  state.route = location.hash.replace("#", "") || "homes";
  render();
});

document.getElementById("reset-demo").addEventListener("click", () => {
  localStorage.removeItem("winchester-selected-home");
  localStorage.removeItem("winchester-evidence");
  state.selectedId = homes[0].id;
  state.evidence = ["listing", "sold"];
  state.query = "";
  state.homeFilter = "all";
  showToast("Demo state reset");
  setRoute("homes");
});

render();
