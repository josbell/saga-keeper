import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ForgeScreen } from './screens/forge'
import { IronSheetScreen } from './screens/iron-sheet'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/forge" element={<ForgeScreen />} />
        <Route path="/iron-sheet" element={<IronSheetScreen />} />
        <Route path="*" element={<Navigate to="/forge" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
