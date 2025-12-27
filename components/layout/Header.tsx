import React from 'react';
import { CLAN_TAG } from '@/lib/constants';

interface HeaderProps {
  clanName?: string;
  totalWars?: number;
}

export function Header({ clanName, totalWars = 0 }: HeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text mb-2">
            Clash of Clans War Analytics
          </h1>
          <p className="text-textMuted">
            {clanName ? (
              <>
                Tracking <span className="text-primary font-medium">{clanName}</span>
                {' '}
                <span className="text-sm">({CLAN_TAG.replace('#', '#')})</span>
              </>
            ) : (
              'Loading clan information...'
            )}
          </p>
        </div>
        {totalWars > 0 && (
          <div className="bg-surface border border-border rounded-lg px-4 py-2">
            <div className="text-textMuted text-sm">Total Wars Tracked</div>
            <div className="text-2xl font-semibold text-primary">{totalWars}</div>
          </div>
        )}
      </div>
    </header>
  );
}
