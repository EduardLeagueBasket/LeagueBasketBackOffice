import { useNavigate } from 'react-router-dom';

export default function ButtonNavigation({ url, icon, text, disabled = false }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="btn btn-outline-primary mb-2"
      disabled={disabled}
      onClick={() => {
        if (!disabled) navigate(url);
      }}
    >
      <i className={icon}></i>&nbsp;
      {text}
    </button>
  );
}