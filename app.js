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
    note: "The shortest station walk in the shortlist, with useful price headroom below the Lifetime ISA limit.",
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
    note: "More space for the money. Walk the 22-minute route to the station before you decide.",
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
    note: "Worth viewing if a 24-minute station walk suits you and the listing facts check out.",
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
    note: "The cheapest home here, so it leaves the most cash spare. Check the condition and works carefully.",
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
    note: "A 15-minute station walk. It is priced at the Lifetime ISA limit, so you cannot offer more.",
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
    note: "Good space at an affordable price. The 38-minute walk to the station lowers the score.",
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
    note: "Priced at the £450k Lifetime ISA limit with only a patio. Check the evidence and condition before going further.",
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
    note: "Three bedrooms at the £450k Lifetime ISA limit. It needs works, which leaves no budget for surprises.",
  },
];

const marketData = window.WINCHESTER_MARKET_DATA;
if (!marketData?.rows?.length) {
  throw new Error("Generated Winchester market summary is missing");
}
const marketRows = marketData.rows;

const LISA_LIMIT = 450000;

const evidenceTasks = [
  { id: "listing", label: "Listing facts confirmed against the agent source", source: "Agent listing" },
  { id: "sold", label: "Comparable sold prices reviewed", source: "HM Land Registry" },
  { id: "walk", label: "Station walk tested at commute time", source: "Your own check" },
  { id: "tenure", label: "Title and tenure evidence requested", source: "Conveyancer" },
  { id: "condition", label: "Condition and first-year works checked", source: "Survey or viewing" },
];

// Plain-English display text for the condition values stored on each home.
const conditionLabels = {
  Cosmetic: "Needs cosmetic updates",
  Tired: "Needs works",
};

const formatMoney = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

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
    train: '<path d="M7 16h10M8 20l2-4m6 4-2-4M6 3h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 7h6"/>',
    bed: '<path d="M3 18v-7m18 7v-5H3v5m3-5V7h6a3 3 0 0 1 3 3v3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
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

