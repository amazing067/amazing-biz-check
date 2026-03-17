const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'quotes.json');
    const json = fs.readFileSync(filePath, 'utf8');
    const quotes = JSON.parse(json);

    if (!Array.isArray(quotes) || quotes.length === 0) {
      return res.status(200).json({ quote: '오늘도 좋은 하루 되세요.' });
    }

    // 날짜 기준으로 오늘 인덱스 선택 (단순 순환)
    const today = new Date();
    const index = today.getDate() % quotes.length;
    const item = quotes[index];

    res.status(200).json({ quote: item.text || item });
  } catch (err) {
    console.error('Error reading quotes.json', err);
    res.status(200).json({ quote: '오늘도 좋은 하루 되세요.' });
  }
};

