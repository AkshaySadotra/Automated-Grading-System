# Grading System - Complete Setup Guide

## Project Overview

This is a full-stack AI-powered grading system with:
- **Backend**: Python Flask API with AI agents (using Autogen)
- **Frontend**: React web application for user interaction

## Quick Start

### 1. Backend Setup

Navigate to the project root and install backend dependencies:

```powershell
# Install dependencies
pip install -r .\GradingSystem\requirements.txt

# Start the Flask server
python run.py
```

The backend will be available at `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```powershell
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will open automatically at `http://localhost:3000`

## Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Port 3000)      │
│  - GradingForm: Submit assignments      │
│  - FeedbackDisplay: View AI feedback    │
└─────────────────────┬───────────────────┘
                      │
                      │ HTTP Requests
                      │ (with CORS)
                      ▼
┌─────────────────────────────────────────┐
│       Flask Backend (Port 5000)         │
│  - /AutomatedGradingFeedback endpoint   │
└─────────────────────┬───────────────────┘
                      │
                      │ Multi-Agent Processing
                      │
                      ▼
┌─────────────────────────────────────────┐
│    AI Agents (Autogen)                  │
│  - GetChunksAgent                       │
│  - EduEvaluator                         │
│  - CriticAgent                          │
└─────────────────────────────────────────┘
```

## API Endpoints

### GET /
Returns a simple hello message.

**Response:**
```json
{"message": "Hello from Flask"}
```

### GET /AutomatedGradingFeedback
Processes study materials and student assignments to generate feedback.

**Query Parameters:**
- `StudyFiles` (required): Path to study materials folder
- `AssignmentFiles` (required): Path to student assignments folder

**Example:**
```
http://localhost:5000/AutomatedGradingFeedback?StudyFiles=study-materials&AssignmentFiles=student-assignments
```

**Response:**
Streaming response with real-time feedback from AI agents

## Frontend Components

### GradingForm
- Input fields for study materials and assignment file paths
- Submit button with loading state
- Information box explaining the process

### FeedbackDisplay
- Displays feedback in real-time
- Shows loading state during processing
- Error handling and display
- Copy to clipboard functionality

## File Structure

```
final_backend/
├── GradingSystem/
│   ├── run.py (main Flask app)
│   ├── requirements.txt
│   ├── GradingSystem.sql
│   ├── README.md
│   └── AutomatedGradingFeedback/
│       ├── AutomatedGradingFeedback.py
│       ├── Agents.py
│       ├── GetBlobUrls.py
│       ├── getchunks.py
│       ├── OpenaiClient.py
│       └── __pycache__/
└── frontend/
    ├── package.json
    ├── README.md
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── App.css
        ├── index.js
        ├── index.css
        └── components/
            ├── GradingForm.js
            ├── GradingForm.css
            ├── FeedbackDisplay.js
            └── FeedbackDisplay.css
```

## Development

### Frontend Development

The frontend uses:
- **React 18**: UI framework
- **React Router**: Navigation (if extended)
- **Axios**: HTTP client
- **CSS3**: Styling with gradients and animations

### Backend Development

The backend uses:
- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Autogen**: Multi-agent orchestration
- **OpenAI**: LLM for AI analysis
- **Azure Storage**: Blob storage for files
- **Azure Search**: Document search capabilities

## Troubleshooting

### Frontend won't connect to backend
- Ensure Flask backend is running on port 5000
- Check that CORS is enabled in `run.py`
- Check browser console for CORS errors

### Backend errors
- Verify all requirements are installed: `pip install -r requirements.txt`
- Check that all environment variables are set (OpenAI API key, Azure credentials)
- Review Flask logs for detailed error messages

### Port conflicts
- Change Flask port: `app.run(port=5001)`
- Change React port: `PORT=3001 npm start`

## Environment Variables

Make sure to set up the following environment variables for the backend:
- `OPENAI_API_KEY`: Your OpenAI API key
- Azure credentials for blob storage and search

## Production Deployment

For production:
1. Build the frontend: `npm run build`
2. Serve the built files from Flask using a static folder
3. Use a production WSGI server like Gunicorn
4. Set Flask `DEBUG=False`

## License

MIT

## Support

For issues or questions, please check the README files in each directory.
