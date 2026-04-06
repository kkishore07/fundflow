import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../utils/api";
import "../styles/campaign.css";

const buildAnalyticsFromCampaigns = (campaigns) => {
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const totalCampaigns = safeCampaigns.length;
  const approvedCampaigns = safeCampaigns.filter((campaign) => campaign.status === "approved").length;
  const pendingCampaigns = safeCampaigns.filter((campaign) => campaign.status === "pending").length;
  const rejectedCampaigns = safeCampaigns.filter((campaign) => campaign.status === "rejected").length;

  const totalRaised = safeCampaigns.reduce((sum, campaign) => sum + (Number(campaign.currentAmount) || 0), 0);
  const totalTarget = safeCampaigns.reduce((sum, campaign) => sum + (Number(campaign.targetAmount) || 0), 0);
  const totalDonations = safeCampaigns.reduce((sum, campaign) => sum + (Number(campaign.donationCount) || 0), 0);
  const averageProgress = totalTarget > 0 ? Number(((totalRaised / totalTarget) * 100).toFixed(1)) : 0;

  const topCampaigns = safeCampaigns
    .filter((campaign) => campaign.status === "approved")
    .sort((first, second) => {
      const firstTarget = Number(first.targetAmount) || 1;
      const secondTarget = Number(second.targetAmount) || 1;
      return (Number(second.currentAmount) || 0) / secondTarget - (Number(first.currentAmount) || 0) / firstTarget;
    })
    .slice(0, 5)
    .map((campaign) => ({
      _id: campaign._id,
      title: campaign.title,
      targetAmount: Number(campaign.targetAmount) || 0,
      currentAmount: Number(campaign.currentAmount) || 0,
      donationCount: Number(campaign.donationCount) || 0,
    }));

  return {
    totalCampaigns,
    approvedCampaigns,
    pendingCampaigns,
    rejectedCampaigns,
    totalRaised,
    totalTarget,
    totalDonations,
    averageProgress,
    topCampaigns,
  };
};

const Analytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = sessionStorage.getItem("token");

    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/campaigns/creator/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        sessionStorage.clear();
        navigate("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        setError("");
        return;
      }

      throw new Error("Primary analytics endpoint failed");
    } catch (err) {
      try {
        const fallbackResponse = await fetch(`${API_URL}/api/campaigns/creator/my-campaigns`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (fallbackResponse.status === 401) {
          sessionStorage.clear();
          navigate("/login");
          return;
        }

        const fallbackData = await fallbackResponse.json();
        if (!fallbackResponse.ok) {
          setError(fallbackData.message || "Failed to fetch analytics");
          return;
        }

        const computedAnalytics = buildAnalyticsFromCampaigns(fallbackData.campaigns || []);
        setAnalytics(computedAnalytics);
        setError("");
      } catch (fallbackError) {
        setError("Error fetching analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;
  if (error) return <div className="dashboard-container"><div className="alert alert-error">{error}</div></div>;

  const safeTotalTarget = analytics.totalTarget || 0;
  const safeTotalRaised = analytics.totalRaised || 0;
  const totalProgress = safeTotalTarget > 0 ? Math.min((safeTotalRaised / safeTotalTarget) * 100, 100) : 0;
  const topCampaigns = Array.isArray(analytics.topCampaigns) ? analytics.topCampaigns : [];
  const maxTopTarget = Math.max(...topCampaigns.map(c => c.targetAmount || 0), 1);

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Analytics Dashboard</h2>
          <button onClick={() => navigate("/creator-dashboard")} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>

        <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-primary">📊</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">{analytics.totalCampaigns}</h3>
              <p className="dashboard-card-description">Total Campaigns</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-success">✅</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">{analytics.approvedCampaigns}</h3>
              <p className="dashboard-card-description">Approved</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-warning">⏳</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">{analytics.pendingCampaigns}</h3>
              <p className="dashboard-card-description">Pending</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-danger">❌</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">{analytics.rejectedCampaigns}</h3>
              <p className="dashboard-card-description">Rejected</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-success">💰</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">₹{analytics.totalRaised.toLocaleString('en-IN')}</h3>
              <p className="dashboard-card-description">Total Raised</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-primary">🎯</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">₹{analytics.totalTarget.toLocaleString('en-IN')}</h3>
              <p className="dashboard-card-description">Total Target</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-purple">💝</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">{analytics.totalDonations}</h3>
              <p className="dashboard-card-description">Total Donations</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-icon-orange">📈</div>
            <div className="dashboard-card-content">
              <h3 className="dashboard-card-title">{analytics.averageProgress}%</h3>
              <p className="dashboard-card-description">Avg Progress</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
          <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <h3 className="dashboard-card-title" style={{ margin: 0 }}>Overall Progress</h3>
              <span style={{ fontSize: "12px", color: "#666" }}>
                ₹{safeTotalRaised.toLocaleString('en-IN')} / ₹{safeTotalTarget.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ height: "10px", background: "#e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${totalProgress}%`, background: "var(--primary)", transition: "width 0.3s ease" }} />
            </div>
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>{totalProgress.toFixed(1)}% of total target raised</div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
          <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
            <h3 className="dashboard-card-title" style={{ marginBottom: "12px" }}>Campaign Status Breakdown</h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {[
                { label: "Approved", value: analytics.approvedCampaigns, color: "#10b981" },
                { label: "Pending", value: analytics.pendingCampaigns, color: "#f59e0b" },
                { label: "Rejected", value: analytics.rejectedCampaigns, color: "#ef4444" },
              ].map((item) => {
                const total = analytics.totalCampaigns || 1;
                const percent = Math.min((item.value / total) * 100, 100);
                return (
                  <div key={item.label} style={{ display: "grid", gridTemplateColumns: "120px 1fr 48px", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>{item.label}</span>
                    <div style={{ height: "8px", background: "#f3f4f6", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${percent}%`, background: item.color }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#666", textAlign: "right" }}>{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {analytics.topCampaigns && analytics.topCampaigns.length > 0 && (
          <div>
            <h3 style={{ marginBottom: "16px" }}>Top Performing Campaigns</h3>
            <div style={{ display: "grid", gap: "16px" }}>
              {analytics.topCampaigns.map((campaign) => {
                const progress = campaign.targetAmount > 0 ? Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100) : 0;
                const barWidth = Math.max(((campaign.targetAmount || 0) / maxTopTarget) * 100, 5);
                return (
                <div key={campaign._id} className="campaign-card" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: "8px" }}>{campaign.title}</h4>
                      <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#666" }}>
                        <span>Target: ₹{campaign.targetAmount.toLocaleString('en-IN')}</span>
                        <span>Raised: ₹{campaign.currentAmount.toLocaleString('en-IN')}</span>
                        <span>Donations: {campaign.donationCount}</span>
                      </div>
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ height: "8px", background: "#f3f4f6", borderRadius: "6px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: "var(--primary)" }} />
                        </div>
                        <div style={{ marginTop: "6px", fontSize: "12px", color: "#666" }}>{progress.toFixed(1)}% funded</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
                        {((campaign.currentAmount / campaign.targetAmount) * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>Progress</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>Relative Target Size</div>
                    <div style={{ height: "6px", background: "#eef2ff", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${barWidth}%`, background: "#6366f1" }} />
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
