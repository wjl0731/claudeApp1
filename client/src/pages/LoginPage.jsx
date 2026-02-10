import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('user');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await login(phone, password);
      } else {
        user = await register(phone, password, name, role);
      }
      navigate(user.role === 'owner' ? '/owner' : '/');
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">✿</div>
      <h1 className="auth-title">Nail Bloom</h1>
      <p className="auth-subtitle">韩式精致美甲 · 预约平台</p>

      <div className="auth-form">
        <div className="auth-tabs">
          <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
            登录
          </button>
          <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
            注册
          </button>
        </div>

        {!isLogin && (
          <div className="auth-tabs" style={{ marginBottom: 20 }}>
            <button className={`auth-tab ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>
              我要预约
            </button>
            <button className={`auth-tab ${role === 'owner' ? 'active' : ''}`} onClick={() => setRole('owner')}>
              我是店主
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>昵称</label>
              <input className="input" placeholder="输入你的昵称" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="input-group">
            <label>手机号</label>
            <input className="input" placeholder="输入手机号" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="input-group">
            <label>密码</label>
            <input className="input" type="password" placeholder="输入密码" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? '请稍候...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        {isLogin && (
          <div className="auth-switch">
            <p style={{ marginBottom: 8 }}>
              还没有账号？<a onClick={() => setIsLogin(false)}>立即注册</a>
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-light)' }}>
              演示账号：13800000002 / 123456（用户）
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-light)' }}>
              演示账号：13800000001 / 123456（店主）
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
