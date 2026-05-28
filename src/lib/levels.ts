import { GRID_ROWS, GRID_COLS, COLOR_VALUES, STONE_BUBBLE } from '@/lib/constants';
import type { Grid } from '@/lib/game-types';

const generateGrid = (rowsToFill: number, numColors: number, level: number): Grid => {
const grid: Grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));
const safeRowsToFill = Math.min(rowsToFill, GRID_ROWS - 4);
const availableColors = [...COLOR_VALUES];
const colorsToUse = availableColors.slice(0, Math.min(numColors, availableColors.length));
let stoneBubbleCount = 0;
const maxStones = Math.min(5, Math.floor(level / 5));

for (let row = 0; row < safeRowsToFill; row++) {
const colsToFill = row % 2 === 1 ? GRID_COLS - 1 : GRID_COLS;
for (let col = 0; col < colsToFill; col++) {
if (level >= 5 && stoneBubbleCount < maxStones && Math.random() < 0.08) {
grid[row][col] = STONE_BUBBLE;
stoneBubbleCount++;
continue;
}
if (Math.random() > 0.10 && colorsToUse.length > 0) {
grid[row][col] = colorsToUse[Math.floor(Math.random() * colorsToUse.length)];
}
}
}
return grid;
};

export const getLevel = (level: number) => ({
id: level,
grid: generateGrid(Math.min(GRID_ROWS - 4, 4 + Math.floor((level - 1) / 3)), Math.min(COLOR_VALUES.length, 3 + Math.floor((level - 1) / 4)), level),
targetShots: 25 + (level * 2),
shotsBeforeDrop: 5,
});

export const getAvailableColors = (grid: Grid): string[] => {
const colorSet = new Set<string>();
for (let r = 0; r < GRID_ROWS; r++) {
const row = grid[r];
if (!row) continue;
for (let c = 0; c < GRID_COLS; c++) {
const cell = row[c];
if (cell && cell !== STONE_BUBBLE && cell !== 'bomb' && COLOR_VALUES.includes(cell)) {
colorSet.add(cell);
}
}
}
if (colorSet.size === 0) return [...COLOR_VALUES];
return Array.from(colorSet);
};