function pageHead(title, lede, summary = "") {
  return `
    <header class="page-head">
      <h1>${title}</h1>
      <p class="lede">${lede}</p>
      ${summary ? `<p class="summary">${summary}</p>` : ""}
    </header>
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

function tenureAndCondition(home) {
  return `${home.tenure}. ${conditionLabels[home.condition] || home.condition}.`;
}

function homeFacts(home) {
  return `
    <span>${icon("bed")}${plural(home.beds, "bedroom", "bedrooms")}</span>
    <span>${plural(home.toilets, "toilet", "toilets")}</span>
    <span>${home.garden}</span>
    <span>${icon("train")}${home.station} min walk to station</span>
  `;
}

function lisaTag(home) {
  if (home.price > LISA_LIMIT) return '<span class="tag tag--danger">Over Lifetime ISA limit</span>';
  if (home.price === LISA_LIMIT) return '<span class="tag tag--attention">At Lifetime ISA limit</span>';
  return "";
}

function stillToConfirm(home) {
  return home.evidence >= 75
    ? `${home.evidence}% of facts confirmed. Confirm the rest before you offer.`
    : `${home.evidence}% of facts confirmed. Title, condition or listing gaps remain.`;
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
    return `<div class="empty-state"><h3>No homes match</h3><p>Clear the search or choose another filter.</p><button type="button" id="clear-homes">Show every home</button></div>`;
  }
  return visible
    .map(
      (home) => `
        <article class="home-card">
          <button type="button" data-open-home="${home.id}" aria-label="Review ${home.name}">
            <div class="listing-main">
              <div class="listing-top">
                <strong class="listing-price">${formatMoney.format(home.price)}</strong>
                <span class="tag">${home.status}</span>
                ${lisaTag(home)}
              </div>
              <h3>${home.name}, ${home.postcode}</h3>
              <div class="home-facts">${homeFacts(home)}</div>
              <p class="listing-tenure">${tenureAndCondition(home)}</p>
              <p class="listing-why"><strong>${home.verdict}.</strong> ${home.note}</p>
              <p class="listing-gap"><strong>Still to confirm:</strong> ${stillToConfirm(home)}</p>
            </div>
            <div class="listing-side">
              <p class="listing-fit"><strong>${home.score}</strong><span>out of 100<br />fit score</span></p>
              <p class="listing-sold"><span>Sold-price range</span>${home.soldBand}</p>
              <span class="listing-cta">See full check ${icon("arrow")}</span>
            </div>
          </button>
        </article>
      `,
    )
    .join("");
}

function homesSummary() {
  const withinLisa = homes.filter((home) => home.price <= LISA_LIMIT).length;
  const nearStation = homes.filter((home) => home.station <= 15).length;
  const mostConfirmed = homes.filter((home) => home.evidence >= 75).length;
  const lisaPart =
    withinLisa === homes.length
      ? `all priced within the Lifetime ISA limit of ${formatMoney.format(LISA_LIMIT)}`
      : `${withinLisa} priced within the Lifetime ISA limit of ${formatMoney.format(LISA_LIMIT)}`;
  return `${homes.length} homes, ${lisaPart}. ${nearStation} ${nearStation === 1 ? "is" : "are"} a 15-minute walk or less from the station. ${mostConfirmed} ${mostConfirmed === 1 ? "has" : "have"} most facts confirmed.`;
}

function renderHomes() {
  workspace.innerHTML = `
    ${pageHead(
      "Saved homes in Winchester",
      "Compare nine example homes a first-time buyer has saved. Open one to see its checks and an offer range.",
      homesSummary(),
    )}

    <section class="catalogue-controls" aria-label="Find homes">
      <label class="search-control">${icon("search")}<span class="sr-only">Search homes</span><input id="home-search" name="home-search" type="search" placeholder="Search street or postcode" value="${state.query}" /></label>
      <label class="sort-control"><span>Sort by</span><select id="home-sort" name="home-sort" aria-label="Sort homes">
        <option value="match" ${state.sort === "match" ? "selected" : ""}>Highest fit score</option>
        <option value="price" ${state.sort === "price" ? "selected" : ""}>Lowest price</option>
        <option value="station" ${state.sort === "station" ? "selected" : ""}>Shortest walk to station</option>
        <option value="evidence" ${state.sort === "evidence" ? "selected" : ""}>Most facts confirmed</option>
      </select></label>
    </section>
    <div class="filter-row" role="group" aria-label="Filter homes">
      ${[
        ["all", "All homes"],
        ["under-425", "Under £425k"],
        ["station", "15 min or less to station"],
        ["three-bed", "3+ bedrooms"],
        ["evidence", "Most facts confirmed"],
      ]
        .map(([id, label]) => `<button type="button" data-home-filter="${id}" aria-pressed="${state.homeFilter === id}">${label}</button>`)
        .join("")}
    </div>
    <p class="result-count"><strong id="home-result-count">${filteredHomes().length}</strong> of ${homes.length} homes showing</p>
    <p class="list-key"><strong>Fit score</strong> rates each home out of 100 on budget, station walk, space, condition and evidence. In this example the scores are set by hand, not calculated. <strong>Facts confirmed</strong> is how much of the listing a source backs up, such as HM Land Registry, a survey or your own viewing. "Most" means 75% or more.</p>
    <section class="listing-list" id="home-grid" aria-label="Saved homes">${homeCards()}</section>
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
  const coverage = marketData.coverage;
  const filters = marketData.filters;
  const generated = formatDate(marketData.generatedAt);
  workspace.innerHTML = `
    ${pageHead(
      "2025 sold prices by area and property type",
      "Completed 2025 sales in Winchester to compare against an asking price. None of these homes is for sale now.",
      `${coverage.includedRecords.toLocaleString("en-GB")} of ${coverage.sourceRecords.toLocaleString("en-GB")} Winchester district sales in the HM Land Registry file meet the rules below, covering ${formatDate(coverage.earliestSale)} to ${formatDate(coverage.latestSale)}. Source: HM Land Registry Price Paid Data, Open Government Licence v3.0.`,
    )}
    <section class="market-layout">
      <div class="market-main">
        <div class="market-toolbar">
          <label>Postcode area<select id="market-area" name="market-area"><option value="all">All areas</option><option>SO21</option><option>SO22</option><option>SO23</option></select></label>
          <label>Property type<select id="market-type" name="market-type"><option value="all">All types</option><option>Terraced</option><option>Semi-detached</option><option>Detached</option><option>Flat</option></select></label>
        </div>
        <p class="bars-caption">Median sale price for each group</p>
        <div class="market-bars" id="market-bars">
          ${marketRows
            .map(
              (row) => `<article data-market-row data-area="${row.area}" data-type="${row.type}">
                <div><strong>${row.area} · ${row.type}</strong><span>${plural(row.sales, "sale", "sales")}</span></div>
                <div class="bar-track" aria-hidden="true"><span style="width:${Math.round((row.median / maxMedian) * 100)}%"></span></div>
                <b>${formatMoney.format(row.median)}</b>
              </article>`,
            )
            .join("")}
        </div>
      </div>
      <aside class="market-note">
        <h2>Using these prices</h2>
        <ul>
          <li>Start with the closest property type and postcode.</li>
          <li>Look at the full price range as well as the median.</li>
          <li>Adjust for condition, tenure, size and sale date.</li>
          <li>Keep listing claims separate from official completed sales.</li>
        </ul>
        <p>Snapshot downloaded ${generated}. Later Land Registry releases can add or correct sales.</p>
        <details><summary>Which sales are included</summary><p>Standard sales at full market value (category A), recorded as new entries (record status A), for detached, semi-detached and terraced houses and flats, priced from ${formatMoney.format(filters.priceRangeGbp[0])} to ${formatMoney.format(filters.priceRangeGbp[1])}. The median is the middle price. The low and high columns show the middle half of prices: a quarter of sales were below the low figure and a quarter above the high one.</p><p><a href="data/price-paid-source.json">See the source data and checksum</a></p><p><a href="docs/MARKET_DATA_CONTRACT.md">Read how the figures are built</a></p></details>
      </aside>
    </section>
    <section class="market-table-wrap">
      <table>
        <caption class="sr-only">Sold prices by postcode area and property type</caption>
        <thead><tr><th scope="col">Area and type</th><th scope="col">Sales</th><th scope="col">Low</th><th scope="col">Median</th><th scope="col">High</th></tr></thead>
        <tbody id="market-table">${marketRows
          .map(
            (row) => `<tr data-market-row data-area="${row.area}" data-type="${row.type}"><th scope="row">${row.area} · ${row.type}</th><td>${row.sales}</td><td>${formatMoney.format(row.p25)}</td><td><strong>${formatMoney.format(row.median)}</strong></td><td>${formatMoney.format(row.p75)}</td></tr>`,
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
  const lisaBlocked = state.plan.useLisa && result.askingPrice > LISA_LIMIT;
  const tone = lisaBlocked || result.headroom < 0 ? "shortfall" : result.headroom < 15000 ? "tight" : "ready";
  const status = lisaBlocked
    ? "Over the Lifetime ISA limit"
    : result.headroom < 0
      ? "Over budget"
      : result.headroom < 15000
        ? "Only just within budget"
        : "Within budget";
  const decision = lisaBlocked
    ? `The asking price is ${formatMoney.format(result.askingPrice - LISA_LIMIT)} over the ${formatMoney.format(LISA_LIMIT)} Lifetime ISA limit.`
    : result.headroom < 0
      ? `The asking price is ${formatMoney.format(Math.abs(result.headroom))} more than the most you can pay on these numbers.`
      : `You could pay up to ${formatMoney.format(result.headroom)} more than the asking price on these numbers, before any survey findings.`;
  const feesOnly = Math.min(LISA_LIMIT, result.borrowingCapacity + state.plan.deposit - state.plan.fees);
  const withReserve = Math.min(LISA_LIMIT, result.borrowingCapacity + state.plan.deposit - state.plan.fees - state.plan.reserve);
  return `
    <div class="decision-card decision-card--${tone}">
      <p class="decision-status">${status}</p>
      <p class="decision-text">${decision}</p>
      <dl class="figure-list">
        <div><dt>Most you can pay</dt><dd>${formatMoney.format(result.modelledMaxPrice)}</dd></div>
        <div><dt>Mortgage needed</dt><dd>${formatMoney.format(result.mortgageRequired)}</dd></div>
        <div><dt>Monthly payment at ${state.plan.rate}%</dt><dd>${formatMoney.format(result.monthly)}</dd></div>
        <div><dt>Cash towards the price</dt><dd>${formatMoney.format(result.cashForPrice)}</dd></div>
      </dl>
    </div>
    <h2 class="plan-subhead">How your cash choices change the most you can pay</h2>
    <table class="scenario-table">
      <caption class="sr-only">Most you can pay under three cash choices</caption>
      <tbody>
        <tr><th scope="row">Pay buying fees only, keep nothing back</th><td>${formatMoney.format(feesOnly)}</td></tr>
        <tr><th scope="row">Pay fees and keep ${formatMoney.format(state.plan.reserve)} after buying</th><td>${formatMoney.format(withReserve)}</td></tr>
        <tr class="active"><th scope="row">Also set aside ${formatMoney.format(state.plan.works)} for first-year works <span>(your plan)</span></th><td>${formatMoney.format(result.modelledMaxPrice)}</td></tr>
      </tbody>
    </table>
  `;
}

function renderPlan() {
  workspace.innerHTML = `
    ${pageHead(
      "Work out your maximum price",
      `A Lifetime ISA is a savings account where the government adds 25%, up to £1,000 a year. You can only use it on a first home costing ${formatMoney.format(LISA_LIMIT)} or less. Your borrowing, fees, reserve and first-year works may set a lower limit.`,
    )}
    <section class="plan-layout">
      <form id="plan-form" class="plan-form">
        <fieldset class="form-section"><legend>The home</legend><div class="field-grid">
          ${planField("askingPrice", "Asking price", { prefix: "£", step: 1000 })}
          <label class="check-field"><input id="plan-useLisa" name="useLisa" type="checkbox" ${state.plan.useLisa ? "checked" : ""}><span>Use a Lifetime ISA</span></label>
        </div></fieldset>
        <fieldset class="form-section"><legend>Borrowing</legend><div class="field-grid">
          ${planField("salary", "Expected salary", { prefix: "£", step: 1000 })}
          ${planField("multiple", "Loan as a multiple of salary", { suffix: "×", step: 0.1 })}
          ${planField("rate", "Mortgage rate", { suffix: "%", step: 0.05 })}
          ${planField("term", "Mortgage term", { suffix: "years" })}
        </div></fieldset>
        <fieldset class="form-section"><legend>Your cash</legend><div class="field-grid">
          ${planField("deposit", "Cash deposit", { prefix: "£", step: 1000 })}
          ${planField("lisaContribution", "Lifetime ISA savings this year", { prefix: "£", step: 500 })}
          ${planField("fees", "Buying fees", { prefix: "£", step: 100 })}
          ${planField("reserve", "Cash to keep after buying", { prefix: "£", step: 1000 })}
          ${planField("works", "First-year repairs and works", { prefix: "£", step: 1000 })}
        </div></fieldset>
      </form>
      <div class="plan-output" id="plan-output" aria-live="polite">${planResults()}</div>
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
  return { offerTarget, opening, walkAway: Math.min(LISA_LIMIT, home.price + (home.price < 430000 ? 5000 : 0)) };
}

