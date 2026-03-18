import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY 미설정 → 출근 목록 빈 배열 반환');
      return NextResponse.json([]);
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('date', today);

    if (error) {
      console.error('supabase today select error', error);
      return NextResponse.json({ error: 'failed-to-load-attendance' }, { status: 500 });
    }

    const records = (data ?? []).map((r) => ({
      id: r.id,
      managerId: r.manager_id,
      company: r.company,
      name: r.name,
      phone: r.phone,
      logo: r.logo,
      color: r.color,
      suffix: r.suffix,
      date: r.date,
      checkinAt: r.checkin_at,
      checkoutAt: r.checkout_at,
    }));

    return NextResponse.json(records);
  } catch (err) {
    console.error('Error loading attendance from supabase', err);
    return NextResponse.json({ error: 'failed-to-load-attendance' }, { status: 500 });
  }
}

