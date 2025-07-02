import React, { useState } from 'react';
import type { ReactNode } from 'react';

interface TabListProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  showTabs?: boolean; // for mobile hamburger toggle
}

const TabList: React.FC<TabListProps> = ({ value, onChange, children, showTabs = true }) => {
  if (!showTabs) return null;
  return (
    <div className="flex-1 flex justify-center items-center overflow-x-auto whitespace-nowrap">
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              selected: (child as React.ReactElement<any>).props.value === value,
              onChange,
            })
          : child
      )}
    </div>
  );
};

export default TabList;