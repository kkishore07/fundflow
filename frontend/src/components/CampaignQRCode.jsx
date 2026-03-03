import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const CampaignQRCode = ({ campaignId, campaignTitle }) => {
  const [showQR, setShowQR] = useState(false);
  
  // Generate the full URL for the campaign
  const campaignUrl = `${window.location.origin}/campaign/${campaignId}/donate`;

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${campaignId}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `${campaignTitle}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(campaignUrl);
    alert("Campaign link copied to clipboard!");
  };

  return (
    <div className="campaign-qr">
      <button 
        onClick={() => setShowQR(!showQR)}
        className="btn btn-secondary campaign-qr-toggle"
        type="button"
      >
        {showQR ? "Hide QR Code" : "Share QR Code"}
      </button>

      {showQR && (
        <div className="campaign-qr-panel">
          <QRCodeSVG 
            id={`qr-${campaignId}`}
            value={campaignUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
          <p className="campaign-qr-link">
            {campaignUrl}
          </p>
          <div className="campaign-qr-actions">
            <button 
              onClick={copyLink}
              className="btn btn-primary"
              type="button"
            >
              Copy Link
            </button>
            <button 
              onClick={downloadQR}
              className="btn btn-secondary"
              type="button"
            >
              Download QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignQRCode;
