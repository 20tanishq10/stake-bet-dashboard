/**
 * Structured bet rules evaluated against cached match data (TheSportsDB / matches table)
 * or host-confirmed market outcomes (Polymarket reference).
 */
export type BetRule =
  | MatchWinnerRule
  | OverUnderGoalsRule
  | BothTeamsScoreRule
  | PlayerScoresRule
  | ManualMarketRule;

export type MatchWinnerRule = {
  type: "match_winner";
  matchId: number;
  selection: "home" | "away" | "draw";
};

export type OverUnderGoalsRule = {
  type: "over_under_goals";
  matchId: number;
  line: number;
  selection: "over" | "under";
};

export type BothTeamsScoreRule = {
  type: "both_teams_score";
  matchId: number;
  selection: boolean;
};

export type PlayerScoresRule = {
  type: "player_scores";
  matchId: number;
  playerId: number;
  minGoals: number;
};

/** Host-entered net PnL vs external market (Polymarket etc.) */
export type ManualMarketRule = {
  type: "manual_market";
  marketReference: string;
  matchId?: number;
  description: string;
};

export const BET_RULE_TYPES = [
  "match_winner",
  "over_under_goals",
  "both_teams_score",
  "player_scores",
  "manual_market",
] as const;

export type BetRuleType = (typeof BET_RULE_TYPES)[number];

export function isBetRule(value: unknown): value is BetRule {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  return BET_RULE_TYPES.includes((value as { type: string }).type as BetRuleType);
}
