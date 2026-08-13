import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadLogo, clearUpload } from '../../store/uploads/uploadLogoSlice';

const UploadProductImageModal = ({ show, onClose, onUploaded }) => {
  const dispatch = useDispatch();
  const {
    loading = false,
    progress = 0,
    url = '',
    error = null,
    processComplete = false,
  } = useSelector((state) => state.uploadLogo || {});
  const fileInputRef = useRef();

  useEffect(() => {
    if (!show || !processComplete || !url) return;
    onUploaded(url);
    dispatch(clearUpload());
    onClose();
  }, [show, processComplete, url, onUploaded, onClose, dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    dispatch(
      uploadLogo({
        file,
        folder: 'product-images',
        referenceId: 'product',
        type: 'product',
      }),
    );
  };

  const handleClose = () => {
    dispatch(clearUpload());
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
      <div
        className="modal fade show"
        style={{ display: 'block', zIndex: 1050 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Subir imagen de producto</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Cerrar"
              />
            </div>
            <div className="modal-body">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="form-control mb-3"
                onChange={handleFileChange}
                disabled={loading}
              />
              {loading && (
                <div className="progress mb-3">
                  <div
                    className="progress-bar"
                    style={{ width: `${progress}%` }}
                  >
                    {progress}%
                  </div>
                </div>
              )}
              {error && (
                <div className="alert alert-danger">
                  {typeof error === 'string' ? error : 'Error al subir'}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadProductImageModal;
