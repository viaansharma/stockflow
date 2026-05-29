import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { customersApi } from '../utils/api';
import {
  Modal, ConfirmDialog, PageLoader, EmptyState,
  FormField, SearchInput, PageHeader
} from '../components/UI';
import { Plus, Pencil, Trash2, User, Mail, Phone, MapPin, RefreshCw } from 'lucide-react';

const EMPTY_FORM = { first_name: '', last_name: '', email: '', phone: '', address: '' };

function CustomerForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading, isEdit }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name" required error={errors.first_name}>
          <input className="input" value={form.first_name} onChange={set('first_name')} placeholder="Jane" />
        </FormField>
        <FormField label="Last Name" required error={errors.last_name}>
          <input className="input" value={form.last_name} onChange={set('last_name')} placeholder="Smith" />
        </FormField>
        <div className="col-span-2">
          <FormField label="Email" required error={errors.email}>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" disabled={isEdit} />
          </FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Phone" error={errors.phone}>
            <input className="input" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
          </FormField>
        </div>
        <div className="col-span-2">
          <FormField label="Address" error={errors.address}>
            <textarea
              className="input resize-none"
              rows={2}
              value={form.address}
              onChange={set('address')}
              placeholder="123 Main St, City, State"
            />
          </FormField>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </form>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customersApi.list({ search: search || undefined });
      setCustomers(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await customersApi.create(data);
      toast.success('Customer added successfully');
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      const { email, ...rest } = data;
      await customersApi.update(editCustomer.id, rest);
      toast.success('Customer updated');
      setEditCustomer(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await customersApi.delete(deleteCustomer.id);
      toast.success('Customer deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} registered customer${customers.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-secondary p-2"><RefreshCw size={16} /></button>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> Add Customer
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." />
      </div>

      {/* Grid view */}
      {loading ? (
        <PageLoader />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add your first customer to start managing orders."
          action={
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> Add Customer
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div key={c.id} className="card p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-sky-500" />
                  </div>
                  <div>
                    <p className="font-medium text-ink-800">
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs text-ink-400">Customer #{c.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditCustomer(c)}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteCustomer(c)}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-ink-500">
                  <Mail size={13} className="flex-shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2 text-ink-500">
                    <Phone size={13} className="flex-shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center gap-2 text-ink-500">
                    <MapPin size={13} className="flex-shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Customer">
        <CustomerForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>

      <Modal open={!!editCustomer} onClose={() => setEditCustomer(null)} title="Edit Customer">
        {editCustomer && (
          <CustomerForm
            initial={{
              first_name: editCustomer.first_name,
              last_name: editCustomer.last_name,
              email: editCustomer.email,
              phone: editCustomer.phone || '',
              address: editCustomer.address || '',
            }}
            isEdit
            onSubmit={handleUpdate}
            onCancel={() => setEditCustomer(null)}
            loading={saving}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        onConfirm={handleDelete}
        danger
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteCustomer?.first_name} ${deleteCustomer?.last_name}"? This cannot be undone.`}
      />
    </div>
  );
}
