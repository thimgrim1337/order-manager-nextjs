const borderColors = [
  'border-chart-1',
  'border-chart-2',
  'border-chart-3',
  'border-chart-4',
  'border-chart-5',
];

/** An Order's colour on the Timeline, from its id: the same whichever Orders are shown beside it. */
export const timelineColor = (orderId: number) => borderColors[orderId % borderColors.length];
