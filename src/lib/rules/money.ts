export function formatRand(amount: number): string {
  const [intPart, decPart] = amount.toFixed(2).split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${withThousands}.${decPart}`;
}
