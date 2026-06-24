export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Views: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          wallet_balance: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      bet_participants: {
        Row: {
          id: string;
          bet_id: string;
          user_id: string;
          share_percentage: number;
          contribution: number;
        };
        Insert: never;
        Update: never;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
    };
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
          id: string;
          home_team: string;
          away_team: string;
          match_time: string;
          stage: string;
          home_score: number | null;
          away_score: number | null;
          status: string;
          api_football_id: string | null;
          api_football_data: Json | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          home_team: string;
          away_team: string;
          match_time: string;
          stage: string;
          home_score?: number | null;
          away_score?: number | null;
          status: string;
          api_football_id?: string | null;
          api_football_data?: Json | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          home_team?: string;
          away_team?: string;
          match_time?: string;
          stage?: string;
          home_score?: number | null;
          away_score?: number | null;
          status?: string;
          api_football_id?: string | null;
          api_football_data?: Json | null;
          updated_at?: string;
        };
      };
      api_rate_limits: {
        Row: {
          date: string;
          request_count: number;
        };
        Insert: {
          date: string;
          request_count?: number;
        };
        Update: {
          date?: string;
          request_count?: number;
        };
      };
      teams: {
        Row: {
          id: number;
          league_id: number;
          season: string;
          name: string;
          short_name: string | null;
          badge_url: string | null;
          flag_url: string | null;
          country: string | null;
          stadium: string | null;
          formed_year: number | null;
          raw_payload: Json;
          synced_at: string;
        };
        Insert: {
          id: number;
          league_id?: number;
          season?: string;
          name: string;
          short_name?: string | null;
          badge_url?: string | null;
          flag_url?: string | null;
          country?: string | null;
          stadium?: string | null;
          formed_year?: number | null;
          raw_payload?: Json;
          synced_at?: string;
        };
        Update: {
          id?: number;
          league_id?: number;
          season?: string;
          name?: string;
          short_name?: string | null;
          badge_url?: string | null;
          flag_url?: string | null;
          country?: string | null;
          stadium?: string | null;
          formed_year?: number | null;
          raw_payload?: Json;
          synced_at?: string;
        };
      };
      players: {
        Row: {
          id: number;
          team_id: number | null;
          league_id: number;
          season: string;
          name: string;
          firstname: string | null;
          lastname: string | null;
          nationality: string | null;
          birth_date: string | null;
          position: string | null;
          photo_url: string | null;
          raw_payload: Json;
          synced_at: string;
        };
        Insert: {
          id: number;
          team_id?: number | null;
          league_id?: number;
          season?: string;
          name: string;
          firstname?: string | null;
          lastname?: string | null;
          nationality?: string | null;
          birth_date?: string | null;
          position?: string | null;
          photo_url?: string | null;
          raw_payload?: Json;
          synced_at?: string;
        };
        Update: {
          id?: number;
          team_id?: number | null;
          league_id?: number;
          season?: string;
          name?: string;
          firstname?: string | null;
          lastname?: string | null;
          nationality?: string | null;
          birth_date?: string | null;
          position?: string | null;
          photo_url?: string | null;
          raw_payload?: Json;
          synced_at?: string;
        };
      };
      match_stats: {
        Row: {
          id: string;
          match_id: number;
          league_id: number;
          season: string;
          stat_type: string;
          stat_value: string | null;
          raw_payload: Json;
          synced_at: string;
        };
        Insert: {
          id?: string;
          match_id: number;
          league_id?: number;
          season?: string;
          stat_type: string;
          stat_value?: string | null;
          raw_payload?: Json;
          synced_at?: string;
        };
        Update: {
          id?: string;
          match_id?: number;
          league_id?: number;
          season?: string;
          stat_type?: string;
          stat_value?: string | null;
          raw_payload?: Json;
          synced_at?: string;
        };
      };
      player_stats: {
        Row: {
          id: string;
          match_id: number | null;
          player_id: number;
          league_id: number;
          season: string;
          stat_type: string;
          stat_value: string | null;
          raw_payload: Json;
          synced_at: string;
        };
        Insert: {
          id?: string;
          match_id?: number | null;
          player_id: number;
          league_id?: number;
          season?: string;
          stat_type: string;
          stat_value?: string | null;
          raw_payload?: Json;
          synced_at?: string;
        };
        Update: {
          id?: string;
          match_id?: number | null;
          player_id?: number;
          league_id?: number;
          season?: string;
          stat_type?: string;
          stat_value?: string | null;
          raw_payload?: Json;
          synced_at?: string;
        };
      };
      standings: {
        Row: {
          id: string;
          league_id: number;
          season: string;
          team_id: number | null;
          rank: number | null;
          group_name: string | null;
          played: number | null;
          wins: number | null;
          draws: number | null;
          losses: number | null;
          goals_for: number | null;
          goals_against: number | null;
          goal_difference: number | null;
          points: number | null;
          raw_payload: Json;
          synced_at: string;
        };
        Insert: {
          id?: string;
          league_id?: number;
          season?: string;
          team_id?: number | null;
          rank?: number | null;
          group_name?: string | null;
          played?: number | null;
          wins?: number | null;
          draws?: number | null;
          losses?: number | null;
          goals_for?: number | null;
          goals_against?: number | null;
          goal_difference?: number | null;
          points?: number | null;
          raw_payload?: Json;
          synced_at?: string;
        };
        Update: {
          id?: string;
          league_id?: number;
          season?: string;
          team_id?: number | null;
          rank?: number | null;
          group_name?: string | null;
          played?: number | null;
          wins?: number | null;
          draws?: number | null;
          losses?: number | null;
          goals_for?: number | null;
          goals_against?: number | null;
          goal_difference?: number | null;
          points?: number | null;
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
