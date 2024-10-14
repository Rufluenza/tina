"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function Keyboard() {
  const keys = [
    ['Back', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å', '"'],
    ['Caps Lock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Æ', 'Ø', 'Enter'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-'],
    ['Space']
  ];

  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [inputString, setInputString] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();

      if (event.key === 'ArrowUp') {
        if (selectedRow > 0) {
          const newRow = selectedRow - 1;
          const newCol = Math.min(selectedCol, keys[newRow].length - 1);
          setSelectedRow(newRow);
          setSelectedCol(newCol);
        }
      } else if (event.key === 'ArrowDown') {
        if (selectedRow < keys.length - 1) {
          const newRow = selectedRow + 1;
          const newCol = Math.min(selectedCol, keys[newRow].length - 1);
          setSelectedRow(newRow);
          setSelectedCol(newCol);
        }
      } else if (event.key === 'ArrowLeft') {
        if (selectedCol > 0) {
          setSelectedCol(selectedCol - 1);
        }
      } else if (event.key === 'ArrowRight') {
        if (selectedCol < keys[selectedRow].length - 1) {
          setSelectedCol(selectedCol + 1);
        }
      } else if (event.key === 'Enter') {
        const key = keys[selectedRow][selectedCol];
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow, selectedCol, inputString]);

  interface KeyPressHandler {
    (key: string): void;
  }

  const handleKeyPress: KeyPressHandler = (key) => {
    if (key === 'Backspace') {
      setInputString(inputString.slice(0, -1));
    } else if (key === 'Space') {
      setInputString(inputString + ' ');
    } else if (key === 'Enter') {
      setInputString(inputString + '\n');
    } else if (key === 'Caps Lock' || key === 'Back') {
      // Implement Caps Lock or Back functionality if needed
    } else {
      setInputString(inputString + key);
    }
  };

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
