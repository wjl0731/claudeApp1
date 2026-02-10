import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [todayAppts, setTodayAppts] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.getMyShop().then(setShop);
    api.getShopAppointments().then(data => {
      setAppointments(data);
      setTodayAppts(data.filter(a => a.date === today));
    }).catch(() => {});
  }, []);

  const stats = {
    today: todayAppts.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    total: appointments.length,
  };

  return (
    <div className="page">
      <div style={{ paddingTop: 20, marginBottom: 4 }}>
        <p style={{ fontSize: 13, color: 'var(--text-light)', fontWeight: 300 }}>店主中心</p>
        <h1 className="page-title" style={{ padding: 0 }}>
          {shop?.name || `${user?.name}的店铺`}
        </h1>
      </div>
      <p className="page-subtitle">{today}</p>

      {!shop ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <p>您还没有创建店铺</p>
          <p style={{ fontSize: 12, marginTop: 8 }}>请前往「店铺管理」创建您的店铺</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.today}</div>
              <div className="stat-label">今日预约</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">待确认</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.confirmed}</div>
              <div className="stat-label">已确认</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">总预约</div>
            </div>
          </div>

          {/* Today's appointments */}
          <div className="section">
            <div className="section-header">
              <h3 className="section-title">今日预约</h3>
            </div>

            {todayAppts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 24, color: 'var(--text-light)' }}>
                今天暂无预约，好好休息一下吧 ☕
              </div>
            ) : (
              todayAppts.map(appt => (
                <div key={appt.id} className="appt-card">
                  <div className="appt-header">
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{appt.user_name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 8 }}>{appt.user_phone}</span>
                    </div>
                    <span className={`badge badge-${appt.status}`}>
                      {appt.status === 'pending' ? '待确认' : appt.status === 'confirmed' ? '已确认' : appt.status}
                    </span>
                  </div>
                  <div className="appt-body">
                    <div className="appt-row">
                      <span style={{ fontWeight: 500 }}>{appt.service_name}</span>
                      <span style={{ color: 'var(--pink-500)' }}>¥{appt.price}</span>
                    </div>
                    <div className="appt-row">
                      <Clock size={14} color="var(--text-light)" />
                      <span>{appt.time_slot}</span>
                      <span style={{ color: 'var(--text-light)' }}>({appt.duration}分钟)</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick info */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--pink-50), var(--lavender-50))',
            border: 'none'
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>营业时间</p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{shop.open_time} - {shop.close_time}</p>
            <div className="divider" />
            <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>服务项目</p>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{shop.services?.length || 0} 项</p>
          </div>
        </>
      )}
    </div>
  );
}
