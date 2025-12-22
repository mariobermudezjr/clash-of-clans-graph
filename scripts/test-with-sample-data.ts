import { CoCWarResponse } from '../lib/types';
import { transformWarData } from '../lib/data-transformer';
import { saveWar } from '../lib/storage';

// Sample preparation data from user (modified to be a completed war)
const sampleWarEnded: CoCWarResponse = {
  "state": "warEnded",
  "teamSize": 10,
  "attacksPerMember": 2,
  "preparationStartTime": "20231025T052303.000Z",
  "startTime": "20231026T042303.000Z",
  "endTime": "20231027T042303.000Z",
  "clan": {
    "tag": "#2YGUQGY90",
    "name": "Alpha",
    "badgeUrls": {
      "small": "https://api-assets.clashofclans.com/badges/70/7ocEevp7dNbl1_iTinkwidH59WjqCFZ_yHm9pUpkgEA.png",
      "large": "https://api-assets.clashofclans.com/badges/512/7ocEevp7dNbl1_iTinkwidH59WjqCFZ_yHm9pUpkgEA.png",
      "medium": "https://api-assets.clashofclans.com/badges/200/7ocEevp7dNbl1_iTinkwidH59WjqCFZ_yHm9pUpkgEA.png"
    },
    "clanLevel": 17,
    "attacks": 18,
    "stars": 42,
    "destructionPercentage": 85.5,
    "members": [
      {
        "tag": "#9PU99J8",
        "name": "Mist",
        "townhallLevel": 15,
        "mapPosition": 3,
        "attacks": [
          { "attackerTag": "#9PU99J8", "defenderTag": "#YJLPR00J", "stars": 2, "destructionPercentage": 78.5, "order": 1 },
          { "attackerTag": "#9PU99J8", "defenderTag": "#QCCQRCRYL", "stars": 3, "destructionPercentage": 100, "order": 12 }
        ]
      },
      {
        "tag": "#QUJR009C",
        "name": "worn",
        "townhallLevel": 14,
        "mapPosition": 7,
        "attacks": [
          { "attackerTag": "#QUJR009C", "defenderTag": "#Q0988RJQ", "stars": 2, "destructionPercentage": 85, "order": 3 },
          { "attackerTag": "#QUJR009C", "defenderTag": "#PJQL2PU0P", "stars": 2, "destructionPercentage": 72, "order": 15 }
        ]
      },
      {
        "tag": "#209VRVV0C",
        "name": "Bill Swerski",
        "townhallLevel": 14,
        "mapPosition": 8,
        "attacks": [
          { "attackerTag": "#209VRVV0C", "defenderTag": "#PJQL2PU0P", "stars": 3, "destructionPercentage": 100, "order": 5 }
        ]
      },
      {
        "tag": "#PU22GLVC",
        "name": "Mooney87",
        "townhallLevel": 15,
        "mapPosition": 4,
        "attacks": [
          { "attackerTag": "#PU22GLVC", "defenderTag": "#YCLCJYLJU", "stars": 2, "destructionPercentage": 68, "order": 2 },
          { "attackerTag": "#PU22GLVC", "defenderTag": "#L8CV9Y8U", "stars": 2, "destructionPercentage": 81, "order": 14 }
        ]
      },
      {
        "tag": "#89G9JQJP",
        "name": "Oculus Rift™",
        "townhallLevel": 13,
        "mapPosition": 10,
        "attacks": [
          { "attackerTag": "#89G9JQJP", "defenderTag": "#QCCQRCRYL", "stars": 2, "destructionPercentage": 75, "order": 7 }
        ]
      },
      {
        "tag": "#8PRPV9U8J",
        "name": "DoubleTap00",
        "townhallLevel": 15,
        "mapPosition": 2,
        "attacks": [
          { "attackerTag": "#8PRPV9U8J", "defenderTag": "#CY9CGJJR", "stars": 3, "destructionPercentage": 100, "order": 4 },
          { "attackerTag": "#8PRPV9U8J", "defenderTag": "#C990JLG2", "stars": 3, "destructionPercentage": 100, "order": 13 }
        ]
      },
      {
        "tag": "#QYPGL0U2G",
        "name": "seartharith",
        "townhallLevel": 15,
        "mapPosition": 6,
        "attacks": [
          { "attackerTag": "#QYPGL0U2G", "defenderTag": "#L8CV9Y8U", "stars": 2, "destructionPercentage": 79, "order": 6 },
          { "attackerTag": "#QYPGL0U2G", "defenderTag": "#YCLCJYLJU", "stars": 2, "destructionPercentage": 88, "order": 16 }
        ]
      },
      {
        "tag": "#Q0V0Q82Y9",
        "name": "ZAWZAW",
        "townhallLevel": 15,
        "mapPosition": 5,
        "attacks": [
          { "attackerTag": "#Q0V0Q82Y9", "defenderTag": "#2LLJYYV0J", "stars": 2, "destructionPercentage": 82, "order": 8 },
          { "attackerTag": "#Q0V0Q82Y9", "defenderTag": "#9JJG9CJ2J", "stars": 3, "destructionPercentage": 100, "order": 17 }
        ]
      },
      {
        "tag": "#8JJGLUJ2L",
        "name": "SethBerlin26",
        "townhallLevel": 15,
        "mapPosition": 1,
        "attacks": [
          { "attackerTag": "#8JJGLUJ2L", "defenderTag": "#CY9CGJJR", "stars": 3, "destructionPercentage": 100, "order": 9 },
          { "attackerTag": "#8JJGLUJ2L", "defenderTag": "#C990JLG2", "stars": 3, "destructionPercentage": 100, "order": 18 }
        ]
      },
      {
        "tag": "#L0CCUYYVQ",
        "name": "iishikaori",
        "townhallLevel": 14,
        "mapPosition": 9,
        "attacks": [
          { "attackerTag": "#L0CCUYYVQ", "defenderTag": "#YJLPR00J", "stars": 2, "destructionPercentage": 71, "order": 10 }
        ]
      }
    ]
  },
  "opponent": {
    "tag": "#JY982VJ",
    "name": "Anonymous",
    "badgeUrls": {
      "small": "https://api-assets.clashofclans.com/badges/70/3tugyMrwymXiLz9ybrvDdR7qC_QpoH4hMWXXOHfEZEk.png",
      "large": "https://api-assets.clashofclans.com/badges/512/3tugyMrwymXiLz9ybrvDdR7qC_QpoH4hMWXXOHfEZEk.png",
      "medium": "https://api-assets.clashofclans.com/badges/200/3tugyMrwymXiLz9ybrvDdR7qC_QpoH4hMWXXOHfEZEk.png"
    },
    "clanLevel": 22,
    "attacks": 15,
    "stars": 35,
    "destructionPercentage": 76.2,
    "members": [
      {
        "tag": "#YJLPR00J",
        "name": "PeaK",
        "townhallLevel": 14,
        "mapPosition": 8,
        "attacks": [
          { "attackerTag": "#YJLPR00J", "defenderTag": "#L0CCUYYVQ", "stars": 2, "destructionPercentage": 73, "order": 11 }
        ]
      },
      {
        "tag": "#YCLCJYLJU",
        "name": "R_U_B_E_N",
        "townhallLevel": 15,
        "mapPosition": 6,
        "attacks": [
          { "attackerTag": "#YCLCJYLJU", "defenderTag": "#QYPGL0U2G", "stars": 2, "destructionPercentage": 69, "order": 19 },
          { "attackerTag": "#YCLCJYLJU", "defenderTag": "#PU22GLVC", "stars": 2, "destructionPercentage": 77, "order": 25 }
        ]
      },
      {
        "tag": "#QCCQRCRYL",
        "name": "Diether",
        "townhallLevel": 12,
        "mapPosition": 10,
        "attacks": [
          { "attackerTag": "#QCCQRCRYL", "defenderTag": "#89G9JQJP", "stars": 3, "destructionPercentage": 100, "order": 20 }
        ]
      },
      {
        "tag": "#CY9CGJJR",
        "name": "maarten",
        "townhallLevel": 15,
        "mapPosition": 1,
        "attacks": [
          { "attackerTag": "#CY9CGJJR", "defenderTag": "#8JJGLUJ2L", "stars": 1, "destructionPercentage": 45, "order": 21 },
          { "attackerTag": "#CY9CGJJR", "defenderTag": "#8PRPV9U8J", "stars": 2, "destructionPercentage": 65, "order": 28 }
        ]
      },
      {
        "tag": "#L8CV9Y8U",
        "name": "benjamino",
        "townhallLevel": 15,
        "mapPosition": 5,
        "attacks": [
          { "attackerTag": "#L8CV9Y8U", "defenderTag": "#Q0V0Q82Y9", "stars": 2, "destructionPercentage": 81, "order": 22 },
          { "attackerTag": "#L8CV9Y8U", "defenderTag": "#QYPGL0U2G", "stars": 2, "destructionPercentage": 74, "order": 29 }
        ]
      },
      {
        "tag": "#C990JLG2",
        "name": "GIET-HERO",
        "townhallLevel": 15,
        "mapPosition": 2,
        "attacks": [
          { "attackerTag": "#C990JLG2", "defenderTag": "#8PRPV9U8J", "stars": 2, "destructionPercentage": 71, "order": 23 }
        ]
      },
      {
        "tag": "#PJQL2PU0P",
        "name": "Barbarian King",
        "townhallLevel": 13,
        "mapPosition": 9,
        "attacks": [
          { "attackerTag": "#PJQL2PU0P", "defenderTag": "#L0CCUYYVQ", "stars": 3, "destructionPercentage": 100, "order": 24 }
        ]
      },
      {
        "tag": "#2LLJYYV0J",
        "name": "pjvercammen",
        "townhallLevel": 15,
        "mapPosition": 4,
        "attacks": [
          { "attackerTag": "#2LLJYYV0J", "defenderTag": "#Q0V0Q82Y9", "stars": 2, "destructionPercentage": 68, "order": 26 },
          { "attackerTag": "#2LLJYYV0J", "defenderTag": "#PU22GLVC", "stars": 2, "destructionPercentage": 79, "order": 31 }
        ]
      },
      {
        "tag": "#Q0988RJQ",
        "name": "LegendKiller",
        "townhallLevel": 14,
        "mapPosition": 7,
        "attacks": [
          { "attackerTag": "#Q0988RJQ", "defenderTag": "#QUJR009C", "stars": 2, "destructionPercentage": 76, "order": 27 },
          { "attackerTag": "#Q0988RJQ", "defenderTag": "#209VRVV0C", "stars": 2, "destructionPercentage": 83, "order": 32 }
        ]
      },
      {
        "tag": "#9JJG9CJ2J",
        "name": "gino",
        "townhallLevel": 15,
        "mapPosition": 3,
        "attacks": [
          { "attackerTag": "#9JJG9CJ2J", "defenderTag": "#9PU99J8", "stars": 2, "destructionPercentage": 72, "order": 30 }
        ]
      }
    ]
  }
};

