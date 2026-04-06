import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GlobalContext from "../context/GlobalContext";
import { API_URL } from "../utils/api";
import "../styles/campaign.css";

const EditCampaign = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    endDate: "",
    image: null,
  });

  const token = sessionStorage.getItem("token");
  const sessionUserId = sessionStorage.getItem("userId");
  const sessionRole = sessionStorage.getItem("role");
  const currentUserId = user?.id || sessionUserId;
  const isCreatorOrAdmin = sessionRole === "creator" || sessionRole === "admin";

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!isCreatorOrAdmin) {
      toast.error("Creators only");
      navigate("/user-dashboard");
      return;
    }

    const fetchCampaign = async () => {
      try {
        console.log("Fetching campaign:", campaignId);
        const response = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          toast.error("Campaign not found");
          navigate("/active-campaigns");
          return;
        }

        const data = await response.json();
        console.log("Campaign data:", data);
        setCampaign(data.campaign);

        // Check if user is the creator (compare as strings)
        const creatorId = typeof data.campaign.creator === "object" 
          ? data.campaign.creator._id || data.campaign.creator 
          : data.campaign.creator;
        
        if (creatorId?.toString() !== currentUserId?.toString()) {
          toast.error("You can only edit your own campaigns");
          navigate("/active-campaigns");
          return;
        }

        // Check if campaign is pending or approved
        if (data.campaign.status !== "pending" && data.campaign.status !== "approved") {
          toast.error("You can only edit pending or approved campaigns");
          navigate("/active-campaigns");
          return;
        }

        // Populate form with campaign data
        setFormData({
          title: data.campaign.title,
          description: data.campaign.description,
          targetAmount: data.campaign.targetAmount,
          endDate: data.campaign.endDate.split("T")[0],
          image: null,
        });

        // Set image preview if exists
        if (data.campaign.image) {
          setImagePreview(`${API_URL}/uploads/${data.campaign.image}`);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        toast.error("Failed to load campaign");
        navigate("/active-campaigns");
      }
    };

    fetchCampaign();
  }, [campaignId, token, isCreatorOrAdmin, currentUserId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only image files are allowed (jpeg, jpg, png, gif, webp)");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.targetAmount || !formData.endDate) {
      toast.error("All fields required");
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("targetAmount", formData.targetAmount);
      submitData.append("endDate", formData.endDate);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Campaign updated successfully!");
        setTimeout(() => navigate("/active-campaigns"), 800);
      } else {
        toast.error(result.message || "Failed to update campaign");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Error updating campaign");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading campaign...</p></div>;
  }

  if (!campaign) {
    return <div className="dashboard-container"><p>Campaign not found</p></div>;
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Edit Campaign</h2>
        </div>
        <div className="campaign-form-container">
          <form onSubmit={handleSubmit} className="campaign-form">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Campaign title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Describe your campaign"
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Amount (₹) *</label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                className="input"
                placeholder="10000"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campaign Image</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                className="input"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              />
              {imagePreview && (
                <div style={{ marginTop: "10px", position: "relative" }}>
                  <img
                    src={imagePreview}
                    alt="Campaign preview"
                    style={{ maxWidth: "300px", maxHeight: "200px", borderRadius: "8px" }}
                  />
                  {formData.image && (
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        marginTop: "5px",
                        padding: "5px 10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => navigate("/creator-dashboard")} className="btn btn-secondary btn-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default EditCampaign;
