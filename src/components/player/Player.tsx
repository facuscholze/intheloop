"use client";

import { PlayerProvider } from "./PlayerProvider";
import { PlayerBar } from "./PlayerBar";
import { PlayerExpanded } from "./PlayerExpanded";

export function Player() {
  return (
    <PlayerProvider>
      <PlayerBar />
      <PlayerExpanded />
    </PlayerProvider>
  );
}
