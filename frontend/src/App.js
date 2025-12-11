import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResumeUpload from './pages/ResumeUpload';
import ResumeBuilder from './pages/ResumeBuilder';
import InterviewQnA from './pages/InterviewQnA';
import InterviewQuestions from './pages/InterviewQuestions';
import BulkResumeAnalysis from './pages/BulkResumeAnalysis';
import RankingResults from './pages/RankingResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Single Resume Conversion */}
        <Route path="/upload" element={<ResumeUpload />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        
        {/* Interview QnA Generator */}
        <Route path="/interview-qna" element={<InterviewQnA />} />
        <Route path="/interview-questions" element={<InterviewQuestions />} />
        
        {/* Bulk Resume Ranking */}
        <Route path="/bulk-analysis" element={<BulkResumeAnalysis />} />
        <Route path="/ranking-results" element={<RankingResults />} />
      </Routes>
    </Router>
  );
}

export default App;