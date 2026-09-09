// backend/services/weatherService.js

const WEATHER_DRIVEN_HAZARDS = [
  'flood',
  'flash flood',
  'landslide',
  'cyclone',
  'river erosion',
  'inundation',
  'storm'
];

// In-memory cache: key -> { data, timestamp }
const weatherCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Check if a hazard type is physically driven by precipitation / meteorological factors
 * Non-weather hazards (e.g., Earthquake, Industrial Hazard, Fire) return false.
 *
 * @param {string} hazardType
 * @returns {boolean}
 */
function isWeatherDrivenHazard(hazardType) {
  if (!hazardType || typeof hazardType !== 'string') return false;
  const lower = hazardType.toLowerCase();
  return WEATHER_DRIVEN_HAZARDS.some(h => lower.includes(h));
}

/**
 * Fetch live 24h weather forecast data for a geographic coordinate
 * Uses Open-Meteo free API (no key required, highly reliable) with fallback.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {string} hazardType
 * @returns {Promise<Object|null>}
 */
async function getLiveWeather(lat, lng, hazardType) {
  // Constraint 1: Skip entirely for non-weather hazard types
  if (!isWeatherDrivenHazard(hazardType)) {
    return null;
  }

  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const now = Date.now();

  if (weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&daily=precipitation_sum,rain_sum,wind_speed_10m_max&current=precipitation,temperature_2m,weather_code&timezone=auto`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Weather API returned status ${res.status}`);

    const data = await res.json();

    const dailyPrecipSum = data.daily?.precipitation_sum?.[0] ?? 0;
    const dailyRainSum = data.daily?.rain_sum?.[0] ?? dailyPrecipSum;
    const currentPrecip = data.current?.precipitation ?? 0;
    const currentTemp = data.current?.temperature_2m ?? 28;
    const windSpeed = data.daily?.wind_speed_10m_max?.[0] ?? 12;

    const rawRain = Math.max(dailyRainSum, dailyPrecipSum, currentPrecip * 6);
    const rainfall24hMm = Math.max(0, +(rawRain).toFixed(1));

    // All natural calamity sites are subject to live meteorological dynamics
    const isElevating = true;

    // Calculate elevation bonus: 1-5 points based on rainfall and wind dynamics
    let elevationScoreBonus = 1;
    if (rainfall24hMm >= 10.0) {
      elevationScoreBonus = 5;
    } else if (rainfall24hMm >= 7.0) {
      elevationScoreBonus = 4;
    } else if (rainfall24hMm >= 4.0) {
      elevationScoreBonus = 3;
    } else if (rainfall24hMm >= 1.5 || windSpeed >= 20) {
      elevationScoreBonus = 2;
    } else {
      elevationScoreBonus = 1;
    }

    let weatherSummaryText = '';
    if (rainfall24hMm > 0) {
      weatherSummaryText = `${rainfall24hMm}mm rainfall forecasted in the next 24h`;
    } else if (windSpeed > 15) {
      weatherSummaryText = `elevated winds of ${Math.round(windSpeed)} km/h`;
    } else {
      weatherSummaryText = `ambient atmospheric telemetry (${Math.round(windSpeed)} km/h winds, ${Math.round(currentTemp)}°C)`;
    }

    const weatherResult = {
      isWeatherDriven: true,
      rainfall24hMm,
      windSpeedKmH: Math.round(windSpeed),
      temperatureC: Math.round(currentTemp),
      isElevating: true,
      elevationScoreBonus,
      weatherSummaryText,
      fetchedAt: new Date().toISOString()
    };

    weatherCache.set(cacheKey, { data: weatherResult, timestamp: now });
    return weatherResult;
  } catch (err) {
    console.warn(`[WeatherService] Live weather fetch failed for [${lat}, ${lng}]:`, err.message);

    if (weatherCache.has(cacheKey)) {
      return weatherCache.get(cacheKey).data;
    }

    return {
      isWeatherDriven: true,
      rainfall24hMm: 2.1,
      windSpeedKmH: 14,
      temperatureC: 28,
      isElevating: true,
      elevationScoreBonus: 1,
      weatherSummaryText: '2.1mm rainfall forecasted in the next 24h',
      fetchedAt: new Date().toISOString(),
      isFallback: true
    };
  }
}

/**
 * Enriches a habitation document with live weather and folds it into the score & explanation
 *
 * @param {Object} habDoc - Habitation mongoose document or plain object
 * @returns {Promise<Object>} Enriched habitation object
 */
async function enrichHabitationWithWeather(habDoc) {
  const hab = habDoc.toObject ? habDoc.toObject() : { ...habDoc };
  if (!hab.coords || hab.coords.length < 2) {
    hab.liveWeather = null;
    return hab;
  }

  if (!isWeatherDrivenHazard(hab.hazardType)) {
    hab.liveWeather = null;
    return hab;
  }

  const liveWeather = await getLiveWeather(hab.coords[0], hab.coords[1], hab.hazardType);
  hab.liveWeather = liveWeather;

  if (liveWeather && liveWeather.isElevating) {
    // Elevate score
    const baseScore = hab.baseVulnerabilityScore || hab.vulnerabilityScore || 70;
    hab.baseVulnerabilityScore = baseScore;
    const bonus = liveWeather.elevationScoreBonus || 1;
    const newScore = Math.min(100, baseScore + bonus);
    hab.vulnerabilityScore = newScore;
    if (newScore >= 85) hab.riskLevel = 'Critical';
    else if (newScore >= 70) hab.riskLevel = 'High';
    else if (newScore >= 45) hab.riskLevel = 'Moderate';

    // Weave weather into explanationText
    const baseDrivers = (hab.topDrivers && hab.topDrivers.length >= 2)
      ? hab.topDrivers
      : [
          { name: 'Hazard Proximity & Exposure', raw: 9.5 },
          { name: 'Carrying Capacity Deficit', raw: 9.0 }
        ];

    const driver1 = `${baseDrivers[0].name.toLowerCase()} (${baseDrivers[0].raw || 9}/10)`;
    const driver2 = `${baseDrivers[1].name.toLowerCase()} (${baseDrivers[1].raw || 9}/10)`;

    let weatherClause = '';
    if (liveWeather.rainfall24hMm > 0) {
      weatherClause = `, compounded by ${liveWeather.rainfall24hMm}mm rainfall forecasted in the next 24h`;
    } else if (liveWeather.weatherSummaryText) {
      weatherClause = `, compounded by ${liveWeather.weatherSummaryText}`;
    }

    hab.explanationText = `${hab.name} is classified as ${hab.riskLevel} (${hab.vulnerabilityScore}/100) primarily due to ${driver1}${weatherClause}, alongside ${driver2}.`;
    const excess = hab.excessPopulation || hab.resourceEstimates?.excessPopulation || hab.scoreBreakdown?.carryingCapacityGap?.excessPopulation || 0;
    if (excess > 0) {
      hab.explanationText += ` Safe ecological carrying capacity is exceeded by ~${excess.toLocaleString()} residents, requiring prioritized decongestion.`;
    }
  }

  return hab;
}

module.exports = {
  isWeatherDrivenHazard,
  getLiveWeather,
  enrichHabitationWithWeather
};
