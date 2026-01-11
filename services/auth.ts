import { User } from '../types';

const USERS_KEY = 'sparky_users';
const CURRENT_USER_KEY = 'sparky_current_user';

export const authService = {
  // Register a new user
  register: (user: User): { success: boolean; message?: string } => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'האימייל הזה כבר רשום במערכת' };
    }

    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after register
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true };
  },

  // Login existing user
  login: (email: string, password: string): { success: boolean; user?: User; message?: string } => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, message: 'אימייל או סיסמה שגויים' };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Check if user is already logged in
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};