import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../context/GlobalContext";

const Settings = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(GlobalContext);
  const userName = user?.name || sessionStorage.getItem("userName");

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

      <main className="dashboard-main settings-page">
        <div className="settings-hero">
          <div>
            <p className="settings-kicker">Admin Controls</p>
            <h2 className="dashboard-title" style={{ marginBottom: "6px" }}>Settings</h2>
            <p className="dashboard-subtitle">Configure your crowdfunding platform settings here.</p>
          </div>
          <button onClick={() => navigate("/admin-dashboard")} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>

        <div className="settings-panel">
          <div className="settings-panel-header">
            <h3>Platform Settings</h3>
            <span className="settings-badge">Read only</span>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label htmlFor="commission">Commission Rate (%)</label>
              <input className="input" type="number" id="commission" defaultValue="5" disabled />
            </div>

            <div className="settings-field">
              <label htmlFor="minDonation">Minimum Donation Amount ($)</label>
              <input className="input" type="number" id="minDonation" defaultValue="1" disabled />
            </div>

            <div className="settings-field">
              <label htmlFor="maxDonation">Maximum Donation Amount ($)</label>
              <input className="input" type="number" id="maxDonation" defaultValue="10000" disabled />
            </div>

            <div className="settings-field">
              <label htmlFor="campaignTimeout">Campaign Duration (days)</label>
              <input className="input" type="number" id="campaignTimeout" defaultValue="30" disabled />
            </div>
          </div>

          <div className="settings-actions">
            <button className="btn btn-primary" disabled>Save Settings</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
