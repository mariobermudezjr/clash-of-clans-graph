import { NextResponse } from 'next/server';
import { getAllLeagueWars, getLeagueSeasons, getLeagueStorageStats, saveLeagueGroup } from '@/lib/league-storage';
import { LeagueWarGroup } from '@/lib/league-types';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/league-wars
 * Fetch all league wars from storage (flattened across all seasons)
 */
export async function GET() {
  try {
    const wars = await getAllLeagueWars();
    const seasons = await getLeagueSeasons();
    const stats = await getLeagueStorageStats();

    return NextResponse.json({
      wars,
      seasons,
      stats,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching league wars:', error);
    return NextResponse.json(
      {
        wars: [],
        seasons: [],
        stats: { totalSeasons: 0, totalWars: 0, lastUpdated: 'Never' },
        success: false,
        error: 'Failed to fetch league wars',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/league-wars
 * Save a new league war group to storage
 */
export async function POST(request: Request) {
  try {
    const leagueGroup: LeagueWarGroup = await request.json();

    // Validate league group object
    if (!leagueGroup.season || !leagueGroup.wars || leagueGroup.wars.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid league war group data',
        },
        { status: 400 }
      );
    }

    const saved = await saveLeagueGroup(leagueGroup);

    return NextResponse.json({
      success: true,
      saved,
      message: 'League war group saved successfully',
    });
  } catch (error) {
    console.error('Error saving league war group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save league war group',
      },
      { status: 500 }
    );
  }
}