async function testWithSampleData() {
  console.log('='.repeat(60));
  console.log('Testing with Sample War Data');
  console.log('='.repeat(60));

  console.log('\nTransforming API response to our schema...');
  const war = transformWarData(sampleWarEnded);

  console.log('\nWar Details:');
  console.log(`  ID: ${war.id}`);
  console.log(`  Clan: ${war.clanName} (${war.clanTag})`);
  console.log(`  Opponent: ${war.opponentName} (${war.opponentTag})`);
  console.log(`  Team Size: ${war.teamSize}`);
  console.log(`  War Ended: ${new Date(war.endTime).toLocaleString()}`);
  console.log('\nClan Stats:');
  console.log(`  Attacks Used: ${war.clanStats.attacksUsed}/${war.clanStats.attacksAvailable}`);
  console.log(`  Stars: ${war.clanStats.totalStars}`);
  console.log(`  Destruction: ${war.clanStats.destructionPercentage.toFixed(2)}%`);
  console.log('\nOpponent Stats:');
  console.log(`  Attacks Used: ${war.opponentStats.attacksUsed}/${war.opponentStats.attacksAvailable}`);
  console.log(`  Stars: ${war.opponentStats.totalStars}`);
  console.log(`  Destruction: ${war.opponentStats.destructionPercentage.toFixed(2)}%`);

  // Calculate average stars per attack
  const ourAttacks = war.attacks.filter(a => a.isOurClan);
  const avgStars = ourAttacks.reduce((sum, a) => sum + a.stars, 0) / ourAttacks.length;
  console.log(`\nAverage Stars Per Attack: ${avgStars.toFixed(2)}`);

  console.log('\n\nSaving to storage...');
  const saved = await saveWar(war);

  if (saved) {
    console.log('✅ War saved successfully!');
  } else {
    console.log('ℹ️  War already exists in storage');
  }

  console.log('\n' + '='.repeat(60));
  console.log('Now visit http://localhost:3000 to see the dashboard!');
  console.log('='.repeat(60));
}

// Run the test
testWithSampleData()
  .then(() => {
    console.log('\nTest completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during test:', error);
    process.exit(1);
  });
