import "./HorizontalPage.css";

const HorizontalPage = () => {
  return (
    <main className="dashboard-main">
      <h2 className="quick-status-title">Quick Status</h2>
      <div className="quick-status-container">
        <div className="quick-status-block">
          <span className="quick-status-label">Total Orders</span>
          <span className="quick-status-value">250</span>
        </div>
        <div className="quick-status-block">
          <span className="quick-status-label">Active Processes</span>
          <span className="quick-status-value">180</span>
        </div>
        <div className="quick-status-block">
          <span className="quick-status-label">Completed Orders</span>
          <span className="quick-status-value">70</span>
        </div>
      </div>
    </main>
  );
};

export default HorizontalPage;
