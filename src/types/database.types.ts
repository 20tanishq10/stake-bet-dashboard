export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          role: "host" | "participant";
          wallet_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role?: "host" | "participant";
          wallet_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          role?: "host" | "participant";
          wallet_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      invites: {
        Row: {
          id: string;
          token: string;
          email: string | null;
          created_by: string;
          used_by: string | null;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          token: string;
          email?: string | null;
          created_by: string;
          used_by?: string | null;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          token?: string;
          email?: string | null;
          created_by?: string;
          used_by?: string | null;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
      };
      matches: {
        Row: {
          id: number;
          league_id: number;
          season: number;
          round: string | null;
          home_team_id: number;
          home_team_name: string;
          away_team_id: number;
          away_team_name: string;
          kickoff_at: string;
          status: string;
          home_goals: number | null;
          away_goals: number | null;
          raw_payload: Json;
          synced_at: string;
        };
        Insert: {
          id: number;
          league_id: number;
          season: number;
          round?: string | null;
          home_team_id: number;
          home_team_name: string;
          away_team_id: number;
          away_team_name: string;
          kickoff_at: string;
          status: string;
          home_goals?: number | null;
          away_goals?: number | null;
          raw_payload?: Json;
          synced_at?: string;
        };
        Update: {
          id?: number;
          league_id?: number;
          season?: number;
          round?: string | null;
          home_team_id?: number;
          home_team_name?: string;
          away_team_id?: number;
          away_team_name?: string;
          kickoff_at?: string;
          status?: string;
          home_goals?: number | null;
          away_goals?: number | null;
          raw_payload?: Json;
          synced_at?: string;
        };
      };
      bets: {
        Row: {
          id: string;
          created_by: string;
          match_id: number | null;
          title: string;
          description: string | null;
          market_reference: string | null;
          rule: Json;
          status:
            | "draft"
            | "open"
            | "locked"
            | "pending_settlement"
            | "settled"
            | "void";
          lock_at: string | null;
          net_result: number | null;
          settled_at: string | null;
          settled_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          match_id?: number | null;
          title: string;
          description?: string | null;
          market_reference?: string | null;
          rule: Json;
          status?:
            | "draft"
            | "open"
            | "locked"
            | "pending_settlement"
            | "settled"
            | "void";
          lock_at?: string | null;
          net_result?: number | null;
          settled_at?: string | null;
          settled_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          match_id?: number | null;
          title?: string;
          description?: string | null;
          market_reference?: string | null;
          rule?: Json;
          status?:
            | "draft"
            | "open"
            | "locked"
            | "pending_settlement"
            | "settled"
            | "void";
          lock_at?: string | null;
          net_result?: number | null;
          settled_at?: string | null;
          settled_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bet_participations: {
        Row: {
          id: string;
          bet_id: string;
          user_id: string;
          stake_amount: number;
          share_pct: number;
          payout_amount: number | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          bet_id: string;
          user_id: string;
          stake_amount: number;
          share_pct: number;
          payout_amount?: number | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          bet_id?: string;
          user_id?: string;
          stake_amount?: number;
          share_pct?: number;
          payout_amount?: number | null;
          joined_at?: string;
        };
      };
      wallet_ledger: {
        Row: {
          id: string;
          user_id: string;
          entry_type:
            | "initial_balance"
            | "host_credit"
            | "host_debit"
            | "stake_lock"
            | "stake_release"
            | "settlement_payout"
            | "settlement_loss"
            | "void_refund";
          amount: number;
          balance_after: number;
          bet_id: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_type:
            | "initial_balance"
            | "host_credit"
            | "host_debit"
            | "stake_lock"
            | "stake_release"
            | "settlement_payout"
            | "settlement_loss"
            | "void_refund";
          amount: number;
          balance_after: number;
          bet_id?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_type?:
            | "initial_balance"
            | "host_credit"
            | "host_debit"
            | "stake_lock"
            | "stake_release"
            | "settlement_payout"
            | "settlement_loss"
            | "void_refund";
          amount?: number;
          balance_after?: number;
          bet_id?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          event_type:
            | "user_joined"
            | "invite_created"
            | "wallet_adjusted"
            | "bet_created"
            | "bet_joined"
            | "bet_locked"
            | "bet_settled"
            | "bet_voided";
          actor_id: string | null;
          target_user_id: string | null;
          bet_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type:
            | "user_joined"
            | "invite_created"
            | "wallet_adjusted"
            | "bet_created"
            | "bet_joined"
            | "bet_locked"
            | "bet_settled"
            | "bet_voided";
          actor_id?: string | null;
          target_user_id?: string | null;
          bet_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?:
            | "user_joined"
            | "invite_created"
            | "wallet_adjusted"
            | "bet_created"
            | "bet_joined"
            | "bet_locked"
            | "bet_settled"
            | "bet_voided";
          actor_id?: string | null;
          target_user_id?: string | null;
          bet_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Enums: {
      user_role: "host" | "participant";
      bet_status:
        | "draft"
        | "open"
        | "locked"
        | "pending_settlement"
        | "settled"
        | "void";
      ledger_entry_type:
        | "initial_balance"
        | "host_credit"
        | "host_debit"
        | "stake_lock"
        | "stake_release"
        | "settlement_payout"
        | "settlement_loss"
        | "void_refund";
      activity_event_type:
        | "user_joined"
        | "invite_created"
        | "wallet_adjusted"
        | "bet_created"
        | "bet_joined"
        | "bet_locked"
        | "bet_settled"
        | "bet_voided";
    };
  };
};
