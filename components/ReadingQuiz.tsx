
import React, { useState } from 'react';
import { readingPassages } from '../data';
import { ReadingPassage, UserAnswers } from '../types';
import Results from './Results';
import { CheckIcon, XIcon, BookOpenIcon } from './Icons';


const ReadingQuiz: React.FC = () => {
    const [answers, setAnswers] = useState<UserAnswers>({});
    const [quizState, setQuizState] = useState<'selecting' | 'in_progress' | 'submitted'>('selecting');
    const [selectedPassage, setSelectedPassage] = useState<ReadingPassage | null>(null);

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSelectPassage = (passage: ReadingPassage) => {
        setSelectedPassage(passage);
        setQuizState('in_progress');
    };

    const handleSubmit = () => {
        setQuizState('submitted');
        window.scrollTo(0, 0);
    };

    const handleReset = () => {
        setAnswers({});
        setQuizState('selecting');
        setSelectedPassage(null);
    };

    const PassageText = ({ passage }: { passage: string }) => {
        const parts = passage.split(/(__\(\d+\)__)/g);
        return (
            <p className="text-slate-700 leading-relaxed">
                {parts.map((part, index) => {
                    const match = part.match(/__\((\d+)\)__/);
                    if (match) {
                        const qNum = match[1];
                        return <strong key={index} className="text-sky-600 font-bold bg-sky-100 px-2 py-1 rounded-md">({qNum})</strong>;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </p>
        );
    };

    if (quizState === 'selecting') {
        return (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
                <h2 className="text-2xl font-bold text-sky-800 mb-2 text-center">Reading Comprehension</h2>
                <p className="text-slate-600 mb-8 text-center">Select a passage to begin.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {readingPassages.map(passage => (
                        <button
                            key={passage.id}
                            onClick={() => handleSelectPassage(passage)}
                            className="flex flex-col text-left p-6 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50 transition-all duration-200"
                        >
                            <div className="flex items-center mb-2">
                                <BookOpenIcon className="text-sky-600 mr-3" />
                                <h3 className="font-bold text-sky-700 text-lg">{passage.title}</h3>
                            </div>
                            <p className="text-slate-600 text-sm line-clamp-2">{passage.passage.substring(0, 100)}...</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (quizState === 'submitted' && selectedPassage) {
        const score = selectedPassage.questions.reduce((acc, q) => {
            const questionId = `${selectedPassage.id}-${q.id}`;
            return answers[questionId] === q.correctAnswer ? acc + 1 : acc;
        }, 0);
        
        return <Results score={score} total={selectedPassage.questions.length} onReset={handleReset}>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-sky-800 mb-2">{selectedPassage.title}</h3>
                 <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <PassageText passage={selectedPassage.passage} />
                </div>
                <div className="space-y-4">
                     {selectedPassage.questions.map((q) => {
                        const questionId = `${selectedPassage.id}-${q.id}`;
                        return (
                            <div key={questionId} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                                <p className="font-semibold text-slate-800 text-sm">Question for blank ({q.id})</p>
                                <div className="mt-2 space-y-2">
                                    {q.options.map(option => {
                                        const isCorrect = option === q.correctAnswer;
                                        const isSelected = answers[questionId] === option;
                                        const isIncorrectSelection = isSelected && !isCorrect;

                                        let style = 'border-slate-300 bg-white text-slate-700';
                                        if(isCorrect) style = 'border-green-400 bg-green-100 text-green-800 font-semibold';
                                        if(isIncorrectSelection) style = 'border-red-400 bg-red-100 text-red-800';

                                        return (
                                            <div key={option} className={`flex items-center p-2 rounded-md border text-sm ${style}`}>
                                                {isCorrect && <CheckIcon className="mr-2 text-green-600"/>}
                                                {isIncorrectSelection && <XIcon className="mr-2 text-red-600"/>}
                                                {option === "Ø" ? "Ø (no article)" : option}
                                            </div>
                                        )
                                    })}
                                </div>
                                {!answers[questionId] && <p className="text-xs text-amber-600 mt-2">Not answered</p>}
                            </div>
                        )
                    })}
                </div>
            </div>
        </Results>;
    }

    if (quizState === 'in_progress' && selectedPassage) {
        return (
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 transition-shadow hover:shadow-lg">
                    <h3 className="text-xl font-bold text-sky-800 mb-4">{selectedPassage.title}</h3>
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <PassageText passage={selectedPassage.passage} />
                    </div>
                    <div className="space-y-6">
                        {selectedPassage.questions.map(q => {
                            const questionId = `${selectedPassage.id}-${q.id}`;
                            return (
                                <div key={questionId}>
                                    <p className="font-semibold text-slate-800 mb-2">Question ({q.id})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {q.options.map(option => (
                                            <button
                                                key={option}
                                                onClick={() => handleAnswer(questionId, option)}
                                                className={`px-4 py-2 rounded-full border-2 text-sm transition-all duration-200 ${
                                                    answers[questionId] === option
                                                        ? 'bg-sky-500 border-sky-600 text-white font-semibold'
                                                        : 'bg-white border-slate-300 hover:bg-sky-100 hover:border-sky-300'
                                                }`}
                                            >
                                                {option === "Ø" ? "Ø (no article)" : option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleSubmit}
                        className="w-full max-w-xs px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Submit Answers
                    </button>
                </div>
            </div>
        );
    }
    
    // Fallback in case state is invalid
    return <div>Loading...</div>;
};

export default ReadingQuiz;
