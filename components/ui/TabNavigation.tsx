'use client';

import React, { useState } from 'react';

export type TabId = 'stats' | 'graphs' | 'league-wars' | 'predictions';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

interface TabNavigationProps {
  defaultTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  children: (activeTab: TabId) => React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'league-wars', label: 'CWL', icon: '🏆' },
  { id: 'predictions', label: 'Predict', icon: '🎯' },
  { id: 'graphs', label: 'Wars', icon: '📈' },
  { id: 'stats', label: 'Stats', icon: '📊' },
];

export function TabNavigation({ defaultTab = 'league-wars', onTabChange, children }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="relative pb-20">
      {/* Content */}
      <div className="min-h-[60vh]">
        {children(activeTab)}
      </div>

      {/* Floating Tab Menu */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-2 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-background text-textMuted hover:bg-border hover:text-text'
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-sm font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
