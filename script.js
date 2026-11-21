    "use strict";
    // ----------------------------------------
    // ELEMENTS
    // ----------------------------------------

    const demandSlider = document.getElementById("demandSlider");
    const costSlider = document.getElementById("costSlider");
    const taxSlider = document.getElementById("taxSlider");

    const demandValue = document.getElementById("demandValue");
    const costValue = document.getElementById("costValue");
    const taxValue = document.getElementById("taxValue");

    const $ = (id) => document.getElementById(id);

    function money(value) {
      return "$" + value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    // ----------------------------------------
    // ECONOMIC MODEL
    // ----------------------------------------

    function calculateMarket() {
      const a = Number(demandSlider.value);
      const c = Number(costSlider.value);
      const tax = Number(taxSlider.value);

      const b = 0.8;
      const d = 0.8;

      // Competitive equilibrium without a tax.
      const quantityWithoutTax = Math.max(
        0, (a - c) / (b + d)
      );

      // Market quantity after imposing a tax.
      const quantity = Math.max(
        0, (a - c - tax) / (b + d)
      );

      const buyerPrice = a - b * quantity;
      const sellerPrice = c + d * quantity;

      const consumerSurplus =
        0.5 * quantity * (a - buyerPrice);

      const producerSurplus =
        0.5 * quantity * (sellerPrice - c);

      const taxRevenue = tax * quantity;

      // Exact lost surplus for this linear market model.
      const lostQuantity =
        quantityWithoutTax - quantity;

      const deadweightLoss =
        0.5 * (b + d) * lostQuantity * lostQuantity;

      return {
        a, b, c, d, tax,
        quantity,
        quantityWithoutTax,
        buyerPrice,
        sellerPrice,
        consumerSurplus,
        producerSurplus,
        taxRevenue,
        deadweightLoss
      };
    }

    // ----------------------------------------
    // SVG GRAPH
    // ----------------------------------------

    const svgNS = "http://www.w3.org/2000/svg";

    const chart = {
      left: 75,
      top: 25,
      width: 635,
      height: 340,
      maxQ: 110,
      maxP: 180
    };

    function graphX(q) {
      return chart.left + q / chart.maxQ * chart.width;
    }

    function graphY(p) {
      return chart.top + chart.height -
        p / chart.maxP * chart.height;
    }

    function setLine(id, x1, y1, x2, y2) {
      const element = $(id);

      element.setAttribute("x1", x1);
      element.setAttribute("y1", y1);
      element.setAttribute("x2", x2);
      element.setAttribute("y2", y2);
    }

    function svgElement(tag, attributes, text) {
      const element = document.createElementNS(svgNS, tag);

      for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
      }

      if (text !== undefined) {
        element.textContent = text;
      }

      return element;
    }

    function createGrid() {
      const grid = $("chartGrid");

      for (let price = 0; price <= 180; price += 30) {
        const y = graphY(price);

        grid.appendChild(svgElement("line", {
          x1: 75, y1: y, x2: 710, y2: y,
          stroke: "#E5E0D8",
          "stroke-width": 1
        }));

        grid.appendChild(svgElement("text", {
          x: 63, y: y + 4,
          "text-anchor": "end"
        }, String(price)));
      }

      for (let quantity = 0; quantity <= 100; quantity += 20) {
        const x = graphX(quantity);

        grid.appendChild(svgElement("line", {
          x1: x, y1: 25, x2: x, y2: 365,
          stroke: "#E5E0D8",
          "stroke-width": 1
        }));

        grid.appendChild(svgElement("text", {
          x, y: 386,
          "text-anchor": "middle"
        }, String(quantity)));
      }
    }

    function drawChart(market) {
      
   // ----------------------------------------
   // SHADED ECONOMIC WELFARE REGIONS
   // ----------------------------------------

    const qTax = market.quantity;
    const qNoTax = market.quantityWithoutTax;

    const buyerP = market.buyerPrice;
    const sellerP = market.sellerPrice;

    const noTaxPrice = market.a - market.b * qNoTax;

     // Convert points into an SVG polygon.
    function polygonPoints(points) {
    return points
      .map(point =>
        graphX(point[0]) + "," + graphY(point[1])
      )
      .join(" ");
  }

    // Consumer surplus: area below demand,
    // above the price consumers pay.
    $("consumerArea").setAttribute(
    "points",
    polygonPoints([
      [0, market.a],
      [qTax, buyerP],
      [0, buyerP]
    ])
  );

    // Producer surplus: area above supply,
    // below the price producers receive.
    $("producerArea").setAttribute(
    "points",
    polygonPoints([
      [0, market.c],
      [qTax, sellerP],
      [0, sellerP]
    ])
  );

    // Deadweight loss: trades eliminated by tax.
    // This triangle connects the taxed quantity
    // to the original tax-free equilibrium.
    $("deadweightArea").setAttribute(
    "points",
    polygonPoints([
      [qTax, buyerP],
      [qTax, sellerP],
      [qNoTax, noTaxPrice]
    ])
  );

    // No DWL region when there is no tax.
    $("deadweightArea").style.display =
    market.tax > 0 && qNoTax > qTax
      ? "block"
      : "none";

      const q = market.quantity;
      const x = graphX(q);

      const buyerY = graphY(market.buyerPrice);
      const sellerY = graphY(market.sellerPrice);

      // Demand curve.
      setLine(
        "demandLine",
        graphX(0), graphY(market.a),
        graphX(chart.maxQ),
        graphY(market.a - market.b * chart.maxQ)
      );

      // Supply curve.
      setLine(
        "supplyLine",
        graphX(0), graphY(market.c),
        graphX(chart.maxQ),
        graphY(market.c + market.d * chart.maxQ)
      );

      // Price and quantity guides.
      setLine(
        "verticalGuide",
        x, buyerY, x, graphY(0)
      );

      setLine(
        "horizontalGuide",
        graphX(0), buyerY, x, buyerY
      );

      // Tax wedge.
      setLine(
        "taxWedge",
        x, buyerY, x, sellerY
      );

      const showTax = market.tax > 0 && q > 0;

      $("taxWedge").style.display =
        showTax ? "block" : "none";

      $("sellerPoint").style.display =
        showTax ? "block" : "none";

      // Equilibrium markers.
      $("buyerPoint").setAttribute("cx", x);
      $("buyerPoint").setAttribute("cy", buyerY);

      $("sellerPoint").setAttribute("cx", x);
      $("sellerPoint").setAttribute("cy", sellerY);

      // Text labels.
      const equilibriumLabel = $("equilibriumLabel");

      equilibriumLabel.setAttribute(
        "x", Math.min(x + 12, 615)
      );

      equilibriumLabel.setAttribute(
        "y", Math.max(buyerY - 16, 38)
      );

      equilibriumLabel.textContent =
        "Q = " + q.toFixed(1);

      const taxLabel = $("taxGraphLabel");

      taxLabel.setAttribute(
        "x", Math.min(x + 15, 630)
      );

      taxLabel.setAttribute(
        "y", (buyerY + sellerY) / 2 + 4
      );

      taxLabel.textContent =
        showTax ? "Tax: $" + market.tax : "";
    }

    // ----------------------------------------
    // UPDATE RESULTS
    // ----------------------------------------

    function updateSimulation() {
      const market = calculateMarket();

      demandValue.textContent = demandSlider.value;
      costValue.textContent = costSlider.value;
      taxValue.textContent = taxSlider.value;

      $("priceResult").textContent =
        money(market.buyerPrice);

      $("quantityResult").textContent =
        market.quantity.toFixed(1);

      $("consumerResult").textContent =
        money(market.consumerSurplus);

      $("producerResult").textContent =
        money(market.producerSurplus);

      $("taxRevenueResult").textContent =
        money(market.taxRevenue);

      $("deadweightLossResult").textContent =
        money(market.deadweightLoss);

      drawChart(market);

      // Explain the result in ordinary language.
      const analysis = $("analysisText");

      if (market.tax === 0) {
        analysis.textContent =
          "With no tax, the competitive equilibrium occurs at " +
          market.quantity.toFixed(1) +
          " units, at a price of " +
          money(market.buyerPrice) +
          ". In this model, the market generates no " +
          "tax-induced deadweight loss.";
      }

      else if (market.quantity === 0) {
        analysis.textContent =
          "At this tax level, no units are traded. " +
          "The government collects no tax revenue, " +
          "while the trades prevented by the tax " +
          "account for " +
          money(market.deadweightLoss) +
          " in lost economic surplus.";
      }

      else {
        analysis.textContent =
          "The per-unit tax of " +
          money(market.tax) +
          " reduces quantity from " +
          market.quantityWithoutTax.toFixed(1) +
          " to " +
          market.quantity.toFixed(1) +
          " units. Buyers pay " +
          money(market.buyerPrice) +
          " while sellers receive " +
          money(market.sellerPrice) +
          ". The government collects " +
          money(market.taxRevenue) +
          " in revenue, and the reduction in mutually " +
          "beneficial trades produces " +
          money(market.deadweightLoss) +
          " in deadweight loss.";
      }
    }

    // ----------------------------------------
    // INTERACTIONS
    // ----------------------------------------

    demandSlider.addEventListener("input", updateSimulation);
    costSlider.addEventListener("input", updateSimulation);
    taxSlider.addEventListener("input", updateSimulation);

    $("resetButton").addEventListener("click", function() {
      demandSlider.value = 100;
      costSlider.value = 20;
      taxSlider.value = 0;

      updateSimulation();
    });

    // Initialize after the page has loaded.
    createGrid();
    updateSimulation();