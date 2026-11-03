import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Modal SOLO para seleccionar un archivo y previsualizarlo localmente.
 * No sube nada al backend: la subida se hace al Crear/Actualizar.
 */
const UploadNationalTeamLogoModal = ({ show, onClose, onUploaded }) => {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return '';
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!show) return;
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [show]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleUseLogo = () => {
    if (!selectedFile) return;
    onUploaded(selectedFile);
    handleClose();
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Subir Logo de Equipo Nacional</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="form-control mb-3"
                onChange={handleFileChange}
                disabled={false}
              />

              {previewUrl && (
                <div className="text-center">
                  <img
                    src={previewUrl}
                    alt="Preview logo"
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: 180 }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUseLogo}
                disabled={!selectedFile}
              >
                Usar Logo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadNationalTeamLogoModal; 