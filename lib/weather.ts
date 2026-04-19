/**
 * 天気API連動（Open-Meteo 無料・APIキー不要）。
 *
 * Docs: https://open-meteo.com/en/docs
 *
 * エリアslugから緯度経度を引き、現在の天気コードと気温を取得して、
 * TodayQuery の weather フィールド候補（'rain' | 'heat' | 'cold' | 'sunny'）に変換する。
 */

/** 主要エリアの代表座標 */
const AREA_COORDS: Record<string, { lat: number; lon: number }> = {
  hokkaido: { lat: 43.0621, lon: 141.3544 },     // 札幌
  aomori: { lat: 40.8244, lon: 140.7400 },
  iwate: { lat: 39.7036, lon: 141.1527 },
  miyagi: { lat: 38.2688, lon: 140.8722 },       // 仙台
  akita: { lat: 39.7186, lon: 140.1024 },
  yamagata: { lat: 38.2404, lon: 140.3634 },
  fukushima: { lat: 37.7500, lon: 140.4678 },
  ibaraki: { lat: 36.3418, lon: 140.4468 },
  tochigi: { lat: 36.5658, lon: 139.8836 },
  gunma: { lat: 36.3911, lon: 139.0608 },
  saitama: { lat: 35.8617, lon: 139.6455 },
  chiba: { lat: 35.6074, lon: 140.1065 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  kanagawa: { lat: 35.4478, lon: 139.6425 },     // 横浜
  niigata: { lat: 37.9024, lon: 139.0237 },
  toyama: { lat: 36.6953, lon: 137.2113 },
  ishikawa: { lat: 36.5944, lon: 136.6256 },
  fukui: { lat: 36.0652, lon: 136.2216 },
  yamanashi: { lat: 35.6639, lon: 138.5684 },
  nagano: { lat: 36.6513, lon: 138.1812 },
  gifu: { lat: 35.3912, lon: 136.7224 },
  shizuoka: { lat: 34.9769, lon: 138.3831 },
  aichi: { lat: 35.1815, lon: 136.9066 },        // 名古屋
  mie: { lat: 34.7303, lon: 136.5086 },
  shiga: { lat: 35.0045, lon: 135.8686 },
  kyoto: { lat: 35.0116, lon: 135.7681 },
  osaka: { lat: 34.6937, lon: 135.5023 },
  hyogo: { lat: 34.6901, lon: 135.1956 },        // 神戸
  nara: { lat: 34.6851, lon: 135.8325 },
  wakayama: { lat: 34.2260, lon: 135.1675 },
  tottori: { lat: 35.5011, lon: 134.2350 },
  shimane: { lat: 35.4723, lon: 133.0505 },
  okayama: { lat: 34.6551, lon: 133.9195 },
  hiroshima: { lat: 34.3853, lon: 132.4553 },
  yamaguchi: { lat: 34.1858, lon: 131.4714 },
  tokushima: { lat: 34.0703, lon: 134.5549 },
  kagawa: { lat: 34.3401, lon: 134.0434 },       // 高松
  ehime: { lat: 33.8416, lon: 132.7658 },        // 松山
  kochi: { lat: 33.5597, lon: 133.5311 },
  fukuoka: { lat: 33.6064, lon: 130.4181 },
  saga: { lat: 33.2494, lon: 130.2990 },
  nagasaki: { lat: 32.7503, lon: 129.8777 },
  kumamoto: { lat: 32.7898, lon: 130.7417 },
  oita: { lat: 33.2382, lon: 131.6126 },
  miyazaki: { lat: 31.9111, lon: 131.4239 },
  kagoshima: { lat: 31.5602, lon: 130.5581 },
  okinawa: { lat: 26.2124, lon: 127.6809 },      // 那覇
};

/** デフォルト: tokyo */
function getCoords(area: string | undefined): { lat: number; lon: number } {
  if (!area) return AREA_COORDS.tokyo;
  return AREA_COORDS[area] ?? AREA_COORDS.tokyo;
}

export type WeatherCondition = 'sunny' | 'rain' | 'heat' | 'cold' | 'any';

/**
 * WMO weather code → TodayQuery weather に変換。
 * Open-Meteo Weather code 仕様: https://open-meteo.com/en/docs
 */
function codeToWeather(code: number, temperatureC: number): WeatherCondition {
  // 気温優先（極端な気温はtemp判定）
  if (temperatureC >= 30) return 'heat';
  if (temperatureC <= 5) return 'cold';

  // WMO コードで雨/雪/晴れ判定
  if (code === 0 || code === 1) return 'sunny';           // 晴れ・ほぼ晴れ
  if (code === 2 || code === 3) return 'sunny';            // 部分曇り→sunny扱い
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rain';
  if (code >= 71 && code <= 77) return 'cold';             // 雪
  return 'any';
}

export type WeatherNow = {
  condition: WeatherCondition;
  temperatureC: number;
  code: number;
  label: string;
};

/** WMOコードを日本語の自然文に。表示用。 */
function codeToJaLabel(code: number): string {
  if (code === 0) return '快晴';
  if (code === 1) return '晴れ';
  if (code === 2) return '晴れ時々曇り';
  if (code === 3) return '曇り';
  if (code >= 45 && code <= 48) return '霧';
  if (code >= 51 && code <= 55) return '霧雨';
  if (code >= 56 && code <= 57) return '凍雨';
  if (code >= 61 && code <= 65) return '雨';
  if (code >= 66 && code <= 67) return '氷雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return 'にわか雨';
  if (code >= 85 && code <= 86) return 'にわか雪';
  if (code >= 95 && code <= 99) return '雷雨';
  return '不明';
}

/**
 * 現在の天気を Open-Meteo から取得してマッピング。
 * 失敗時は null を返す（呼び出し側でフォールバック）。
 */
export async function fetchWeatherForArea(area: string | undefined): Promise<WeatherNow | null> {
  const { lat, lon } = getCoords(area);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FTokyo`;
  try {
    const res = await fetch(url, {
      // Next.js RSC: 30分キャッシュ（天気はコロコロ変わるが実用十分）
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const t = data.current?.temperature_2m;
    const c = data.current?.weather_code;
    if (typeof t !== 'number' || typeof c !== 'number') return null;
    return {
      condition: codeToWeather(c, t),
      temperatureC: t,
      code: c,
      label: codeToJaLabel(c),
    };
  } catch {
    return null;
  }
}
