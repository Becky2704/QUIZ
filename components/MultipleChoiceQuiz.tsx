import React, { useState } from 'react';
import { multipleChoiceQuestions } from '../data';
import { MultipleChoiceQuestion, UserAnswers } from '../types';
import Results from './Results';
import { CheckIcon, XIcon } from './Icons';

interface MultipleChoiceQuizProps {
    isMultiplayer?: boolean;
    questions?: MultipleChoiceQuestion[];
    onMultiplayerSubmit?: (answers: UserAnswers) => void;
}

const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const MultipleChoiceQuiz: React.FC<MultipleChoiceQuizProps> = ({ isMultiplayer = false, questions, onMultiplayerSubmit }) => {
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [quizState, setQuizState] = useState<'selecting' | 'in_progress' | 'submitted'>(isMultiplayer ? 'in_progress' : 'selecting');
  const [numQuestionsInput, setNumQuestionsInput] = useState<string>('10');
  const [inputError, setInputError] = useState<string>('');
  const [currentQuestions, setCurrentQuestions] = useState<MultipleChoiceQuestion[]>(questions || []);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  const handleStartQuiz = () => {
    const num = parseInt(numQuestionsInput, 10);
    if (isNaN(num) || num <= 0 || num > multipleChoiceQuestions.length) {
        setInputError(`Please enter a number between 1 and ${multipleChoiceQuestions.length}.`);
        return;
    }
    setInputError('');
    const shuffled = shuffleArray(multipleChoiceQuestions);
    setCurrentQuestions(shuffled.slice(0, num));
    setQuizState('in_progress');
  };

  const handleSubmit = () => {
    if(isMultiplayer && onMultiplayerSubmit) {
        onMultiplayerSubmit(answers);
        // In multiplayer, we wait for the server to change the game state to 'results'
    } else {
        setQuizState('submitted');
        window.scrollTo(0, 0);
    }
  };
  
  const handleReset = () => {
      setAnswers({});
      setCurrentQuestions([]);
      setQuizState('selecting');
  };

  if (quizState === 'submitted' && !isMultiplayer) {
    const score = currentQuestions.reduce((acc, q) => {
      return answers[q.id] === q.correctAnswer ? acc + 1 : acc;
    }, 0);
    return <Results score={score} total={currentQuestions.length} onReset={handleReset}>
        {currentQuestions.map((q, index) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            const isAnswered = userAnswer !== undefined;

            return (
                 <div key={q.id} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                    <p className="font-semibold text-slate-800">{index + 1}. {q.question}</p>
                    <div className="mt-3 space-y-2">
                        {q.options.map(option => {
                            const isCorrectOption = option === q.correctAnswer;
                            const isSelected = userAnswer === option;
                            const isIncorrectSelection = isSelected && !isCorrectOption;

                            let style = 'border-slate-300 bg-slate-50 text-slate-700';
                            if(isCorrectOption) style = 'border-green-400 bg-green-100 text-green-800 font-semibold';
                            if(isIncorrectSelection) style = 'border-red-400 bg-red-100 text-red-800';

                            return (
                                <div key={option} className={`flex items-center p-3 rounded-md border text-sm ${style}`}>
                                    {isCorrectOption && <CheckIcon className="mr-2 text-green-600"/>}
                                    {isIncorrectSelection && <XIcon className="mr-2 text-red-600"/>}
                                    {option}
                                </div>
                            )
                        })}
                    </div>
                    {!isAnswered && <p className="text-xs text-amber-600 mt-2">Not answered</p>}
                    {!isCorrect && isAnswered && q.explanation && (
                        <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
                            <p className="font-bold text-amber-900 text-sm">Explanation:</p>
                            <p className="text-amber-800 text-sm">{q.explanation}</p>
                        </div>
                    )}
                </div>
            )
        })}
    </Results>;
  }

  if(quizState === 'selecting' && !isMultiplayer) {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 text-center">
            <h2 className="text-2xl font-bold text-sky-800 mb-2">Multiple Choice Quiz</h2>
            <p className="text-slate-600 mb-6">Enter how many questions you'd like to answer.</p>
            <div className="max-w-xs mx-auto">
                 <input 
                    type="number"
                    value={numQuestionsInput}
                    onChange={(e) => {
                        setInputError('');
                        setNumQuestionsInput(e.target.value);
                    }}
                    placeholder={`1-${multipleChoiceQuestions.length}`}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 text-center text-lg font-semibold transition-all duration-200 focus:border-sky-500 focus:ring-sky-500"
                    min="1"
                    max={multipleChoiceQuestions.length}
                />
                {inputError && <p className="text-red-500 text-sm mt-2">{inputError}</p>}
                 <button
                    onClick={() => {
                        setNumQuestionsInput(String(multipleChoiceQuestions.length));
                        setInputError('');
                    }}
                    className="mt-4 text-sm text-sky-600 hover:underline"
                >
                    Answer all {multipleChoiceQuestions.length} questions
                </button>
            </div>
            <button
                onClick={handleStartQuiz}
                className="mt-8 w-full max-w-xs px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                Start Quiz
            </button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-sky-800 mb-2">Multiple Choice Questions</h2>
        <p className="text-slate-600">Select the best answer for each question. ({currentQuestions.length} questions)</p>
         {isMultiplayer && <p className="text-slate-500 text-sm mt-2 animate-pulse">Waiting for other players to finish...</p>}
      </div>
      {currentQuestions.map((q, index) => (
        <div key={q.id} className="bg-white p-6 rounded-xl shadow-md border border-slate-200 transition-shadow hover:shadow-lg">
          <p className="font-semibold text-slate-800 mb-4">{index + 1}. {q.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(q.id, option)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                  answers[q.id] === option 
                    ? 'bg-sky-500 border-sky-600 text-white font-semibold shadow-inner' 
                    : 'bg-slate-100 border-slate-200 hover:bg-sky-100 hover:border-sky-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
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
};

export default MultipleChoiceQuiz;