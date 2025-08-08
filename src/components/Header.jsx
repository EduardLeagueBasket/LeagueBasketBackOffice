import React from 'react';
import { User, Bell, Search, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';

const Header = ({ setSidebarOpen, currentPage }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="navbar navbar-custom">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-link d-md-none p-0 me-3"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h3 className="mb-0 text-capitalize">{currentPage}</h3>
        </div>

        <div className="d-flex align-items-center">
          <div className="position-relative me-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar..."
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          </div>

          <button className="btn btn-link position-relative me-3 p-2">
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
              3
            </span>
          </button>

          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
              <User size={18} color="white" />
            </div>
            <span className="fw-medium">{user?.name} {user?.lastName}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header; 