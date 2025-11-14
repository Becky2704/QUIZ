import React, { useState } from 'react';
import MultipleChoiceQuiz from './components/MultipleChoiceQuiz';
import ReadingQuiz from './components/ReadingQuiz';
import MultiplayerFlow from './components/MultiplayerFlow';
import { BookOpenIcon, CheckCircleIcon, UsersIcon } from './components/Icons';

type Tab = 'multipleChoice' | 'reading' | 'multiplayer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('multipleChoice');

  const renderContent = () => {
    switch (activeTab) {
      case 'multipleChoice':
        return <MultipleChoiceQuiz />;
      case 'reading':
        return <ReadingQuiz />;
      case 'multiplayer':
        return <MultiplayerFlow />;
      default:
        return <MultipleChoiceQuiz />;
    }
  };

  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactElement }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center justify-center w-full px-4 py-3 font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
        activeTab === tab
          ? 'bg-sky-600 text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-sky-700 mb-4 sm:mb-0">
            English for Nursing Exam Prep
          </h1>
        </div>
        <div className="container mx-auto px-4 pb-4">
           <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <TabButton tab="multipleChoice" label="Multiple Choice" icon={<CheckCircleIcon />} />
            <TabButton tab="reading" label="Reading Passages" icon={<BookOpenIcon />} />
            <TabButton tab="multiplayer" label="Play with Friends" icon={<UsersIcon />} />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Exam Prep. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;