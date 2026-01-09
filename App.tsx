import React, { useState } from 'react';
import { Subject, SubjectConfig, StudyMode } from './types';
import SubjectCard from './components/SubjectCard';
import ChatInterface from './components/ChatInterface';
import { BookOpen, ArrowRight, PenTool, GraduationCap, MessageCircle, MonitorPlay } from 'lucide-react';

const SUBJECTS: SubjectConfig[] = [
  {
    id: Subject.MATH,
    name: "מתמטיקה",
    icon: "🧮",
    color: "blue",
    description: "אלגברה, גיאומטריה, שברים? קלי קלות!",
    systemInstruction: ""
  },
  {
    id: Subject.SCIENCE,
    name: "מדעים",
    icon: "🧬",
    color: "green",
    description: "ביולוגיה, כימיה, פיזיקה והחלל!",
    systemInstruction: ""
  },
  {
    id: Subject.HISTORY,
    name: "היסטוריה",
    icon: "🏛️",
    color: "amber",
    description: "תרבויות עתיקות, מלחמות ודמויות היסטוריות.",
    systemInstruction: ""
  },
  {
    id: Subject.ENGLISH,
    name: "אנגלית",
    icon: "📚",
    color: "rose",
    description: "עזרה בחיבורים, דקדוק וספרות.",
    systemInstruction: ""
  },
  {
    id: Subject.CODING,
    name: "תכנות",
    icon: "💻",
    color: "violet",
    description: "פייתון, HTML, JS. בואו נבנה דברים מגניבים.",
    systemInstruction: ""
  },
  {
    id: Subject.GENERAL,
    name: "חבר ללימודים",
    icon: "🎓",
    color: "cyan",
    description: "ארגון, טיפים, או סתם לקשקש!",
    systemInstruction: ""
  }
];

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectConfig | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode | null>(null);

  // 1. Chat View (Subject & Mode Selected)
  if (selectedSubject && studyMode) {
    return (
      <ChatInterface 
        subject={selectedSubject} 
        mode={studyMode}
        onBack={() => {
          setStudyMode(null);
          // Optional: clear subject too if you want to go all the way back
          // setSelectedSubject(null); 
        }} 
      />
    );
  }

  // 2. Mode Selection View (Subject Selected, No Mode)
  if (selectedSubject) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-6">
        <button 
          onClick={() => setSelectedSubject(null)}
          className="self-start p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600 mb-6"
        >
          <ArrowRight className="w-8 h-8" />
        </button>

        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center animate-fadeIn">
          <div className="text-center mb-10">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl bg-gradient-to-br from-${selectedSubject.color}-400 to-${selectedSubject.color}-600 text-white shadow-lg mb-4`}>
                {selectedSubject.icon}
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-800">
              {selectedSubject.name}
            </h2>
            <p className="text-slate-500 mt-2 text-lg">מה המטרה שלנו היום?</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStudyMode(StudyMode.HOMEWORK)}
              className="w-full bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-indigo-400 flex items-center gap-4 text-right group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">עזרה בשיעורי בית</h3>
                <p className="text-sm text-slate-500">נתקעת בשאלה? בוא נפתור ביחד.</p>
              </div>
            </button>

            <button
              onClick={() => setStudyMode(StudyMode.QUIZ)}
              className="w-full bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-pink-400 flex items-center gap-4 text-right group"
            >
              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">בחן אותי</h3>
                <p className="text-sm text-slate-500">מוכן למבחן? בוא נבדוק את הידע שלך.</p>
              </div>
            </button>

            <button
              onClick={() => setStudyMode(StudyMode.PRESENTATION)}
              className="w-full bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-orange-400 flex items-center gap-4 text-right group"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <MonitorPlay className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">בניית מצגת</h3>
                <p className="text-sm text-slate-500">צריך עזרה בתכנון שקופיות?</p>
              </div>
            </button>

            <button
              onClick={() => setStudyMode(StudyMode.CASUAL)}
              className="w-full bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-400 flex items-center gap-4 text-right group"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">סתם ככה</h3>
                <p className="text-sm text-slate-500">לדבר על הנושא בכיף, בלי לחץ.</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Subject Selection View (Default)
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero Section */}
      <header className="w-full bg-white pb-10 pt-8 px-6 rounded-b-[3rem] shadow-sm mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-400"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-center mb-4">
             <div className="bg-gradient-to-tr from-primary to-accent p-4 rounded-3xl shadow-lg transform rotate-3">
                <BookOpen className="text-white w-10 h-10" />
             </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-800 mb-4 tracking-tight">
            היי! אני <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">ספארקי</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            המורה הפרטי שלך מבוסס AI. בחר נושא למטה ובוא נהפוך את שיעורי הבית לקלים (ואולי אפילו לכיפיים)! 🚀
          </p>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute top-10 right-10 text-slate-100 animate-pulse text-6xl">✖️</div>
        <div className="absolute bottom-5 left-10 text-slate-100 text-6xl rotate-12">➗</div>
      </header>

      {/* Dashboard Grid */}
      <main className="w-full max-w-6xl px-4 md:px-8 pb-12 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBJECTS.map((subject) => (
            <SubjectCard 
              key={subject.id} 
              config={subject} 
              onClick={() => setSelectedSubject(subject)} 
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} ספארקי - נבנה עבור תלמידים</p>
      </footer>
    </div>
  );
}