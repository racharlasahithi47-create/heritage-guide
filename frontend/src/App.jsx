import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Result from './pages/Result';
import SiteDetail from './pages/SiteDetail';
import ReportFlow from './pages/ReportFlow';
import Explore from './pages/Explore';
import RiskMap from './pages/RiskMap';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/result" element={<Result />} />
        <Route path="/site/:id" element={<SiteDetail />} />
        <Route path="/report/:siteId" element={<ReportFlow />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/risk-map" element={<RiskMap />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
