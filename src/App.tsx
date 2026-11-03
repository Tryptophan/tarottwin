import { Route, Routes, Navigate } from 'react-router-dom'
import { useAppState } from './lib/storage'
import { Starfield } from './components/Starfield'
import BottomNav from './components/BottomNav'
import TopBar from './components/TopBar'
import { UpdateBanner } from './components/UpdateBanner'
import { OfflineStatus } from './components/OfflineStatus'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Twin from './pages/Twin'
import TwinReading from './pages/TwinReading'
import Collection from './pages/Collection'
import Bonds from './pages/Bonds'
import BondDetail from './pages/BondDetail'
import Shop from './pages/Shop'
import Settings from './pages/Settings'
import './pages/pages.css'

export default function App() {
  const state = useAppState()
  return (
    <>
      <Starfield />
      <UpdateBanner />
      <OfflineStatus />
      {!state.onboarded ? (
        <Onboarding />
      ) : (
        <>
          <TopBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/twin" element={<Twin />} />
            <Route path="/twin/:id" element={<TwinReading />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/bonds" element={<Bonds />} />
            <Route path="/bonds/:id" element={<BondDetail />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
        </>
      )}
    </>
  )
}
