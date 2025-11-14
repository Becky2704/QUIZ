
import React from 'react';
import { RefreshCwIcon } from './Icons';

interface ResultsProps {
  score: number;
  total: number;
  onReset: () => void;
  children: React.ReactNode;
}

const Results: React.FC<ResultsProps> = ({ score, total, onReset, children }) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  
  const getFeedback = () => {
      if (percentage >= 90) return { message: "Excellent Work!", color: "text-green-600", bgColor: "bg-green-100" };
      if (percentage >= 75) return { message: "Great Job!", color: "text-sky-600", bgColor: "bg-sky-100" };
      if (percentage >= 50) return { message: "Good Effort!", color: "text-amber-600", bgColor: "bg-amber-100" };
      return { message: "Keep Practicing!", color: "text-red-600", bgColor: "bg-red-100" };
  }
  
  const feedback = getFeedback();

  return (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center">
            <h2 className={`text-3xl font-bold ${feedback.color} mb-2`}>{feedback.message}</h2>
            <p className="text-slate-700 text-lg">You scored</p>
            <p className="text-5xl font-extrabold text-slate-800 my-4">{score} / {total}</p>
            
            <div className="w-full bg-slate-200 rounded-full h-4 my-4">
                <div className="bg-sky-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
            <p className="font-semibold text-slate-600">{percentage}%</p>
            
            <button
                onClick={onReset}
                className="mt-6 inline-flex items-center px-6 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-md hover:bg-sky-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
                <RefreshCwIcon className="mr-2"/>
                Try Again
            </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-2xl font-bold text-sky-800 mb-4">Answer Review</h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    </div>
  );
};

export default Results;
