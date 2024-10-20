// input-handler.ts
'use client';

import { useState, useEffect } from 'react';

export function useInputHandler(keys: string[][]) {
  // State variables
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [inputString, setInputString] = useState('');
  const [gamepadIndex, setGamepadIndex] = useState<number | null>(null);

  // State variables for edge detection
  // State variables for debounce timing
  const [lastInputTime, setLastInputTime] = useState(0);
  const inputDelay = 100; // Adjust as needed (milliseconds)

  const moveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
    setSelectedRow((prevRow) => {
      let newRow = prevRow;
      if (direction === 'up') {
        if (prevRow > 0) {
          newRow = prevRow - 1;
        } else if (prevRow == 0) {
          newRow = keys.length - 1;
        }
        
        if (selectedCol >= keys[newRow].length) {
          setSelectedCol(keys[newRow].length - 1);
        } else {
          setSelectedCol((prevCol) => Math.min(prevCol, keys[newRow].length - 1));
        }
      } else if (direction === 'down') {
        if (prevRow < keys.length - 1) {
          newRow = prevRow + 1;
        } else if (prevRow == keys.length - 1) {
          newRow = 0;
        }
        if (selectedCol >= keys[newRow].length) {
          setSelectedCol(keys[newRow].length - 1);
        } else {
          setSelectedCol((prevCol) => Math.min(prevCol, keys[newRow].length - 1));
        }
      }
      return newRow;
    });

    setSelectedCol((prevCol) => {
      let newCol = prevCol;
      const currentRowLength = keys[selectedRow].length;

      if (direction === 'left') {
        if (prevCol > 0) {
          newCol = prevCol - 1;
        } else if (prevCol == 0) {
          newCol = currentRowLength - 1;
        }
      } else if (direction === 'right') {
        if (prevCol < currentRowLength - 1) {
          newCol = prevCol + 1;
        } else if (prevCol == currentRowLength - 1) {
          newCol = 0;
        }

      }
      return newCol;
    });
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setInputString((prev) => prev.slice(0, -1));
    } else if (key === 'Space') {
      setInputString((prev) => prev + ' ');
    } else if (key === 'Enter') {
      setInputString((prev) => prev + '\n');
    } else if (key === 'Caps Lock' || key === 'Back') {
      // Implement Caps Lock or Back functionality if needed
    } else {
      setInputString((prev) => prev + key);
    }
  };

  // Keyboard Input Handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();

      if (event.key === 'ArrowUp') {
        moveSelection('up');
      } else if (event.key === 'ArrowDown') {
        moveSelection('down');
      } else if (event.key === 'ArrowLeft') {
        moveSelection('left');
      } else if (event.key === 'ArrowRight') {
        moveSelection('right');
      } else if (event.key === 'Enter') {
        const key = keys[selectedRow][selectedCol];
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRow, selectedCol, keys]);

  // Gamepad Connection Handling
  useEffect(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      setGamepadIndex(event.gamepad.index);
    };

    const handleGamepadDisconnected = () => {
      setGamepadIndex(null);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

    // Gamepad Input Handling with Edge Detection and Local Previous States
  // Gamepad Input Handling with Edge Detection and Local Previous States
  useEffect(() => {
    let animationFrame: number;

    const deadzone = 0.4; // Deadzone threshold
    let prevAxesActive = { x: false, y: false };
    let prevButtonsPressed: boolean[] = [];

    const pollGamepad = () => {
      if (gamepadIndex !== null) {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[gamepadIndex];

        if (gamepad) {
          const { buttons, axes } = gamepad;
          const currentTime = Date.now();

          // Edge detection for axes (joystick movements)
          const leftStickX = axes[0];
          const leftStickY = axes[1];

          // Determine if axes are active beyond the deadzone
          const axisXActive = Math.abs(leftStickX) > deadzone;
          const axisYActive = Math.abs(leftStickY) > deadzone;

          // Edge detection for X axis (left/right)
          if (axisXActive && !prevAxesActive.x && currentTime - lastInputTime > inputDelay) {
            // Joystick moved in X axis beyond deadzone
            if (leftStickX > 0) {
              moveSelection('right');
            } else if (leftStickX < 0) {
              moveSelection('left');
            }
            setLastInputTime(currentTime);
          }

          // Edge detection for Y axis (up/down)
          if (axisYActive && !prevAxesActive.y && currentTime - lastInputTime > inputDelay) {
            // Joystick moved in Y axis beyond deadzone
            if (leftStickY > 0) {
              moveSelection('down');
            } else if (leftStickY < 0) {
              moveSelection('up');
            }
            setLastInputTime(currentTime);
          }

          // Update previous axes active states
          prevAxesActive = { x: axisXActive, y: axisYActive };

          // Edge detection for buttons
          if (prevButtonsPressed.length === 0) {
            prevButtonsPressed = buttons.map((button) => button.pressed);
          } else {
            buttons.forEach((button, index) => {
              const prevPressed = prevButtonsPressed[index];
              if (button.pressed && !prevPressed) {
                // Button was just pressed
                if (index === 0) {
                  // "A" button
                  const key = keys[selectedRow][selectedCol];
                  handleKeyPress(key);
                  setLastInputTime(currentTime);
                } else if (index === 3) {
                  // delete button
                  handleKeyPress('Backspace');
                  setLastInputTime(currentTime);
                }
                // Handle other buttons if needed
              }
            });

            // Update previous button states
            prevButtonsPressed = buttons.map((button) => button.pressed);
          }
        }
      }

      animationFrame = requestAnimationFrame(pollGamepad);
    };

    pollGamepad();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [gamepadIndex, selectedRow, selectedCol, keys, lastInputTime]);

  return {
    selectedRow,
    selectedCol,
    inputString,
  };
}