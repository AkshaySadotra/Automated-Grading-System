import { Link, useLocation } from 'react-router-dom';
import { Bot, Sparkles, LayoutDashboard, History } from 'lucide-react';
import './Header.css';

const Header = () => {
    const location = useLocation();

    return (
        <header className="app-header">
            <div className="logo-container">
                <div className="icon-wrapper">
                    <Bot size={32} className="bot-icon" />
                    <Sparkles size={16} className="sparkle-icon" />
                </div>
                <div className="title-wrapper">
                    <h1>AutoGrade AI</h1>
                    <span className="subtitle">Intelligent Assessment System</span>
                </div>
            </div>
            
            <nav className="main-nav">
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                    <LayoutDashboard size={18} /> Dashboard
                </Link>
                <Link to="/history" className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}>
                    <History size={18} /> AI Insights
                </Link>
            </nav>

            <div className="status-indicator">
                <span className="status-dot"></span>
                System Online
            </div>
        </header>
    );
};

export default Header;
