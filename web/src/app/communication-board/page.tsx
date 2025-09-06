"use client"
import CommunicationGrid from '@/components/communication-grid'
import { CommunicationItem } from '@/lib/types'

// Sample data - replace with your actual data source
const sampleItems: CommunicationItem[] = [
  {
    id: '1',
    text: 'SMS Tool',
    image: '/icons/sms.svg?height=60&width=60',
    x: 0,
    y: 0,
    // go to page with url / (meaning home page)
    function: () => window.location.href = '/sms'
  },
  {
    id: '2',
    text: 'Yes',
    image: '/icons/yes.svg?height=60&width=60',
    x: 1,
    y: 0,
    function: () => console.log('Yes selected')
  },
  {
    id: '3',
    text: 'No',
    image: '/icons/no.svg?height=60&width=60',
    x: 2,
    y: 0,
    function: () => console.log('No selected')
  },
  {
    id: '4',
    text: 'Happy',
    image: '/icons/happy.svg?height=60&width=60',
    x: 0,
    y: 1,
    function: () => console.log('Water selected')
  },
  {
    id: '5',
    text: 'Sad',
    image: '/icons/sad.svg?height=60&width=60',
    x: 1,
    y: 1,
    function: () => console.log('Food selected')
  },
  {
    id: '6',
    text: 'Stop',
    image: '/icons/stop.svg?height=60&width=60',
    x: 2,
    y: 1,
    function: () => console.log('Help selected')
  },
  {
    id: '7',
    text: 'Bathroom',
    image: '/placeholder.svg?height=60&width=60',
    x: 0,
    y: 2,
    function: () => console.log('Bathroom selected')
  },
  {
    id: '8',
    text: 'Hungry',
    image: '',
    x: 1,
    y: 2,
    isEmpty: true,
    function: () => console.log('Empty tile selected')
  },
  {
    id: '9',
    text: 'Thirsty',
    image: '/placeholder.svg?height=60&width=60',
    x: 2,
    y: 2,
    function: () => console.log('More selected')
  },
  // help
  {
    id: '10',
    text: 'Help',
    image: '/icons/help.svg?height=60&width=60',
    x: 0,
    y: 3,
    function: () => console.log('Help selected')
  },
  // important
  {
    id: '11',
    text: 'Important',
    image: '/icons/important.svg?height=60&width=60',
    x: 1,
    y: 3,
    function: () => console.log('Important selected')
  },
  // more
  {
    id: '12',
    text: 'More',
    image: '/icons/more.svg?height=60&width=60',
    x: 2,
    y: 3,
    function: () => console.log('More selected')
  },
]

export default function CommunicationBoardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Communication Board
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Use arrow keys to navigate, Enter to select, Escape to deselect
          </p>
        </header>
        
        <main className="flex justify-center">
          <CommunicationGrid 
            items={sampleItems}
            dimensions={{ rows: 5, cols: 6 }}
          />
        </main>
      </div>
    </div>
  )
}
