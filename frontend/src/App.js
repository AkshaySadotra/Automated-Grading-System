import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History } from 'lucide-react';
import './App.css';
import GradingForm from './components/GradingForm';
import FeedbackDisplay from './components/FeedbackDisplay';
import HistoryPage from './pages/HistoryPage';

// Navigation Component to show active states
function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="main-nav">
      <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
        <LayoutDashboard size={18} /> Grading Dashboard
      </Link>
      <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>
        <History size={18} /> Upload History
      </Link>
    </nav>
  );
}

// Main Grading Dashboard Component
function GradingDashboard({ handleGradingSubmit, loading, feedback, error }) {
  return (
    <div className="container">
      <GradingForm onSubmit={handleGradingSubmit} loading={loading} />
      <FeedbackDisplay feedback={feedback} loading={loading} error={error} />
    </div>
  );
}

function App() {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGradingSubmit = async (studyFiles, assignmentFiles) => {
    setLoading(true);
    setError('');
    setFeedback('');

    try {
      const formData = new FormData();
      formData.append('StudyFiles', studyFiles);
      formData.append('AssignmentFiles', assignmentFiles);

      const response = await fetch('http://localhost:5000/AutomatedGradingFeedback', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setFeedback(result);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching feedback');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <div className="title-section">
              <h1>📚 Automated Grading Feedback System</h1>
              <p>AI-Powered Assignment Evaluation & Teaching Improvement</p>
            </div>
            <Navigation />
          </div>
        </header>
        
        <main className="App-main">
          <Routes>
            <Route 
              path="/" 
              element={
                <GradingDashboard 
                  handleGradingSubmit={handleGradingSubmit} 
                  loading={loading} 
                  feedback={feedback} 
                  error={error} 
                />
              } 
            />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>

        <footer className="App-footer">
          <p>&copy; 2026 Automated Grading System. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
