import React from 'react';

const emptyVariant = () => ({
  sku: '',
  talla: '',
  precio: '',
  stock: '',
  activo: true,
});

export function mapVariantToApi(v) {
  const atributos = {};
  if (v.talla?.trim()) atributos.talla = v.talla.trim();
  return {
    sku: v.sku.trim(),
    atributos,
    precio: Number(v.precio),
    stock: Number(v.stock),
    activo: v.activo !== false,
  };
}

export function mapVariantFromApi(v) {
  const attrs = v.atributos || {};
  return {
    sku: v.sku || '',
    talla: attrs.talla || attrs.size || '',
    precio: v.precio ?? '',
    stock: v.stock ?? '',
    activo: v.activo !== false,
  };
}

export default function ProductVariantEditor({
  variantes,
  onChange,
  disabled = false,
}) {
  const updateVariant = (index, field, value) => {
    const next = variantes.map((v, i) =>
      i === index ? { ...v, [field]: value } : v,
    );
    onChange(next);
  };

  const addVariant = () => onChange([...variantes, emptyVariant()]);

  const removeVariant = (index) => {
    if (variantes.length <= 1) return;
    onChange(variantes.filter((_, i) => i !== index));
  };

  return (
    <div className="retail-variants">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0">Variantes (SKU, precio, stock) *</label>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={addVariant}
          disabled={disabled}
        >
          <i className="bi bi-plus-lg me-1" />
          Agregar variante
        </button>
      </div>
      {variantes.map((v, index) => (
        <div key={index} className="card mb-2 border">
          <div className="card-body py-3">
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label small">SKU *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={v.sku}
                  onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                  disabled={disabled}
                  placeholder="JER-L-M"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Talla / atributo</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={v.talla}
                  onChange={(e) => updateVariant(index, 'talla', e.target.value)}
                  disabled={disabled}
                  placeholder="M"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Precio *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control form-control-sm"
                  value={v.precio}
                  onChange={(e) => updateVariant(index, 'precio', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label small">Stock *</label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-sm"
                  value={v.stock}
                  onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`variant-active-${index}`}
                    checked={v.activo !== false}
                    onChange={(e) =>
                      updateVariant(index, 'activo', e.target.checked)
                    }
                    disabled={disabled}
                  />
                  <label
                    className="form-check-label small"
                    htmlFor={`variant-active-${index}`}
                  >
                    Activa
                  </label>
                </div>
              </div>
              <div className="col-md-1 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeVariant(index)}
                  disabled={disabled || variantes.length <= 1}
                  title="Eliminar variante"
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { emptyVariant };
