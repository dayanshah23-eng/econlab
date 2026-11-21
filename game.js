
"use strict";

// -----------------------------------------
// GAME STATE
// -----------------------------------------

const history = [];

let playerTotal = 0;
let opponentTotal = 0;

const strategySelect =
  document.getElementById("strategySelect");

const strategyDescription =
  document.getElementById("strategyDescription");

const payoffMatrix = {
  cooperate: {
    cooperate: [3, 3],
    defect: [0, 5]
  },
  defect: {
    cooperate: [5, 0],
    defect: [1, 1]
  }
};

// -----------------------------------------
// COMPUTER STRATEGIES
// -----------------------------------------

function getOpponentMove() {
  const strategy = strategySelect.value;

  if (strategy === "always-cooperate") {
    return "cooperate";
  }

  if (strategy === "always-defect") {
    return "defect";
  }

  // Tit for Tat cooperates in the first round.
  // After that, it copies the player's last move.
  if (strategy === "tit-for-tat") {
    if (history.length === 0) {
      return "cooperate";
    }

    return history[history.length - 1].playerMove;
  }

  return "cooperate";
}

// -----------------------------------------
// PLAY A ROUND
// -----------------------------------------

function playRound(playerMove) {
  const opponentMove = getOpponentMove();

  const payoff =
    payoffMatrix[playerMove][opponentMove];

  const playerPoints = payoff[0];
  const opponentPoints = payoff[1];

  playerTotal += playerPoints;
  opponentTotal += opponentPoints;

  history.push({
    round: history.length + 1,
    playerMove,
    opponentMove,
    playerPoints,
    opponentPoints
  });

  updateDisplay();
  updateStrategyGraphs();
}

// -----------------------------------------
// UPDATE THE INTERFACE
// -----------------------------------------

function updateDisplay() {
  document.getElementById("playerScore").textContent =
    playerTotal;

  document.getElementById("opponentScore").textContent =
    opponentTotal;

  document.getElementById("roundNumber").textContent =
    String(history.length + 1).padStart(2, "0");

  document.getElementById("roundCount").textContent =
    history.length + " ROUNDS COMPLETED";

  const latest = history[history.length - 1];

  if (!latest) {
    document.getElementById("outcomeTitle").textContent =
      "No decisions yet.";

    document.getElementById("outcomeExplanation").textContent =
      "Select Cooperate or Defect to begin the experiment.";

    return;
  }

  let outcomeTitle = "";
  let explanation = "";

  if (
    latest.playerMove === "cooperate" &&
    latest.opponentMove === "cooperate"
  ) {
    outcomeTitle = "Mutual cooperation.";

    explanation =
      "Both players cooperate and receive 3 points each. " +
      "Their combined payoff is 6 points.";
  }

  else if (
    latest.playerMove === "defect" &&
    latest.opponentMove === "defect"
  ) {
    outcomeTitle = "Mutual defection.";

    explanation =
      "Both players defect and receive only 1 point each. " +
      "This is the Nash equilibrium of the one-round game, " +
      "although mutual cooperation would benefit both.";
  }

  else if (latest.playerMove === "defect") {
    outcomeTitle = "You gained the advantage.";

    explanation =
      "You defected while the opponent cooperated. " +
      "You receive 5 points and the opponent receives 0.";
  }

  else {
    outcomeTitle = "Your opponent gained the advantage.";

    explanation =
      "You cooperated while the opponent defected. " +
      "You receive 0 points and the opponent receives 5.";
  }

  document.getElementById("outcomeTitle").textContent =
    outcomeTitle;

  document.getElementById("outcomeExplanation").textContent =
    explanation;

  updateHistory();
}

// -----------------------------------------
// RENDER DECISION HISTORY
// -----------------------------------------

