import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadLogo, clearUpload } from '../../store/uploads/uploadLogoSlice';

const UploadNationalTeamLogoModal = ({ show, onClose, onUploaded, referenceId, reloadData, folder, type }) => {
  const dispatch = useDispatch();
  const { loading = false, progress = 0, url = '', error = null, processComplete = false
  } = useSelector(state => state.uploadLogo || {});
  const fileInputRef = useRef();

  useEffect(() => {
    if (!show || !processComplete || !url) return;
    onUploaded(url);
    dispatch(clearUpload());
    reloadData();
    onClose();
  }, [show, processComplete, url, onUploaded, onClose, reloadData, dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    dispatch(uploadLogo({ file, folder, referenceId, type }));
  };

  const handleClose = () => {
    dispatch(clearUpload());
    reloadData()
    onClose();
  };

  const handleUseLogo = () => {
    if (url) {
      onUploaded(url);
      handleClose();
    }
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
                disabled={loading}
              />

              {loading && (
                <div className="progress mb-3">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {progress}%
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger text-center">
                  {error}
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
                disabled={!url}
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