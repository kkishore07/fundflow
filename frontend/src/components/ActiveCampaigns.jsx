import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/api";
import RatingStars from "./RatingStars";
import CampaignQRCode from "./CampaignQRCode";
import "../styles/campaign.css";

const ActiveCampaigns = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  const fetchMyCampaigns = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/campaigns/creator/my-campaigns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        sessionStorage.clear();
        navigate("/login");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        const allCampaigns = data.campaigns || [];
        const activeCampaigns = allCampaigns.filter(campaign => campaign.currentAmount < campaign.targetAmount);
        setCampaigns(activeCampaigns);
      } else {
        setError(data.message || "Failed to fetch campaigns");
      }
    } catch (err) {
      setError("Error fetching campaigns");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "dashboard-badge-warning",
      approved: "dashboard-badge-success",
      rejected: "dashboard-badge-danger",
    };
    return badges[status] || "";
  };

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100).toFixed(1);
  };

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2 className="dashboard-title">My Campaigns</h2>
          <button onClick={() => navigate("/creator-dashboard")} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {campaigns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No campaigns yet. Create your first campaign!</p>
            <button onClick={() => navigate("/create-campaign")} className="btn btn-primary" style={{ marginTop: "16px" }}>
              Create Campaign
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="campaign-card" style={{ padding: "0", display: "flex", flexDirection: "column", height: "100%" }}>
                {campaign.image ? (
                  <img 
                    src={`${API_URL}/uploads/${campaign.image}`} 
                    alt={campaign.title}
                    style={{ 
                      width: "100%", 
                      height: "160px", 
                      objectFit: "cover",
                      borderRadius: "12px 12px 0 0"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "160px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    borderRadius: "12px 12px 0 0"
                  }}>🎯</div>
                )}
                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Title and Status */}
                  <div style={{ marginBottom: "8px" }}>
                    <h3 style={{ marginBottom: "6px", fontSize: "16px", fontWeight: "700" }}>{campaign.title}</h3>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <span className={`dashboard-badge ${getStatusBadge(campaign.status)}`} style={{ fontSize: "11px", padding: "3px 8px" }}>
                        {campaign.status.toUpperCase()}
                      </span>
                      {campaign.status === "approved" && campaign.totalRatings > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <RatingStars rating={campaign.averageRating || 0} readOnly size="small" />
                          <span style={{ fontSize: "11px", color: "#666" }}>
                            ({campaign.totalRatings})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ marginBottom: "10px", color: "#666", fontSize: "13px", lineHeight: "1.4" }}>{campaign.description.substring(0, 80)}...</p>

                  {/* Target Amount */}
                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}>Target Amount</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#1f64ff" }}>₹{campaign.targetAmount.toLocaleString('en-IN')}</p>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
                      <span>Progress: {getProgress(campaign.currentAmount, campaign.targetAmount)}%</span>
                      <span style={{ fontWeight: "600" }}>₹{campaign.currentAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          height: "100%", 
                          background: campaign.status === "approved" ? "#1f64ff" : "#ccc",
                          width: `${getProgress(campaign.currentAmount, campaign.targetAmount)}%`,
                          transition: "width 0.3s ease"
                        }} 
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", marginBottom: "12px" }}>
                    <div>
                      <p style={{ color: "#999", marginBottom: "2px" }}>Created:</p>
                      <p style={{ fontWeight: "600" }}>{new Date(campaign.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p style={{ color: "#999", marginBottom: "2px" }}>End Date:</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <p style={{ fontWeight: "600" }}>{new Date(campaign.endDate).toLocaleDateString()}</p>
                        {campaign.isExpired && (
                          <span style={{ 
                            backgroundColor: "#ff6b6b", 
                            color: "white", 
                            padding: "1px 4px", 
                            borderRadius: "2px", 
                            fontSize: "0.7rem",
                            fontWeight: "bold"
                          }}>
                            EXPIRED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {campaign.status === "rejected" && campaign.rejectionReason && (
                    <div style={{ marginTop: "8px", padding: "10px", background: "#fee", borderRadius: "4px", color: "#c00", fontSize: "12px" }}>
                      <strong>Rejection:</strong> {campaign.rejectionReason}
                    </div>
                  )}

                  {/* Buttons Container */}
                  <div style={{ marginTop: "auto", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* Edit button for pending and approved campaigns */}
                    {(campaign.status === "pending" || campaign.status === "approved") && (
                      <button 
                        onClick={() => navigate(`/edit-campaign/${campaign._id}`)}
                        className="btn btn-primary"
                        style={{ width: "100%", padding: "8px 12px", fontSize: "13px" }}
                      >
                        ✏️ Edit
                      </button>
                    )}

                    {/* QR Code for sharing approved campaigns */}
                    {campaign.status === "approved" && (
                      <CampaignQRCode campaignId={campaign._id} campaignTitle={campaign.title} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActiveCampaigns;
