"use client"

export function GridLines() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Left vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-800/20" />
      
      {/* Right vertical line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-800/20" />
      
      {/* Horizontal line - full width */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gray-800/20" />
    </div>
  )
}




