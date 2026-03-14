import React, { useState } from 'react';
import './GradingForm.css';

function GradingForm({ onSubmit, loading }) {
  const [studyFiles, setStudyFiles] = useState(null);
  const [assignmentFiles, setAssignmentFiles] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!studyFiles || !assignmentFiles) {
      alert('Please select both ZIP files');
      return;
    }

    onSubmit(studyFiles, assignmentFiles);
  };

  return (
    <div className="grading-form-container">
      <form className="grading-form" onSubmit={handleSubmit}>
        <h2>📝 Submit for Grading</h2>
        
        <div className="form-group">
          <label htmlFor="studyFiles">
            <span className="label-text">Study Materials (ZIP)</span>
            <span className="required">*</span>
          </label>
          <input
            id="studyFiles"
            type="file"
            accept=".zip"
            onChange={(e) => setStudyFiles(e.target.files[0])}
            disabled={loading}
            className="form-input"
          />
          <small className="hint">
            Upload the ZIP file containing study materials
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="assignmentFiles">
            <span className="label-text">Assignment Files (ZIP)</span>
            <span className="required">*</span>
          </label>
          <input
            id="assignmentFiles"
            type="file"
            accept=".zip"
            onChange={(e) => setAssignmentFiles(e.target.files[0])}
            disabled={loading}
            className="form-input"
          />
          <small className="hint">
            Upload the ZIP file containing student assignments
          </small>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            <>
              🚀 Upload
            </>
          )}
        </button>

        <div className="info-box">
          <h4>ℹ️ How it works:</h4>
          <ul>
            <li>Submit your study materials and student assignments</li>
            <li>AI agents analyze the assignments against study materials</li>
            <li>Get detailed feedback on student performance</li>
            <li>Receive teaching improvement suggestions</li>
          </ul>
        </div>
      </form>
    </div>
  );
}

export default GradingForm;
