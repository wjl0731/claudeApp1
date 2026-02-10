import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store, Calendar, Settings, LogOut, ChevronRight } from 'lucide-react';

export default function OwnerProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <div style={{ textAlign: 'center', paddingTop: 32, paddingBottom: 24 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--lavender-200), var(--pink-200))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', fontSize: 28
        }}>
          {user?.name?.charAt(0) || '✿'}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>{user?.phone}</p>
        <span className="badge badge-lavender" style={{ marginTop: 8 }}>店主</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {[
          { icon: <Store size={18} />, label: '店铺管理', path: '/owner/shop' },
          { icon: <Calendar size={18} />, label: '预约管理', path: '/owner/appointments' },
          { icon: <Settings size={18} />, label: '账号设置', path: '#' },
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => item.path !== '#' && navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px',
              borderBottom: idx < 2 ? '1px solid var(--beige-100)' : 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
              {item.icon}
              <span style={{ fontSize: 14 }}>{item.label}</span>
            </div>
            <ChevronRight size={16} color="var(--brown-100)" />
          </div>
        ))}
      </div>

      <button className="btn btn-full" style={{ marginTop: 24, background: 'var(--beige-100)', color: 'var(--text-secondary)', gap: 8 }} onClick={handleLogout}>
        <LogOut size={16} /> 退出登录
      </button>

      <p style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: 'var(--brown-100)' }}>
        Nail Bloom v1.0 · 店主版
      </p>
    </div>
  );
}
