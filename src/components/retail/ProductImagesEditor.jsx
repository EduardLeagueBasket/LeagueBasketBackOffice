import React, { useEffect, useRef } from 'react';

export default function ProductImagesEditor({
  imagenes,
  onChange,
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const imagenesRef = useRef(imagenes);
  imagenesRef.current = imagenes;

  useEffect(() => {
    return () => {
      imagenesRef.current.forEach((img) => {
        if (img.url?.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = [...imagenes];
    files.forEach((file) => {
      const isFirst = next.length === 0;
      next.push({
        url: URL.createObjectURL(file),
        file,
        principal: isFirst && !next.some((i) => i.principal),
      });
    });
    onChange(next);
    e.target.value = '';
  };

  const setPrincipal = (index) => {
    onChange(
      imagenes.map((img, i) => ({
        ...img,
        principal: i === index,
      })),
    );
  };

  const removeImage = (index) => {
    const removed = imagenes[index];
    if (removed?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(removed.url);
    }
    const next = imagenes.filter((_, i) => i !== index);
    if (next.length && !next.some((i) => i.principal)) {
      next[0] = { ...next[0], principal: true };
    }
    onChange(next);
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0">Imágenes</label>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <i className="bi bi-image me-1" />
          Añadir imagen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="d-none"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
      {imagenes.length === 0 ? (
        <p className="text-muted small mb-0">
          Sin imágenes. Se subirán al guardar el producto.
        </p>
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {imagenes.map((img, index) => (
            <div key={`${img.url}-${index}`} className="retail-image-thumb position-relative">
              <img src={img.url} alt="" className="rounded border" />
              {img.principal && (
                <span className="badge bg-primary position-absolute top-0 start-0 m-1">
                  Principal
                </span>
              )}
              {img.file && (
                <span className="badge bg-secondary position-absolute top-0 end-0 m-1">
                  Pendiente
                </span>
              )}
              <div className="btn-group btn-group-sm w-100 mt-1">
                {!img.principal && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setPrincipal(index)}
                    disabled={disabled}
                  >
                    Principal
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
