'use client';

import { useState } from 'react';
import { createProduct, updateProduct } from '@/lib/api';
import type { Product } from '@/lib/types';

interface Props {
  product: Product | null; // null = creating a new product
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductForm({ product, onClose, onSaved }: Props) {
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [stock, setStock] = useState(product ? String(product.stock) : '0');
  const [description, setDescription] = useState(product?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const input = {
      name,
      category,
      brand,
      price: Number(price),
      stock: Number(stock),
      description: description || null,
    };
    try {
      if (product) await updateProduct(product.id, input);
      else await createProduct(input);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the product');
      setSaving(false);
    }
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>{product ? `Edit product ${product.id}` : 'Add product'}</h2>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="brand">Brand</label>
            <input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="price">Price (USD)</label>
            <input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="stock">Stock</label>
            <input id="stock" type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </div>
    </div>
  );
}
