import React from 'react';
import { CLAN_TAG } from '@/lib/constants';

interface HeaderProps {
  clanName?: string;
  lastUpdated?: string;
}

export function Header({ clanName, lastUpdated }: HeaderProps) {
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text mb-2">
            Clash of Clans War Analytics
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
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
            {lastUpdated && (
              <p className="text-textMuted text-xs">
                Last updated: {formatLastUpdated(lastUpdated)}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
