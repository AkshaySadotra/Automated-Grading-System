import React, { useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Terminal, Copy, Check } from 'lucide-react';
import './LiveFeedback.css';

const LiveFeedback = ({ feedback, isLoading, error }) => {
    const contentRef = useRef(null);
    const [copied, setCopied] = React.useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [feedback]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(feedback);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="feedback-panel">
            <div className="panel-header">
                <div className="header-left">
                    <Terminal size={20} className="panel-icon" />
                    <h2>AI Analysis Stream</h2>
                    {isLoading && <span className="live-badge">RECEIVING DATA...</span>}
                </div>

                {feedback && !isLoading && (
                    <button onClick={copyToClipboard} className="icon-btn" title="Copy Report">
                        {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                    </button>
                )}
            </div>

            <div className="content-area" ref={contentRef}>
                {error ? (
                    <div className="error-message">
                        <h3>⚠️ Connection Error</h3>
                        <p>{error}</p>
                    </div>
                ) : !feedback ? (
                    <div className="empty-state">
                        <div className="cursor-blink">_</div>
                        <p>Waiting for input sequence...</p>
                    </div>
                ) : (
                    <div className="markdown-body">
                        <Markdown>{feedback}</Markdown>
                        {isLoading && <span className="cursor-blink">▋</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveFeedback;
