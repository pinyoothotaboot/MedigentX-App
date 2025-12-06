
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './Button';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = React.useState(() => 
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={toggleTheme} 
      className="rounded-full w-10 h-10 p-0"
      title="Toggle Theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
};
