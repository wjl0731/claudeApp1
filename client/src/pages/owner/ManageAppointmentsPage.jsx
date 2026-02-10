import { useState, useEffect } from 'react';
import { Clock, Phone, User, MessageSquare } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';

const STATUS_MAP = {
  pending: { label: '待确认', badge: 'badge-pending' },
  confirmed: { label: '已确认', badge: 'badge-confirmed' },
  completed: { label: '已完成', badge: 'badge-completed' },
  cancelled: { label: '已取消', badge: 'badge-cancelled' },
};

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const showToast = useToast();

  const loadData = () => {
    const params = [];
    if (dateFilter) params.push(`date=${dateFilter}`);
    if (filter !== 'all') params.push(`status=${filter}`);
    api.getShopAppointments(params.join('&')).then(setAppointments).catch(() => {});
  };

  useEffect(() => { loadData(); }, [filter, dateFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      showToast(status === 'confirmed' ? '已确认预约' : status === 'completed' ? '已标记完成' : '已取消预约');
      loadData();
    } catch (err) {
      showToast(err.message);
    }
  };

  // Next 7 days for quick filter
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      day: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      date: d.getDate(),
    };
  });

  return (
    <div className="page">
      <h1 className="page-title">预约管理</h1>
      <p className="page-subtitle">管理客户预约</p>

      {/* Date filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
        <button
          className={`chip ${!dateFilter ? 'active' : ''}`}
          onClick={() => setDateFilter('')}
        >全部日期</button>
        {dates.map(d => (
          <button
            key={d.value}
            className={`chip ${dateFilter === d.value ? 'active' : ''}`}
            onClick={() => setDateFilter(d.value)}
            style={{ minWidth: 48 }}
          >
            <span style={{ fontSize: 11 }}>周{d.day}</span>
            <br />
            {d.date}
          </button>
        ))}
      </div>

      {/* Status filter */}
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

      {/* Appointments list */}
      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>暂无预约</p>
        </div>
      ) : (
        appointments.map(appt => (
          <div key={appt.id} className="appt-card">
            <div className="appt-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--pink-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <User size={14} color="var(--pink-500)" />
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{appt.user_name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-light)' }}>
                    <Phone size={10} />
                    {appt.user_phone}
                  </div>
                </div>
              </div>
              <span className={`badge ${STATUS_MAP[appt.status]?.badge}`}>
                {STATUS_MAP[appt.status]?.label}
              </span>
            </div>

            <div className="appt-body">
              <div className="appt-row">
                <span style={{ fontWeight: 500 }}>{appt.service_name}</span>
                <span style={{ color: 'var(--pink-500)', fontWeight: 600 }}>¥{appt.price}</span>
              </div>
              <div className="appt-row">
                <Clock size={14} color="var(--text-light)" />
                <span>{appt.date} {appt.time_slot}</span>
                <span style={{ color: 'var(--text-light)' }}>({appt.duration}分钟)</span>
              </div>
              {appt.note && (
                <div className="appt-row">
                  <MessageSquare size={14} color="var(--text-light)" />
                  <span>{appt.note}</span>
                </div>
              )}
            </div>

            {appt.status === 'pending' && (
              <div className="appt-actions">
                <button className="btn btn-primary btn-sm" onClick={() => updateStatus(appt.id, 'confirmed')}>
                  确认预约
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(appt.id, 'cancelled')}>
                  拒绝
                </button>
              </div>
            )}
            {appt.status === 'confirmed' && (
              <div className="appt-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(appt.id, 'completed')}>
                  标记完成
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(appt.id, 'cancelled')}>
                  取消
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
