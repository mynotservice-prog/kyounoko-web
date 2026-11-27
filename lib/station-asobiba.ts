/**
 * 駅×子供の遊び場（/station/<駅>/asobiba）の施設台帳と、その読み方（実験47・2026-11-27）。
 *
 * 旧来の遊び場ページは「同じ区・市の施設」を並べるだけで、同じ区の駅がほぼ同じ中身になるため
 * 常に noindex・配信停止にしていた（lib/station-cond-index.ts）。この台帳は、駅から直線1.2km以内の
 * 施設を区・都・施設の公式で1件ずつ確かめたもので、台帳のある駅だけをこの型で配信する。
 *
 * - 施設の事実（料金・対象・授乳室など）は公式の記載だけ。記載が無い項目は null（「無い」ではない）。
 * - 距離は駅の座標（lib/station-coords.json）からの直線距離。徒歩の目安は直線×1.3を道のりとし、
 *   大人 分速80m・子連れ（ベビーカー・幼児の歩き）分速60mで割った概算。
 * - 台帳の施設が STATION_ASOBIBA_MIN 件に満たない駅は配信しない（少ない駅を量産しない）。
 */
import { STATION_ASOBIBA_LEDGER, type AsobibaLedgerFacility } from './station-asobiba-ledger';
import { getStationCoords, haversineKm } from './all-stations';
import { getOutingSpotsWithSlug, isSpotIndexable } from './spots';
import type { FaqItem } from './station-faq';

/** 配信に要る、公式で確かめた施設の最小件数 */
export const STATION_ASOBIBA_MIN = 12;
/** 載せる範囲（直線） */
export const STATION_ASOBIBA_MAX_M = 1200;

export type AsobibaBand = '駅前' | '徒歩圏' | '少し歩く';

export type AsobibaFacility = AsobibaLedgerFacility & {
  /** 駅からの直線距離（m・10m単位） */
  m: number;
  band: AsobibaBand;
  /** 大人の徒歩の目安（分） */
  walkAdult: number;
  /** 子連れの徒歩の目安（分） */
  walkKids: number;
  /** きょうのこに同じ施設の個別ページがあれば、その slug */
  spotSlug?: string;
};

export type StationAsobiba = {
  facilities: AsobibaFacility[];
  /** 台帳で一番新しい確認日 */
  verifiedAt: string;
  counts: {
    total: number;
    free: number;
    indoor: number;
    nursingRoom: number;
    diaperChange: number;
    within800: number;
  };
};

export const ASOBIBA_KIND_LABEL: Record<AsobibaLedgerFacility['kind'], string> = {
  jidoukan: '児童館・児童センター',
  'kosodate-hiroba': '子育てひろば',
  'indoor-play': '屋内の遊び場',
  park: '公園',
  museum: '博物館・科学館',
  library: '図書館',
  'mall-kids': '商業施設のキッズスペース',
  pool: 'プール',
  other: 'そのほか',
};

const normName = (s: string) => s.replace(/[（(].*?[）)]/g, '').replace(/[\s・　]/g, '').trim();

let spotIndex: Map<string, string> | null = null;
function findSpotSlug(name: string): string | undefined {
  if (!spotIndex) {
    spotIndex = new Map();
    for (const { slug, spot } of getOutingSpotsWithSlug()) {
      if (!isSpotIndexable(spot)) continue;
      const k = normName(spot.name);
      if (!spotIndex.has(k)) spotIndex.set(k, slug);
    }
  }
  return spotIndex.get(normName(name));
}

function bandOf(m: number): AsobibaBand {
  if (m <= 300) return '駅前';
  if (m <= 800) return '徒歩圏';
  return '少し歩く';
}

const cache = new Map<string, StationAsobiba | null>();

/** 台帳のある駅の施設（駅に近い順）。台帳が無い・座標が無い駅は null。 */
export function getStationAsobiba(stationSlug: string): StationAsobiba | null {
  if (cache.has(stationSlug)) return cache.get(stationSlug)!;
  const ledger = STATION_ASOBIBA_LEDGER[stationSlug];
  const at = getStationCoords(stationSlug);
  if (!ledger || !at) {
    cache.set(stationSlug, null);
    return null;
  }
  const facilities: AsobibaFacility[] = ledger
    .map((f) => {
      const raw = haversineKm(at, { lat: f.lat, lng: f.lng }) * 1000;
      const m = Math.round(raw / 10) * 10;
      const road = raw * 1.3;
      return {
        ...f,
        m,
        band: bandOf(m),
        walkAdult: Math.max(1, Math.round(road / 80)),
        walkKids: Math.max(1, Math.round(road / 60)),
        spotSlug: findSpotSlug(f.name),
      };
    })
    .filter((f) => f.m <= STATION_ASOBIBA_MAX_M)
    .sort((a, b) => a.m - b.m);
  const r: StationAsobiba = {
    facilities,
    verifiedAt: ledger.map((f) => f.verifiedAt).sort().at(-1) ?? '',
    counts: {
      total: facilities.length,
      free: facilities.filter((f) => f.fee.free === true).length,
      indoor: facilities.filter((f) => f.place === 'indoor').length,
      nursingRoom: facilities.filter((f) => f.nursingRoom === true).length,
      diaperChange: facilities.filter((f) => f.diaperChange === true).length,
      within800: facilities.filter((f) => f.m <= 800).length,
    },
  };
  cache.set(stationSlug, r);
  return r;
}

