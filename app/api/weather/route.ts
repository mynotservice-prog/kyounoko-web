import { NextResponse } from 'next/server';
import { fetchWeatherForArea } from '@/lib/weather';

export const revalidate = 1800; // 30分キャッシュ

/** /api/weather?area=tokyo */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const area = url.searchParams.get('area') ?? 'tokyo';
  const w = await fetchWeatherForArea(area);
  if (!w) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  return NextResponse.json(w, {
    headers: {
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  });
}
