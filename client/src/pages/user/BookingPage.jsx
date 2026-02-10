import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';

export default function BookingPage() {
  const { shopId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [shop, setShop] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      day: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      date: d.getDate(),
      month: d.getMonth() + 1,
    };
  });

  useEffect(() => {
    api.getShop(shopId).then(data => {
      setShop(data);
      const preSelect = searchParams.get('service');
      if (preSelect) {
        const svc = data.services.find(s => s.id === Number(preSelect));
        if (svc) { setSelectedService(svc); setStep(2); }
      }
    });
  }, [shopId]);

  useEffect(() => {
    if (selectedDate && shopId) {
      api.getSlots(shopId, selectedDate).then(setSlots);
    }
  }, [selectedDate, shopId]);

  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      showToast('请完善预约信息');
      return;
    }
    setLoading(true);
    try {
      await api.createAppointment({
        shop_id: Number(shopId),
        service_id: selectedService.id,
        date: selectedDate,
        time_slot: selectedTime,
        note,
      });
      showToast('预约成功！');
      setTimeout(() => navigate('/appointments'), 500);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!shop) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="header">
        <button className="header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>预约服务</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* Progress */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginBottom: 24
      }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step >= s ? 'var(--pink-400)' : 'var(--beige-200)',
              color: step >= s ? 'white' : 'var(--text-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600
            }}>
              {step > s ? <Check size={14} /> : s}
            </div>
            {s < 3 && <div style={{
              width: 40, height: 2,
              background: step > s ? 'var(--pink-400)' : 'var(--beige-200)'
            }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>选择服务</h3>
          <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 16 }}>{shop.name}</p>
          {shop.services.map(service => (
            <div
              key={service.id}
              className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
              onClick={() => setSelectedService(service)}
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
          <button
            className="btn btn-primary btn-full"
            style={{ marginTop: 16 }}
            disabled={!selectedService}
            onClick={() => setStep(2)}
          >
            下一步 · 选择时间
          </button>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>选择日期</h3>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
            {dates.map(d => (
              <button
                key={d.value}
                className={`chip ${selectedDate === d.value ? 'active' : ''}`}
                onClick={() => { setSelectedDate(d.value); setSelectedTime(''); }}
                style={{ minWidth: 56, flexDirection: 'column', display: 'flex', alignItems: 'center', padding: '10px 12px' }}
              >
                <span style={{ fontSize: 11, opacity: 0.7 }}>周{d.day}</span>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{d.date}</span>
              </button>
            ))}
          </div>

          {selectedDate && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>选择时间</h3>
              <div className="time-grid">
                {slots.map(slot => (
                  <button
                    key={slot.time}
                    className={`time-slot ${selectedTime === slot.time ? 'active' : ''} ${!slot.available ? 'disabled' : ''}`}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
              上一步
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
            >
              下一步 · 确认
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>确认预约</h3>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>店铺</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{shop.name}</span>
            </div>
            <div className="divider" style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>服务</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedService?.name}</span>
            </div>
            <div className="divider" style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>日期</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedDate}</span>
            </div>
            <div className="divider" style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>时间</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{selectedTime}</span>
            </div>
            <div className="divider" style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>价格</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--pink-500)' }}>¥{selectedService?.price}</span>
            </div>
          </div>

          <div className="input-group">
            <label>备注（选填）</label>
            <textarea
              className="input"
              placeholder="想要什么款式？有什么特别要求吗？"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>上一步</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleBook} disabled={loading}>
              {loading ? '提交中...' : '确认预约'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
