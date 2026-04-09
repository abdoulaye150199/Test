import React from 'react';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="shrink-0">{tab.label}</span>
          {tab.count !== undefined && (
            <span className="ml-2 shrink-0 text-xs text-(--color-text-tertiary)">
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
