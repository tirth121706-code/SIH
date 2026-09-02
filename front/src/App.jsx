// This component is a direct JSX conversion of the original static
// index.html body. No classes, ids, text, or structure were changed —
// only the syntax required to make it valid JSX (className instead of
// class, self-closing tags, style objects instead of style strings).
// All interactivity still comes from js/script.js, unmodified, which is
// imported once in main.jsx and operates on these same element ids.

export default function App() {
  return (
    <div className="app">

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">अ</span>
          <div className="brand-text">
            <span className="brand-name">ABHAYA</span>
            <span className="brand-sub">Hazard &amp; Vulnerability System</span>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item is-active" data-view="dashboard">
            <span className="nav-dot"></span>Dashboard
          </button>
          <button className="nav-item" data-view="map">
            <span className="nav-dot"></span>Hazard Map
          </button>
          <button className="nav-item" data-view="habitations">
            <span className="nav-dot"></span>Habitations
          </button>
          <button className="nav-item" data-view="relocation">
            <span className="nav-dot"></span>Relocation Priority
          </button>
          <button className="nav-item" data-view="about">
            <span className="nav-dot"></span>How Scoring Works
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-pill"><span className="pulse"></span>Live data · demo mode</div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="main">

        <header className="topbar">
          <div className="topbar-title">
            <h1 id="view-title">Command Dashboard</h1>
            <p id="view-subtitle">Overview of hazard exposure and habitation vulnerability across monitored districts</p>
          </div>
          <div className="topbar-actions">
            <div className="search">
              <input type="text" placeholder="Search habitation, district, hazard type…" id="searchInput" />
            </div>
            <button className="btn btn-outline">Export Report</button>
            <div className="avatar">DM</div>
          </div>
        </header>

        {/* ===== DASHBOARD VIEW ===== */}
        <section className="view is-active" id="view-dashboard">

          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">Habitations Monitored</span>
              <span className="stat-value">1,248</span>
              <span className="stat-trend">across 6 districts</span>
            </div>
            <div className="stat-card stat-card--dark">
              <span className="stat-label">Critical Risk Zones</span>
              <span className="stat-value">37</span>
              <span className="stat-trend">requires immediate review</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Population at Risk</span>
              <span className="stat-value">86,420</span>
              <span className="stat-trend">estimated exposed residents</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Relocation Priority List</span>
              <span className="stat-value">12</span>
              <span className="stat-trend">settlements flagged this cycle</span>
            </div>
          </div>

          <div className="panel-grid">

            <div className="panel panel-map">
              <div className="panel-head">
                <h2>Hazard Exposure Map</h2>
                <div className="legend">
                  <span><i className="sw sw-1"></i>Low</span>
                  <span><i className="sw sw-2"></i>Moderate</span>
                  <span><i className="sw sw-3"></i>High</span>
                  <span><i className="sw sw-4"></i>Critical</span>
                </div>
              </div>
              <div className="map-canvas" id="mapCanvas">
                <div id="mapCompact" className="leaflet-map"></div>
              </div>
            </div>

            <div className="panel panel-list">
              <div className="panel-head">
                <h2>Top Relocation Priorities</h2>
              </div>
              <ol className="priority-list">
                <li><span className="rank">01</span><span className="name">Kotla Basti</span><span className="score">9.4</span></li>
                <li><span className="rank">02</span><span className="name">Chandpur Colony</span><span className="score">9.1</span></li>
                <li><span className="rank">03</span><span className="name">Rampur Nagar</span><span className="score">8.6</span></li>
                <li><span className="rank">04</span><span className="name">Gopalpur</span><span className="score">7.9</span></li>
                <li><span className="rank">05</span><span className="name">Sundarban Ghat</span><span className="score">6.8</span></li>
              </ol>
            </div>
          </div>

          <div className="panel panel-table">
            <div className="panel-head">
              <h2>Habitation Risk Register</h2>
              <div className="filters">
                <select id="hazardFilter">
                  <option value="all">All hazard types</option>
                  <option value="flood">Flood</option>
                  <option value="landslide">Landslide</option>
                  <option value="cyclone">Cyclone</option>
                  <option value="erosion">River Erosion</option>
                </select>
                <select id="riskFilter">
                  <option value="all">All risk levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <table className="data-table" id="riskTable">
              <thead>
                <tr>
                  <th>Habitation</th>
                  <th>District</th>
                  <th>Hazard Type</th>
                  <th>Population</th>
                  <th>Vulnerability Score</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                <tr data-hazard="flood" data-risk="critical">
                  <td>Kotla Basti</td><td>Riverside</td><td>Flood</td><td>4,120</td>
                  <td><div className="bar"><span style={{ width: '94%' }}></span></div></td>
                  <td><span className="badge badge-critical">Critical</span></td>
                </tr>
                <tr data-hazard="erosion" data-risk="critical">
                  <td>Chandpur Colony</td><td>Riverside</td><td>River Erosion</td><td>3,860</td>
                  <td><div className="bar"><span style={{ width: '91%' }}></span></div></td>
                  <td><span className="badge badge-critical">Critical</span></td>
                </tr>
                <tr data-hazard="landslide" data-risk="high">
                  <td>Rampur Nagar</td><td>Hillside</td><td>Landslide</td><td>2,910</td>
                  <td><div className="bar"><span style={{ width: '86%' }}></span></div></td>
                  <td><span className="badge badge-high">High</span></td>
                </tr>
                <tr data-hazard="cyclone" data-risk="high">
                  <td>Gopalpur</td><td>Coastal</td><td>Cyclone</td><td>5,430</td>
                  <td><div className="bar"><span style={{ width: '79%' }}></span></div></td>
                  <td><span className="badge badge-high">High</span></td>
                </tr>
                <tr data-hazard="flood" data-risk="moderate">
                  <td>Sundarban Ghat</td><td>Riverside</td><td>Flood</td><td>1,780</td>
                  <td><div className="bar"><span style={{ width: '68%' }}></span></div></td>
                  <td><span className="badge badge-moderate">Moderate</span></td>
                </tr>
                <tr data-hazard="cyclone" data-risk="low">
                  <td>Vasant Vihar</td><td>Coastal</td><td>Cyclone</td><td>960</td>
                  <td><div className="bar"><span style={{ width: '31%' }}></span></div></td>
                  <td><span className="badge badge-low">Low</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== MAP VIEW ===== */}
        <section className="view" id="view-map">
          <div className="panel panel-full">
            <div className="panel-head">
              <h2>Hazard Map — Full View</h2>
              <div className="legend">
                <span><i className="sw sw-1"></i>Low</span>
                <span><i className="sw sw-2"></i>Moderate</span>
                <span><i className="sw sw-3"></i>High</span>
                <span><i className="sw sw-4"></i>Critical</span>
              </div>
            </div>
            <div className="map-canvas map-canvas--tall">
              <div id="mapFull" className="leaflet-map"></div>
            </div>
            <p className="hint">Live map of India (OpenStreetMap data via CARTO's grayscale basemap) — markers are colour-weighted by risk intensity (dark = critical) and sit at each habitation's real coordinates. In production these coordinates and risk values are pulled live from PostGIS instead of the demo dataset in script.js.</p>
          </div>
        </section>

        {/* ===== HABITATIONS VIEW ===== */}
        <section className="view" id="view-habitations">
          <div className="panel panel-full">
            <div className="panel-head"><h2>All Habitations</h2></div>
            <table className="data-table">
              <thead><tr><th>Habitation</th><th>District</th><th>Population</th><th>Households</th><th>Nearest Hazard</th><th>Carrying Capacity</th></tr></thead>
              <tbody>
                <tr><td>Kotla Basti</td><td>Riverside</td><td>4,120</td><td>812</td><td>Flood plain — 0.4 km</td><td>Exceeded</td></tr>
                <tr><td>Chandpur Colony</td><td>Riverside</td><td>3,860</td><td>765</td><td>Eroding bank — 0.2 km</td><td>Exceeded</td></tr>
                <tr><td>Rampur Nagar</td><td>Hillside</td><td>2,910</td><td>540</td><td>Slope &gt;30° — 0.6 km</td><td>Near limit</td></tr>
                <tr><td>Gopalpur</td><td>Coastal</td><td>5,430</td><td>1,120</td><td>Storm surge zone — 1.1 km</td><td>Near limit</td></tr>
                <tr><td>Sundarban Ghat</td><td>Riverside</td><td>1,780</td><td>349</td><td>Flood plain — 1.8 km</td><td>Within limit</td></tr>
                <tr><td>Vasant Vihar</td><td>Coastal</td><td>960</td><td>201</td><td>Storm surge zone — 3.2 km</td><td>Within limit</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ===== RELOCATION VIEW ===== */}
        <section className="view" id="view-relocation">
          <div className="panel panel-full">
            <div className="panel-head"><h2>Relocation Priority Ranking</h2></div>
            <ol className="priority-list priority-list--wide">
              <li><span className="rank">01</span><span className="name">Kotla Basti — Riverside</span><span className="score">9.4</span></li>
              <li><span className="rank">02</span><span className="name">Chandpur Colony — Riverside</span><span className="score">9.1</span></li>
              <li><span className="rank">03</span><span className="name">Rampur Nagar — Hillside</span><span className="score">8.6</span></li>
              <li><span className="rank">04</span><span className="name">Gopalpur — Coastal</span><span className="score">7.9</span></li>
              <li><span className="rank">05</span><span className="name">Sundarban Ghat — Riverside</span><span className="score">6.8</span></li>
              <li><span className="rank">06</span><span className="name">Vasant Vihar — Coastal</span><span className="score">3.2</span></li>
            </ol>
            <p className="hint">Ranking = weighted combination of hazard probability, exposure, vulnerability and carrying-capacity overshoot. See "How Scoring Works" for the formula.</p>
          </div>
        </section>

        {/* ===== ABOUT / SCORING VIEW ===== */}
        <section className="view" id="view-about">
          <div className="panel panel-full panel-about">
            <div className="panel-head"><h2>How the Risk &amp; Vulnerability Score Works</h2></div>

            <div className="about-grid">
              <div className="about-card">
                <span className="about-step">01</span>
                <h3>Hazard Layer</h3>
                <p>Flood, landslide, cyclone and erosion probability surfaces are derived from historical events, terrain slope, rainfall and drainage data.</p>
              </div>
              <div className="about-card">
                <span className="about-step">02</span>
                <h3>Exposure Layer</h3>
                <p>Habitation boundaries and population counts are overlaid on hazard surfaces to measure how many people and assets sit inside each hazard zone.</p>
              </div>
              <div className="about-card">
                <span className="about-step">03</span>
                <h3>Vulnerability Layer</h3>
                <p>Housing quality, access to infrastructure and socio-economic indicators adjust the raw exposure into a vulnerability index per habitation.</p>
              </div>
              <div className="about-card">
                <span className="about-step">04</span>
                <h3>Carrying Capacity</h3>
                <p>Land stability and resource limits are compared against current population to flag habitations that have exceeded a safe carrying capacity.</p>
              </div>
            </div>

            <div className="formula-box">
              <span className="formula-label">Composite Risk Score</span>
              <code>R = (H × 0.35) + (E × 0.25) + (V × 0.25) + (C × 0.15)</code>
              <p>H = Hazard probability · E = Exposure · V = Vulnerability index · C = Carrying-capacity overshoot — each normalised 0–10. Weights are configurable per disaster type.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
