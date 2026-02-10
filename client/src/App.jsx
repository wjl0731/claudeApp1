import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LayoutDashboard, Store, ClipboardList } from 'lucide-react';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/user/HomePage';
import ShopDetailPage from './pages/user/ShopDetailPage';
import BookingPage from './pages/user/BookingPage';
import AppointmentsPage from './pages/user/AppointmentsPage';
import ProfilePage from './pages/user/ProfilePage';
import DashboardPage from './pages/owner/DashboardPage';
import ManageAppointmentsPage from './pages/owner/ManageAppointmentsPage';
import ManageShopPage from './pages/owner/ManageShopPage';
import OwnerProfilePage from './pages/owner/OwnerProfilePage';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'owner' ? '/owner' : '/'} />;
  return children;
}

function UserNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>首页</span>
      </NavLink>
      <NavLink to="/appointments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={22} />
        <span>预约</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>我的</span>
      </NavLink>
    </nav>
  );
}

function OwnerNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/owner" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={22} />
        <span>工作台</span>
      </NavLink>
      <NavLink to="/owner/appointments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <ClipboardList size={22} />
        <span>预约</span>
      </NavLink>
      <NavLink to="/owner/shop" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Store size={22} />
        <span>店铺</span>
      </NavLink>
      <NavLink to="/owner/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>我的</span>
      </NavLink>
    </nav>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isDetailPage = location.pathname.startsWith('/shop/') || location.pathname.startsWith('/booking/');

  const showNav = !isLoginPage && !loading && user && !isDetailPage;

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* User routes */}
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/shop/:id" element={<PrivateRoute><ShopDetailPage /></PrivateRoute>} />
        <Route path="/booking/:shopId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><AppointmentsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Owner routes */}
        <Route path="/owner" element={<PrivateRoute role="owner"><DashboardPage /></PrivateRoute>} />
        <Route path="/owner/appointments" element={<PrivateRoute role="owner"><ManageAppointmentsPage /></PrivateRoute>} />
        <Route path="/owner/shop" element={<PrivateRoute role="owner"><ManageShopPage /></PrivateRoute>} />
        <Route path="/owner/profile" element={<PrivateRoute role="owner"><OwnerProfilePage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {showNav && (isOwnerRoute ? <OwnerNav /> : <UserNav />)}
    </>
  );
}
