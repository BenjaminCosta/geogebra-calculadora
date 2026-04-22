'use client'

import { MoreVertical } from 'lucide-react'

const xValues = [-2, -1, 0, 1, 2]

export function TableScreen() {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#F5F5F5]">
      {/* Section Title */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-lg font-medium text-primary-violet">
          Definir funciones
        </h2>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto mx-1">
        <div className="bg-white">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-[#E8E6F0] border-b border-[#E0E0E0] sticky top-0">
            <div className="flex items-center justify-center gap-1 py-3 px-2 border-r border-[#E0E0E0]">
              <span className="text-sm font-medium text-[#212121]">x</span>
              <MoreVertical className="w-4 h-4 text-[#757575]" />
            </div>
            <div className="flex items-center justify-center py-3 px-2 border-r border-[#E0E0E0]">
              <span className="text-sm font-medium text-[#212121]">f(x)</span>
            </div>
            <div className="flex items-center justify-center py-3 px-2">
              <span className="text-sm font-medium text-[#212121]">g(x)</span>
            </div>
          </div>

          {/* Table Body */}
          {xValues.map((value, index) => (
            <div 
              key={index} 
              className="grid grid-cols-3 border-b border-[#E0E0E0]"
            >
              <div className="flex items-center justify-center py-4 px-2 border-r border-[#E0E0E0] bg-white">
                <span className="text-base text-[#212121]">{value}</span>
              </div>
              <div className="flex items-center justify-center py-4 px-2 border-r border-[#E0E0E0] bg-white">
                {/* Empty f(x) cell */}
              </div>
              <div className="flex items-center justify-center py-4 px-2 bg-white">
                {/* Empty g(x) cell */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty space below table */}
      <div className="flex-1 min-h-[100px] bg-[#F5F5F5]" />
    </div>
  )
}
