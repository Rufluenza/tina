'use client'

import { useState, useEffect, useCallback } from 'react'
import { CommunicationItem, GridDimensions } from '@/lib/types'
import CommunicationTile from '@/components/communication-tile'

interface CommunicationGridProps {
  items: CommunicationItem[]
  dimensions?: GridDimensions
}

export default function CommunicationGrid({ 
  items, 
  dimensions = { rows: 5, cols: 6 } 
}: CommunicationGridProps) {
  const [selectedTile, setSelectedTile] = useState<string | null>(null)
  const [focusedPosition, setFocusedPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Create a matrix from the items array
  const createMatrix = useCallback(() => {
    const matrix: (CommunicationItem | null)[][] = Array(dimensions.rows)
      .fill(null)
      .map(() => Array(dimensions.cols).fill(null))

    items.forEach(item => {
      if (item.y < dimensions.rows && item.x < dimensions.cols) {
        matrix[item.y][item.x] = item
      }
    })

    return matrix
  }, [items, dimensions])

  const matrix = createMatrix()

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          setFocusedPosition(prev => ({
            ...prev,
            y: Math.max(0, prev.y - 1)
          }))
          break
        case 'ArrowDown':
          event.preventDefault()
          setFocusedPosition(prev => ({
            ...prev,
            y: Math.min(dimensions.rows - 1, prev.y + 1)
          }))
          break
        case 'ArrowLeft':
          event.preventDefault()
          setFocusedPosition(prev => ({
            ...prev,
            x: Math.max(0, prev.x - 1)
          }))
          break
        case 'ArrowRight':
          event.preventDefault()
          setFocusedPosition(prev => ({
            ...prev,
            x: Math.min(dimensions.cols - 1, prev.x + 1)
          }))
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          const currentItem = matrix[focusedPosition.y][focusedPosition.x]
          if (currentItem) {
            handleTileActivation(currentItem)
          }
          break
        case 'Escape':
        case 'Backspace':
          event.preventDefault()
          setSelectedTile(null)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedPosition, matrix, dimensions])

  const handleTileActivation = (item: CommunicationItem) => {
    if (selectedTile === item.id) {
      // Deselect if already selected
      setSelectedTile(null)
    } else {
      // Select the tile
      setSelectedTile(item.id)
      
      // Execute function if available and not empty
      if (item.function && !item.isEmpty) {
        item.function()
      }
    }
  }

  const handleTileClick = (item: CommunicationItem | null) => {
    if (!item) return
    handleTileActivation(item)
  }

  return (
    <div 
      className="communication-grid focus:outline-none"
      tabIndex={0}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
        gridTemplateRows: `repeat(${dimensions.rows}, 1fr)`,
        gap: '4px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        border: '3px solid #333',
        borderRadius: '8px'
      }}
    >
      {matrix.map((row, rowIndex) =>
        row.map((item, colIndex) => (
          <CommunicationTile
            key={`${rowIndex}-${colIndex}`}
            item={item}
            isSelected={item ? selectedTile === item.id : false}
            isFocused={focusedPosition.x === colIndex && focusedPosition.y === rowIndex}
            onClick={() => handleTileClick(item)}
          />
        ))
      )}
    </div>
  )
}
