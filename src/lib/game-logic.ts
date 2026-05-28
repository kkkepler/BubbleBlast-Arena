import { BUBBLE_DIAMETER, BUBBLE_RADIUS, GRID_COLS, GRID_ROWS } from '@/lib/constants';

export const getBubblePosition = (row: number, col: number) => {
  const isOddRow = row % 2 === 1;
  const y = row * (BUBBLE_DIAMETER * 0.866);
  let x = col * BUBBLE_DIAMETER;
  if (isOddRow) x += BUBBLE_RADIUS;
  return { x, y };
};

export const getBubbleCenterPosition = (row: number, col: number) => {
  const { x, y } = getBubblePosition(row, col);
  return { x: x + BUBBLE_RADIUS, y: y + BUBBLE_RADIUS };
};

export const getNeighbors = (row: number, col: number): [number, number][] => {
  const isOddRow = row % 2 === 1;
  const candidates: [number, number][] = [
    [row, col - 1], [row, col + 1], [row - 1, col], [row + 1, col],
  ];
  if (isOddRow) {
    candidates.push([row - 1, col + 1], [row + 1, col + 1]);
  } else {
    candidates.push([row - 1, col - 1], [row + 1, col - 1]);
  }
  return candidates.filter(([r, c]) => {
    if (r < 0 || r >= GRID_ROWS || c < 0) return false;
    const neighborCols = r % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
    return c < neighborCols;
  });
};
