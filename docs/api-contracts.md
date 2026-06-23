# API Contracts

Phase 1 defines interfaces; implementations land in Phases 2–5.

## Supabase (direct client)

Most reads/writes go through Supabase JS client with RLS — no custom REST layer for CRUD.

### Phase 2 RPC functions (planned)

| Function | Caller | Purpose |
|---|---|---|
| `join_bet(bet_id, stake)` | Participant | Lock stake, update share_pct |
| `adjust_wallet(user_id, amount, note)` | Host | Credit/debit with ledger entry |
| `settle_bet(bet_id, net_result)` | Host / cron | Proportional payout + ledger |
| `void_bet(bet_id, reason)` | Host | Refund all stakes |

## Next.js Route Handlers

### `GET /api/cron/sync-matches`

Sync FIFA WC 2026 fixtures from API-Football → `matches` table.

**Auth**: `Authorization: Bearer ${CRON_SECRET}`

**Response**

```json
{ "synced": 48, "season": 2026 }
```

**Schedule**: Every 6 hours (`vercel.json`); tighten during live tournament.

---

### `POST /api/invites/validate` (Phase 2)

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

## API-Football (external)

Wrapper: `src/lib/api-football/client.ts`

| Method | Endpoint | Use |
|---|---|---|
| `getWorldCupFixtures(season)` | `GET /fixtures?league={id}&season=2026` | Cron sync |
| `getFixtureById(id)` | `GET /fixtures?id={id}` | Match detail, settlement |

**Headers**: `x-apisports-key: ${API_FOOTBALL_KEY}`

**Caching**: DB table `matches` is canonical after sync; avoid hitting API on every page load.

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
