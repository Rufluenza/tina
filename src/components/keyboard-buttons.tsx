// keyboard-buttons.tsx
"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { useInputHandler } from './input-handler';

export default function Keyboard() {
  const keys = [
    ['Back', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å', '"'],
    ['Caps Lock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Æ', 'Ø', 'Enter'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-'],
    ['Space']
  ];

  const {
    selectedRow,
    selectedCol,
    inputString,
  } = useInputHandler(keys);

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
                    h-12 font-medium text-sm
                    ${key === 'Space' ? 'flex-grow flex-basis-[60%] max-w-[600px]' : 'w-12'}
                    ${['Backspace', 'Enter'].includes(key) ? 'w-20' : ''}
                    ${['Back', 'Caps Lock'].includes(key) ? 'w-24' : ''}
                    ${['Å', 'Æ', 'Ø', '"'].includes(key) ? 'w-12 text-lg' : ''}
                    ${selectedRow === rowIndex && selectedCol === keyIndex ? 'bg-black text-white' : ''}
                  `}
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
