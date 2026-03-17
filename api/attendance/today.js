const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'attendance.json');
    if (!fs.existsSync(filePath)) {
      return res.status(200).json([]);
    }
    const json = fs.readFileSync(filePath, 'utf8');
    const records = JSON.parse(json);

    // 오늘 날짜 기준으로 필터링
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const todayRecords = records.filter((r) => r.date === today);

    res.status(200).json(todayRecords);
  } catch (err) {
    console.error('Error reading attendance.json', err);
    res.status(500).json({ error: 'failed-to-load-attendance' });
  }
};

