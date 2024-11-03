"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useInputHandler } from './input-handler';

export default function Keyboard() {
  const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Æ', 'Ø'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ['Space']
  ];

  const {
    selectedRow,
    selectedCol,
    inputString,
    setSelectedRow,
    setSelectedCol,
    handleKeyPress
  } = useInputHandler(keys);

  // New state for managing hover
  const [hoveredKey, setHoveredKey] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-4 bg-white rounded-lg shadow-lg max-w-3xl w-full">
        <div className="mb-4 text-2xl">{inputString}</div>
        <div className="grid gap-1">
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((key, keyIndex) => (
                <Button
                  key={keyIndex}
                  variant="outline"
                  className={`
                    h-12 font-bold text-4xl
                    ${key === 'Space' ? 'flex-grow flex-basis-[60%] max-w-[600px]' : 'w-12'}
                    ${['Backspace', 'Enter'].includes(key) ? 'w-20' : ''}
                    ${['Back', 'Caps Lock'].includes(key) ? 'w-24' : ''}
                    ${['Å', 'Æ', 'Ø', '"'].includes(key) ? 'w-12 text-4xl' : ''}
                    ${
                      (selectedRow === rowIndex && selectedCol === keyIndex) ||
                      (hoveredKey?.row === rowIndex && hoveredKey?.col === keyIndex)
                        ? 'bg-black text-white'
                        : ''
                    }
                  `}
                  // Add hover effect not only
                  
                  onMouseEnter={() => {
                    setHoveredKey({ row: rowIndex, col: keyIndex });
                    setSelectedRow(rowIndex);
                    setSelectedCol(keyIndex);
                  }}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => handleKeyPress(key)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleKeyPress('Backspace');
                  }}
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
