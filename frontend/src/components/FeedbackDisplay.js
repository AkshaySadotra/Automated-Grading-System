import React from 'react';
import './FeedbackDisplay.css';

function FeedbackDisplay({ feedback, loading, error }) {
  return (
    <div className="feedback-container">
      <div className="feedback-panel">
        <h2>
          <span className="feedback-icon">💬</span>
          AI Feedback & Analysis
        </h2>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {loading && !feedback && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Analyzing assignments and generating feedback...</p>
            <p className="loading-subtext">This may take a few moments</p>
          </div>
        )}

        {feedback && (
          <div className="feedback-content">
            <div className="feedback-text">
              {feedback.split('\n\n').map((paragraph, idx) => (
                paragraph.trim() && (
                  <div key={idx} className="feedback-paragraph">
                    {paragraph}
                  </div>
                )
              ))}
            </div>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(feedback);
                alert('Feedback copied to clipboard!');
              }}
            >
              📋 Copy Feedback
            </button>
          </div>
        )}

        {!feedback && !loading && !error && (
          <div className="empty-state">
            <p>🚀 Submit study materials and assignments to generate feedback</p>
            <p className="empty-subtext">
              The AI agents will analyze the assignments and provide comprehensive feedback
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackDisplay;
