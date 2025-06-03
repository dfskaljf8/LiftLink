import React, { useState, useEffect } from 'react';
import api from './api';

export const AdminDashboard = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState(null);
  const [securityAnalytics, setSecurityAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchAdminData();
    }
  }, [userProfile]);

  const fetchAdminData = async () => {
    try {
      const [healthRes, analyticsRes] = await Promise.all([
        api.get('/api/admin/system/health'),
        api.get('/api/admin/security/analytics')
      ]);
      
      setSystemHealth(healthRes.data);
      setSecurityAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
    setLoading(false);
  };

  if (userProfile?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h2>🚫 Access Denied</h2>
        <p>Admin privileges required to access this area.</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🛡️ LiftLink Security Control Center</h1>
        <p>Protecting our fitness community - one user at a time</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'kyc' ? 'active' : ''}`}
          onClick={() => setActiveTab('kyc')}
        >
          🪪 KYC Review
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          🚨 Reports
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          📋 Manual Review
        </button>
        <button 
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📜 Audit Logs
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <AdminOverview 
            systemHealth={systemHealth}
            securityAnalytics={securityAnalytics}
          />
        )}
        {activeTab === 'kyc' && <KYCReviewPanel />}
        {activeTab === 'reports' && <ReportsPanel />}
        {activeTab === 'reviews' && <ManualReviewPanel />}
        {activeTab === 'audit' && <AuditLogsPanel />}
      </div>
    </div>
  );
};

const AdminOverview = ({ systemHealth, securityAnalytics }) => {
  return (
    <div className="admin-overview">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-info">
            <h3>{systemHealth?.database_metrics?.total_users || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🏋️‍♂️</div>
          <div className="metric-info">
            <h3>{systemHealth?.database_metrics?.total_trainers || 0}</h3>
            <p>Verified Trainers</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-info">
            <h3>{systemHealth?.database_metrics?.total_bookings || 0}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-info">
            <h3>{systemHealth?.database_metrics?.total_messages || 0}</h3>
            <p>Messages Sent</p>
          </div>
        </div>
      </div>

      <div className="security-metrics">
        <h2>🔒 Security Status</h2>
        <div className="security-grid">
          <div className="security-card critical">
            <div className="security-header">
              <h3>🚨 Critical Events</h3>
              <span className="count">{securityAnalytics?.summary?.critical_events || 0}</span>
            </div>
            <p>High-priority security incidents requiring immediate attention</p>
          </div>
          
          <div className="security-card warning">
            <div className="security-header">
              <h3>⚠️ High-Risk Users</h3>
              <span className="count">{securityAnalytics?.summary?.total_high_risk_users || 0}</span>
            </div>
            <p>Users flagged for suspicious behavior patterns</p>
          </div>
          
          <div className="security-card info">
            <div className="security-header">
              <h3>📋 Pending Reviews</h3>
              <span className="count">
                {(securityAnalytics?.pending_items?.kyc_documents || 0) + 
                 (securityAnalytics?.pending_items?.manual_reviews || 0)}
              </span>
            </div>
            <p>Items awaiting manual review</p>
          </div>
          
          <div className="security-card">
            <div className="security-header">
              <h3>🛡️ Banned Users</h3>
              <span className="count">{systemHealth?.security_metrics?.banned_users || 0}</span>
            </div>
            <p>Users permanently banned for violations</p>
          </div>
        </div>
      </div>

      <div className="daily-activity">
        <h2>📈 Today's Activity</h2>
        <div className="activity-grid">
          <div className="activity-item">
            <span className="activity-label">New Users</span>
            <span className="activity-value">{systemHealth?.daily_activity?.new_users || 0}</span>
          </div>
          <div className="activity-item">
            <span className="activity-label">New Bookings</span>
            <span className="activity-value">{systemHealth?.daily_activity?.new_bookings || 0}</span>
          </div>
          <div className="activity-item">
            <span className="activity-label">Messages Sent</span>
            <span className="activity-value">{systemHealth?.daily_activity?.messages_sent || 0}</span>
          </div>
          <div className="activity-item">
            <span className="activity-label">System Status</span>
            <span className="activity-value healthy">✅ Healthy</span>
          </div>
        </div>
      </div>

      {securityAnalytics?.high_risk_users?.length > 0 && (
        <div className="high-risk-users">
          <h2>⚠️ High-Risk Users (Immediate Attention Required)</h2>
          <div className="risk-users-list">
            {securityAnalytics.high_risk_users.map((user) => (
              <div key={user._id} className="risk-user-card">
                <div className="user-info">
                  <strong>{user.user_name}</strong>
                  <span className="user-email">{user.user_email}</span>
                </div>
                <div className="risk-score">
                  Risk Score: <span className="score">{user.total_risk}</span>
                </div>
                <div className="behavior-count">
                  {user.behavior_count} suspicious behaviors
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const KYCReviewPanel = () => {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDocs();
  }, []);

  const fetchPendingDocs = async () => {
    try {
      const response = await api.get('/api/admin/kyc/pending');
      setPendingDocs(response.data.pending_documents);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
    }
    setLoading(false);
  };

  const handleDocumentAction = async (documentId, action, reason) => {
    try {
      await api.post(`/api/admin/kyc/verify/${documentId}`, {
        action,
        reason
      });
      
      fetchPendingDocs();
      setSelectedDoc(null);
      alert(`Document ${action}d successfully`);
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error processing document');
    }
  };

  if (loading) return <div className="loading">Loading KYC documents...</div>;

  return (
    <div className="kyc-review-panel">
      <div className="panel-header">
        <h2>🪪 KYC Document Review</h2>
        <div className="pending-count">
          {pendingDocs.length} documents pending review
        </div>
      </div>

      <div className="documents-grid">
        {pendingDocs.length === 0 ? (
          <div className="no-pending">
            <p>✅ No documents pending review!</p>
            <p>All caught up with verification.</p>
          </div>
        ) : (
          pendingDocs.map((doc) => (
            <div key={doc.document_id} className="doc-card">
              <div className="doc-header">
                <div className="doc-type">
                  {doc.document_type === 'government_id' ? '🪪' :
                   doc.document_type === 'certification' ? '📜' : '🤳'} 
                  {doc.document_type.replace('_', ' ')}
                </div>
                <div className="priority">
                  {doc.user_role === 'trainer' ? '🔴 High' : '🟡 Normal'}
                </div>
              </div>
              
              <div className="user-info">
                <strong>{doc.user_name}</strong>
                <span>{doc.user_email}</span>
                <span className="role">{doc.user_role}</span>
              </div>
              
              <div className="doc-date">
                Uploaded: {new Date(doc.created_at).toLocaleDateString()}
              </div>
              
              <button 
                onClick={() => setSelectedDoc(doc)}
                className="review-btn"
              >
                Review Document
              </button>
            </div>
          ))
        )}
      </div>

      {selectedDoc && (
        <DocumentReviewModal 
          document={selectedDoc}
          onAction={handleDocumentAction}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
};

const DocumentReviewModal = ({ document, onAction, onClose }) => {
  const [documentDetails, setDocumentDetails] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentDetails();
  }, [document]);

  const fetchDocumentDetails = async () => {
    try {
      const response = await api.get(`/api/admin/kyc/document/${document.document_id}`);
      setDocumentDetails(response.data);
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>🔍 Document Review: {document.document_type}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {loading ? (
          <div className="loading">Loading document details...</div>
        ) : (
          <div className="document-review">
            <div className="document-image">
              {documentDetails?.document?.document_data ? (
                <img 
                  src={`data:image/jpeg;base64,${documentDetails.document.document_data}`}
                  alt="Document"
                  className="review-image"
                />
              ) : (
                <div className="no-image">Document data not available</div>
              )}
            </div>

            <div className="document-info">
              <div className="user-section">
                <h4>👤 User Information</h4>
                <div className="info-grid">
                  <div><strong>Name:</strong> {documentDetails?.user_info?.name}</div>
                  <div><strong>Email:</strong> {documentDetails?.user_info?.email}</div>
                  <div><strong>Role:</strong> {documentDetails?.user_info?.role}</div>
                  <div><strong>Member Since:</strong> {new Date(documentDetails?.user_info?.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="verification-section">
                <h4>🔍 Verification Checklist</h4>
                <div className="checklist">
                  <label>
                    <input type="checkbox" /> Document is clear and readable
                  </label>
                  <label>
                    <input type="checkbox" /> Information matches user profile
                  </label>
                  <label>
                    <input type="checkbox" /> Document appears authentic
                  </label>
                  <label>
                    <input type="checkbox" /> No signs of tampering
                  </label>
                  {document.document_type === 'government_id' && (
                    <>
                      <label>
                        <input type="checkbox" /> Valid government ID format
                      </label>
                      <label>
                        <input type="checkbox" /> Not expired
                      </label>
                    </>
                  )}
                  {document.document_type === 'certification' && (
                    <label>
                      <input type="checkbox" /> Valid certification body
                    </label>
                  )}
                </div>
              </div>

              <div className="action-section">
                <h4>🎯 Review Decision</h4>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Reason for approval/rejection..."
                  className="reason-input"
                  required
                />
                
                <div className="action-buttons">
                  <button 
                    onClick={() => onAction(document.document_id, 'approve', actionReason)}
                    className="approve-btn"
                    disabled={!actionReason.trim()}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    onClick={() => onAction(document.document_id, 'reject', actionReason)}
                    className="reject-btn"
                    disabled={!actionReason.trim()}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsPanel = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/admin/reports?status=pending');
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
    setLoading(false);
  };

  const resolveReport = async (reportId, action, reason) => {
    try {
      await api.post(`/api/admin/reports/${reportId}/resolve`, {
        action,
        reason
      });
      
      fetchReports();
      setSelectedReport(null);
      alert('Report resolved successfully');
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Error resolving report');
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div className="reports-panel">
      <div className="panel-header">
        <h2>🚨 User Reports</h2>
        <div className="reports-count">
          {reports.length} pending reports
        </div>
      </div>

      <div className="reports-list">
        {reports.length === 0 ? (
          <div className="no-reports">
            <p>✅ No pending reports!</p>
            <p>Community is safe and sound.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.report_id} className={`report-card ${report.priority}`}>
              <div className="report-header">
                <div className="report-reason">
                  {report.reason.replace('_', ' ').toUpperCase()}
                </div>
                <div className={`priority-badge ${report.priority}`}>
                  {report.priority.toUpperCase()}
                </div>
              </div>
              
              <div className="report-users">
                <div><strong>Reported User:</strong> {report.reported_user_name}</div>
                <div><strong>Reported By:</strong> {report.reporter_name}</div>
              </div>
              
              <div className="report-description">
                {report.description}
              </div>
              
              <div className="report-date">
                {new Date(report.created_at).toLocaleDateString()}
              </div>
              
              <button 
                onClick={() => setSelectedReport(report)}
                className="investigate-btn"
              >
                Investigate
              </button>
            </div>
          ))
        )}
      </div>

      {selectedReport && (
        <ReportInvestigationModal
          report={selectedReport}
          onResolve={resolveReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

const ReportInvestigationModal = ({ report, onResolve, onClose }) => {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>🔍 Investigate Report</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="investigation-details">
          <div className="report-info">
            <h4>Report Details</h4>
            <div><strong>Reason:</strong> {report.reason}</div>
            <div><strong>Priority:</strong> {report.priority}</div>
            <div><strong>Description:</strong> {report.description}</div>
            {report.evidence && (
              <div><strong>Evidence:</strong> {report.evidence}</div>
            )}
          </div>

          <div className="users-info">
            <h4>Users Involved</h4>
            <div><strong>Reported User:</strong> {report.reported_user_name} ({report.reported_user_email})</div>
            <div><strong>Reporter:</strong> {report.reporter_name}</div>
          </div>

          <div className="resolution-form">
            <h4>Resolution</h4>
            
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="action-select"
            >
              <option value="">Select Action</option>
              <option value="ban">Ban User</option>
              <option value="restrict">Restrict User</option>
              <option value="warn">Issue Warning</option>
              <option value="dismiss">Dismiss Report</option>
            </select>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain your decision..."
              className="reason-textarea"
              required
            />

            <div className="resolution-actions">
              <button 
                onClick={() => onResolve(report.report_id, action, reason)}
                disabled={!action || !reason.trim()}
                className="resolve-btn"
              >
                Resolve Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManualReviewPanel = () => {
  const [reviewTasks, setReviewTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewTasks();
  }, []);

  const fetchReviewTasks = async () => {
    try {
      const response = await api.get('/api/admin/review-queue');
      setReviewTasks(response.data.review_tasks);
    } catch (error) {
      console.error('Error fetching review tasks:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading review tasks...</div>;

  return (
    <div className="manual-review-panel">
      <div className="panel-header">
        <h2>📋 Manual Review Queue</h2>
        <div className="tasks-count">
          {reviewTasks.length} tasks pending review
        </div>
      </div>

      <div className="review-tasks">
        {reviewTasks.length === 0 ? (
          <div className="no-tasks">
            <p>✅ All caught up!</p>
            <p>No manual reviews pending.</p>
          </div>
        ) : (
          reviewTasks.map((task) => (
            <div key={task.task_id} className={`task-card ${task.priority}`}>
              <div className="task-header">
                <div className="task-reason">{task.reason}</div>
                <div className={`priority-badge ${task.priority}`}>
                  {task.priority.toUpperCase()}
                </div>
              </div>
              
              <div className="task-user">
                <strong>{task.user_name}</strong> ({task.user_email})
              </div>
              
              <div className="task-details">
                {JSON.stringify(task.details)}
              </div>
              
              <div className="task-date">
                Created: {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AuditLogsPanel = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    event_type: '',
    user_id: '',
    days: 7
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.user_id) params.append('user_id', filters.user_id);
      params.append('days', filters.days);

      const response = await api.get(`/api/admin/audit-logs?${params}`);
      setAuditLogs(response.data.audit_logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading audit logs...</div>;

  return (
    <div className="audit-logs-panel">
      <div className="panel-header">
        <h2>📜 Security Audit Logs</h2>
        
        <div className="filters">
          <select
            value={filters.event_type}
            onChange={(e) => setFilters({...filters, event_type: e.target.value})}
            className="filter-select"
          >
            <option value="">All Events</option>
            <option value="user_login">User Login</option>
            <option value="kyc_document_uploaded">KYC Upload</option>
            <option value="suspicious_message_sent">Suspicious Message</option>
            <option value="user_reported">User Reported</option>
          </select>
          
          <input
            type="text"
            placeholder="User ID"
            value={filters.user_id}
            onChange={(e) => setFilters({...filters, user_id: e.target.value})}
            className="filter-input"
          />
          
          <select
            value={filters.days}
            onChange={(e) => setFilters({...filters, days: parseInt(e.target.value)})}
            className="filter-select"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="logs-list">
        {auditLogs.map((log) => (
          <div key={log.event_id} className={`log-entry ${log.severity.toLowerCase()}`}>
            <div className="log-header">
              <div className="log-type">{log.event_type}</div>
              <div className="log-severity">{log.severity}</div>
              <div className="log-time">{new Date(log.timestamp).toLocaleString()}</div>
            </div>
            
            <div className="log-user">
              {log.user_name ? `${log.user_name} (${log.user_id})` : log.user_id}
            </div>
            
            <div className="log-details">
              {JSON.stringify(log.details, null, 2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
