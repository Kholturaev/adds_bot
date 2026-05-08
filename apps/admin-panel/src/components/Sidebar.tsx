import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <h1>Adds-bot Admin</h1>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/ads"
        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
      >
        Ads Queue
      </NavLink>
      <NavLink
        to="/catalog"
        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
      >
        Catalog
      </NavLink>
      <button className="danger" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
