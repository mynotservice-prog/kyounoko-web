/**
 * 駅×子供の遊び場の施設台帳（実験47・2026-11-27）。中身は data/station-asobiba/<駅slug>.json。
 * 1件ずつ区・都・施設の公式で確かめたもの。書き方と検査は scripts/check-station-asobiba.mjs。
 * 公式に記載の無い項目は null（「無い」という意味ではない）。false は公式が「無い」と明記しているときだけ。
 */
import kinshicho from '../data/station-asobiba/kinshicho.json';
import oshiage from '../data/station-asobiba/oshiage.json';
import kitaSenju from '../data/station-asobiba/kita-senju.json';
import ikebukuro from '../data/station-asobiba/ikebukuro.json';
import ueno from '../data/station-asobiba/ueno.json';

export type AsobibaLedgerFacility = {
  name: string;
  kind: 'jidoukan' | 'kosodate-hiroba' | 'indoor-play' | 'park' | 'museum' | 'library' | 'mall-kids' | 'pool' | 'other';
  place: 'indoor' | 'outdoor' | 'mixed';
  address: string;
  lat: number;
  lng: number;
  geoSource: 'gsi' | 'official';
  officialUrl: string;
  sourceUrls: string[];
  fee: { free: boolean | null; text: string | null };
  ages: string | null;
  hours: string | null;
  closed: string | null;
  nursingRoom: boolean | null;
  diaperChange: boolean | null;
  strollerOk: boolean | null;
  directFromStation: boolean | null;
  accessOfficial: string | null;
  notes: string | null;
  verifiedAt: string;
};

export const STATION_ASOBIBA_LEDGER: Record<string, AsobibaLedgerFacility[]> = {
  kinshicho: kinshicho as AsobibaLedgerFacility[],
  oshiage: oshiage as AsobibaLedgerFacility[],
  'kita-senju': kitaSenju as AsobibaLedgerFacility[],
  ikebukuro: ikebukuro as AsobibaLedgerFacility[],
  ueno: ueno as AsobibaLedgerFacility[],
};
