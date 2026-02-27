
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Team = {
  id: string;
  name: string;
  code: string;
};

const MOCK_TEAMS: Team[] = [
  { id: '1', name: 'Eagles Soccer Club', code: 'EAGL01' },
  { id: '2', name: 'Wildcats Basketball', code: 'CAT99X' }
];

interface TeamContextType {
  activeTeam: Team;
  setActiveTeam: (team: Team) => void;
  teams: Team[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [activeTeam, setActiveTeam] = useState<Team>(MOCK_TEAMS[0]);

  return (
    <TeamContext.Provider value={{ activeTeam, setActiveTeam, teams: MOCK_TEAMS }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