function renderReview() {
  const home = selectedHome();
  const offer = reviewSummary(home);
  const atLimit = home.price === LISA_LIMIT;
  const commute = home.station <= 15 ? ["Short walk", "success"] : home.station <= 22 ? ["Test the route", "attention"] : ["Long walk", "attention"];
  const evidenceOk = home.evidence >= 75;
  workspace.innerHTML = `
    <a class="back-link" href="#homes" data-route="homes">${icon("back")}Back to saved homes</a>
    <section class="review-head">
      <div class="review-title">
        <div class="listing-top">
          <strong class="listing-price">${formatMoney.format(home.price)}</strong>
          <span class="tag">${home.status}</span>
          ${lisaTag(home)}
        </div>
        <h1>${home.name}</h1>
        <p class="review-place">${home.postcode}, Winchester</p>
        <div class="home-facts">${homeFacts(home)}</div>
        <p class="listing-tenure">${tenureAndCondition(home)}</p>
      </div>
      <div class="review-fit">
        <p class="review-score"><strong>${home.score}</strong> out of 100 fit score: <b>${home.verdict}</b></p>
        <p>${home.note}</p>
        <label>Review another home<select id="review-home" name="review-home">${homes.map((item) => `<option value="${item.id}" ${item.id === home.id ? "selected" : ""}>${item.name}</option>`).join("")}</select></label>
      </div>
    </section>
    <section class="review-grid">
      <div class="review-column">
        <h2>Key facts</h2>
        <dl class="key-facts">
          <div><dt>Asking price</dt><dd>${formatMoney.format(home.price)}</dd></div>
          <div><dt>Walk to station</dt><dd>${home.station} min</dd></div>
          <div><dt>Layout</dt><dd>${plural(home.beds, "bedroom", "bedrooms")}, ${plural(home.toilets, "toilet", "toilets")}</dd></div>
          <div><dt>Condition</dt><dd>${conditionLabels[home.condition] || home.condition}</dd></div>
          <div><dt>Sold-price range</dt><dd>${home.soldBand}</dd></div>
          <div><dt>Facts confirmed</dt><dd>${home.evidence}%</dd></div>
        </dl>

        <h2>Checks on finance, commute and evidence</h2>
        <p class="section-lede">Fixed rules, applied the same way to every home.</p>
        <div class="rule-checks">
          <article><span>Finance</span><strong class="tone-${atLimit ? "attention" : "success"}">${atLimit ? "At the Lifetime ISA limit" : `${formatMoney.format(LISA_LIMIT - home.price)} below the Lifetime ISA limit`}</strong><p>${atLimit ? `Do not let an offer, or a deal on fixtures and fittings, push the price above ${formatMoney.format(LISA_LIMIT)}.` : "Keep the remaining cash for fees, reserve and repairs. Don't spend it on a higher offer."}</p></article>
          <article><span>Commute</span><strong class="tone-${commute[1]}">${commute[0]}</strong><p>This scores the walk to Winchester station only. The train to Waterloo and the rest of the trip are not part of the check.</p></article>
          <article><span>Evidence</span><strong class="tone-${evidenceOk ? "success" : "attention"}">${evidenceOk ? "Enough to book a viewing" : "Gaps remain"}</strong><p>${evidenceOk ? "The sources cover enough to decide on a viewing. Confirm the rest before you make an offer." : "Fill the title, condition or listing gaps before you rely on the fit score."}</p></article>
        </div>
      </div>
      <aside class="negotiation-card">
        <h2>Offer range</h2>
        <dl>
          <div><dt>Opening offer</dt><dd>${formatMoney.format(offer.opening)}</dd></div>
          <div><dt>Price to aim for</dt><dd>${formatMoney.format(offer.offerTarget)}</dd></div>
          <div><dt>Walk-away price</dt><dd>${formatMoney.format(offer.walkAway)}</dd></div>
        </dl>
        <p>An illustrative range from the example's rules. A survey, broker and conveyancer need to confirm the facts before you offer.</p>
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
    const text = `${home.name}, ${home.postcode}\n${formatMoney.format(home.price)}. Fit score ${home.score} out of 100: ${home.verdict}.\nWalk to station: ${home.station} min. Facts confirmed: ${home.evidence}%.\nPrice to aim for: ${formatMoney.format(offer.offerTarget)}.\n\nExample from Winchester Buyer Check. Check all facts before acting.`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Review summary copied");
    } catch {
      showToast("Copy was blocked by this browser");
    }
  });
  document.getElementById("mark-viewing").addEventListener("click", () => showToast(`${home.name} marked ready for viewing in this browser`));
}

function renderEvidence() {
  const complete = evidenceTasks.filter((task) => state.evidence.includes(task.id)).length;
  const readiness = Math.round((complete / evidenceTasks.length) * 100);
  workspace.innerHTML = `
    ${pageHead(
      "What still needs checking",
      "Tick each check as you confirm it. Official records, the agent's claims and your own checks are kept apart.",
      `<strong id="readiness-value">${readiness}%</strong> ready to review: ${complete} of ${evidenceTasks.length} checks done.`,
    )}
    <div class="progress-bar" role="progressbar" aria-label="Checks done" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${readiness}"><span style="width:${readiness}%"></span></div>
    <section class="evidence-layout">
      <div>
        <h2>Checks for ${selectedHome().name}</h2>
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
        <h2>Sources and how far to rely on them</h2>
        <article><b class="source-dot official"></b><div><strong>HM Land Registry</strong><span>Official record of completed sales. A snapshot is included with this example.</span></div><em class="tone-success">High</em></article>
        <article><b class="source-dot supplied"></b><div><strong>Agent listing</strong><span>The agent's claim. Check the home is still for sale.</span></div><em class="tone-attention">Medium</em></article>
        <article><b class="source-dot model"></b><div><strong>Affordability calculator</strong><span>Worked out from the numbers you enter on the Plan page.</span></div><em>Check inputs</em></article>
        <article><b class="source-dot missing"></b><div><strong>Survey and title</strong><span>Not supplied yet in this example.</span></div><em class="tone-danger">Missing</em></article>
      </aside>
    </section>
    <section class="boundary-note">
      <h2>What this example does not do</h2>
      <p>It does not copy listings from property sites, create accounts, make mortgage decisions or send offers.</p>
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
  showToast("Example reset");
  setRoute("homes");
});

render();
