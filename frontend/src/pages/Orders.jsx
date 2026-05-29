import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ordersApi, productsApi, customersApi } from '../utils/api';
import {
  Modal, ConfirmDialog, PageLoader, EmptyState,
  StatusBadge, FormField, PageHeader
} from '../components/UI';
import {
  Plus, Trash2, ShoppingCart, RefreshCw, ChevronDown,
  ChevronUp, X, Search
} from 'lucide-react';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// ── Order Form ────────────────────────────────────────────────────────────────

function OrderForm({ onSubmit, onCancel, loading }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [errors, setErrors] = useState({});
  const [customerSearch, setCustomerSearch] = useState('');

  useEffect(() => {
    Promise.all([
      customersApi.list({ limit: 500 }),
      productsApi.list({ limit: 500 }),
    ]).then(([cRes, pRes]) => {
      setCustomers(cRes.data);
      setProducts(pRes.data);
    });
  }, []);

  const filteredCustomers = customers.filter((c) =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const addItem = () => setItems((prev) => [...prev, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const getProduct = (id) => products.find((p) => p.id === parseInt(id));

  const orderTotal = items.reduce((sum, item) => {
    const p = getProduct(item.product_id);
    return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
  }, 0);

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = 'Please select a customer';
    items.forEach((item, i) => {
      if (!item.product_id) e[`product_${i}`] = 'Select a product';
      if (!item.quantity || parseInt(item.quantity) < 1) e[`qty_${i}`] = 'Min quantity is 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      customer_id: parseInt(customerId),
      notes: notes || undefined,
      items: items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
      })),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Customer */}
      <div>
        <label className="label">Customer <span className="text-rose-500">*</span></label>
        <div className="space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              className="input pl-8"
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select a customer</option>
            {filteredCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name} — {c.email}
              </option>
            ))}
          </select>
        </div>
        {errors.customer && <p className="mt-1 text-xs text-rose-500">{errors.customer}</p>}
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Order Items <span className="text-rose-500">*</span></label>
          <button type="button" onClick={addItem} className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
            <Plus size={12} /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => {
            const p = getProduct(item.product_id);
            return (
              <div key={i} className="bg-ink-50 rounded-xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <select
                      className="input text-sm"
                      value={item.product_id}
                      onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                          {p.name} (Stock: {p.stock_quantity}) — ${p.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    {errors[`product_${i}`] && (
                      <p className="text-xs text-rose-500 mt-1">{errors[`product_${i}`]}</p>
                    )}
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      className="input text-sm text-center"
                      min="1"
                      max={p?.stock_quantity || 9999}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                      placeholder="Qty"
                    />
                    {errors[`qty_${i}`] && (
                      <p className="text-xs text-rose-500 mt-1">{errors[`qty_${i}`]}</p>
                    )}
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="mt-0.5 p-1.5 rounded-lg text-ink-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {p && (
                  <div className="flex justify-between text-xs text-ink-500 px-1">
                    <span>{p.name}</span>
                    <span>${(p.price * (parseInt(item.quantity) || 0)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="bg-ink-900 text-amber-400 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium">Order Total</span>
        <span className="font-display text-xl">${orderTotal.toFixed(2)}</span>
      </div>

      {/* Notes */}
      <FormField label="Notes">
        <textarea
          className="input resize-none"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional order notes..."
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
}

// ── Order Row (expandable) ────────────────────────────────────────────────────

function OrderRow({ order, onStatusChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="table-row cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart size={14} className="text-violet-500" />
            </div>
            <div>
              <p className="font-medium text-ink-800">Order #{order.id}</p>
              <p className="text-xs text-ink-400">
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5">
          <p className="text-sm text-ink-700">
            {order.customer?.first_name} {order.customer?.last_name}
          </p>
          <p className="text-xs text-ink-400">{order.customer?.email}</p>
        </td>
        <td className="px-4 py-3.5 text-center text-sm text-ink-600">
          {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
        </td>
        <td className="px-4 py-3.5 text-right font-medium text-ink-800">
          ${order.total_amount.toFixed(2)}
        </td>
        <td className="px-4 py-3.5 text-center">
          <StatusBadge status={order.status} />
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <select
              className="text-xs border border-ink-200 bg-ink-50 rounded-lg px-2 py-1.5 text-ink-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            {['pending', 'cancelled'].includes(order.status) && (
              <button
                onClick={() => onDelete(order)}
                className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 transition-colors">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-ink-50/80">
          <td colSpan={6} className="px-5 py-3">
            <div className="space-y-1.5">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-ink-200 px-1.5 py-0.5 rounded text-ink-600">
                      {item.product?.sku}
                    </span>
                    <span className="text-ink-700">{item.product?.name}</span>
                    <span className="text-ink-400">× {item.quantity}</span>
                  </div>
                  <span className="text-ink-700 font-medium">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {order.notes && (
                <p className="text-xs text-ink-500 mt-2 pt-2 border-t border-ink-200">
                  Note: {order.notes}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Orders Page ───────────────────────────────────────────────────────────────

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.list({ status: statusFilter || undefined });
      setOrders(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await ordersApi.create(data);
      toast.success('Order placed successfully!');
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await ordersApi.updateStatus(id, status);
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await ordersApi.delete(deleteOrder.id);
      toast.success('Order deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-secondary p-2"><RefreshCw size={16} /></button>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> New Order
            </button>
          </div>
        }
      />

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        {['', ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${statusFilter === s
                ? 'bg-ink-900 text-amber-400'
                : 'bg-white border border-ink-200 text-ink-500 hover:border-ink-400'
              }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="Create your first order to get started."
            action={
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus size={16} /> New Order
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Customer</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Items</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onDelete={setDeleteOrder}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Order" size="lg">
        <OrderForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>

      <ConfirmDialog
        open={!!deleteOrder}
        onClose={() => setDeleteOrder(null)}
        onConfirm={handleDelete}
        danger
        title="Delete Order"
        message={`Delete Order #${deleteOrder?.id}? Stock will be restored if the order is pending.`}
      />
    </div>
  );
}
