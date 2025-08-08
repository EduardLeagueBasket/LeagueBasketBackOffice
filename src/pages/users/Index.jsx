import React, { useState, useEffect } from 'react';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../store/usersSlice';
import { mapProfileName } from '../../utils/MapRoleName';
import GenericTable from '../../components/Table.jsx/GenericTable';

const Users = () => {
  //const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users = [], loading = false, pagination = { currentPage: 1, totalPages: 0, totalUsers: 0, limit: 5 } } = useSelector((state) => state.users || {});
  const { user: currentUser } = useSelector((state) => state.auth);
  const isSuperAdmin = currentUser?.profile?.name === 'SUPER_ADMIN';
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeTab, setActiveTab] = useState('manager-teams');
  const [typeUser, setTypeUser] = useState(!isSuperAdmin ? 'manager-teams' : 'league-assistants');

  const handleGetUsers = async () => {
    const params = {
      page: currentPage,
      limit: isSuperAdmin ? pageSize : 100,
      search: searchTerm,
      sortField: sortField,
      sortDirection: sortDirection,
      typeUser: typeUser
    };
    await dispatch(getUsers(params));
  };

  useEffect(() => {
    handleGetUsers();
  }, [currentPage, pageSize, sortField, sortDirection, typeUser]);

  const handleSearch = () => {
    setSearchTerm(searchTerm.trim());
    setCurrentPage(1);
    handleGetUsers();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTypeUser(tab);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Gestión de Usuarios</h4>
          <ButtonNavigation url="/users/add" icon="bi bi-plus-lg" text="Agregar Usuario" />
        </div>

        <div className="card-body">
          <div className="table-responsive">
            {
              isSuperAdmin && (
                <div className="mb-3 d-flex">
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Buscar liga..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? "Buscando..." : "Buscar"}
                  </button>
                </div>

              )
            }
            <GenericTable
              columns={[
                { header: 'Nombre', accessor: 'name', cell: (item) => `${item.name} ${item.lastName}` },
                { header: 'Email', accessor: 'email' },
                {
                  header: 'Perfil',
                  accessor: 'profile.name',
                  cell: (item) => mapProfileName(item.profile?.name ?? '--')
                },
                { header: 'Estado', accessor: 'status' },
                { header: 'Teléfono', accessor: 'phone' },
              ]}
              data={users}
              onEdit={(item) => console.log("Editar", item)}
              onDelete={(item) => console.log("Eliminar", item)}
              loading={loading}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
