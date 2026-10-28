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
    status: "Shortlisted",
    evidence: 82,
    soldBand: "£386k–£421k",
    verdict: "Shortest walk",
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
    status: "New lead",
    evidence: 75,
    soldBand: "£397k–£432k",
    verdict: "Commute trade-off",
    note: "Good space for the price. The 38-minute walk to the station lowers its fit score.",
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

const Calc = window.BuyerCalculator;
const Fit = window.FitScore;
const buyingRules = window.WINCHESTER_BUYING_RULES;
const LISA_LIMIT = Calc.LISA_PRICE_LIMIT;

// The checklist follows the National Trading Standards material information list
// (Parts A to C), plus three checks the buyer makes themselves.
const ownChecks = {
  id: "own",
  title: "Your own checks",
  description: "Things no listing can tell you.",
  items: [
    { id: "sold-prices", label: "Compare sold prices nearby", help: "Use the Market page for similar homes in the same postcode area." },
    { id: "station-walk", label: "Walk to the station at commute time", help: "Time the route you would really take." },
    { id: "survey", label: "Book a survey", help: "A surveyor checks condition and the cost of any works." },
  ],
};
const checkGroups = [...buyingRules.materialInformation.groups, ownChecks];
const allChecks = checkGroups.flatMap((group) => group.items);
const DEFAULT_CHECKS = ["price", "sold-prices"];

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

const formatWhole = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const formatShare = (share) => `${Math.round(share * 100)}%`;

function parseMoney(value) {
  return Number(String(value).replace(/[^\d.]/g, "")) || 0;
}

function readStored(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    // Private windows can block storage; the page still works for this visit.
  }
}

const DEFAULT_PLAN = Object.freeze({
  askingPrice: 425000,
  salary: 72000,
  deposit: 85000,
  lisaContribution: 4000,
  useLisa: true,
  firstTimeBuyer: true,
  conveyancing: 2000,
  survey: 800,
  lenderFee: 1000,
  moving: 1200,
  reserve: 12000,
  works: 15000,
  multiple: 4.5,
  rate: 4.5,
  term: 30,
  bedroomsNeeded: 2,
});

const storedChecks = readStored("winchester-checks", {});

const state = {
  route: location.hash.replace("#", "") || "homes",
  selectedId: (() => {
    try {
      return localStorage.getItem("winchester-selected-home") || homes[0].id;
    } catch {
      return homes[0].id;
    }
  })(),
  homeFilter: "all",
  query: "",
  sort: "plan",
  checks: storedChecks && typeof storedChecks === "object" && !Array.isArray(storedChecks) ? storedChecks : {},
  plan: { ...DEFAULT_PLAN },
  importance: { ...Fit.DEFAULT_IMPORTANCE },
};

const workspace = document.getElementById("workspace");
const toast = document.getElementById("toast");

// The plan applied to every home: one maximum, the Lifetime ISA limit when used, bedrooms needed.
function planContext() {
  return {
    budgetMax: Calc.calculateAffordability(state.plan).modelledMaxPrice,
    lisaLimit: state.plan.useLisa ? LISA_LIMIT : undefined,
    bedroomsNeeded: state.plan.bedroomsNeeded,
  };
}

function scoreFor(home, context = planContext()) {
  return Fit.fitScore(home, context, state.importance);
}

// The current plan applied to one home's price. Same rules as the Plan page.
function budgetFor(home) {
  return Calc.assessBudget(state.plan, home.price);
}

function budgetHeadline(check) {
  if (check.level === "over-lisa") return "Over the Lifetime ISA limit";
  if (check.level === "over") return `${formatMoney.format(Math.abs(check.headroom))} over what your plan allows`;
  if (check.level === "tight") return `Only just within your plan, ${formatMoney.format(check.headroom)} to spare`;
  return `Within your plan, ${formatMoney.format(check.headroom)} to spare`;
}

// One quiet line per card. Colour only for the homes that fit; the page summary says how many do not.
function budgetLine(home) {
  const check = budgetFor(home);
  const tone = check.withinPlan ? ` tone-${check.tone}` : "";
  return `<p class="listing-budget${tone}">${budgetHeadline(check)}.</p>`;
}

