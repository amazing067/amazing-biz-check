import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(_req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'quotes.json');
    const json = fs.readFileSync(filePath, 'utf8');
    const quotes = JSON.parse(json);

    if (!Array.isArray(quotes) || quotes.length === 0) {
      return NextResponse.json({ quote: '오늘도 좋은 하루 되세요.' });
    }

    const today = new Date();
    const idx = today.getDate() % quotes.length;
    const item = quotes[idx];

    return NextResponse.json({ quote: item.text ?? item });
  } catch (err) {
    console.error('Error reading quotes.json', err);
    return NextResponse.json({ quote: '오늘도 좋은 하루 되세요.' });
  }
}

