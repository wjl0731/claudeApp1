import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';

const STATUS_MAP = {
  pending: { label: '待确认', badge: 'badge-pending' },
  confirmed: { label: '已确认', badge: 'badge-confirmed' },
  completed: { label: '已完成', badge: 'badge-completed' },
  cancelled: { label: '已取消', badge: 'badge-cancelled' },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const showToast = useToast();

  const loadData = () => {
    api.getMyAppointments().then(setAppointments).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const handleCancel = async (id) => {
    try {
      await api.cancelAppointment(id);
      showToast('已取消预约');
      loadData();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleReview = async () => {
    try {
      await api.addReview(reviewModal.id, { rating: reviewRating, content: reviewContent });
      showToast('评价成功！');
      setReviewModal(null);
      setReviewRating(5);
      setReviewContent('');
      loadData();
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">我的预约</h1>
      <p className="page-subtitle">管理你的美甲预约</p>

      <div className="chips">
        {[
          { key: 'all', label: '全部' },
          { key: 'pending', label: '待确认' },
          { key: 'confirmed', label: '已确认' },
          { key: 'completed', label: '已完成' },
        ].map(f => (
          <button key={f.key} className={`chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>暂无预约记录</p>
        </div>
      ) : (
        filtered.map(appt => (
          <div key={appt.id} className="appt-card">
            <div className="appt-header">
              <span className="appt-shop">{appt.shop_name}</span>
              <span className={`badge ${STATUS_MAP[appt.status]?.badge}`}>
                {STATUS_MAP[appt.status]?.label}
              </span>
            </div>
            <div className="appt-body">
              <div className="appt-row">
                <span style={{ fontSize: 14, fontWeight: 500 }}>{appt.service_name}</span>
                <span style={{ color: 'var(--pink-500)', fontWeight: 600 }}>¥{appt.price}</span>
              </div>
              <div className="appt-row">
                <Calendar size={14} color="var(--text-light)" />
                <span>{appt.date}</span>
                <Clock size={14} color="var(--text-light)" style={{ marginLeft: 8 }} />
                <span>{appt.time_slot}</span>
              </div>
              {appt.shop_address && (
                <div className="appt-row">
                  <MapPin size={14} color="var(--text-light)" />
                  <span>{appt.shop_address}</span>
                </div>
              )}
            </div>

            <div className="appt-actions">
              {(appt.status === 'pending' || appt.status === 'confirmed') && (
                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt.id)}>
                  取消预约
                </button>
              )}
              {appt.status === 'completed' && !appt.has_review && (
                <button className="btn btn-outline btn-sm" onClick={() => setReviewModal(appt)}>
                  写评价
                </button>
              )}
              {appt.status === 'completed' && appt.has_review > 0 && (
                <span className="badge badge-sage">已评价</span>
              )}
            </div>
          </div>
        ))
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">写评价</h3>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
              {reviewModal.shop_name} · {reviewModal.service_name}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => setReviewRating(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <Star size={28} fill={i <= reviewRating ? '#fbbf24' : 'none'} color={i <= reviewRating ? '#fbbf24' : 'var(--beige-200)'} />
                </button>
              ))}
            </div>

            <div className="input-group">
              <textarea
                className="input"
                placeholder="分享你的体验吧～"
                value={reviewContent}
                onChange={e => setReviewContent(e.target.value)}
              />
            </div>

            <button className="btn btn-primary btn-full" onClick={handleReview}>
              提交评价
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
