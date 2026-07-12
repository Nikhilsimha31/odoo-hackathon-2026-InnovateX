import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

function App() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('af_theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('af_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <div>
      <Navbar isDark={isDark} onToggleTheme={toggleTheme} />
      <Dashboard />
    </div>
  );
}

export default App;
