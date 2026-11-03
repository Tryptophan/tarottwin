import { Route, Routes, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppState } from './lib/storage'
import { startRelaySync } from './net/runtime'
import { STUBBED } from './lib/stub'
import { Starfield } from './components/Starfield'
import BottomNav from './components/BottomNav'
import TopBar from './components/TopBar'
import { UpdateBanner } from './components/UpdateBanner'
import { OfflineStatus } from './components/OfflineStatus'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Oracle from './pages/Oracle'
import Twin from './pages/Twin'
import TwinReading from './pages/TwinReading'
import Join from './pages/Join'
import Collection from './pages/Collection'
import Bonds from './pages/Bonds'
import BondDetail from './pages/BondDetail'
import Shop from './pages/Shop'
import Settings from './pages/Settings'
import './pages/pages.css'

export default function App() {
  const state = useAppState()
  // stubbed profiles have made-up secrets: never publish them to real relays
  useEffect(() => (state.onboarded && !STUBBED ? startRelaySync() : undefined), [state.onboarded])
  return (
    <>
      <Starfield />
      {STUBBED && <div className="stub-banner">Stubbed data</div>}
      <UpdateBanner />
      <OfflineStatus />
      {!state.onboarded ? (
        <Onboarding />
      ) : (
        <>
          <TopBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/oracle" element={<Oracle />} />
            <Route path="/twin" element={<Twin />} />
            <Route path="/twin/:id" element={<TwinReading />} />
            <Route path="/join/:secret" element={<Join />} />
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
