export function base62ToLastFour(str: string): string {
  const charset =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = 0n;

  for (let i = 0; i < str.length; i++) {
    const power = BigInt(str.length - i - 1);
    const value = BigInt(charset.indexOf(str[i]));
    result += value * 62n ** power;
  }

  const decimalStr = result.toString();
  return decimalStr.slice(-4);
}

export function removeInvPrefix(id: string): string {
  if (id.startsWith("INV-")) {
    return id.slice(4); // remove first 4 characters
  }
  return id; // return unchanged if prefix not present
}
