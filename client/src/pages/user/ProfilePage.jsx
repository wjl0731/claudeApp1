import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, LogOut, Heart, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      {/* Profile header */}
      <div style={{
        textAlign: 'center',
        paddingTop: 32,
        paddingBottom: 24
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--pink-200), var(--lavender-200))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: 28
        }}>
          {user?.name?.charAt(0) || '✿'}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>{user?.phone}</p>
        <span className="badge badge-pink" style={{ marginTop: 8 }}>
          {user?.role === 'owner' ? '店主' : '普通用户'}
        </span>
      </div>

      {/* Menu */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {[
          { icon: <Calendar size={18} />, label: '我的预约', path: '/appointments' },
          { icon: <Heart size={18} />, label: '我的收藏', path: '#' },
          { icon: <User size={18} />, label: '个人设置', path: '#' },
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => item.path !== '#' && navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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

      <button
        className="btn btn-full"
        style={{
          marginTop: 24,
          background: 'var(--beige-100)',
          color: 'var(--text-secondary)',
          gap: 8
        }}
        onClick={handleLogout}
      >
        <LogOut size={16} />
        退出登录
      </button>

      <p style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: 'var(--brown-100)' }}>
        Nail Bloom v1.0 · Made with ♡
      </p>
    </div>
  );
}
