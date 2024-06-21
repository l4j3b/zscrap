'use client';

import { button, buttonGroup, Leva, useControls } from 'leva';
import { cloneDeep } from 'lodash-es';
import { useState, useEffect, useCallback } from 'react';

import { Kbd } from '~/components/ui/kbd';

// convert the grid 0 and 1 to true and false
const convertGrid = (grid: number[][]) => {
  return grid.map((row) => row.map((cell) => cell === 1));
};

const HEART_GRID = convertGrid([
  [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0],
  [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
]);

const SPACE_INVADER_GRID = convertGrid([
  [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
]);

const GRIDS = {
  heart: HEART_GRID,
  space: SPACE_INVADER_GRID,
};

const initialGridState = (x: number, y: number) =>
  Array.from({ length: y }, () => Array.from({ length: x }, () => true));

const PixelGrid = () => {
  const [grid, setGrid] = useState(initialGridState(5, 5));
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });

  useControls(() => ({
    Reset: button(() => setGrid(initialGridState(width, height))),
    Presets: buttonGroup({
      '❤️': () => initGrid('heart'),
      '👾': () => initGrid('space'),
    }),
  }));

  const [{ width, height, angle, color1, color2, color3 }, set] = useControls('Settings', () => ({
    width: { value: 5, min: 1, max: 20, step: 1 },
    height: { value: 5, min: 1, max: 20, step: 1 },
    fontSize: { value: 36, min: 8, max: 100, step: 1 },
    scale: { value: 100, min: 0, max: 100, step: 1 },
    angle: { value: 180, min: 0, max: 360, step: 1 },
    color1: '#4B0082',
    color2: '#FF1493',
    color3: '#FF4500',
  }));

  const initGrid = (name: keyof typeof GRIDS) => {
    set({ width: GRIDS[name][0].length, height: GRIDS[name].length });
    setGrid(GRIDS[name]);
  };

  useEffect(() => {
    // New grid should keep old values
    // If the new grid is bigger, fill with true
    // If the new grid is smaller, cut the old grid
    const newGrid = initialGridState(width, height);
    const oldGrid = cloneDeep(grid);

    for (let i = 0; i < Math.min(height, oldGrid.length); i++) {
      for (let j = 0; j < Math.min(width, oldGrid[i].length); j++) {
        newGrid[i][j] = oldGrid[i][j];
      }
    }

    setGrid(newGrid);
  }, [width, height]);

  const toggleOpacity = useCallback(
    (rowIndex: number, colIndex: number) => {
      const newGrid = cloneDeep(grid);
      newGrid[rowIndex][colIndex] = !grid[rowIndex][colIndex];
      setGrid(newGrid);
    },
    [grid],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { row, col } = focusedCell;

      switch (e.key) {
        case 'w':
          setFocusedCell({ row: Math.max(0, row - 1), col });
          break;
        case 's':
          setFocusedCell({ row: Math.min(height - 1, row + 1), col });
          break;
        case 'a':
          setFocusedCell({ row, col: Math.max(0, col - 1) });
          break;
        case 'd':
          setFocusedCell({ row, col: Math.min(width - 1, col + 1) });
          break;
        case 'o':
          toggleOpacity(row, col);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedCell, toggleOpacity, width, height]);

  return (
    <div className="relative">
      <Leva
        titleBar={{
          position: {
            x: -12,
            y: 76,
          },
        }}
      />

      <ul className="mb-4 ml-4 list-disc space-y-2">
        <li>
          <Kbd>w</Kbd>, <Kbd>a</Kbd>, <Kbd>s</Kbd>, <Kbd>d</Kbd> to move.
        </li>
        <li>
          <Kbd>o</Kbd> to toggle opacity.
        </li>
        <li>Click to toggle opacity and focus.</li>
      </ul>

      <div
        className={`
          animate-gradient
          bg-[length:auto_200%]
        `}
        style={{
          position: 'relative',
          overflow: 'visible',
          verticalAlign: 'middle',
          textAlign: 'center',
          backgroundImage: `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3})`,
          isolation: 'isolate',
        }}
      >
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => {
              return (
                <div
                  key={colIndex}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    toggleOpacity(rowIndex, colIndex);
                    setFocusedCell({ row: rowIndex, col: colIndex });
                  }}
                  style={{
                    opacity: cell ? 0 : 1,
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: 48,
                    height: 48,
                  }}
                  onKeyDown={() => {}}
                >
                  {/* {symbol} */}
                </div>
              );
            })}
          </div>
        ))}

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex' }}>
              {row.map((cell, colIndex) => {
                return (
                  <div
                    key={colIndex}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      toggleOpacity(rowIndex, colIndex);
                      setFocusedCell({ row: rowIndex, col: colIndex });
                    }}
                    style={{
                      opacity: cell ? 0 : 1,
                      cursor: 'pointer',
                      userSelect: 'none',
                      width: 48,
                      height: 48,
                      background: 'rgba(255, 255, 255, 1)',
                      mixBlendMode: 'screen',
                    }}
                    onKeyDown={() => {}}
                  >
                    {/* {symbol} */}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex' }}>
              {row.map((cell, colIndex) => {
                const isActive = focusedCell.row === rowIndex && focusedCell.col === colIndex;

                return (
                  <div
                    key={colIndex}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      toggleOpacity(rowIndex, colIndex);
                      setFocusedCell({ row: rowIndex, col: colIndex });
                    }}
                    className="outline outline-slate-500"
                    style={{
                      opacity: cell ? 0 : 1,
                      cursor: 'pointer',
                      userSelect: 'none',
                      outlineStyle: isActive ? 'dotted' : 'none',
                      outlineOffset: isActive ? '-30px' : '0',
                      outlineWidth: isActive ? '8px' : '0',
                      width: 48,
                      height: 48,
                      // background: "white",
                      // mixBlendMode: "exclusion",
                    }}
                    onKeyDown={() => {}}
                  >
                    {/* {symbol} */}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PixelGrid;
