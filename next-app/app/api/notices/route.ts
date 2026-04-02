import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const DEFAULT_GJ2_NOTICE_HTML = `
<div class="notice-text">
  <div class="notice-top">4월부터 전체보험사 모니터링이 변경되었습니다</div>
  <div>질문 복잡해지고 <span class="notice-yn">예/아니오</span> 섞여서 나오니</div>
  <div>끝까지 확인 한 후 답변해주세요!!</div>
  <div class="notice-strong">청약 후 3시간 후에만 해피콜 진행가능</div>
  <div class="notice-sub">(3시간 전에는 해피콜 진행이 불가능합니다)</div>
</div>
`.trim();

const DEFAULT_PUBLIC_NOTICE_HTML = DEFAULT_GJ2_NOTICE_HTML;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        {
          gj2NoticeHtml: DEFAULT_GJ2_NOTICE_HTML,
          publicNoticeHtml: DEFAULT_PUBLIC_NOTICE_HTML,
          error: 'supabase-not-configured',
        },
        { status: 200 },
      );
    }

    const { data, error } = await supabase
      .from('dashboard_notices')
      .select('notice_key, content');

    if (error) {
      console.error('supabase dashboard_notices select error', error);
      return NextResponse.json(
        {
          gj2NoticeHtml: DEFAULT_GJ2_NOTICE_HTML,
          publicNoticeHtml: DEFAULT_PUBLIC_NOTICE_HTML,
        },
        { status: 200 },
      );
    }

    const map = new Map<string, string>();
    for (const row of data ?? []) {
      map.set(String(row.notice_key), String(row.content ?? ''));
    }

    return NextResponse.json({
      gj2NoticeHtml: map.get('gj2') || DEFAULT_GJ2_NOTICE_HTML,
      publicNoticeHtml: map.get('public') || DEFAULT_PUBLIC_NOTICE_HTML,
    });
  } catch (err) {
    console.error('Error loading notices', err);
    return NextResponse.json(
      {
        gj2NoticeHtml: DEFAULT_GJ2_NOTICE_HTML,
        publicNoticeHtml: DEFAULT_PUBLIC_NOTICE_HTML,
      },
      { status: 200 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
    }

    const body = await req.json();
    const target = String(body?.target ?? '').trim();
    const content = String(body?.content ?? '').trim();
    if (!target || !content) {
      return NextResponse.json({ error: 'target-and-content-required' }, { status: 400 });
    }
    if (target !== 'gj2' && target !== 'public') {
      return NextResponse.json({ error: 'invalid-target' }, { status: 400 });
    }

    const { error } = await supabase.from('dashboard_notices').upsert(
      {
        notice_key: target,
        content,
      },
      { onConflict: 'notice_key' },
    );

    if (error) {
      console.error('supabase dashboard_notices upsert error', error);
      return NextResponse.json({ error: 'failed-to-save-notice' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error saving notice', err);
    return NextResponse.json({ error: 'failed-to-save-notice' }, { status: 500 });
  }
}
