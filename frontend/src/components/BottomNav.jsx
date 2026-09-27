import { NavLink } from 'react-router-dom';
import { IconHome, IconCompass, IconMapPin, IconClipboard } from './Icons';

const items = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/explore', label: 'Explore', icon: IconCompass },
  { to: '/risk-map', label: 'Risk Map', icon: IconMapPin },
  { to: '/admin', label: 'Review', icon: IconClipboard }
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Icon size={21} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
