import React, { useState, useEffect } from 'react';
import { RefreshCw, Layers, ChevronDown, ChevronRight, FileText, Bot, FileSearch, X, Users, AlertTriangle, Lightbulb, CheckCircle2, TrendingUp, User  } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './HistoryPage.css';

// Helper component to parse and render the beautifully formatted JSON dashboard
const ParsedFeedbackDisplay = ({ rawText }) => {
  try {
    const startIndex = rawText.indexOf('{');
    const endIndex = rawText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      return <ReactMarkdown>{rawText}</ReactMarkdown>;
    }
    
    const jsonStr = rawText.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonStr);
    const data = parsed?.AgentOutputs?.EduEvaluator || parsed;
    
    if (!data.class_summary && !data.students) {
      return <ReactMarkdown>{rawText}</ReactMarkdown>;
    }

    const { class_summary: summary, teacher_insights: insights, students } = data;

    // Helper: rendering a stat card
    const StatCard = ({ title, value, icon, gradient }) => (
      <div className="stat-card" style={{ background: gradient }}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
          <h4>{title}</h4>
          <span>{value}</span>
        </div>
      </div>
    );

    return (
      <div className="parsed-feedback-dashboard">
        {/* Top Summary Section */}
        {summary && (
          <section className="dashboard-section slide-up">
            <h3 className="section-title"><TrendingUp size={18}/> Class Summary</h3>
            <div className="stats-grid">
              <StatCard 
                title="Avg Grade" 
                value={`${summary.average_grade}%`} 
                icon={<CheckCircle2/>} 
                gradient="linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))" 
              />
              <StatCard 
                title="Avg Plagiarism" 
                value={`${summary.average_plagiarism}%`} 
                icon={<AlertTriangle/>} 
                gradient="linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))" 
              />
              <StatCard 
                title="Total Students" 
                value={students?.length || 0} 
                icon={<Users/>} 
                gradient="linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))" 
              />
            </div>
            {summary.most_difficult_question && (
              <div className="info-callout warning">
                <strong><AlertTriangle size={16}/> Hardest Concept:</strong> {summary.most_difficult_question}
              </div>
            )}
          </section>
        )}

        {/* Teacher Insights Section */}
        {insights && (
          <section className="dashboard-section slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="section-title"><Lightbulb size={18}/> Teacher Insights</h3>
            <div className="insights-container">
              {insights.teaching_gaps && insights.teaching_gaps.length > 0 && (
                <div className="insight-box gaps">
                  <h4>Identified Gaps</h4>
                  <ul>
                    {insights.teaching_gaps.map((gap, i) => <li key={i}>{gap}</li>)}
                  </ul>
                </div>
              )}
              {insights.improvement_suggestions && insights.improvement_suggestions.length > 0 && (
                <div className="insight-box suggestions">
                  <h4>Suggestions for Improvement</h4>
                  <ul>
                    {insights.improvement_suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Students Detail Section */}
        {students && students.length > 0 && (
          <section className="dashboard-section slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="section-title"><Users size={18}/> Student Evaluations</h3>
            <div className="students-list">
              {students.map((student, idx) => (
                <div key={idx} className="student-card">
                  <div className="student-card-header">
                    <div className="student-identity">
                      <User size={32} className="student-avatar" />
                      <div>
                        <h4>{student.name || student.id}</h4>
                        <span className="student-id">ID: {student.id}</span>
                      </div>
                    </div>
                    <div className="student-scores">
                      <div className="score-badge grade">
                        Grade: <strong>{student.evaluation?.grade}%</strong>
                      </div>
                      <div className={`score-badge plagiarism ${student.plagiarism?.score > 30 ? 'high' : 'low'}`}>
                        Plag: <strong>{student.plagiarism?.score}%</strong>
                      </div>
                    </div>
                  </div>
                  <div className="student-card-body">
                    <p><strong>Evaluation:</strong> {student.evaluation?.explanation}</p>
                    <div className="feedback-grid">
                      {student.feedback?.strengths && (
                        <div className="fb-item pos">
                          <h5>Strengths</h5>
                          <p>{student.feedback.strengths}</p>
                        </div>
                      )}
                      {student.feedback?.weaknesses && (
                        <div className="fb-item neg">
                          <h5>Weaknesses</h5>
                          <p>{student.feedback.weaknesses}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );

  } catch (err) {
    // If anything fails during parsing or rendering, fallback to raw markdown
    return <ReactMarkdown>{rawText}</ReactMarkdown>;
  }
};

function HistoryPage() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  
  // New state variables for the AI Agent
  const [agentLoading, setAgentLoading] = useState({}); // Track loading per row index
  const [agentResponses, setAgentResponses] = useState({}); // Track parsed feedback per row index
  const [modalData, setModalData] = useState(null); // Data for the response modal

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/UploadHistory');
      if (!response.ok) {
        throw new Error(`Error fetching history: ${response.statusText}`);
      }
      const data = await response.json();
      const historyList = data.history || [];
      setHistoryItems(historyList);

      // Pre-load any responses that were saved in the DB
      const preloadedResponses = {};
      historyList.forEach((item, idx) => {
        if (item.savedResponse) {
          preloadedResponses[idx] = item.savedResponse;
        }
      });
      setAgentResponses(preloadedResponses);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleRunAgent = async (e, index, item) => {
    e.stopPropagation(); // prevent row expansion
    if (!item.assignmentFolderId || !item.studyMaterialId) {
      alert("Missing folder IDs. This entry might be unlinked or an old upload.");
      return;
    }

    setAgentLoading(prev => ({ ...prev, [index]: true }));
    setAgentResponses(prev => ({ ...prev, [index]: '' })); // Clear previous response
    
    // Live Modal: Open immediately before streaming starts
    setModalData({
      title: `AI Analysis: ${item.assignmentFolder}`,
      content: "Initializing AI Agents and loading data chunks..."
    });

    let finalResultText = '';

    try {
      const formData = new FormData();
      formData.append('StudyFiles', item.studyMaterialId);
      formData.append('AssignmentFiles', item.assignmentFolderId);

      const response = await fetch(`http://localhost:5000/AutomatedGradingFeedback`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Connection Failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        finalResultText += chunk;
        
        // Update both the background state AND the live active modal state
        setAgentResponses(prev => ({ ...prev, [index]: finalResultText }));
        setModalData(prev => ({ ...prev, content: finalResultText }));
      }

      // STREAM FINISHED: Auto-Save the response to the Database
      try {
        await fetch('http://localhost:5000/SaveFeedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignmentFolderId: item.assignmentFolderId,
            responseContent: finalResultText
          })
        });
        console.log("Feedback automatically saved to the database.");
      } catch (saveErr) {
        console.error("Failed to auto-save feedback to DB:", saveErr);
      }

    } catch (err) {
      console.error(err);
      alert(`Error running AI Agent: ${err.message}`);
      setModalData(prev => ({ ...prev, content: `Error: ${err.message}` }));
    } finally {
      setAgentLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const openModal = (e, index, item) => {
     e.stopPropagation();
     setModalData({
        title: `AI Analysis: ${item.assignmentFolder}`,
        content: agentResponses[index] || "No response available."
     });
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2><Layers className="icon-header" /> AI Insights & Mappings</h2>
        <button className="refresh-btn" onClick={fetchHistory} disabled={loading}>
          <RefreshCw className={loading ? 'spin' : ''} size={18} /> Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && <div className="loading-state">Loading history...</div>}

      {!loading && historyItems.length === 0 && !error && (
        <div className="empty-state">No upload history found.</div>
      )}

      {!loading && historyItems.length > 0 && (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th className="th-num">#</th>
                <th className="th-assignment">Assignment Folder</th>
                <th className="th-study">Study Material Folder</th>
                <th className="th-date">Upload Date</th>
                <th className="th-action">Action</th>
                <th className="th-response">Responses</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((item, index) => (
                <React.Fragment key={index}>
                  <tr 
                    className={`table-row ${expandedRow === index ? 'expanded' : ''}`}
                    onClick={() => toggleRow(index)}
                  >
                    <td className="td-num">{index + 1}</td>
                    <td className="td-assignment">
                      <div className="folder-cell">
                        {expandedRow === index ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className={item.assignmentFolder === '—' ? 'no-data' : ''}>
                          {item.assignmentFolder}
                        </span>
                      </div>
                    </td>
                    <td className="td-study">
                      <span className={item.studyMaterialFolder === '—' ? 'no-data' : ''}>
                        {item.studyMaterialFolder}
                      </span>
                    </td>
                    <td className="td-date">{item.uploadedAt}</td>
                    <td className="td-action">
                      <button 
                        className={`ai-agent-btn ${agentLoading[index] ? 'loading' : ''} ${(!item.assignmentFolderId || !item.studyMaterialId) ? 'disabled' : ''}`}
                        onClick={(e) => handleRunAgent(e, index, item)}
                        disabled={agentLoading[index] || (!item.assignmentFolderId || !item.studyMaterialId)}
                      >
                        {agentLoading[index] ? (
                          <div className="btn-spinner"></div>
                        ) : (
                          <>
                            <Bot size={16} className="btn-icon" />
                            AI Agent
                          </>
                        )}
                      </button>
                    </td>
                    <td className="td-response">
                      {agentResponses[index] ? (
                        <button 
                          className="view-response-btn"
                          onClick={(e) => openModal(e, index, item)}
                        >
                          <FileSearch size={16} />
                          View Result
                        </button>
                      ) : (
                        <span className="no-response">—</span>
                      )}
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="expanded-row">
                      <td colSpan="6">
                        <div className="expanded-content">
                          <div className="files-section">
                            <h4>📄 Assignment Files</h4>
                            {item.assignmentFiles.length > 0 ? (
                              <ul className="file-list">
                                {item.assignmentFiles.map((file, idx) => (
                                  <li key={idx} className="file-item">
                                    <FileText size={14} className="file-icon" />
                                    <span>{file}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="no-files">No assignment files</p>
                            )}
                          </div>
                          <div className="files-section">
                            <h4>📚 Study Material Files</h4>
                            {item.studyMaterialFiles.length > 0 ? (
                              <ul className="file-list">
                                {item.studyMaterialFiles.map((file, idx) => (
                                  <li key={idx} className="file-item">
                                    <FileText size={14} className="file-icon" />
                                    <span>{file}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="no-files">No study material files</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Response Modal */}
      {modalData && (
        <div className="modal-overlay" onClick={() => setModalData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Bot className="icon-header" size={20} /> {modalData.title}</h3>
              <button className="close-modal-btn" onClick={() => setModalData(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body custom-scrollbar">
              <ParsedFeedbackDisplay rawText={modalData.content} />
            </div>
            <div className="modal-footer">
              <button 
                className="copy-btn" 
                onClick={() => {
                  navigator.clipboard.writeText(modalData.content);
                  alert('Response copied to clipboard!');
                }}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default HistoryPage;
