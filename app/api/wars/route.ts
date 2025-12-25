import { NextResponse } from 'next/server';
import { getWars, saveWar, getStorageStats } from '@/lib/storage';
import { War } from '@/lib/types';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/wars
 * Fetch all wars from storage
 */
export async function GET() {
  try {
    const wars = await getWars();
    const stats = await getStorageStats();

    return NextResponse.json({
      wars,
      stats,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching wars:', error);
    return NextResponse.json(
      {
        wars: [],
        stats: { totalWars: 0, lastUpdated: 'Never' },
        success: false,
        error: 'Failed to fetch wars',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wars
 * Save a new war to storage (used by collector or manual trigger)
 */
export async function POST(request: Request) {
  try {
    const war: War = await request.json();

    // Validate war object
    if (!war.id || !war.clanName || !war.opponentName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid war data',
        },
        { status: 400 }
      );
    }

    const saved = await saveWar(war);

    return NextResponse.json({
      success: true,
      saved,
      message: saved ? 'War saved successfully' : 'War already exists',
    });
  } catch (error) {
    console.error('Error saving war:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save war',
      },
      { status: 500 }
    );
  }
}
