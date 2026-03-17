import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const attendanceFilePath = path.join(process.cwd(), 'data', 'attendance.json');
const managersFilePath = path.join(process.cwd(), 'data', 'managers.json');

function readAttendance(): any[] {
  if (!fs.existsSync(attendanceFilePath)) return [];
  return JSON.parse(fs.readFileSync(attendanceFilePath, 'utf8')) as any[];
}

function readManagers(): any[] {
  if (!fs.existsSync(managersFilePath)) return [];
  return JSON.parse(fs.readFileSync(managersFilePath, 'utf8')) as any[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { managerId } = body;
    if (!managerId) {
      return NextResponse.json({ error: 'managerId-required' }, { status: 400 });
    }

    const managers = readManagers();
    const manager = managers.find((m) => String(m.id) === String(managerId));
    if (!manager) {
      return NextResponse.json({ error: 'manager-not-found' }, { status: 404 });
    }

    const all = readAttendance();
    const today = new Date().toISOString().slice(0, 10);

    const record = {
      id: `a-${Date.now()}-${managerId}`,
      managerId: String(managerId),
      company: manager.company,
      name: manager.name,
      phone: manager.phone,
      logo: manager.logo,
      color: manager.color ?? null,
      suffix: manager.suffix ?? null,
      date: today,
      checkinAt: new Date().toISOString(),
    };

    all.push(record);
    fs.writeFileSync(attendanceFilePath, JSON.stringify(all, null, 2), 'utf8');

    return NextResponse.json(record);
  } catch (err) {
    console.error('attendance checkin error', err);
    return NextResponse.json({ error: 'failed-to-checkin' }, { status: 500 });
  }
}

