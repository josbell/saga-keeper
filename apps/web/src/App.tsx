import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ForgeScreen } from './screens/forge'
import { GreatHallScreen } from './screens/great-hall'
import { IronSheetScreen } from './screens/iron-sheet'
import { OracleScreen } from './screens/oracle'
import { SkaldScreen } from './screens/skald'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/great-hall" element={<GreatHallScreen />} />
        <Route path="/forge" element={<ForgeScreen />} />
        <Route path="/iron-sheet" element={<IronSheetScreen />} />
        <Route path="/oracle" element={<OracleScreen />} />
        <Route path="/skald" element={<SkaldScreen />} />
        <Route path="*" element={<Navigate to="/great-hall" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
