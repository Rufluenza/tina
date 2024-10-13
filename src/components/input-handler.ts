// input-handler.ts
import { useState, useEffect } from 'react';

export function useInputHandler(keys: string[][]) {
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [inputString, setInputString] = useState('');
  const [gamepadIndex, setGamepadIndex] = useState<number | null>(null);

  const moveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
    setSelectedRow((prevRow) => {
      let newRow = prevRow;
      if (direction === 'up' && prevRow > 0) {
        newRow = prevRow - 1;
      } else if (direction === 'down' && prevRow < keys.length - 1) {
        newRow = prevRow + 1;
      }
      return newRow;
    });

    setSelectedCol((prevCol) => {
      let newCol = prevCol;
      const currentRowLength = keys[selectedRow].length;

      if (direction === 'left' && prevCol > 0) {
        newCol = prevCol - 1;
      } else if (direction === 'right' && prevCol < currentRowLength - 1) {
        newCol = prevCol + 1;
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

  useEffect(() => {
    let animationFrame: number;

    const pollGamepad = () => {
      if (gamepadIndex !== null) {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[gamepadIndex];

        if (gamepad) {
          const { buttons, axes } = gamepad;

          // Map joystick axes to navigation
          const threshold = 0.5; // Deadzone threshold
          const [leftStickX, leftStickY] = axes;

          if (leftStickY < -threshold) {
            moveSelection('up');
          } else if (leftStickY > threshold) {
            moveSelection('down');
          }

          if (leftStickX < -threshold) {
            moveSelection('left');
          } else if (leftStickX > threshold) {
            moveSelection('right');
          }

          // Map buttons to actions
          if (buttons[0].pressed) {
            const key = keys[selectedRow][selectedCol];
            handleKeyPress(key);
          }
        }
      }

      animationFrame = requestAnimationFrame(pollGamepad);
    };

    pollGamepad();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [gamepadIndex, selectedRow, selectedCol, keys]);

  return {
    selectedRow,
    selectedCol,
    inputString,
  };
}
