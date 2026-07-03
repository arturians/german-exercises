import { useState } from 'react';
import { AdjectiveEndingsExercise } from './exercises/adjective-endings/AdjectiveEndingsExercise';

type Screen = 'home' | 'adjective-endings';

export function App() {
  const [screen, setScreen] = useState<Screen>('home');

  if (screen === 'adjective-endings') {
    return (
      <main className="app-shell">
        <AdjectiveEndingsExercise onBack={() => setScreen('home')} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="home-screen" aria-label="Exercises">
        <header className="home-header">
          <p className="eyebrow">German grammar practice</p>
          <h1>Exercises</h1>
        </header>

        <div className="exercise-list">
          <button
            className="exercise-link"
            type="button"
            onClick={() => setScreen('adjective-endings')}
          >
            <span>
              <strong>Adjective endings</strong>
              <small>Practice endings with case, gender, and number hints.</small>
            </span>
            <span aria-hidden="true">Open</span>
          </button>
        </div>
      </section>
    </main>
  );
}
