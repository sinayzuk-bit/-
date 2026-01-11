import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';
import { BookOpen, User as UserIcon, Lock, Mail, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const result = authService.login(email, password);
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.message || 'שגיאה בהתחברות');
      }
    } else {
      if (!name || !email || !password) {
        setError('נא למלא את כל השדות');
        return;
      }
      const newUser: User = { name, email, password };
      const result = authService.register(newUser);
      if (result.success) {
        onLogin(newUser);
      } else {
        setError(result.message || 'שגיאה בהרשמה');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50"></div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 z-10 animate-fadeIn border border-slate-100">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-accent text-white shadow-lg mb-4 transform -rotate-3">
                    <BookOpen className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-800">
                    {isLogin ? 'ברוכים השבים!' : 'נעים להכיר!'}
                </h1>
                <p className="text-slate-500 mt-2">
                    {isLogin ? 'הכנס את הפרטים כדי להיכנס לספארקי' : 'הירשם כדי להתחיל ללמוד עם ספארקי'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="relative">
                        <UserIcon className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="השם שלך"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                        />
                    </div>
                )}
                
                <div className="relative">
                    <Mail className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                    <input
                        type="email"
                        placeholder="כתובת אימייל"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute top-3.5 right-4 w-5 h-5 text-slate-400" />
                    <input
                        type="password"
                        placeholder="סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-indigo-600 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                    {isLogin ? 'התחבר' : 'הירשם'}
                    <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                    {isLogin ? 'אין לך עדיין חשבון?' : 'יש לך כבר חשבון?'}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="mr-2 font-bold text-primary hover:underline"
                    >
                        {isLogin ? 'הירשם עכשיו' : 'התחבר'}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};

export default AuthScreen;