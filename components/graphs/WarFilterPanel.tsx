'use client';

import React, { useState } from 'react';
import { War } from '@/lib/types';
import { useFilters } from '@/lib/FilterContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

interface WarFilterPanelProps {
  wars: War[];
}

export function WarFilterPanel({ wars }: WarFilterPanelProps) {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [showAllWars, setShowAllWars] = useState(false);

  // Local state for pending filter changes
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters with global filters when they change externally (e.g., reset)
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleWarToggle = (warId: string) => {
    const newSelected = localFilters.selectedWars.includes(warId)
      ? localFilters.selectedWars.filter(id => id !== warId)
      : [...localFilters.selectedWars, warId];
    setLocalFilters({ ...localFilters, selectedWars: newSelected });
  };

  const handleSelectAll = () => {
    setLocalFilters({ ...localFilters, selectedWars: wars.map(w => w.id) });
  };

  const handleClearAll = () => {
    setLocalFilters({ ...localFilters, selectedWars: [] });
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalFilters({ ...localFilters, sortBy: e.target.value as 'date' | 'attacks' | 'stars' });
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalFilters({ ...localFilters, sortOrder: e.target.value as 'asc' | 'desc' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({ ...localFilters, searchQuery: e.target.value });
  };

  const handleApplyFilters = () => {
    // Apply all local filters to global state
    updateFilter('selectedWars', localFilters.selectedWars);
    updateFilter('sortBy', localFilters.sortBy);
    updateFilter('sortOrder', localFilters.sortOrder);
    updateFilter('searchQuery', localFilters.searchQuery);
  };

  const handleResetFilters = () => {
    resetFilters();
    // Local state will sync via useEffect
  };

  // Filter wars based on local search query
  const filteredWars = wars.filter(war =>
    war.opponentName.toLowerCase().includes(localFilters.searchQuery.toLowerCase())
  );

  // Limit display to first 10 unless "Show All" is clicked
  const displayWars = showAllWars ? filteredWars : filteredWars.slice(0, 10);

  return (
    <Card title="War Filters">
      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="text-sm font-medium text-text mb-1.5 block">
            Search Opponent
          </label>
          <input
            type="text"
            placeholder="Search by opponent name..."
            value={localFilters.searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-text placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150"
          />
        </div>

        {/* Sort By */}
        <Select
          label="Sort By"
          options={[
            { value: 'date', label: 'Date' },
            { value: 'attacks', label: 'Attacks Used' },
            { value: 'stars', label: 'Avg Stars' },
          ]}
          value={localFilters.sortBy}
          onChange={handleSortByChange}
        />

        {/* Sort Order */}
        <Select
          label="Sort Order"
          options={[
            { value: 'desc', label: 'Highest First' },
            { value: 'asc', label: 'Lowest First' },
          ]}
          value={localFilters.sortOrder}
          onChange={handleSortOrderChange}
        />

        {/* War Selection */}
        {wars.length > 0 && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text">
                  Select Wars ({localFilters.selectedWars.length} selected)
                </label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearAll}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 bg-background border border-border rounded-md p-3">
                {displayWars.length === 0 ? (
                  <p className="text-textMuted text-sm text-center py-4">
                    No wars found matching &quot;{localFilters.searchQuery}&quot;
                  </p>
                ) : (
                  displayWars.map(war => (
                    <Checkbox
                      key={war.id}
                      label={`${war.opponentName} (${new Date(war.endTime).toLocaleDateString()})`}
                      checked={localFilters.selectedWars.includes(war.id)}
                      onChange={() => handleWarToggle(war.id)}
                    />
                  ))
                )}
              </div>

              {filteredWars.length > 10 && !showAllWars && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAllWars(true)}
                  className="w-full mt-2 text-xs"
                >
                  Show All ({filteredWars.length} wars)
                </Button>
              )}

              {showAllWars && filteredWars.length > 10 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAllWars(false)}
                  className="w-full mt-2 text-xs"
                >
                  Show Less
                </Button>
              )}
            </div>
          </>
        )}

        {/* Apply and Reset buttons */}
        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={handleApplyFilters}
            className="w-full"
          >
            Apply Filters
          </Button>
          <Button
            variant="secondary"
            onClick={handleResetFilters}
            className="w-full"
          >
            Reset All Filters
          </Button>
        </div>
      </div>
    </Card>
  );
}
