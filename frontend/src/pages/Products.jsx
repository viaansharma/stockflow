import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { productsApi } from '../utils/api';
import {
  Modal, ConfirmDialog, PageLoader, EmptyState,
  StockBadge, FormField, SearchInput, PageHeader
} from '../components/UI';
import { Plus, Pencil, Trash2, Package, RefreshCw } from 'lucide-react';

const EMPTY_FORM = {
  name: '', sku: '', description: '', price: '', stock_quantity: '', category: ''
};

function ProductForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price required';
    if (form.stock_quantity === '' || isNaN(form.stock_quantity) || Number(form.stock_quantity) < 0)
      e.stock_quantity = 'Valid stock quantity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity, 10),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FormField label="Product Name" required error={errors.name}>
            <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Wireless Keyboard" />
          </FormField>
        </div>
        <FormField label="SKU" required error={errors.sku}>
          <input className="input font-mono" value={form.sku} onChange={set('sku')} placeholder="e.g. KB-001" />
        </FormField>
        <FormField label="Category" error={errors.category}>
          <input className="input" value={form.category} onChange={set('category')} placeholder="e.g. Electronics" />
        </FormField>
        <FormField label="Price ($)" required error={errors.price}>
          <input className="input" type="number" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" />
        </FormField>
        <FormField label="Stock Quantity" required error={errors.stock_quantity}>
          <input className="input" type="number" value={form.stock_quantity} onChange={set('stock_quantity')} placeholder="0" />
        </FormField>
        <div className="col-span-2">
          <FormField label="Description" error={errors.description}>
            <textarea
              className="input resize-none"
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="Optional product description..."
            />
          </FormField>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productsApi.list({ search: search || undefined });
      setProducts(res.data);
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
      await productsApi.create(data);
      toast.success('Product created successfully');
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
      await productsApi.update(editProduct.id, data);
      toast.success('Product updated');
      setEditProduct(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productsApi.delete(deleteProduct.id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Products"
        subtitle={`${products.length} product${products.length !== 1 ? 's' : ''} in inventory`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-secondary p-2">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> Add Product
            </button>
          </div>
        }
      />

      {/* Search */}
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or SKU..." />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Add your first product to start managing inventory."
            action={
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus size={16} /> Add Product
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={14} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium text-ink-800">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-ink-400 truncate max-w-48">{p.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs bg-ink-100 px-2 py-1 rounded-md text-ink-600">{p.sku}</span>
                    </td>
                    <td className="px-4 py-3.5 text-ink-600">{p.category || '—'}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-ink-800">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-ink-700">{p.stock_quantity}</td>
                    <td className="px-4 py-3.5 text-center">
                      <StockBadge quantity={p.stock_quantity} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteProduct(p)}
                          className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Product" size="md">
        <ProductForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="md">
        {editProduct && (
          <ProductForm
            initial={{
              name: editProduct.name,
              sku: editProduct.sku,
              description: editProduct.description || '',
              price: String(editProduct.price),
              stock_quantity: String(editProduct.stock_quantity),
              category: editProduct.category || '',
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditProduct(null)}
            loading={saving}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        danger
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
