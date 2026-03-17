import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'attendance.json');

function readAll(): any[] {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as any[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recordId } = body;
    if (!recordId) {
      return NextResponse.json({ error: 'recordId-required' }, { status: 400 });
    }
    const all = readAll();
    const idx = all.findIndex((r) => r.id === recordId);
    if (idx === -1) {
      return NextResponse.json({ error: 'not-found' }, { status: 404 });
    }
    all[idx].checkoutAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(all, null, 2), 'utf8');
    return NextResponse.json(all[idx]);
  } catch (err) {
    console.error('attendance checkout error', err);
    return NextResponse.json({ error: 'failed-to-checkout' }, { status: 500 });
  }
}

