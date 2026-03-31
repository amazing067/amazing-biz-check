import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
    }

    const { data, error } = await supabase.from('managers').select('*');
    if (error) {
      console.error('supabase managers select error', error);
      return NextResponse.json({ error: 'failed-to-load-managers' }, { status: 500 });
    }

    const managers = (data ?? [])
      .map((m) => ({
        id: String(m.id),
        company: m.company,
        name: m.name,
        suffix: m.suffix ?? null,
        phone: m.phone,
        logo: m.logo,
        category: m.category,
        color: m.color ?? null,
      }))
      .sort((a, b) => Number(a.id) - Number(b.id));

    return NextResponse.json(managers);
  } catch (err) {
    console.error('Error loading managers from supabase', err);
    return NextResponse.json({ error: 'failed-to-load-managers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
    }

    const body = await req.json();
    const managerId = String(body?.managerId ?? '').trim();
    const name = String(body?.name ?? '').trim();
    const phone = String(body?.phone ?? '').trim();

    if (!managerId || !name || !phone) {
      return NextResponse.json({ error: 'managerId-name-phone-required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('managers')
      .update({ name, phone })
      .eq('id', managerId)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'manager-not-found' }, { status: 404 });
      }
      console.error('supabase managers update error', error);
      return NextResponse.json({ error: 'failed-to-update-manager' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'manager-not-found' }, { status: 404 });
    }

    return NextResponse.json({
      id: String(data.id),
      company: data.company,
      name,
      suffix: data.suffix ?? null,
      phone,
      logo: data.logo,
      category: data.category,
      color: data.color ?? null,
    });
  } catch (err) {
    console.error('Error updating manager in supabase', err);
    return NextResponse.json({ error: 'failed-to-update-manager' }, { status: 500 });
  }
}

