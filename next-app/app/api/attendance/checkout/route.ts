import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
    }

    const body = await req.json();
    const { recordId } = body;
    if (!recordId) {
      return NextResponse.json({ error: 'recordId-required' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .update({ checkout_at: nowIso })
      .eq('id', recordId)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // not found
        return NextResponse.json({ error: 'not-found' }, { status: 404 });
      }
      console.error('supabase checkout update error', error);
      return NextResponse.json({ error: 'failed-to-checkout' }, { status: 500 });
    }

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
    console.error('attendance checkout error', err);
    return NextResponse.json({ error: 'failed-to-checkout' }, { status: 500 });
  }
}

