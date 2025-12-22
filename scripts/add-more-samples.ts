import { CoCWarResponse } from '../lib/types';
import { transformWarData } from '../lib/data-transformer';
import { saveWar } from '../lib/storage';

// Create 3 more sample wars with varying performance
const sampleWars: CoCWarResponse[] = [
  // War 2 - Good performance
  {
    state: 'warEnded',
    teamSize: 10,
    attacksPerMember: 2,
    preparationStartTime: '20231102T052303.000Z',
    startTime: '20231103T042303.000Z',
    endTime: '20231104T042303.000Z',
    clan: {
      tag: '#2YGUQGY90',
      name: 'Alpha',
      badgeUrls: { small: '', medium: '', large: '' },
      clanLevel: 17,
      attacks: 19,
      stars: 48,
      destructionPercentage: 91.2,
      members: Array(10).fill(null).map((_, i) => ({
        tag: `#TAG${i}`,
        name: `Player${i}`,
        townhallLevel: 14,
        mapPosition: i + 1,
        attacks: i < 9 ? [
          { attackerTag: `#TAG${i}`, defenderTag: `#OPP${i}`, stars: 3, destructionPercentage: 100, order: i + 1 },
          { attackerTag: `#TAG${i}`, defenderTag: `#OPP${i+1}`, stars: 2, destructionPercentage: 85, order: i + 11 }
        ] : [
          { attackerTag: `#TAG${i}`, defenderTag: `#OPP${i}`, stars: 3, destructionPercentage: 100, order: i + 1 }
        ]
      }))
    },
    opponent: {
      tag: '#OPPONENT2',
      name: 'Warriors Clan',
      badgeUrls: { small: '', medium: '', large: '' },
      clanLevel: 18,
      attacks: 18,
      stars: 42,
      destructionPercentage: 84.5,
      members: Array(10).fill(null).map((_, i) => ({
        tag: `#OPP${i}`,
        name: `Enemy${i}`,
        townhallLevel: 14,
        mapPosition: i + 1,
        attacks: i < 8 ? [
          { attackerTag: `#OPP${i}`, defenderTag: `#TAG${i}`, stars: 2, destructionPercentage: 82, order: i + 20 },
          { attackerTag: `#OPP${i}`, defenderTag: `#TAG${i+1}`, stars: 2, destructionPercentage: 88, order: i + 30 }
        ] : i === 8 ? [
          { attackerTag: `#OPP${i}`, defenderTag: `#TAG${i}`, stars: 2, destructionPercentage: 76, order: i + 20 }
        ] : []
      }))
    }
  },
  // War 3 - Average performance
  {
    state: 'warEnded',
    teamSize: 10,
    attacksPerMember: 2,
    preparationStartTime: '20231109T052303.000Z',
    startTime: '20231110T042303.000Z',
    endTime: '20231111T042303.000Z',
    clan: {
      tag: '#2YGUQGY90',
      name: 'Alpha',
      badgeUrls: { small: '', medium: '', large: '' },
      clanLevel: 17,
      attacks: 16,
      stars: 34,
      destructionPercentage: 78.5,
      members: Array(10).fill(null).map((_, i) => ({
        tag: `#TAG${i}`,
        name: `Player${i}`,
        townhallLevel: 14,
        mapPosition: i + 1,
        attacks: i < 6 ? [
          { attackerTag: `#TAG${i}`, defenderTag: `#DEF${i}`, stars: 2, destructionPercentage: 75, order: i + 1 },
          { attackerTag: `#TAG${i}`, defenderTag: `#DEF${i+1}`, stars: 2, destructionPercentage: 82, order: i + 11 }
        ] : i < 8 ? [
          { attackerTag: `#TAG${i}`, defenderTag: `#DEF${i}`, stars: 2, destructionPercentage: 68, order: i + 1 }
        ] : []
      }))
    },
    opponent: {
      tag: '#OPPONENT3',
      name: 'Elite Squad',
      badgeUrls: { small: '', medium: '', large: '' },
      clanLevel: 19,
      attacks: 20,
      stars: 46,
      destructionPercentage: 89.3,
      members: Array(10).fill(null).map((_, i) => ({
        tag: `#DEF${i}`,
        name: `Defender${i}`,
        townhallLevel: 15,
        mapPosition: i + 1,
        attacks: [
          { attackerTag: `#DEF${i}`, defenderTag: `#TAG${i}`, stars: 2, destructionPercentage: 88, order: i + 20 },
          { attackerTag: `#DEF${i}`, defenderTag: `#TAG${i+1}`, stars: 2, destructionPercentage: 91, order: i + 30 }
        ]
      }))
    }
  },
  // War 4 - Excellent performance
  {
    state: 'warEnded',
    teamSize: 10,
    attacksPerMember: 2,
    preparationStartTime: '20231116T052303.000Z',
    startTime: '20231117T042303.000Z',
    endTime: '20231118T042303.000Z',
    clan: {
      tag: '#2YGUQGY90',
      name: 'Alpha',
      badgeUrls: { small: '', medium: '', large: '' },
      clanLevel: 17,
      attacks: 20,
      stars: 55,
      destructionPercentage: 96.5,
      members: Array(10).fill(null).map((_, i) => ({
        tag: `#TAG${i}`,
        name: `Player${i}`,
        townhallLevel: 15,
        mapPosition: i + 1,
        attacks: [
          { attackerTag: `#TAG${i}`, defenderTag: `#RIVAL${i}`, stars: 3, destructionPercentage: 100, order: i + 1 },
          { attackerTag: `#TAG${i}`, defenderTag: `#RIVAL${i+1}`, stars: i < 5 ? 3 : 2, destructionPercentage: i < 5 ? 100 : 93, order: i + 11 }
        ]
      }))
    },
    opponent: {
      tag: '#OPPONENT4',
      name: 'Dragon Knights',
      badgeUrls: { small: '', medium: '', large: '' },
      clanLevel: 16,
      attacks: 17,
      stars: 38,
      destructionPercentage: 81.2,
      members: Array(10).fill(null).map((_, i) => ({
        tag: `#RIVAL${i}`,
        name: `Knight${i}`,
        townhallLevel: 14,
        mapPosition: i + 1,
        attacks: i < 7 ? [
          { attackerTag: `#RIVAL${i}`, defenderTag: `#TAG${i}`, stars: 2, destructionPercentage: 79, order: i + 20 },
          { attackerTag: `#RIVAL${i}`, defenderTag: `#TAG${i+1}`, stars: 2, destructionPercentage: 84, order: i + 30 }
        ] : i < 9 ? [
          { attackerTag: `#RIVAL${i}`, defenderTag: `#TAG${i}`, stars: 2, destructionPercentage: 72, order: i + 20 }
        ] : []
      }))
    }
  }
];

async function addMoreSamples() {
  console.log('Adding 3 more sample wars...\n');

  for (const [index, warData] of sampleWars.entries()) {
    console.log(`War ${index + 2}:`);
    const war = transformWarData(warData);
    console.log(`  Opponent: ${war.opponentName}`);
    console.log(`  Attacks: ${war.clanStats.attacksUsed}/${war.clanStats.attacksAvailable}`);
    console.log(`  Stars: ${war.clanStats.totalStars}`);

    const ourAttacks = war.attacks.filter(a => a.isOurClan);
    const avgStars = ourAttacks.reduce((sum, a) => sum + a.stars, 0) / ourAttacks.length;
    console.log(`  Avg Stars/Attack: ${avgStars.toFixed(2)}`);

    await saveWar(war);
    console.log('  ✅ Saved\n');
  }

  console.log('All sample wars added!');
  console.log('Visit http://localhost:3000 to see the dashboard with 4 wars.');
}

addMoreSamples()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
