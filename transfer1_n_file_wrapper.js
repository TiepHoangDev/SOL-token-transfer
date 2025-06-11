const fs = require('fs');
const { transfer1N } = require('./transfer1_n');

(async () => {
  try {
    const input = JSON.parse(fs.readFileSync('input.json', 'utf8'));
    const result = await transfer1N(input);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ Lỗi khi chạy:', err.message);
  }
})();
