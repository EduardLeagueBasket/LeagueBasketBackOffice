import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword, clearAuthState } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import { Eye, EyeOff } from 'lucide-react';

const ForceChangePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector(state => state.auth);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa ambos campos.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Las contraseñas no coinciden.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (!strongPasswordRegex.test(password)) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña débil',
        html: `
          <p>La contraseña debe cumplir con los siguientes requisitos:</p>
          <ul class="text-left">
            <li>Mínimo 8 caracteres</li>
            <li>Al menos una mayúscula</li>
            <li>Al menos una minúscula</li>
            <li>Al menos un número</li>
            <li>Al menos un carácter especial</li>
          </ul>
        `,
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      await dispatch(updatePassword({ userId: user.id, newPassword: password })).unwrap();
      dispatch(clearAuthState());

      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña ha sido actualizada correctamente.',
        confirmButtonText: 'Continuar'
      }).then(() => {
        navigate('/'); // Redirigir al dashboard
      });
    } catch (errorMessages) {
      // Mostrar errores de validación del backend
      const errorList = Array.isArray(errorMessages)
        ? errorMessages.map(msg => `<li>${msg}</li>`).join('')
        : `<li>${errorMessages}</li>`;

      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        html: `
          <p>Por favor corrige los siguientes errores:</p>
          <ul class="text-left">
            ${errorList}
          </ul>
        `,
        confirmButtonText: 'Entendido'
      });
    }
  };

  return (
    <div className="login-bg vh-100 d-flex align-items-center justify-content-center login-page-bg">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h4 className="mb-3 text-center">Actualizar Contraseña</h4>
        <p className="text-muted text-center">Por seguridad, debes actualizar tu contraseña antes de continuar.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nueva Contraseña</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                style={{ zIndex: 10, border: 'none', background: 'none' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirmar Nueva Contraseña</label>
            <div className="position-relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                style={{ zIndex: 10, border: 'none', background: 'none' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <ClipLoader color="#fff" size={20} /> : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePassword;
