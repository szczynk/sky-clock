import { useEffect, useState } from 'react';
import useLocalStorage from './hooks/localstorage';
import './App.css';
import Contributors from './components/contributor/Contributors';
import Clock from './components/clock/Clock';
import Events from './components/events/Events';
import WeeklyReset from './components/events/WeeklyReset';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import Particles from "./components/particles-background/particles";

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [theme, setTheme] = useLocalStorage('theme', (window.matchMedia?.('(prefers-color-scheme: dark)').matches && 'dark') || 'light');

  document.body.setAttribute('data-theme', theme);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <Particles />
      <header className="App-header">
        Sky Clock
        <div className="theme" onClick={toggleTheme}>
          <FontAwesomeIcon className="icon-theme" icon={theme === 'light' ? faMoon : faSun } />
        </div>
      </header>
      <div className='main'>
        <main>
          <Clock date={currentDate} />
          <WeeklyReset currentDate={currentDate} />
          <Events currentDate={currentDate} />
        </main>
      </div>
      <Contributors />
    </div>
  );
}

export default App;
