import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import GlobalContext from "../../context/GlobalContext";
import { API_URL } from "../../utils/api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(GlobalContext);
  const userName = user?.name || sessionStorage.getItem("userName");
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [campaignError, setCampaignError] = useState("");
  const [campaignLoading, setCampaignLoading] = useState(true);

  useEffect(() => {
    const fetchTopCampaigns = async () => {
      try {
        const response = await fetch(`${API_URL}/api/campaigns?status=approved`);
        const data = await response.json();
        if (response.ok) {
          const campaigns = Array.isArray(data.campaigns) ? data.campaigns : [];
          const now = new Date();
          const activeCampaigns = campaigns.filter((campaign) => {
            const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
            return !campaign.isExpired && (!endDate || endDate > now);
          });
          setTopCampaigns(activeCampaigns.slice(0, 3));
        } else {
          setCampaignError(data.message || "Failed to load campaigns");
        }
      } catch (error) {
        setCampaignError("Failed to load campaigns");
      } finally {
        setCampaignLoading(false);
      }
    };

    fetchTopCampaigns();
  }, []);

  return (
    <div className="dashboard-container donor-dashboard">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-nav-top">
            <h1 className="dashboard-logo">CrowdFunding</h1>
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">
                Welcome, <strong>{userName}</strong>
              </span>
              <span className="dashboard-badge dashboard-badge-user">Donor</span>
              <button onClick={handleLogout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="dashboard-main donor-dashboard-main">
        <section className="donor-hero">
          <div>
            <p className="donor-hero-tag">Donor Dashboard</p>
            <h2 className="donor-hero-title">Welcome back, {userName || "Donor"}.</h2>
            <p className="donor-hero-subtitle">
              Pick a cause that speaks to you and make an impact today.
            </p>
            <div className="donor-hero-actions">
              <button className="btn btn-primary" onClick={() => navigate("/campaigns")}>
                Explore Campaigns
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/my-donations")}>
                View My Donations
              </button>
            </div>
          </div>
          <div className="donor-hero-card">
            <div className="donor-hero-card-icon">✨</div>
            <div>
              <p className="donor-hero-card-title">Make every rupee count</p>
              <p className="donor-hero-card-text">
                Discover verified campaigns and track your contributions in real time.
              </p>
            </div>
          </div>
        </section>

        <section className="donor-quick-actions">
          <button
            className="donor-action-card"
            onClick={() => navigate("/campaigns")}
            type="button"
          >
            <span className="donor-action-icon">🔍</span>
            <span>
              <strong>Browse Campaigns</strong>
              <small>Discover new causes</small>
            </span>
          </button>
          <button
            className="donor-action-card"
            onClick={() => navigate("/my-donations")}
            type="button"
          >
            <span className="donor-action-icon">💳</span>
            <span>
              <strong>My Donations</strong>
              <small>Track your impact</small>
            </span>
          </button>
          <button className="donor-action-card" type="button">
            <span className="donor-action-icon">👤</span>
            <span>
              <strong>Profile Settings</strong>
              <small>Update your details</small>
            </span>
          </button>
        </section>

        <section className="donor-top-campaigns">
          <div className="donor-section-header">
            <div>
              <h3>Top Campaigns</h3>
              <p>Fresh campaigns needing your support.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate("/campaigns")}>
              View All
            </button>
          </div>

          {campaignLoading && <p>Loading campaigns...</p>}
          {campaignError && <p className="alert alert-error">{campaignError}</p>}

          {!campaignLoading && !campaignError && topCampaigns.length === 0 && (
            <p className="donor-empty">No campaigns available.</p>
          )}

          {!campaignLoading && !campaignError && topCampaigns.length > 0 && (
            <div className="donor-campaign-grid">
              {topCampaigns.map((campaign) => {
                const isTargetReached = campaign.currentAmount >= campaign.targetAmount;
                const progress = Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100);
                return (
                  <div key={campaign._id} className="donor-campaign-card">
                    {campaign.image ? (
                      <img
                        src={`${API_URL}/uploads/${campaign.image}`}
                        alt={campaign.title}
                        className="donor-campaign-image"
                      />
                    ) : (
                      <div className="donor-campaign-placeholder">🎯</div>
                    )}
                    <div className="donor-campaign-body">
                      <h4 className="donor-campaign-title">{campaign.title}</h4>
                      <p className="donor-campaign-description">{campaign.description || "No description available."}</p>
                      <div className="donor-campaign-progress">
                        <div className="donor-progress-track">
                          <div className="donor-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="donor-progress-text">
                          <span>₹{campaign.currentAmount.toLocaleString("en-IN")}</span>
                          <span>of ₹{campaign.targetAmount.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="donor-campaign-meta">
                        <span className="donor-campaign-creator">by {campaign.creatorName || "Creator"}</span>
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate(`/campaign/${campaign._id}/donate`)}
                          disabled={isTargetReached}
                        >
                          {isTargetReached ? "Target Reached" : "Donate"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
