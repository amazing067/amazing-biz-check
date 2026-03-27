import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(_req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'managers.json');
    const json = fs.readFileSync(filePath, 'utf8');
    const managers = JSON.parse(json);
    return NextResponse.json(managers);
  } catch (err) {
    console.error('Error reading managers.json', err);
    return NextResponse.json({ error: 'failed-to-load-managers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const managerId = String(body?.managerId ?? '').trim();
    const name = String(body?.name ?? '').trim();
    const phone = String(body?.phone ?? '').trim();

    if (!managerId || !name || !phone) {
      return NextResponse.json({ error: 'managerId-name-phone-required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'managers.json');
    const json = fs.readFileSync(filePath, 'utf8');
    const managers = JSON.parse(json);

    if (!Array.isArray(managers)) {
      return NextResponse.json({ error: 'invalid-managers-json' }, { status: 500 });
    }

    const idx = managers.findIndex((m: any) => String(m.id) === managerId);
    if (idx < 0) {
      return NextResponse.json({ error: 'manager-not-found' }, { status: 404 });
    }

    managers[idx] = {
      ...managers[idx],
      name,
      phone,
    };

    fs.writeFileSync(filePath, JSON.stringify(managers, null, 2), 'utf8');
    return NextResponse.json(managers[idx]);
  } catch (err) {
    console.error('Error updating managers.json', err);
    return NextResponse.json({ error: 'failed-to-update-manager' }, { status: 500 });
  }
}