function updateHistory() {
  const tbody = document.getElementById("historyBody");

  tbody.innerHTML = "";

  // Newest round at the top.
  const reversed = [...history].reverse();

  reversed.forEach(round => {
    const row = document.createElement("tr");

    const values = [
      round.round,
      capitalize(round.playerMove),
      capitalize(round.opponentMove),
      "+" + round.playerPoints,
      "+" + round.opponentPoints
    ];

    values.forEach(value => {
      const cell = document.createElement("td");

      cell.textContent = value;
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// -----------------------------------------
// RESET THE GAME
// -----------------------------------------

function resetGame() {
  history.length = 0;

  playerTotal = 0;
  opponentTotal = 0;

  document.getElementById("historyBody").innerHTML =
    '<tr><td colspan="5" class="empty-history">' +
    "No rounds played yet.</td></tr>";

  updateDisplay();
  updateStrategyGraphs();
}

// -----------------------------------------
// OPPONENT STRATEGY INFORMATION
// -----------------------------------------

function updateStrategyDescription() {
  const strategy = strategySelect.value;

  const descriptions = {
    "tit-for-tat":
      "Starts by cooperating, then copies your previous move.",

    "always-cooperate":
      "Cooperates every round, regardless of your decisions.",

    "always-defect":
      "Defects every round, regardless of your decisions."
  };

  strategyDescription.textContent =
    descriptions[strategy];

  // Strategies are evaluated as separate experiments.
  resetGame();
}

// -----------------------------------------
// BUTTON EVENTS
// -----------------------------------------

document.getElementById("cooperateButton")
  .addEventListener("click", function() {
    playRound("cooperate");
  });

document.getElementById("defectButton")
  .addEventListener("click", function() {
    playRound("defect");
  });

document.getElementById("resetGame")
  .addEventListener("click", resetGame);

strategySelect.addEventListener(
  "change",
  updateStrategyDescription
);



// -----------------------------------------
// EXPERIMENT 02: STRATEGY ANALYSIS GRAPHS
// -----------------------------------------

const graphNS = "http://www.w3.org/2000/svg";

// Create an SVG element.
function makeGraphElement(tag, attributes, parent, text) {
  const element = document.createElementNS(graphNS, tag);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  if (text !== undefined) {
    element.textContent = text;
  }

  parent.appendChild(element);

  return element;
}

// Draw a reusable two-series line graph.
function drawStrategyGraph(svgId, seriesA, seriesB, maxY) {
  const svg = document.getElementById(svgId);

  // Clear previous graph.
  svg.replaceChildren();

  const left = 65;
  const top = 25;
  const width = 600;
  const height = 255;

  const rounds = Math.max(1, seriesA.length - 1);
  const yMaximum = Math.max(1, maxY);

  function x(index) {
    return left + index / rounds * width;
  }

  function y(value) {
    return top + height - value / yMaximum * height;
  }

  // Horizontal grid and vertical-axis labels.
  for (let i = 0; i <= 5; i++) {
    const value = yMaximum * i / 5;
    const py = y(value);

    makeGraphElement("line", {
      x1: left,
      y1: py,
      x2: left + width,
      y2: py,
      stroke: "#E3DED5",
      "stroke-width": 1
    }, svg);

    makeGraphElement("text", {
      x: left - 12,
      y: py + 4,
      "text-anchor": "end",
      fill: "#77736C",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 11
    }, svg, Number(value.toFixed(1)).toString());
  }

  // Horizontal axis.
  makeGraphElement("line", {
    x1: left,
    y1: top + height,
    x2: left + width,
    y2: top + height,
    stroke: "#181817",
    "stroke-width": 1.5
  }, svg);

  // X-axis round labels.
  const tickCount = Math.min(rounds, 5);

  for (let i = 0; i <= tickCount; i++) {
    const round = Math.round(i * rounds / tickCount);

    makeGraphElement("text", {
      x: x(round),
      y: top + height + 22,
      "text-anchor": "middle",
      fill: "#77736C",
      "font-family": "IBM Plex Mono, monospace",
      "font-size": 11
    }, svg, String(round));
  }

  // Render a line series.
  function renderSeries(values, color) {
    const points = values
      .map((value, index) => `${x(index)},${y(value)}`)
      .join(" ");

    makeGraphElement("polyline", {
      points,
      fill: "none",
      stroke: color,
      "stroke-width": 3,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }, svg);

    // Highlight latest observation.
    const lastIndex = values.length - 1;

    makeGraphElement("circle", {
      cx: x(lastIndex),
      cy: y(values[lastIndex]),
      r: 5,
      fill: color,
      stroke: "white",
      "stroke-width": 2
    }, svg);
  }

  renderSeries(seriesA, "#C85A32");
  renderSeries(seriesB, "#183A2E");
}

// -----------------------------------------
// CONVERT GAME HISTORY INTO GRAPH DATA
// -----------------------------------------

function updateStrategyGraphs() {
  const playerPayoffs = [0];
  const opponentPayoffs = [0];

  const playerCooperation = [0];
  const opponentCooperation = [0];

  let playerTotalPoints = 0;
  let opponentTotalPoints = 0;

  let playerCooperativeRounds = 0;
  let opponentCooperativeRounds = 0;

  history.forEach((round, index) => {
    playerTotalPoints += round.playerPoints;
    opponentTotalPoints += round.opponentPoints;

    playerPayoffs.push(playerTotalPoints);
    opponentPayoffs.push(opponentTotalPoints);

    if (round.playerMove === "cooperate") {
      playerCooperativeRounds++;
    }

    if (round.opponentMove === "cooperate") {
      opponentCooperativeRounds++;
    }

    const completedRounds = index + 1;

    playerCooperation.push(
      playerCooperativeRounds / completedRounds * 100
    );

    opponentCooperation.push(
      opponentCooperativeRounds / completedRounds * 100
    );
  });

  // Graph 1: Cumulative payoffs.
  const maximumPayoff = Math.max(
    5,
    ...playerPayoffs,
    ...opponentPayoffs
  );

  drawStrategyGraph(
    "payoffGraph",
    playerPayoffs,
    opponentPayoffs,
    Math.ceil(maximumPayoff / 5) * 5
  );

  // Graph 2: Cooperation rates (0–100%).
  drawStrategyGraph(
    "cooperationGraph",
    playerCooperation,
    opponentCooperation,
    100
  );
}

// Initialize the game after graph functions are ready.
resetGame();
