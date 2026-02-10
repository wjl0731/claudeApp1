import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, MapPin, Clock, Phone } from 'lucide-react';
import { api } from '../../utils/api';
import Stars from '../../components/Stars';

const COVERS = [
  'linear-gradient(135deg, #fdeef0, #ede8f5)',
  'linear-gradient(135deg, #e2ebe2, #ede8f5)',
];

export default function ShopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [tab, setTab] = useState('services');

  useEffect(() => {
    api.getShop(id).then(setShop).catch(() => navigate('/'));
  }, [id]);

  if (!shop) return <div className="loading"><div className="spinner" /></div>;

  const categories = [...new Set(shop.services.map(s => s.category))];

  return (
    <div className="page" style={{ padding: 0, paddingBottom: 100 }}>
      {/* Cover */}
      <div style={{
        height: 200,
        background: COVERS[shop.id % 2],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 56,
        position: 'relative'
      }}>
        <span>💅</span>
        <button
          className="header-back"
          style={{ position: 'absolute', top: 16, left: 16 }}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Shop info */}
        <div style={{ marginTop: -30, position: 'relative', zIndex: 1 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{shop.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>{shop.description}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontWeight: 600 }}>{shop.rating}</span>
                <span style={{ color: 'var(--text-light)' }}>({shop.reviews.length}条评价)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} color="var(--text-light)" />
                <span>{shop.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color="var(--text-light)" />
                <span>{shop.open_time} - {shop.close_time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} color="var(--text-light)" />
                <span>{shop.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="chips" style={{ marginBottom: 20 }}>
          <button className={`chip ${tab === 'services' ? 'active' : ''}`} onClick={() => setTab('services')}>
            服务项目
          </button>
          <button className={`chip ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
            评价 ({shop.reviews.length})
          </button>
        </div>

        {/* Services */}
        {tab === 'services' && (
          <div>
            {categories.map(cat => (
              <div key={cat} className="section">
                <h3 className="section-title" style={{ marginBottom: 10 }}>
                  <span className="badge badge-pink" style={{ marginRight: 8 }}>{cat}</span>
                </h3>
                {shop.services.filter(s => s.category === cat).map(service => (
                  <div
                    key={service.id}
                    className="service-card"
                    onClick={() => navigate(`/booking/${shop.id}?service=${service.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="service-info">
                      <h4>{service.name}</h4>
                      <p>{service.description}</p>
                    </div>
                    <div className="service-meta">
                      <div className="service-price">¥{service.price}</div>
                      <div className="service-duration">{service.duration}分钟</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          <div>
            {shop.reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <p>暂无评价</p>
              </div>
            ) : (
              shop.reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-user">{review.user_name}</span>
                    <span className="review-date">{review.created_at?.split('T')[0]}</span>
                  </div>
                  <Stars rating={review.rating} size={12} />
                  <p className="review-content" style={{ marginTop: 6 }}>{review.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
