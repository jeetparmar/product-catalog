import type { Product } from '@/lib/types';

interface Props {
  items: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function ProductTable({ items, onEdit, onDelete }: Props) {
  if (items.length === 0) {
    return <div className="empty">No products on this page. Use “Add product” to create one.</div>;
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="num">ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Brand</th>
            <th className="num">Price</th>
            <th className="num">Stock</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td className="num">{p.id}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.brand}</td>
              <td className="num">{money.format(p.price)}</td>
              <td className="num">{p.stock}</td>
              <td className="actions">
                <button className="btn small" onClick={() => onEdit(p)}>Edit</button>
                <button className="btn small danger" onClick={() => onDelete(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
