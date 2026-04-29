import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import UploadInput from './components/UploadInput';
import HistoryPage from './pages/HistoryPage';
import './index.css';
import './App.css';

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [studyFile, setStudyFile] = useState(null);
    const [assignmentFile, setAssignmentFile] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleUpload = async () => {
        if (!studyFile || !assignmentFile) return;

        setIsLoading(true);
        setError('');
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            formData.append('StudyFiles', studyFile);
            formData.append('AssignmentFiles', assignmentFile);

            const response = await fetch(
                `http://127.0.0.1:5000/UploadFiles`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errData = await response.json();
                    throw new Error(errData.error || `Error ${response.status}: ${response.statusText}`);
                } else {
                    throw new Error(`Server Error ${response.status}: ${response.statusText}. Please check backend logs.`);
                }
            }

            // Success cleanup - wipe files after upload is complete
            setStudyFile(null);
            setAssignmentFile(null);
            setUploadSuccess(true);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Router>
            <div className="app-container">
                <Header />

                <main className="main-content">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <div className="centered-layout">
                                    <section className="input-section">
                                        <UploadInput
                                            onRun={handleUpload}
                                            isLoading={isLoading}
                                            studyFile={studyFile}
                                            setStudyFile={setStudyFile}
                                            assignmentFile={assignmentFile}
                                            setAssignmentFile={setAssignmentFile}
                                        />
                                        <div className="decoration-orb"></div>
                                    </section>

                                    {error && (
                                        <div className="error-banner home-error">
                                            {error}
                                        </div>
                                    )}

                                    {uploadSuccess && (
                                        <div className="success-overlay">
                                            <div className="success-modal">
                                                <div className="success-icon">✨</div>
                                                <h3>Upload Successful!</h3>
                                                <p>We are ready to analyze the files. Head over to AI Insights to start the process.</p>
                                                <div className="modal-actions">
                                                    <button onClick={() => setUploadSuccess(false)} className="secondary-btn">Close</button>
                                                    <a href="/history" className="primary-btn">Go to AI Insights</a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            }
                        />
                        <Route path="/history" element={<HistoryPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
