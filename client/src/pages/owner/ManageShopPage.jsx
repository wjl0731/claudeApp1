import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Store } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../components/Toast';

export default function ManageShopPage() {
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  // Shop form
  const [shopForm, setShopForm] = useState({
    name: '', description: '', address: '', phone: '', open_time: '09:00', close_time: '21:00'
  });

  // Service form
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', price: '', duration: '60', category: '美甲'
  });

  const loadData = async () => {
    try {
      const data = await api.getMyShop();
      if (data) {
        setShop(data);
        setServices(data.services || []);
        setShopForm({
          name: data.name, description: data.description || '',
          address: data.address || '', phone: data.phone || '',
          open_time: data.open_time, close_time: data.close_time
        });
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleShopSubmit = async () => {
    try {
      if (shop) {
        await api.updateShop(shop.id, shopForm);
        showToast('店铺信息已更新');
      } else {
        await api.createShop(shopForm);
        showToast('店铺创建成功！');
      }
      setShowShopForm(false);
      loadData();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleServiceSubmit = async () => {
    try {
      const payload = { ...serviceForm, price: Number(serviceForm.price), duration: Number(serviceForm.duration) };
      if (editingService) {
        await api.updateService(editingService.id, payload);
        showToast('服务已更新');
      } else {
        await api.addService(payload);
        showToast('服务已添加');
      }
      setShowServiceForm(false);
      setEditingService(null);
      setServiceForm({ name: '', description: '', price: '', duration: '60', category: '美甲' });
      loadData();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await api.deleteService(id);
      showToast('服务已删除');
      loadData();
    } catch (err) {
      showToast(err.message);
    }
  };

  const openEditService = (svc) => {
    setEditingService(svc);
    setServiceForm({
      name: svc.name, description: svc.description || '',
      price: String(svc.price), duration: String(svc.duration), category: svc.category
    });
    setShowServiceForm(true);
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <h1 className="page-title">店铺管理</h1>
      <p className="page-subtitle">管理你的店铺和服务项目</p>

      {/* Shop info card */}
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">店铺信息</h3>
          <button className="btn btn-outline btn-sm" onClick={() => setShowShopForm(true)}>
            <Edit3 size={12} />
            {shop ? '编辑' : '创建店铺'}
          </button>
        </div>

        {shop ? (
          <div className="card">
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{shop.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>{shop.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>📍 {shop.address}</span>
              <span>📞 {shop.phone}</span>
              <span>🕐 {shop.open_time} - {shop.close_time}</span>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <Store size={32} color="var(--brown-100)" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 14, color: 'var(--text-light)' }}>点击上方按钮创建你的店铺</p>
          </div>
        )}
      </div>

      {/* Services */}
      {shop && (
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">服务项目 ({services.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setEditingService(null);
              setServiceForm({ name: '', description: '', price: '', duration: '60', category: '美甲' });
              setShowServiceForm(true);
            }}>
              <Plus size={14} /> 添加
            </button>
          </div>

          {services.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 24, color: 'var(--text-light)' }}>
              还没有添加服务，快来添加吧
            </div>
          ) : (
            services.map(svc => (
              <div key={svc.id} className="service-card">
                <div className="service-info">
                  <h4>{svc.name}</h4>
                  <p>{svc.description}</p>
                  <span className="badge badge-pink" style={{ marginTop: 4 }}>{svc.category}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div className="service-meta">
                    <div className="service-price">¥{svc.price}</div>
                    <div className="service-duration">{svc.duration}分钟</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px' }}
                      onClick={() => openEditService(svc)}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleDeleteService(svc.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Shop Form Modal */}
      {showShopForm && (
        <div className="modal-overlay" onClick={() => setShowShopForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">{shop ? '编辑店铺' : '创建店铺'}</h3>
            <div className="input-group">
              <label>店铺名称</label>
              <input className="input" placeholder="输入店铺名称" value={shopForm.name} onChange={e => setShopForm({ ...shopForm, name: e.target.value })} />
            </div>
            <div className="input-group">
              <label>店铺简介</label>
              <textarea className="input" placeholder="介绍一下你的店铺" value={shopForm.description} onChange={e => setShopForm({ ...shopForm, description: e.target.value })} />
            </div>
            <div className="input-group">
              <label>地址</label>
              <input className="input" placeholder="店铺地址" value={shopForm.address} onChange={e => setShopForm({ ...shopForm, address: e.target.value })} />
            </div>
            <div className="input-group">
              <label>联系电话</label>
              <input className="input" placeholder="联系电话" value={shopForm.phone} onChange={e => setShopForm({ ...shopForm, phone: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>开始营业</label>
                <input className="input" type="time" value={shopForm.open_time} onChange={e => setShopForm({ ...shopForm, open_time: e.target.value })} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>结束营业</label>
                <input className="input" type="time" value={shopForm.close_time} onChange={e => setShopForm({ ...shopForm, close_time: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleShopSubmit}>保存</button>
          </div>
        </div>
      )}

      {/* Service Form Modal */}
      {showServiceForm && (
        <div className="modal-overlay" onClick={() => { setShowServiceForm(false); setEditingService(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title">{editingService ? '编辑服务' : '添加服务'}</h3>
            <div className="input-group">
              <label>服务名称</label>
              <input className="input" placeholder="例如：韩式纯色美甲" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} />
            </div>
            <div className="input-group">
              <label>服务描述</label>
              <textarea className="input" placeholder="描述一下这个服务" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>价格（元）</label>
                <input className="input" type="number" placeholder="128" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>时长（分钟）</label>
                <input className="input" type="number" placeholder="60" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label>分类</label>
              <select className="input" value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}>
                <option value="美甲">美甲</option>
                <option value="手护">手护</option>
                <option value="美睫">美睫</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleServiceSubmit}>
              {editingService ? '保存修改' : '添加服务'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
