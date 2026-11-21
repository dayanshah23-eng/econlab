# econlab
Interactive experiments exploring economics through data and programming
EconLab is an interactive economics platform designed to make economic concepts easier to explore through data, programming, and experimentation.

I started EconLab with a simple goal: to better understand how the economy works and how data can help explain economic behavior. I also wanted to create something that would allow others to learn about economics in a more accessible and interactive way.

Rather than simply reading about economic theories, EconLab allows users to change variables, test different scenarios, and observe their effects.

## Experiments

### 01 — The Market

An interactive supply-and-demand simulator that allows users to explore how different economic conditions affect market outcomes.

Features:
- Adjustable consumer demand and production costs
- Per-unit taxation
- Interactive supply-and-demand graphs
- Consumer and producer surplus
- Tax revenue and deadweight loss
- Visualizations of economic welfare

### 02 — The Strategy

A game theory laboratory based on the Prisoner's Dilemma, exploring how individual decisions affect cooperation and competition.

Features:
- Interactive cooperation and defection decisions
- Three computer strategies: Tit for Tat, Always Cooperate, and Always Defect
- Payoff matrix visualization
- Round-by-round decision history
- Cumulative payoff graphs
- Cooperation rate analysis

### 03 — The Economy

An interactive data explorer that uses published World Bank data to investigate historical economic trends.

Features:
- GDP per capita, inflation, and unemployment indicators
- Historical data for selected countries
- Interactive line graphs
- Adjustable time periods
- Comparisons between earlier and later observations
- Links to original data sources

## Technologies

EconLab is currently built using:

- **HTML5** — Website structure and content
- **CSS3** — Responsive design and visual styling
- **JavaScript** — Economic models, interactive graphs, and data processing
- **SVG** — Interactive data visualizations
- **World Bank API** — Public economic data

The project currently runs entirely in the browser without a backend.

## Running EconLab Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/econlab.git
   ```

2. Open the project folder:

   ```bash
   cd econlab
   ```

3. Start a local development server:

   ```bash
   python3 -m http.server 8000
   ```

4. Open the website in your browser:

   ```
   http://localhost:8000
   ```

An internet connection is required to load World Bank data in Experiment 03.

## Methodology and Limitations

EconLab is intended for educational exploration rather than economic forecasting.

The Market Simulator uses simplified linear supply-and-demand relationships and assumes a competitive market.

The Game Theory Laboratory uses predefined payoff values and deterministic computer strategies.

The Economy Data Explorer relies on published World Bank observations. Data availability, estimation methods, and revisions may affect comparisons.

These limitations are important because economic models are only as useful as the assumptions behind them.

## Future Development

EconLab is an ongoing project. Planned improvements include:

- Expanded economic indicators and country comparisons
- Additional game theory strategies and simulations
- More advanced economic models
- New interactive experiments
- Further research and educational resources

## Behind EconLab

**Dayan Shah — Founder & Developer**

Founded EconLab to explore the intersection of economics, data, and programming, while making economic concepts easier for others to understand.

**Qasim Ahmad — Design Contributor**

Contributed to EconLab's visual design and the presentation of its interactive educational content.

## Data Attribution

Historical economic indicators are retrieved from the World Bank Indicators API.

Data source: https://data.worldbank.org/

World Bank data may have different licensing or attribution requirements depending on the dataset.

---

EconLab is an independent educational project built to encourage curiosity, experimentation, and a better understanding of economics.
