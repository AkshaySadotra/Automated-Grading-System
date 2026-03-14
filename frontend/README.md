# Automated Grading System - Frontend

A modern React frontend for the AI-powered Automated Grading Feedback System.

## Features

- 📚 Clean and intuitive user interface
- 📝 Easy submission of study materials and assignments
- 💬 Real-time streaming feedback from AI agents
- 🎨 Beautiful gradient UI with responsive design
- ⚡ Fast and responsive interactions
- 📋 Copy feedback to clipboard

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

### Backend Connection

Make sure your Flask backend is running on `http://localhost:5000` before submitting grading requests.

To start the backend:
```bash
# From the project root
python run.py
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── GradingForm.js
│   │   ├── GradingForm.css
│   │   ├── FeedbackDisplay.js
│   │   └── FeedbackDisplay.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Run the development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from create-react-app (cannot be undone)

## How to Use

1. Enter the path to your study materials folder
2. Enter the path to your student assignments folder
3. Click "Generate Feedback"
4. Wait for the AI agents to analyze and provide feedback
5. Copy the feedback or submit to your database

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Colors

Edit the colors in `src/App.css` and component CSS files:
- Primary gradient: `#667eea` to `#764ba2`

### Styling

Each component has its own CSS file for easy maintenance and customization.

## CORS Setup

If you get CORS errors, make sure your Flask backend has CORS enabled:

```python
from flask_cors import CORS
CORS(app)
```

## License

MIT
