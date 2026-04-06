import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";
import { API_URL } from "../utils/api";

const ManageUsers = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(GlobalContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userName = user?.name || sessionStorage.getItem("userName");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please login to view users.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setError("");
      } else {
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          sessionStorage.clear();
          setError("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        if (response.status === 403) {
          setError("Access denied. Admin account required to view users.");
          return;
        }

        setError(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Unable to load users. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const creatorCount = users.filter(u => u.role === "creator").length;
  const userCount = users.filter(u => u.role === "user").length;

  const normalizedQuery = query.trim().toLowerCase();
  const filteredUsers = users.filter(u => {
    const matchesQuery =
      !normalizedQuery ||
      u.name?.toLowerCase().includes(normalizedQuery) ||
      u.email?.toLowerCase().includes(normalizedQuery) ||
      u._id?.toLowerCase().includes(normalizedQuery);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-nav-top">
            <h1 className="dashboard-logo">CrowdFunding</h1>
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">Welcome, <strong>{userName}</strong></span>
              <span className="dashboard-badge dashboard-badge-admin">Admin</span>
              <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="dashboard-main manage-users-page">
        <div className="manage-users-hero">
          <div>
            <h2 className="dashboard-title" style={{ marginBottom: "6px" }}>Manage Users</h2>
            <p className="dashboard-subtitle">Search, filter, and review user accounts in one place.</p>
          </div>
          <button onClick={() => navigate("/admin-dashboard")} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>

        <div className="users-stats">
          <div className="users-stat-card">
            <p className="users-stat-label">Total Users</p>
            <h3 className="users-stat-value">{totalUsers}</h3>
          </div>
          <div className="users-stat-card">
            <p className="users-stat-label">Admins</p>
            <h3 className="users-stat-value">{adminCount}</h3>
          </div>
          <div className="users-stat-card">
            <p className="users-stat-label">Creators</p>
            <h3 className="users-stat-value">{creatorCount}</h3>
          </div>
          <div className="users-stat-card">
            <p className="users-stat-label">Donors</p>
            <h3 className="users-stat-value">{userCount}</h3>
          </div>
        </div>

        <div className="users-panel">
          {error && <div className="alert alert-error" style={{ marginBottom: "12px" }}>{error}</div>}

          <div className="users-toolbar">
            <div className="users-search">
              <input
                className="input"
                type="text"
                placeholder="Search by name, email, or id"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="users-filter">
              <select
                className="input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="creator">Creator</option>
                <option value="user">Donor</option>
              </select>
            </div>
            <div className="users-count">
              Showing {filteredUsers.length} of {totalUsers}
            </div>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div className="users-name">
                            <div className="users-avatar">{u.name?.charAt(0)?.toUpperCase() || "U"}</div>
                            <div>
                              <div className="users-name-text">{u.name}</div>
                              <div className="users-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`users-role users-role-${u.role}`}>{u.role}</span>
                        </td>
                        <td>
                          <span className="users-status">Active</span>
                        </td>
                        <td>
                          <span className="users-id">{u._id}</span>
                        </td>
                        <td>
                          <div className="users-actions">
                            <button className="btn btn-small btn-ghost">Edit</button>
                            <button className="btn btn-small btn-danger">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;
