import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import UploadInput from './components/UploadInput';
import HistoryPage from './pages/HistoryPage';
import './index.css';
import './App.css';

function App() {
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRun = async (studyFile, assignmentFile) => {
        setIsLoading(true);
        setError('');
        setFeedback('');

        try {
            const formData = new FormData();
            formData.append('StudyFiles', studyFile);
            formData.append('AssignmentFiles', assignmentFile);

            const response = await fetch(
                `http://localhost:5000/AutomatedGradingFeedback`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error(`Connection Failed: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let resultText = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                resultText += chunk;
                setFeedback(resultText);
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to connect to the analysis engine.");
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
                                        <UploadInput onRun={handleRun} isLoading={isLoading} />
                                        <div className="decoration-orb"></div>
                                    </section>
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
