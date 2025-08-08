import ButtonNavigation from '../../components/Button/ButtonNavigation';

const Teams = () => {
  return (

    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Gestión de Equipos</h4>
          <ButtonNavigation url="/teams/add" icon="bi bi-plus-lg" text="Crear nuevo equipo" />
        </div>

        <div className="card-body">
          <div className="table-responsive"></div>
        </div>
      </div>
    </div>
  );
};

export default Teams;