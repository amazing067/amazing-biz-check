import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import managers from '@/data/managers.json';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY 미설정');
      return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
    }

    const body = await req.json();
    const { managerId } = body;
    if (!managerId) {
      return NextResponse.json({ error: 'managerId-required' }, { status: 400 });
    }

    const manager = (managers as any[]).find((m) => String(m.id) === String(managerId));
    if (!manager) {
      return NextResponse.json({ error: 'manager-not-found' }, { status: 404 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();

    const record = {
      manager_id: String(managerId),
      company: manager.company,
      name: manager.name,
      phone: manager.phone,
      logo: manager.logo,
      color: manager.color ?? null,
      suffix: manager.suffix ?? null,
      date: today,
      checkin_at: nowIso,
      checkout_at: null as string | null,
    };

    const { data, error } = await supabase.from('attendance').insert(record).select('*').single();
    if (error) {
      console.error('supabase insert error', error);
      return NextResponse.json({ error: 'failed-to-checkin' }, { status: 500 });
    }

    // TV/태블릿이 쓰던 기존 JSON 구조에 맞춰 변환해서 반환
    const response = {
      id: data.id,
      managerId: data.manager_id,
      company: data.company,
      name: data.name,
      phone: data.phone,
      logo: data.logo,
      color: data.color,
      suffix: data.suffix,
      date: data.date,
      checkinAt: data.checkin_at,
      checkoutAt: data.checkout_at,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('attendance checkin error', err);
    return NextResponse.json({ error: 'failed-to-checkin' }, { status: 500 });
  }
}

