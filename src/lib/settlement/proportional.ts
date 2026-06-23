export type ParticipationStake = {
  userId: string;
  stakeAmount: number;
};

export type ProportionalPayout = {
  userId: string;
  stakeAmount: number;
  sharePct: number;
  payoutAmount: number;
  netPnL: number;
};

/**
 * Split net pool result proportionally by stake share.
 * netResult: total profit (+) or loss (-) for the entire pool vs market.
 */
export function calculateProportionalPayouts(
  participations: ParticipationStake[],
  netResult: number,
): ProportionalPayout[] {
  const totalStake = participations.reduce((sum, p) => sum + p.stakeAmount, 0);

  if (totalStake <= 0) {
    throw new Error("Total stake must be greater than zero");
  }

  return participations.map((p) => {
    const sharePct = p.stakeAmount / totalStake;
    const payoutAmount = p.stakeAmount + netResult * sharePct;
    const netPnL = payoutAmount - p.stakeAmount;

    return {
      userId: p.userId,
      stakeAmount: p.stakeAmount,
      sharePct,
      payoutAmount: roundMoney(payoutAmount),
      netPnL: roundMoney(netPnL),
    };
  });
}

export function roundMoney(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
