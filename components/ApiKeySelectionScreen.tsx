import React from 'react';
import { Key, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface ApiKeySelectionScreenProps {
  onKeySelected: () => void;
}

const ApiKeySelectionScreen: React.FC<ApiKeySelectionScreenProps> = ({ onKeySelected }) => {
  const handleOpenSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Per instructions: assume success and proceed to mitigate race conditions
      onKeySelected();
    } catch (error) {
      console.error("Failed to open key selection:", error);
      alert("לא הצלחנו לפתוח את חלון בחירת המפתח. נסה שוב.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-right" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-100 p-4 rounded-3xl">
            <Key className="w-12 h-12 text-amber-600" />
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold text-slate-800 text-center mb-4">
          חיבור מפתח API אישי
        </h1>
        
        <p className="text-slate-600 text-lg mb-8 text-center">
          כדי שספארקי יוכל לענות לך ולהכין מצגות, עליך לחבר מפתח API של Google Gemini. 
          כך השירות נשאר חופשי לכולם וכל אחד משתמש במכסה האישית שלו.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-primary font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>בטוח לגמרי</span>
            </div>
            <p className="text-sm text-slate-500">המפתח נשמר אצלך בדפדפן ולא עובר לאף שרת חיצוני חוץ מאשר לגוגל.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-green-600 font-bold">
              <Zap className="w-5 h-5" />
              <span>מהיר ופשוט</span>
            </div>
            <p className="text-sm text-slate-500">לחיצה אחת והכל מחובר. ניתן להוציא מפתח בחינם (או בתשלום לפי שימוש).</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleOpenSelectKey}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 text-xl"
          >
            חיבור מפתח API עכשיו
          </button>

          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            איך מוציאים מפתח API? (מדריך Billing)
          </a>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
          <strong>הסבר קצר:</strong> מפתח API הוא כמו "תעודת זהות" שמאפשרת לאפליקציה לדבר עם המוח של ה-AI (גוגל ג'מיני). כדי להוציא אחד, נכנסים ל-Google AI Studio, פותחים פרויקט ומפעילים Billing (תשלום).
        </div>
      </div>
    </div>
  );
};

export default ApiKeySelectionScreen;