# API Contracts

Phase 1 defines interfaces; implementations land in Phases 2–5.

## Supabase (direct client)

Most reads/writes go through Supabase JS client with RLS — no custom REST layer for CRUD.

### RPC functions

| Function | Status | Caller | Purpose |
|---|---|---|---|
| `adjust_wallet(p_user_id, p_amount, p_note, p_actor_id)` | **Implemented** | Host (via admin API) | Atomic credit/debit + ledger + activity |
| `join_bet(bet_id, stake)` | Planned | Participant | Lock stake, update share_pct |
| `settle_bet(bet_id, net_result)` | Planned | Host / cron | Proportional payout + ledger |
| `void_bet(bet_id, reason)` | Planned | Host | Refund all stakes |

## Next.js Route Handlers

### `GET /api/cron/sync-matches`

Sync FIFA WC 2026 data from TheSportsDB → Supabase cache tables (`matches`, `teams`, `players`, `match_stats`, `player_stats`, `standings`).

**Auth**: `Authorization: Bearer ${CRON_SECRET}` (or `x-cron-secret` header)

**Response**

```json
{
  "synced": {
    "league": 1,
    "teams": 32,
    "fixtures": 48,
    "results": 10,
    "standings": 32,
    "players": 3,
    "playerStats": 9,
    "matchStats": 120
  }
}
```

**Schedule**: Every 15 minutes (`vercel.json`).

---

### `POST /api/invites/validate`

Validate invite token before signup form.

**Body**

```json
{ "token": "abc123" }
```

**Response 200**

```json
{ "valid": true, "email": "friend@example.com", "expiresAt": "2026-06-01T00:00:00Z" }
```

---

### `POST /api/admin/wallet`

Host wallet adjustment (delegates to `adjust_wallet` RPC).

**Body**

```json
{ "userId": "uuid", "amount": 50, "note": "Top up" }
```

---

### `POST /api/bets/[id]/settle` (Phase 5)

Host confirms manual market result or triggers auto evaluation.

**Body**

```json
{ "netResult": 50.0 }
```

**Response**

```json
{
  "betId": "uuid",
  "status": "settled",
  "payouts": [
    { "userId": "uuid", "stakeAmount": 40, "sharePct": 0.4, "payoutAmount": 60, "netPnL": 20 }
  ]
}
```

---

### `POST /api/ai/parse-bet` (Phase 5)

Parse natural language bet into structured rule via OpenRouter/Qwen.

**Body**

```json
{ "prompt": "Pool on Brazil beating Argentina in the final" }
```

**Response**

```json
{
  "rule": {
    "type": "match_winner",
    "matchId": null,
    "selection": "home"
  },
  "suggestedTitle": "Brazil to beat Argentina"
}
```

## TheSportsDB (external)

Wrapper: `src/lib/thesportsdb/client.ts`

| Method | Endpoint | Use |
|---|---|---|
| `getWorldCupFixtures()` | `eventsseason.php` | Upcoming WC fixtures |
| `getWorldCupHistoricalResults()` | `eventslast.php` | Recent results |
| `getWorldCupTeams()` | `search_all_teams.php` | WC teams |
| `getFocusTeams()` | `searchteams.php` | Arsenal, Liverpool, Barcelona |
| `getFocusPlayers()` | `searchplayers.php` | Haaland, Salah, Mbappe |
| `getEventStats(id)` | `lookupeventstats.php` | Match stats (possession, shots, etc.) |
| `getWorldCupStandings()` | `lookuptable.php` | Group tables |

**Env**: `THESPORTSDB_API_KEY`, `THESPORTSDB_LEAGUE_ID`, `THESPORTSDB_SEASON`

**Caching**: Supabase cache tables are canonical after cron sync; avoid hitting API on every page load.

## OpenRouter (external)

Wrapper: `src/lib/openrouter/client.ts`

| Method | Model | Use |
|---|---|---|
| `chatCompletion(messages)` | `qwen/qwen-2.5-72b-instruct` | Generic |
| `parseBetIdea(prompt)` | same | NL → BetRule JSON |

Deferred until Phase 5 (Nice to Have in MVP scope).

## Realtime (optional, Phase 6)

Supabase Realtime subscription on `activity_logs` for live feed — not required for MVP.

## Error shape (convention)

```json
{
  "error": "Human-readable message",
  "code": "INSUFFICIENT_BALANCE"
}
```

Codes: `INSUFFICIENT_BALANCE`, `BET_LOCKED`, `INVITE_EXPIRED`, `FORBIDDEN`, `RULE_EVALUATION_FAILED`.
