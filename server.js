const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 2000;
const DATA_DIR = path.join(__dirname, 'data');
const MANAGERS_PATH = path.join(DATA_DIR, 'managers.json');
const QUOTES_PATH = path.join(DATA_DIR, 'quotes.json');
const ATTENDANCE_PATH = path.join(DATA_DIR, 'attendance.json');

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}

const LOGOS_DIR = process.env.LOGOS_PATH || path.join('C:\\', 'Users', 'ok', 'cheongu-landing', 'assets', 'logos');
if (fs.existsSync(LOGOS_DIR)) {
  app.use('/logos', express.static(LOGOS_DIR));
  console.log('로고 경로 사용:', LOGOS_DIR);
} else {
  console.log('로고 폴더 없음 (연락처만 표시):', LOGOS_DIR);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadManagers() {
  try {
    return JSON.parse(fs.readFileSync(MANAGERS_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function loadQuotes() {
  try {
    return JSON.parse(fs.readFileSync(QUOTES_PATH, 'utf8'));
  } catch {
    return ['오늘도 좋은 하루 되세요.'];
  }
}

function loadAttendance() {
  try {
    const raw = fs.readFileSync(ATTENDANCE_PATH, 'utf8');
    const data = JSON.parse(raw);
    const today = dateKey();
    if (data.date !== today) return { date: today, records: [] };
    return data;
  } catch {
    return { date: dateKey(), records: [] };
  }
}

function saveAttendance(attendance) {
  attendance.date = dateKey();
  fs.writeFileSync(ATTENDANCE_PATH, JSON.stringify(attendance, null, 2), 'utf8');
}

function dateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

let managers = loadManagers();
let quotes = loadQuotes();

// 오늘의 명언 (매일 다르게 — 30일치, 날짜 1~30으로 선택)
app.get('/api/quote', (req, res) => {
  const day = new Date().getDate();
  const index = (day - 1) % 30;
  const quote = quotes[index] != null ? quotes[index] : quotes[0];
  res.json({ quote: quote || '오늘도 좋은 하루 되세요.' });
});

// 전체 매니저 목록 (회사/이름/연락처)
app.get('/api/managers', (req, res) => {
  res.json(loadManagers());
});

// 오늘 출근한 목록
app.get('/api/attendance/today', (req, res) => {
  const att = loadAttendance();
  res.json(att.records);
});

// 출근 체크인
app.post('/api/attendance/checkin', (req, res) => {
  const { managerId } = req.body;
  const list = loadManagers();
  const manager = list.find((m) => m.id === managerId);
  if (!manager) {
    return res.status(400).json({ error: '매니저를 찾을 수 없습니다.' });
  }
  const att = loadAttendance();
  if (att.records.some((r) => r.managerId === managerId && !r.checkoutAt)) {
    return res.status(400).json({ error: '이미 출근 처리되었습니다.' });
  }
  att.records.push({
    id: `a-${Date.now()}-${managerId}`,
    managerId: manager.id,
    company: manager.company,
    name: manager.name,
    phone: manager.phone,
    logo: manager.logo || null,
    suffix: manager.suffix || null,
    color: manager.color || null,
    checkinAt: new Date().toISOString(),
    checkoutAt: null,
  });
  saveAttendance(att);
  res.json({ ok: true, company: manager.company, name: manager.name });
});

// 퇴근 체크아웃
app.post('/api/attendance/checkout', (req, res) => {
  const { recordId } = req.body;
  const att = loadAttendance();
  const record = att.records.find((r) => r.id === recordId && !r.checkoutAt);
  if (!record) {
    return res.status(400).json({ error: '출근 기록을 찾을 수 없거나 이미 퇴근 처리되었습니다.' });
  }
  record.checkoutAt = new Date().toISOString();
  saveAttendance(att);
  res.json({ ok: true });
});

// TV/태블릿 라우트는 index 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`매니저 출석 체크 서버: ${url}`);
  console.log(`  - TV 대시보드: ${url}/tv.html`);
  console.log(`  - 출근/퇴근 체크(태블릿): ${url}/checkin.html`);
  if (process.env.npm_lifecycle_event !== 'dev') {
    const { exec } = require('child_process');
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd, () => {});
  } else {
    console.log('  - 자동 새로고침: 브라우저에서 localhost:2000 으로 열어주세요.');
  }
});
