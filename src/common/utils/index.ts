export function parseExpiryMs(expiry: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(expiry);
  if (!match) {
    throw new Error(
      `Invalid expirty format: "${expiry}". Expected a positive integer followed by s, m, h, or d (e.g. "15m", "1h")`,
    );
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unknown expiry unit: ${unit}`);
  }
}
