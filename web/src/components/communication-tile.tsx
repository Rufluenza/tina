'use client'

import { CommunicationItem } from '@/lib/types'
import Image from 'next/image'

interface CommunicationTileProps {
  item: CommunicationItem | null
  isSelected: boolean
  isFocused: boolean
  onClick: () => void
}

export default function CommunicationTile({ 
  item, 
  isSelected, 
  isFocused, 
  onClick 
}: CommunicationTileProps) {
  const getBackgroundColor = () => {
    if (isSelected) return '#4CAF50' // Green for selected
    if (isFocused) return '#2196F3' // Blue for focused
    return '#ffffff' // White default
  }

  const getBorderColor = () => {
    if (isSelected) return '#2E7D32' // Darker green
    if (isFocused) return '#1565C0' // Darker blue
    return '#333333' // Dark gray default
  }

  const getTextColor = () => {
    if (isSelected || isFocused) return '#ffffff'
    return '#333333'
  }

  return (
    <button
      className="communication-tile"
      onClick={onClick}
      style={{
        width: '120px',
        height: '120px',
        backgroundColor: getBackgroundColor(),
        border: `3px solid ${getBorderColor()}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        fontSize: '16px',
        fontWeight: 'bold',
        color: getTextColor(),
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !isFocused) {
          e.currentTarget.style.backgroundColor = '#e3f2fd' // Light blue hover
          e.currentTarget.style.borderColor = '#1976d2'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isFocused) {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.borderColor = '#333333'
        }
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = '#1976d2' // Darker blue on press
      }}
      onMouseUp={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = getBackgroundColor()
        }
      }}
    >
      {/* Image Section */}
      {item?.image && (
        <div style={{ marginBottom: '8px' }}>
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.text || 'Communication symbol'}
            width={60}
            height={60}
            style={{
              objectFit: 'contain',
              borderRadius: '4px'
            }}
          />
        </div>
      )}
      
      {/* Text Section */}
      {item?.text && (
        <div
          style={{
            textAlign: 'center',
            lineHeight: '1.2',
            wordBreak: 'break-word',
            fontSize: '14px'
          }}
        >
          {item.text}
        </div>
      )}
      
      {/* Empty tile indicator */}
      {(!item?.text && !item?.image) && (
        <div
          style={{
            color: '#999',
            fontSize: '12px',
            fontStyle: 'italic'
          }}
        >
          {item?.isEmpty ? '' : 'Empty'}
        </div>
      )}
    </button>
  )
}
