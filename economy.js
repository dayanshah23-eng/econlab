
"use strict";

// -----------------------------------------
// 1. INDICATOR DEFINITIONS
// -----------------------------------------

const indicators = {
  "NY.GDP.PCAP.CD": {
    name: "GDP per capita",
    unit: "CURRENT US$",
    kind: "currency",
    explanation:
      "GDP per capita measures economic output divided " +
      "by population. This series uses current US dollars, " +
      "so changes reflect both real economic developments " +
      "and changes in prices or exchange rates. It does not " +
      "directly measure household income or well-being."
  },

  "FP.CPI.TOTL.ZG": {
    name: "Inflation, consumer prices",
    unit: "ANNUAL %",
    kind: "percent",
    explanation:
      "Consumer price inflation measures the annual " +
      "percentage change in a consumer price index. " +
      "An inflation rate falling from 6% to 3% generally " +
      "means prices are rising more slowly, not that " +
      "the overall price level has fallen."
  },

  "SL.UEM.TOTL.ZS": {
    name: "Unemployment, modeled ILO estimate",
    unit: "% OF LABOR FORCE",
    kind: "percent",
    explanation:
      "This unemployment indicator estimates the share " +
      "of the labor force without work, available for work, " +
      "and seeking employment, using the ILO's harmonized " +
      "methodology. It does not measure everyone who " +
      "is outside employment."
  }
};

const countries = {
  USA: "United States",
  CAN: "Canada",
  GBR: "United Kingdom",
  IND: "India",
  BRA: "Brazil"
};

const countrySelect =
  document.getElementById("countrySelect");

const indicatorSelect =
  document.getElementById("indicatorSelect");

const startYearSelect =
  document.getElementById("startYearSelect");

const loadButton =
  document.getElementById("loadDataButton");

const svg =
  document.getElementById("economyChart");

const NS = "http://www.w3.org/2000/svg";

let requestNumber = 0;

// -----------------------------------------
// 2. NUMBER FORMATTING
// -----------------------------------------

function formatValue(value, kind) {
  if (kind === "currency") {
    return "$" + Math.round(value).toLocaleString("en-US");
  }

  return value.toFixed(2) + "%";
}

function formatChange(first, last, kind) {
  const change = last - first;
  const sign = change > 0 ? "+" : "";

  if (kind === "currency") {
    return sign +
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(change);
  }

  return sign + change.toFixed(2) + " pp";
}

function compactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

// -----------------------------------------
// 3. SVG HELPERS
// -----------------------------------------

function createSVG(tag, attributes, text) {
  const element = document.createElementNS(NS, tag);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  if (text !== undefined) {
    element.textContent = text;
  }

  svg.appendChild(element);
  return element;
}

function setStatus(message, error = false) {
  const status = document.getElementById("dataStatus");

  status.textContent = message;
  status.classList.toggle("error", error);
}

function clearResults() {
  svg.replaceChildren();

  ["firstValue", "latestValue", "changeValue"]
    .forEach(id => {
      document.getElementById(id).textContent = "—";
    });

  ["firstYear", "latestYear", "changeDescription"]
    .forEach(id => {
      document.getElementById(id).textContent = "—";
    });

  document.getElementById("observationCount")
    .textContent = "OBSERVATIONS / —";
}

// -----------------------------------------
// 4. DRAW THE GRAPH
// -----------------------------------------

function drawEconomyChart(data, kind) {
  svg.replaceChildren();

  const left = 88;
  const right = 735;
  const top = 25;
  const bottom = 330;

  const width = right - left;
  const height = bottom - top;

  const values = data.map(item => item.value);
  const years = data.map(item => item.year);

  const minimumYear = Math.min(...years);
  const maximumYear = Math.max(...years);

  let minimumValue = Math.min(...values);
  let maximumValue = Math.max(...values);

  // Leave space above and below the observations.
  const range = maximumValue - minimumValue;
  const padding = range > 0
    ? range * 0.12
    : Math.max(Math.abs(maximumValue) * 0.1, 1);

  minimumValue -= padding;
  maximumValue += padding;

  function x(year) {
    if (maximumYear === minimumYear) {
      return left + width / 2;
    }

    return left +
      (year - minimumYear) /
      (maximumYear - minimumYear) * width;
  }

  function y(value) {
    return bottom -
      (value - minimumValue) /
      (maximumValue - minimumValue) * height;
  }

  // Horizontal grid and axis labels.
  for (let i = 0; i <= 5; i++) {
    const value = minimumValue +
      (maximumValue - minimumValue) * i / 5;

    const py = y(value);

    createSVG("line", {
      x1: left,
      y1: py,
      x2: right,
      y2: py,
      stroke: "#E2DDD5",
      "stroke-width": 1
    });

    createSVG("text", {
      x: left - 12,
      y: py + 4,
      "text-anchor": "end",
      fill: "#696860",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 11
    }, compactNumber(value));
  }

  // X-axis.
  createSVG("line", {
    x1: left,
    y1: bottom,
    x2: right,
    y2: bottom,
    stroke: "#181817",
    "stroke-width": 1.5
  });

  // Year labels.
  const tickCount = Math.min(
    5,
    maximumYear - minimumYear
  );

  for (let i = 0; i <= tickCount; i++) {
    const year = tickCount === 0
      ? minimumYear
      : Math.round(
          minimumYear +
          (maximumYear - minimumYear) * i / tickCount
        );

    createSVG("text", {
      x: x(year),
      y: bottom + 26,
      "text-anchor": "middle",
      fill: "#696860",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 11
    }, String(year));
  }

  // Connect observations with a line.
  const points = data.map(item => {
    return x(item.year) + "," + y(item.value);
  }).join(" ");

  createSVG("polyline", {
    points: points,
    fill: "none",
    stroke: "#C85A32",
    "stroke-width": 3.5,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });

  // Small points allow visitors to inspect exact values.
  data.forEach(item => {
    const circle = createSVG("circle", {
      cx: x(item.year),
      cy: y(item.value),
      r: 4,
      fill: "#C85A32",
      stroke: "white",
      "stroke-width": 1.5
    });

    const title = document.createElementNS(NS, "title");

    title.textContent =
      item.year + ": " + formatValue(item.value, kind);

    circle.appendChild(title);
  });

  // Highlight the latest observation.
  const latest = data[data.length - 1];

  createSVG("circle", {
    cx: x(latest.year),
    cy: y(latest.value),
    r: 7,
    fill: "#183A2E",
    stroke: "white",
    "stroke-width": 2
  });

  svg.setAttribute(
    "aria-label",
    "Historical data from " + minimumYear +
    " to " + maximumYear +
    ", with " + data.length + " observations"
  );
}