/** 台帳で配信する駅か（公式で確かめた施設が STATION_ASOBIBA_MIN 件以上） */
export function isStationAsobibaLive(stationSlug: string): boolean {
  const a = getStationAsobiba(stationSlug);
  return !!a && a.counts.total >= STATION_ASOBIBA_MIN;
}

/** 台帳で配信している駅の slug（generateStaticParams・sitemap 用） */
export function listStationAsobibaLive(): string[] {
  return Object.keys(STATION_ASOBIBA_LEDGER).filter(isStationAsobibaLive);
}

const names = (list: AsobibaFacility[], n = 3) => list.slice(0, n).map((f) => f.name).join('・');

/** 台帳の中身だけから組む FAQ。0件の問いは出さない。 */
export function buildAsobibaFaq(stationName: string, a: StationAsobiba): FaqItem[] {
  const out: FaqItem[] = [];
  const fs = a.facilities;
  const near = fs[0];
  if (near) {
    out.push({
      question: `${stationName}駅からいちばん近い子供の遊び場は？`,
      answer: `${near.name}（${ASOBIBA_KIND_LABEL[near.kind]}）で、駅から直線約${near.m}mです。子連れで歩くと約${near.walkKids}分が目安です。${fs.length > 1 ? `次に近いのは${names(fs.slice(1), 2)}です。` : ''}`,
    });
  }
  const free = fs.filter((f) => f.fee.free === true);
  if (free.length > 0) {
    out.push({
      question: `${stationName}駅の近くで無料で遊べる場所は？`,
      answer: `公式に無料と書かれている施設が、駅から直線1.2km以内に${free.length}か所あります。駅に近い順に${names(free)}${free.length > 3 ? 'など' : ''}です。`,
    });
  }
  const indoor = fs.filter((f) => f.place === 'indoor');
  if (indoor.length > 0) {
    out.push({
      question: `${stationName}駅の近くで雨の日に遊べる屋内の場所は？`,
      answer: `屋内の施設が${indoor.length}か所あります。駅に近い順に${names(indoor)}${indoor.length > 3 ? 'など' : ''}です。開館日と時間は各施設の公式でご確認ください。`,
    });
  }
  const nursing = fs.filter((f) => f.nursingRoom === true);
  if (nursing.length > 0) {
    out.push({
      question: `${stationName}駅の近くで授乳室がある遊び場は？`,
      answer: `公式に授乳室（授乳スペース）の記載がある施設は${nursing.length}か所です。駅に近い順に${names(nursing)}${nursing.length > 3 ? 'など' : ''}です。記載が無い施設に授乳室が無いという意味ではありません。`,
    });
  }
  return out;
}

const LD_TYPE: Record<AsobibaLedgerFacility['kind'], string> = {
  jidoukan: 'CivicStructure',
  'kosodate-hiroba': 'CivicStructure',
  'indoor-play': 'EntertainmentBusiness',
  park: 'Park',
  museum: 'Museum',
  library: 'Library',
  'mall-kids': 'Place',
  pool: 'PublicSwimmingPool',
  other: 'Place',
};

/** ItemList（施設単位・住所と座標と公式URL） */
export function buildAsobibaLd(stationName: string, a: StationAsobiba): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${stationName}駅周辺の子供の遊び場`,
    numberOfItems: a.facilities.length,
    itemListElement: a.facilities.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': LD_TYPE[f.kind],
        name: f.name,
        url: f.officialUrl,
        address: { '@type': 'PostalAddress', streetAddress: f.address, addressCountry: 'JP' },
        geo: { '@type': 'GeoCoordinates', latitude: f.lat, longitude: f.lng },
        ...(f.fee.free === true ? { isAccessibleForFree: true } : {}),
      },
    })),
  };
}
