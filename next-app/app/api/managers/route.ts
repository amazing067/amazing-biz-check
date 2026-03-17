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