function icon(name) {
  const paths = {
    train: '<path d="M7 16h10M8 20l2-4m6 4-2-4M6 3h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 7h6"/>',
    bed: '<path d="M3 18v-7m18 7v-5H3v5m3-5V7h6a3 3 0 0 1 3 3v3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
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

function selectHome(id) {
  state.selectedId = id;
  store("winchester-selected-home", id);
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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
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

const criterionName = (id) => Fit.CRITERIA.find((criterion) => criterion.id === id)?.label.toLowerCase() || id;

function listWords(words) {
  if (words.length < 2) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

function sensitivityNote(context) {
  const result = Fit.weightSensitivity(homes, context, state.importance);
  if (result.stable) return { short: "Ranking stable", long: "Moving any one share up or down by a fifth keeps the same top three." };
  const names = listWords(result.dependsOn.map(criterionName));
  return {
    short: `Ranking depends on ${names}`,
    long: `A small change to how much ${result.dependsOn.length === 1 ? "it counts" : "they count"} reorders the top three.`,
  };
}

function filteredHomes() {
  const query = state.query.trim().toLowerCase();
  const context = planContext();
  const ranked = Fit.rankHomes(homes, context, state.importance, { affordableFirst: state.sort === "plan" });
  return ranked
    .filter(({ home }) => {
      if (query && !`${home.name} ${home.postcode}`.toLowerCase().includes(query)) return false;
      if (state.homeFilter === "within-plan") return budgetFor(home).withinPlan;
      if (state.homeFilter === "under-425") return home.price < 425000;
      if (state.homeFilter === "station") return home.station <= 15;
      if (state.homeFilter === "three-bed") return home.beds >= 3;
      if (state.homeFilter === "evidence") return home.evidence >= 75;
      return true;
    })
    .sort((a, b) => {
      if (state.sort === "price") return a.home.price - b.home.price;
      if (state.sort === "station") return a.home.station - b.home.station;
      if (state.sort === "evidence") return b.home.evidence - a.home.evidence;
      return 0; // "plan" and "score" keep the ranking order
    });
}

function homeCards() {
  const visible = filteredHomes();
  if (!visible.length) {
    const withinFilter = state.homeFilter === "within-plan";
    return `<div class="empty-state"><h3>No homes match</h3><p>${withinFilter ? "None of the saved homes is within your plan. Change the plan to see what it would take." : "Clear the search or choose another filter."}</p><div class="empty-actions">${withinFilter ? '<a class="button" href="#plan" data-route="plan">Change my plan</a>' : ""}<button type="button" id="clear-homes"${withinFilter ? ' class="secondary"' : ""}>Show every home</button></div></div>`;
  }
  return visible
    .map(
      ({ home, score }) => `
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
              ${budgetLine(home)}
              <p class="listing-gap"><strong>Still to confirm:</strong> ${stillToConfirm(home)}</p>
            </div>
            <div class="listing-side">
              <p class="listing-fit"><strong>${score}</strong><span>out of 100<br />fit score</span></p>
              <p class="listing-sold"><span>Sold-price range</span>${home.soldBand}</p>
              <span class="listing-cta">See full check ${icon("arrow")}</span>
            </div>
          </button>
        </article>
      `,
    )
    .join("");
}

function planSummary() {
  const maxPrice = planContext().budgetMax;
  const within = homes.filter((home) => budgetFor(home).withinPlan).length;
  const count =
    within === homes.length
      ? `all ${homes.length} homes are within it`
      : within === 0
        ? "none of the homes is within it"
        : `${within} of the ${homes.length} homes ${within === 1 ? "is" : "are"} within it`;
  return `Your plan allows up to <strong>${formatMoney.format(maxPrice)}</strong>, so ${count}.`;
}

function scoreExplainer(ranking) {
  const shares = Fit.normaliseWeights(state.importance);
  const share = (id) => formatShare(shares[id]);
  const a = Fit.ANCHORS;
  return `
    <details class="score-explainer">
      <summary>What is the fit score?</summary>
      <div class="explainer-body">
        <p>The fit score marks each home out of 100 on five things. Each is measured against a fixed yardstick, not against the other homes, so adding or removing a home never changes another home’s score.</p>
        <ul>
          <li><strong>Budget (${share("budget")}).</strong> No marks if the price is over the most your plan allows. Half marks at exactly your limit, full marks with ${formatMoney.format(a.budgetFullMarksHeadroom)} or more to spare.</li>
          <li><strong>Walk to station (${share("walk")}).</strong> Full marks at ${a.walkFullMarks} minutes or less, half marks at ${a.walkHalfMarks}, none at ${a.walkNoMarks} or more.</li>
          <li><strong>Bedrooms (${share("bedrooms")}).</strong> Full marks with a spare room, three quarters with exactly the number you need, a quarter with one fewer.</li>
          <li><strong>Condition (${share("condition")}).</strong> 70% of the marks for cosmetic updates, 30% for a home that needs works.</li>
          <li><strong>Facts confirmed (${share("facts")}).</strong> How much of the listing a source backs up, such as HM Land Registry, a survey or your own viewing. Full marks at ${a.factsFullMarks}% or more.</li>
        </ul>
        <p>The percentages are how much each part counts. <a href="#plan" data-route="plan">Change them on the Plan page</a>.</p>
        <p><strong>${ranking.short}.</strong> ${ranking.long}</p>
      </div>
    </details>
  `;
}

const homeFilters = [
  ["all", "All homes"],
  ["within-plan", "Within my plan"],
  ["under-425", "Under £425k"],
  ["station", "15 min or less to station"],
  ["three-bed", "3+ bedrooms"],
  ["evidence", "Most facts confirmed"],
];

function renderHomes() {
  const context = planContext();
  const ranking = sensitivityNote(context);
  workspace.innerHTML = `
    ${pageHead(
      "Saved homes in Winchester",
      "Nine example homes a first-time buyer has saved. Open one to see its checks, the money you need on the day and an offer range.",
    )}

    <section class="catalogue-controls" aria-label="Find homes">
      <label class="search-control">${icon("search")}<span class="sr-only">Search homes</span><input id="home-search" name="home-search" type="search" placeholder="Search street or postcode" value="${state.query}" /></label>
      <label class="sort-control"><span>Sort by</span><select id="home-sort" name="home-sort" aria-label="Sort homes">
        ${[
          ["plan", "Within my plan first"],
          ["score", "Highest fit score"],
          ["price", "Lowest price"],
          ["station", "Shortest walk to station"],
          ["evidence", "Most facts confirmed"],
        ]
          .map(([value, label]) => `<option value="${value}" ${state.sort === value ? "selected" : ""}>${label}</option>`)
          .join("")}
      </select></label>
    </section>
    <div class="filter-row" role="group" aria-label="Filter homes">
      ${homeFilters.map(([id, label]) => `<button type="button" data-home-filter="${id}" aria-pressed="${state.homeFilter === id}">${label}</button>`).join("")}
    </div>
    <p class="plan-summary">${planSummary()} <a href="#plan" data-route="plan">Change my plan</a></p>
    <div class="list-meta">
      <p class="result-count"><strong id="home-result-count">${filteredHomes().length}</strong> of ${homes.length} homes showing</p>
      <p class="ranking-note">${ranking.short}</p>
    </div>
    ${scoreExplainer(ranking)}
    <h2 class="sr-only" id="home-list-heading">Saved homes</h2>
    <section class="listing-list" id="home-grid" aria-labelledby="home-list-heading">${homeCards()}</section>
  `;

  const grid = document.getElementById("home-grid");
  const count = document.getElementById("home-result-count");
  const refresh = () => {
    grid.innerHTML = homeCards();
    count.textContent = filteredHomes().length;
    bindHomeCards();
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
      selectHome(button.dataset.openHome);
      setRoute("review");
    });
  });
  document.getElementById("clear-homes")?.addEventListener("click", () => {
    state.query = "";
    state.homeFilter = "all";
    renderHomes();
  });
}

// Shared x scale for the market chart: £0 to a round step above the highest upper quartile.
function marketScale() {
  const step = 200000;
  const max = Math.ceil(Math.max(...marketRows.map((row) => row.p75)) / step) * step;
  const ticks = Array.from({ length: max / step + 1 }, (_, index) => index * step);
  return { max, step, ticks, at: (value) => `${((value / max) * 100).toFixed(2)}%` };
}

const shortMoney = (value) => (value >= 1000000 ? `£${(value / 1000000).toFixed(value % 1000000 ? 1 : 0)}m` : value ? `£${value / 1000}k` : "£0");

function renderMarket() {
  const coverage = marketData.coverage;
  const filters = marketData.filters;
  const generated = formatDate(marketData.generatedAt);
  const scale = marketScale();
  const planMax = planContext().budgetMax;
  const showPlan = Number.isFinite(planMax) && planMax > 0 && planMax <= scale.max;
  const planLine = showPlan ? `<i class="plan-line" style="left:${scale.at(planMax)}"></i>` : "";
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
        <figure class="range-chart" style="--intervals:${scale.ticks.length - 1}">
          <figcaption>
            <span class="chart-title">The middle half of 2025 sale prices in each group</span>
            <span class="range-key" aria-hidden="true">
              <span><i class="key-range"></i>Middle half of sales</span>
              <span><i class="key-median"></i>Median</span>
              ${showPlan ? `<span><i class="key-plan"></i>Your plan: up to ${formatMoney.format(planMax)}</span>` : ""}
            </span>
          </figcaption>
          <div class="range-rows" id="market-bars">
            ${marketRows
              .map(
                (row) => `<div class="range-row" data-market-row data-area="${row.area}" data-type="${row.type}">
                  <div class="range-label"><strong>${row.area} · ${row.type}</strong><span>${plural(row.sales, "sale", "sales")}</span></div>
                  <div class="range-plot" aria-hidden="true">
                    <span class="range-bar" style="left:${scale.at(row.p25)};width:calc(${scale.at(row.p75 - row.p25)})"></span>
                    ${planLine}
                    <span class="range-median" style="left:${scale.at(row.median)}"></span>
                  </div>
                  <b class="range-value">${formatMoney.format(row.median)}</b>
                </div>`,
              )
              .join("")}
            <div class="range-row range-axis" aria-hidden="true">
              <span></span>
              <div class="range-ticks">${scale.ticks
                .map((tick, index) => `<span class="${index % 2 ? "tick-minor" : ""}" style="left:${scale.at(tick)}">${shortMoney(tick)}</span>`)
                .join("")}</div>
              <span class="range-value-head">Median</span>
            </div>
          </div>
        </figure>
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
        <details><summary>Which sales are included</summary><p>Standard sales at full market value (category A), recorded as new entries (record status A), for detached, semi-detached and terraced houses and flats, priced from ${formatMoney.format(filters.priceRangeGbp[0])} to ${formatMoney.format(filters.priceRangeGbp[1])}. The median is the middle price. The low and high figures show the middle half of prices: a quarter of sales were below the low figure and a quarter above the high one.</p><p><a href="data/price-paid-source.json">See the source data and checksum</a></p><p><a href="docs/MARKET_DATA_CONTRACT.md">Read how the figures are built</a></p></details>
      </aside>
    </section>
    <section class="market-table-wrap">
      <table class="figures-table">
        <caption class="sr-only">Sold prices by postcode area and property type</caption>
        <thead><tr><th scope="col">Area and type</th><th scope="col" class="num">Sales</th><th scope="col" class="num">Low</th><th scope="col" class="num">Median</th><th scope="col" class="num">High</th></tr></thead>
        <tbody id="market-table">${marketRows
          .map(
            (row) => `<tr data-market-row data-area="${row.area}" data-type="${row.type}"><th scope="row">${row.area} · ${row.type}</th><td class="num">${row.sales}</td><td class="num">${formatMoney.format(row.p25)}</td><td class="num"><strong>${formatMoney.format(row.median)}</strong></td><td class="num">${formatMoney.format(row.p75)}</td></tr>`,
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
  // Money fields are text inputs so they can show "425,000"; the plan keeps the number.
  const input = options.money
    ? `<input id="plan-${id}" name="${id}" type="text" inputmode="numeric" autocomplete="off" data-money value="${formatWhole.format(value)}">`
    : `<input id="plan-${id}" name="${id}" type="number" min="${options.min ?? 0}" ${options.max ? `max="${options.max}"` : ""} step="${options.step ?? 1}" value="${value}">`;
  return `<label>${label}<span class="input-shell">${prefix}${input}${suffix}</span></label>`;
}

function checkField(id, label, extraClass = "") {
  return `<label class="check-field${extraClass ? ` ${extraClass}` : ""}"><input id="plan-${id}" name="${id}" type="checkbox" ${state.plan[id] ? "checked" : ""}><span>${label}</span></label>`;
}

function stampDutyNote(costs, price) {
  if (costs.reliefApplies) return "First-time buyer relief applied";
  if (costs.reliefLost) return `No first-time buyer relief over ${formatMoney.format(Calc.SDLT_RELIEF_LIMIT)}`;
  return price ? "Standard rates" : "";
}

// The cash that leaves your account on completion day for one price.
function moneyOnTheDayTable(price, caption) {
  const day = Calc.moneyOnTheDay(state.plan, price);
  const rows = [
    ["Deposit (your cash towards the price)", day.depositPaid],
    [`Stamp duty <span>${stampDutyNote(day.costs, price)}</span>`, day.costs.stampDuty],
    ["Conveyancing (legal work)", day.costs.conveyancing],
    ["Survey", day.costs.survey],
    ["Lender fee", day.costs.lenderFee],
    ["Moving", day.costs.moving],
  ];
  if (day.costs.otherFees) rows.push(["Other fees", day.costs.otherFees]);
  const bonus = day.lisaBonus ? `, including the ${formatMoney.format(day.lisaBonus)} Lifetime ISA bonus` : "";
  const after =
    day.cashShortfall > 0
      ? `You have ${formatMoney.format(day.cashAvailable)}${bonus}, which is ${formatMoney.format(day.cashShortfall)} short of this.`
      : `You have ${formatMoney.format(day.cashAvailable)}${bonus}. That leaves ${formatMoney.format(day.leftAfter)}: the ${formatMoney.format(state.plan.reserve)} you keep back and ${formatMoney.format(state.plan.works)} for first-year works.`;
  const mortgage =
    day.mortgageShortfall > 0
      ? `The mortgage would need to be ${formatMoney.format(day.mortgageRequired)}, which is ${formatMoney.format(day.mortgageShortfall)} more than your plan can borrow (${formatMoney.format(day.borrowingCapacity)}).`
      : `The mortgage covers the other ${formatMoney.format(day.mortgageRequired)}.`;
  return `
    <table class="money-table">
      <caption class="sr-only">${caption}</caption>
      <tbody>
        ${rows.map(([label, value]) => `<tr><th scope="row">${label}</th><td>${formatMoney.format(value)}</td></tr>`).join("")}
        <tr class="total"><th scope="row">Money needed on the day</th><td>${formatMoney.format(day.total)}</td></tr>
      </tbody>
    </table>
    <p class="money-note">${after} ${mortgage}</p>
  `;
}

function lisaRules() {
  const lisa = buyingRules.lifetimeIsa;
  return `
    <section class="rules-block" aria-labelledby="lisa-rules-heading">
      <h2 id="lisa-rules-heading" class="plan-subhead">Lifetime ISA rules</h2>
      <ul>${lisa.rules.map((rule) => `<li>${rule}</li>`).join("")}</ul>
      <p class="rules-source">${lisa.pendingChange} Checked against <a href="${lisa.sources[0].url}">GOV.UK</a> on ${formatDate(lisa.lastVerified)}.</p>
    </section>
  `;
}

function planResults() {
  const result = Calc.assessBudget(state.plan, state.plan.askingPrice);
  const lisaBlocked = result.lisaBlocked;
  const tone = { "over-lisa": "shortfall", over: "shortfall", tight: "tight", within: "ready" }[result.level];
  const status = {
    "over-lisa": "Over the Lifetime ISA limit",
    over: "Over budget",
    tight: "Only just within budget",
    within: "Within budget",
  }[result.level];
  const decision = lisaBlocked
    ? `The asking price is ${formatMoney.format(result.askingPrice - LISA_LIMIT)} over the ${formatMoney.format(LISA_LIMIT)} Lifetime ISA limit.`
    : result.headroom < 0
      ? `The asking price is ${formatMoney.format(Math.abs(result.headroom))} more than the most you can pay on these numbers.`
      : `You could pay up to ${formatMoney.format(result.headroom)} more than the asking price on these numbers, before any survey findings.`;
  const maxWith = (changes) => Calc.calculateAffordability({ ...state.plan, ...changes }).modelledMaxPrice;
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
    <h2 class="plan-subhead">Money needed on the day</h2>
    <p class="section-lede">For the asking price of ${formatMoney.format(result.askingPrice)}.</p>
    ${moneyOnTheDayTable(result.askingPrice, "Money needed on completion day at the asking price")}
    ${state.plan.useLisa ? lisaRules() : ""}
    <h2 class="plan-subhead">How your cash choices change the most you can pay</h2>
    <table class="scenario-table">
      <caption class="sr-only">Most you can pay under three cash choices</caption>
      <tbody>
        <tr><th scope="row">Pay buying costs only, keep nothing back</th><td>${formatMoney.format(maxWith({ reserve: 0, works: 0 }))}</td></tr>
        <tr><th scope="row">Pay costs and keep ${formatMoney.format(state.plan.reserve)} after buying</th><td>${formatMoney.format(maxWith({ works: 0 }))}</td></tr>
        <tr class="active"><th scope="row">Also set aside ${formatMoney.format(state.plan.works)} for first-year works <span>(your plan)</span></th><td>${formatMoney.format(result.modelledMaxPrice)}</td></tr>
      </tbody>
    </table>
  `;
}

function weightFields() {
  const shares = Fit.normaliseWeights(state.importance);
  return Fit.CRITERIA.map(
    ({ id, label }) => `<label class="weight-field">
      <span class="weight-label">${label}<output id="share-${id}" for="weight-${id}">${formatShare(shares[id])}</output></span>
      <input id="weight-${id}" name="${id}" type="range" min="0" max="10" step="1" value="${state.importance[id]}" data-weight aria-describedby="share-${id}">
    </label>`,
  ).join("");
}

function rankingPreview() {
  const context = planContext();
  const top = Fit.rankHomes(homes, context, state.importance, { affordableFirst: true }).slice(0, 3);
  const ranking = sensitivityNote(context);
  return `<p><strong>Top three now:</strong> ${top.map(({ home, score }) => `${home.name} (${score})`).join(", ")}.</p><p><strong>${ranking.short}.</strong> ${ranking.long}</p>`;
}

function refreshPlanOutputs() {
  document.getElementById("plan-output").innerHTML = planResults();
  document.getElementById("ranking-preview").innerHTML = rankingPreview();
  const shares = Fit.normaliseWeights(state.importance);
  Fit.CRITERIA.forEach(({ id }) => {
    document.getElementById(`share-${id}`).textContent = formatShare(shares[id]);
  });
}

function renderPlan() {
  workspace.innerHTML = `
    ${pageHead(
      "Work out your maximum price",
      `Enter your own numbers. The plan works out the most you can pay, the cash you need on the day and how each saved home is ranked. A Lifetime ISA can only be used on a first home costing ${formatMoney.format(LISA_LIMIT)} or less.`,
    )}
    <section class="plan-layout">
      <form id="plan-form" class="plan-form">
        <fieldset class="form-section"><legend>The home</legend><div class="field-grid">
          ${planField("askingPrice", "Asking price", { prefix: "£", money: true })}
          ${checkField("useLisa", "Use a Lifetime ISA")}
          ${checkField("firstTimeBuyer", "Everyone buying is a first-time buyer", "check-field--wide")}
        </div></fieldset>
        <fieldset class="form-section"><legend>Borrowing</legend><div class="field-grid">
          ${planField("salary", "Expected salary", { prefix: "£", money: true })}
          ${planField("multiple", "Loan as a multiple of salary", { suffix: "times salary", step: 0.1 })}
          ${planField("rate", "Mortgage rate", { suffix: "%", step: 0.05 })}
          ${planField("term", "Mortgage term", { suffix: "years" })}
        </div></fieldset>
        <fieldset class="form-section"><legend>Your cash</legend><div class="field-grid">
          ${planField("deposit", "Cash deposit", { prefix: "£", money: true })}
          ${planField("lisaContribution", "Lifetime ISA savings this year", { prefix: "£", money: true })}
          ${planField("reserve", "Cash to keep after buying", { prefix: "£", money: true })}
          ${planField("works", "First-year repairs and works", { prefix: "£", money: true })}
        </div></fieldset>
        <fieldset class="form-section"><legend>Buying costs</legend>
          <p class="fieldset-note">Example figures. Replace them with your own quotes. Stamp duty is worked out from the price.</p>
          <div class="field-grid">
          ${planField("conveyancing", "Conveyancing (legal work)", { prefix: "£", money: true })}
          ${planField("survey", "Survey", { prefix: "£", money: true })}
          ${planField("lenderFee", "Lender fee", { prefix: "£", money: true })}
          ${planField("moving", "Moving", { prefix: "£", money: true })}
        </div></fieldset>
        <fieldset class="form-section"><legend>What matters to you</legend>
          <p class="fieldset-note">How much each part counts towards the fit score on the Homes page. The shares always add up to 100%.</p>
          <div class="field-grid">
            ${planField("bedroomsNeeded", "Bedrooms you need", { min: 1, max: 6 })}
          </div>
          <div class="weight-grid">${weightFields()}</div>
          <div class="ranking-preview" id="ranking-preview">${rankingPreview()}</div>
          <button type="button" class="text-button" id="reset-weights">Use the default shares</button>
        </fieldset>
      </form>
      <div class="plan-output" id="plan-output" aria-live="polite">${planResults()}</div>
    </section>
  `;
  document.querySelectorAll("#plan-form input:not([data-weight])").forEach((input) => {
    input.addEventListener("input", () => {
      state.plan[input.name] =
        input.type === "checkbox" ? input.checked : "money" in input.dataset ? parseMoney(input.value) : Number(input.value);
      refreshPlanOutputs();
    });
    if ("money" in input.dataset) {
      input.addEventListener("blur", () => {
        input.value = formatWhole.format(state.plan[input.name]);
      });
    }
  });
  document.querySelectorAll("#plan-form [data-weight]").forEach((input) => {
    input.addEventListener("input", () => {
      state.importance[input.name] = Number(input.value);
      refreshPlanOutputs();
    });
  });
  document.getElementById("reset-weights").addEventListener("click", () => {
    state.importance = { ...Fit.DEFAULT_IMPORTANCE };
    document.querySelectorAll("#plan-form [data-weight]").forEach((input) => {
      input.value = state.importance[input.name];
    });
    refreshPlanOutputs();
  });
}

// Offer range capped at what the current plan allows for this home.
function reviewSummary(home) {
  return Calc.offerRange(home, budgetFor(home).modelledMaxPrice);
}

// Finance check for one home: the plan's verdict first, the Lifetime ISA limit only when it matters.
function financeCheck(home) {
  const check = budgetFor(home);
  const limit = formatMoney.format(LISA_LIMIT);
  const maxPrice = formatMoney.format(check.modelledMaxPrice);
  const planLink = '<a href="#plan" data-route="plan">Plan page</a>';
  const limitNote = check.atLisaLimit
    ? ` Do not let an offer, or a deal on fixtures and fittings, push the price above ${limit}.`
    : "";
  let text;
  if (check.level === "over-lisa") {
    text = `The asking price is ${formatMoney.format(home.price - LISA_LIMIT)} over the ${limit} Lifetime ISA limit.`;
  } else if (check.level === "over") {
    text = `Your plan allows up to ${maxPrice}. Check the numbers on the ${planLink} before you go further.${check.atLisaLimit ? ` The price is also at the ${limit} Lifetime ISA limit.` : ""}`;
  } else if (check.level === "tight") {
    text = `${formatMoney.format(check.headroom)} to spare after buying costs, the cash you keep back and first-year works. Don’t spend it on a higher offer.${limitNote}`;
  } else {
    text = `Your plan allows up to ${maxPrice} after buying costs, the cash you keep back and first-year works. Don’t spend the spare on a higher offer.${limitNote}`;
  }
  return { ...check, headline: budgetHeadline(check), text };
}

function lisaLineFor(home) {
  if (!state.plan.useLisa) return "";
  const lisa = buyingRules.lifetimeIsa;
  const text =
    home.price > LISA_LIMIT
      ? `This home is over the ${formatMoney.format(LISA_LIMIT)} limit, so the Lifetime ISA cannot be used for it. Taking the money out for any other reason costs a ${lisa.withdrawalChargePercent}% charge.`
      : `This home is within the ${formatMoney.format(LISA_LIMIT)} limit. You must buy at least ${lisa.monthsAfterFirstPayment} months after your first payment in, with a mortgage and a conveyancer.`;
  return `<p class="money-note"><strong>Lifetime ISA:</strong> ${text}</p>`;
}

function scoreBreakdown(fit) {
  return `
    <table class="score-table">
      <caption class="sr-only">How the fit score adds up</caption>
      <thead><tr><th scope="col">Part</th><th scope="col" class="num">Counts for</th><th scope="col" class="num">Points</th></tr></thead>
      <tbody>
        ${fit.parts.map((part) => `<tr><th scope="row">${part.label}</th><td class="num">${formatShare(part.share)}</td><td class="num">${part.points.toFixed(1)}</td></tr>`).join("")}
        <tr class="total"><th scope="row">Fit score</th><td></td><td class="num">${fit.score}</td></tr>
      </tbody>
    </table>
  `;
}

function renderReview() {
  const home = selectedHome();
  const offer = reviewSummary(home);
  const finance = financeCheck(home);
  const fit = scoreFor(home);
  const commute = home.station <= 15 ? ["Short walk", "success"] : home.station <= 22 ? ["Test the route", "attention"] : ["Long walk", "attention"];
  const evidenceOk = home.evidence >= 75;
  const offerActions = offer.outOfReach
    ? `<a class="button" href="#plan" data-route="plan">Change my plan</a>
       <button type="button" class="secondary" id="show-affordable">Show homes I can afford</button>`
    : `<button type="button" id="copy-review">Copy review summary</button>
       <button type="button" class="secondary" id="mark-viewing">Mark ready for viewing</button>`;
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
        <p class="review-score"><strong>${fit.score}</strong> out of 100 fit score: <b>${home.verdict}</b></p>
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
          <article><span>Finance</span><strong class="tone-${finance.tone}">${finance.headline}</strong><p>${finance.text}</p></article>
          <article><span>Commute</span><strong class="tone-${commute[1]}">${commute[0]}</strong><p>This scores the walk to Winchester station only. The train to Waterloo and the rest of the trip are not part of the check.</p></article>
          <article><span>Evidence</span><strong class="tone-${evidenceOk ? "success" : "attention"}">${evidenceOk ? "Enough to book a viewing" : "Gaps remain"}</strong><p>${evidenceOk ? "The sources cover enough to decide on a viewing. Confirm the rest before you make an offer." : "Fill the title, condition or listing gaps before you rely on the fit score."} <a href="#evidence" data-route="evidence">Open the checklist</a></p></article>
        </div>

        <h2 class="money-heading">Money needed on the day</h2>
        <p class="section-lede">At the asking price, with the costs from your plan. <a href="#plan" data-route="plan">Change them</a></p>
        ${moneyOnTheDayTable(home.price, `Money needed on completion day for ${home.name}`)}
        ${lisaLineFor(home)}
      </div>
      <aside class="negotiation-card">
        <h2>Offer range</h2>
        ${offer.outOfReach
          ? `<p class="offer-out-of-reach"><strong>No offer range within your budget.</strong> Your plan allows up to ${formatMoney.format(offer.budgetMax)}, which is below a sensible opening offer of ${formatMoney.format(offer.suggestedOpening)} for this home.</p>`
          : `<dl>
          <div><dt>Opening offer</dt><dd>${formatMoney.format(offer.opening)}</dd></div>
          <div><dt>Price to aim for</dt><dd>${formatMoney.format(offer.offerTarget)}</dd></div>
          <div><dt>Walk-away price</dt><dd>${formatMoney.format(offer.walkAway)}</dd></div>
        </dl>${offer.cappedAtBudget ? `<p class="offer-capped">Capped at your budget of ${formatMoney.format(offer.budgetMax)}.</p>` : ""}`}
        <p>An illustrative range from the example’s rules, never above what your plan allows. A survey, broker and conveyancer need to confirm the facts before you offer.</p>
        <div class="card-actions">${offerActions}</div>
        ${offer.outOfReach ? '<button type="button" class="text-button" id="copy-review">Copy review summary</button>' : ""}
      </aside>
      <section class="score-breakdown" aria-labelledby="score-heading">
        <h2 id="score-heading">How the fit score adds up</h2>
        ${scoreBreakdown(fit)}
        <p class="money-note"><a href="#homes" data-route="homes">What each part means</a> is on the Homes page. You set the shares on the <a href="#plan" data-route="plan">Plan page</a>.</p>
      </section>
    </section>
  `;
  document.getElementById("review-home").addEventListener("change", (event) => {
    selectHome(event.target.value);
    renderReview();
  });
  document.getElementById("copy-review").addEventListener("click", async () => {
    const text = `${home.name}, ${home.postcode}\n${formatMoney.format(home.price)}. Fit score ${fit.score} out of 100: ${home.verdict}.\nYour budget: ${finance.headline}.\nWalk to station: ${home.station} min. Facts confirmed: ${home.evidence}%.\nMoney needed on the day: ${formatMoney.format(Calc.moneyOnTheDay(state.plan, home.price).total)}.\n${offer.outOfReach ? `No offer range within your budget (up to ${formatMoney.format(offer.budgetMax)}).` : `Price to aim for: ${formatMoney.format(offer.offerTarget)}.`}\n\nExample from Winchester Buyer Check. Check all facts before acting.`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Review summary copied");
    } catch {
      showToast("Copy was blocked by this browser");
    }
  });
  document.getElementById("mark-viewing")?.addEventListener("click", () => showToast(`${home.name} marked ready for viewing in this browser`));
  document.getElementById("show-affordable")?.addEventListener("click", () => {
    state.homeFilter = "within-plan";
    state.query = "";
    setRoute("homes");
  });
}

function checksFor(home) {
  const saved = state.checks[home.id];
  return Array.isArray(saved) ? saved : DEFAULT_CHECKS;
}

// What the example listing says for an item, or "Not confirmed". Nothing is made up.
function knownValue(item, home) {
  if (item.known === "price") return `Listing says ${formatMoney.format(home.price)}`;
  if (item.known === "tenure") return `Listing says ${home.tenure.toLowerCase()}`;
  if (item.known === "rooms") return `Listing says ${plural(home.beds, "bedroom", "bedrooms")}, ${plural(home.toilets, "toilet", "toilets")}`;
  return "";
}

// The right-hand status for one checklist row.
function checkStatus(item, home, isDone, isOwnCheck) {
  if (isOwnCheck) return isDone ? "Done" : "To do";
  const known = knownValue(item, home);
  if (isDone) return known ? `${known}. Confirmed` : "Confirmed";
  return known || "Not confirmed";
}

function renderEvidence() {
  const home = selectedHome();
  const done = checksFor(home);
  const complete = allChecks.filter((item) => done.includes(item.id)).length;
  const readiness = Math.round((complete / allChecks.length) * 100);
  const mi = buyingRules.materialInformation;
  workspace.innerHTML = `
    ${pageHead(
      "What still needs checking",
      "Tick each item once you have seen it confirmed. The list follows the facts National Trading Standards expects an estate agent to give a buyer, plus three checks of your own.",
      `<strong id="readiness-value">${complete} of ${allChecks.length}</strong> checks done for ${home.name}.`,
    )}
    <div class="progress-bar" role="progressbar" aria-label="Checks done" aria-valuemin="0" aria-valuemax="${allChecks.length}" aria-valuenow="${complete}" aria-valuetext="${complete} of ${allChecks.length} checks done"><span style="width:${readiness}%"></span></div>
    <section class="evidence-layout">
      <div>
        <label class="evidence-home">Checklist for<select id="evidence-home" name="evidence-home">${homes.map((item) => `<option value="${item.id}" ${item.id === home.id ? "selected" : ""}>${item.name}</option>`).join("")}</select></label>
        <div id="evidence-checks">
          ${checkGroups
            .map(
              (group) => `<section class="check-group" aria-labelledby="group-${group.id}">
                <h2 id="group-${group.id}">${group.title}</h2>
                <p class="section-lede">${group.description}</p>
                <div class="check-list">
                  ${group.items
                    .map((item) => {
                      const isDone = done.includes(item.id);
                      const quiet = !isDone && !knownValue(item, home);
                      return `<label class="${isDone ? "complete" : ""}">
                        <input type="checkbox" value="${item.id}" ${isDone ? "checked" : ""}>
                        <span class="check-mark">${icon("check")}</span>
                        <span class="check-text"><strong>${item.label}</strong><small>${item.help}</small></span>
                        <span class="check-known${quiet ? " unknown" : ""}">${checkStatus(item, home, isDone, group.id === "own")}</span>
                      </label>`;
                    })
                    .join("")}
                </div>
              </section>`,
            )
            .join("")}
        </div>
        <p class="rules-source">Parts A to C come from the National Trading Standards material information guide for estate agents (November 2023). The government consulted in 2025 on new guidance with the same items. <a href="${mi.sources[1].url}">Read the consultation on GOV.UK</a></p>
      </div>
      <aside class="source-register">
        <h2>Sources and how far to rely on them</h2>
        <article><b class="source-dot official"></b><div><strong>HM Land Registry</strong><span>Official record of completed sales and title. A sales snapshot is included with this example.</span></div><em class="tone-success">High</em></article>
        <article><b class="source-dot supplied"></b><div><strong>Agent listing</strong><span>The agent’s claim. Check the home is still for sale.</span></div><em class="tone-attention">Medium</em></article>
        <article><b class="source-dot model"></b><div><strong>Affordability calculator</strong><span>Worked out from the numbers you enter on the Plan page.</span></div><em>Check inputs</em></article>
        <article><b class="source-dot missing"></b><div><strong>Survey and title</strong><span>Not supplied yet in this example.</span></div><em class="tone-danger">Missing</em></article>
      </aside>
    </section>
    <section class="boundary-note">
      <h2>What this example does not do</h2>
      <p>It does not copy listings from property sites, create accounts, make mortgage decisions or send offers.</p>
    </section>
  `;
  document.getElementById("evidence-home").addEventListener("change", (event) => {
    selectHome(event.target.value);
    renderEvidence();
  });
  document.querySelectorAll("#evidence-checks input").forEach((input) => {
    input.addEventListener("change", () => {
      state.checks[home.id] = [...document.querySelectorAll("#evidence-checks input:checked")].map((item) => item.value);
      store("winchester-checks", state.checks);
      const scroll = window.scrollY;
      renderEvidence();
      window.scrollTo(0, scroll);
      document.querySelector(`#evidence-checks input[value="${input.value}"]`)?.focus({ preventScroll: true });
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
  try {
    ["winchester-selected-home", "winchester-checks", "winchester-evidence"].forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage blocked: nothing saved to clear.
  }
  state.selectedId = homes[0].id;
  state.checks = {};
  state.plan = { ...DEFAULT_PLAN };
  state.importance = { ...Fit.DEFAULT_IMPORTANCE };
  state.query = "";
  state.homeFilter = "all";
  state.sort = "plan";
  showToast("Example reset");
  setRoute("homes");
});

render();