// -----------------------------------------
// 5. UPDATE THE SUMMARY
// -----------------------------------------

function updateSummary(data, indicator) {
  const first = data[0];
  const latest = data[data.length - 1];

  document.getElementById("firstValue").textContent =
    formatValue(first.value, indicator.kind);

  document.getElementById("latestValue").textContent =
    formatValue(latest.value, indicator.kind);

  document.getElementById("changeValue").textContent =
    formatChange(
      first.value,
      latest.value,
      indicator.kind
    );

  document.getElementById("firstYear").textContent =
    "Year: " + first.year;

  document.getElementById("latestYear").textContent =
    "Year: " + latest.year;

  document.getElementById("changeDescription").textContent =
    indicator.kind === "percent"
      ? "Percentage-point change"
      : "Change in current US dollars";

  document.getElementById("observationCount").textContent =
    "OBSERVATIONS / " + data.length;
}

// -----------------------------------------
// 6. FETCH REAL WORLD BANK DATA
// -----------------------------------------

async function loadEconomicData() {
  const currentRequest = ++requestNumber;

  const country = countrySelect.value;
  const indicatorCode = indicatorSelect.value;
  const startYear = Number(startYearSelect.value);

  const indicator = indicators[indicatorCode];
  const countryName = countries[country];

  const endYear = new Date().getFullYear();

  const url =
    "https://api.worldbank.org/v2/country/" +
    country +
    "/indicator/" +
    indicatorCode +
    "?format=json&date=" +
    startYear + ":" + endYear +
    "&per_page=100";

  document.getElementById("chartTitle").textContent =
    indicator.name;

  document.getElementById("chartSubtitle").textContent =
    countryName + " · Annual observations";

  document.getElementById("chartUnit").textContent =
    indicator.unit;

  document.getElementById("economyExplanation").textContent =
    indicator.explanation;

  document.getElementById("sourceLink").href =
    "https://data.worldbank.org/indicator/" +
    indicatorCode + "?locations=" + country;

  clearResults();
  setStatus("Retrieving World Bank observations...");

  loadButton.disabled = true;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("The data source returned an error.");
    }

    const json = await response.json();

    // World Bank responses contain metadata and observations.
    if (!Array.isArray(json) || !Array.isArray(json[1])) {
      throw new Error("Unexpected data format.");
    }

    const observations = json[1]
      .filter(item =>
        item.value !== null &&
        Number.isFinite(Number(item.value))
      )
      .map(item => ({
        year: Number(item.date),
        value: Number(item.value)
      }))
      .filter(item =>
        Number.isInteger(item.year) &&
        item.year >= startYear &&
        item.year <= endYear
      )
      .sort((a, b) => a.year - b.year);

    // Ignore a response if the user started another request.
    if (currentRequest !== requestNumber) {
      return;
    }

    if (observations.length === 0) {
      setStatus(
        "No published observations are available " +
        "for this selection.",
        true
      );
      return;
    }

    drawEconomyChart(observations, indicator);
    updateSummary(observations, indicator);

    setStatus(
      "Published observations loaded. " +
      "Latest available year: " +
      observations[observations.length - 1].year + "."
    );

  } catch (error) {
    if (currentRequest !== requestNumber) {
      return;
    }

    console.error("World Bank data error:", error);

    setStatus(
      "Unable to load the data. Check your internet " +
      "connection and try again.",
      true
    );
  } finally {
    if (currentRequest === requestNumber) {
      loadButton.disabled = false;
    }
  }
}

// -----------------------------------------
// 7. CONNECT THE INTERFACE
// -----------------------------------------

loadButton.addEventListener("click", loadEconomicData);

countrySelect.addEventListener("change", loadEconomicData);
indicatorSelect.addEventListener("change", loadEconomicData);
startYearSelect.addEventListener("change", loadEconomicData);

// Load the default dataset when the page opens.
loadEconomicData();
