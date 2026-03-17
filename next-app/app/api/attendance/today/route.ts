import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Record = { id: string; managerId: string; date: string; checkoutAt?: string };

const filePath = path.join(process.cwd(), 'data', 'attendance.json');

function readAll(): Record[] {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record[];
}

export async function GET(_req: NextRequest) {
  try {
    const all = readAll();
    const today = new Date().toISOString().slice(0, 10);
    const todayRecords = all.filter((r) => r.date === today);
    return NextResponse.json(todayRecords);
  } catch (err) {
    console.error('Error reading attendance.json', err);
    return NextResponse.json({ error: 'failed-to-load-attendance' }, { status: 500 });
  }
}

