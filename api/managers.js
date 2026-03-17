const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'managers.json');
    const json = fs.readFileSync(filePath, 'utf8');
    const managers = JSON.parse(json);
    res.status(200).json(managers);
  } catch (err) {
    console.error('Error reading managers.json', err);
    res.status(500).json({ error: 'failed-to-load-managers' });
  }
};

