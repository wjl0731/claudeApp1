import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const COVERS = [
  'linear-gradient(135deg, #fdeef0, #ede8f5)',
  'linear-gradient(135deg, #e2ebe2, #ede8f5)',
  'linear-gradient(135deg, #fdeef0, #f7f0e8)',
  'linear-gradient(135deg, #ede8f5, #fdeef0)',
];
const EMOJIS = ['💅', '🌸', '✨', '🎀'];

export default function HomePage() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getShops().then(setShops).catch(() => {});
  }, []);

  const filtered = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ paddingTop: 20, marginBottom: 4 }}>
        <p style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 300 }}>Hello,</p>
        <h1 className="page-title" style={{ padding: 0 }}>{user?.name || '小可爱'} ♡</h1>
      </div>
      <p className="page-subtitle">今天想做什么款式呢？</p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--brown-100)' }} />
        <input
          className="input"
          style={{ paddingLeft: 38 }}
          placeholder="搜索店铺..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--pink-100), var(--lavender-100))',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 11, color: 'var(--pink-500)', fontWeight: 500, marginBottom: 4 }}>SPECIAL</p>
          <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>韩式美甲新款上线</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>春日限定 · 温柔色系</p>
        </div>
        <div style={{
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
          fontSize: 48, opacity: 0.6
        }}>🌷</div>
      </div>

      {/* Shop list */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">推荐店铺</h2>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{filtered.length} 家</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>没有找到相关店铺</p>
          </div>
        ) : (
          filtered.map((shop, idx) => (
            <div key={shop.id} className="shop-card" onClick={() => navigate(`/shop/${shop.id}`)}>
              <div className="shop-card-cover" style={{ background: COVERS[idx % COVERS.length] }}>
                <span>{EMOJIS[idx % EMOJIS.length]}</span>
              </div>
              <div className="shop-card-body">
                <h3>{shop.name}</h3>
                <p className="shop-desc">{shop.description}</p>
                <div className="shop-card-footer">
                  <div className="shop-rating">
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span>{shop.rating}</span>
                    <span style={{ color: 'var(--text-light)', fontWeight: 400, fontSize: 12 }}>
                      ({shop.review_count}条评价)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--text-light)' }}>
                    <MapPin size={12} />
                    <span>{shop.address ? shop.address.slice(0, 8) + '...' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
