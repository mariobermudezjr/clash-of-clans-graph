const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'data', 'leaguewars.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

data.seasons.forEach(season => {
  console.log(`Season ${season.season}: ${season.wars.length} wars before dedup`);

  // Group wars by a unique key (season + round + opponent)
  const warMap = new Map();
  season.wars.forEach(war => {
    const key = `${war.season}-round${war.roundNumber}-${war.opponentTag}`;

    // Keep the most recently collected version
    if (!warMap.has(key) || new Date(war.collectedAt) > new Date(warMap.get(key).collectedAt)) {
      warMap.set(key, war);
    }
  });

  season.wars = Array.from(warMap.values()).sort((a, b) => a.roundNumber - b.roundNumber);
  console.log(`Season ${season.season}: ${season.wars.length} wars after dedup`);
});

fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
console.log('\nDuplicates removed successfully!');
