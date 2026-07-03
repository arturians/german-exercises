import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';

type GrammarCase = 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';
type Gender = 'Maskulin' | 'Feminin' | 'Neutrum' | 'Plural';
type NumberValue = 'Singular' | 'Plural';

type Exercise = {
  id: string;
  sentence: string;
  ending: string;
  caseName: GrammarCase;
  gender: Gender;
  number: NumberValue;
};

type Feedback = 'idle' | 'correct' | 'wrong';
type Screen = 'home' | 'adjective-endings';

const CASES: GrammarCase[] = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'];
const SINGULAR_GENDERS: Gender[] = ['Maskulin', 'Feminin', 'Neutrum'];
const TABLE_GENDERS: Gender[] = ['Maskulin', 'Feminin', 'Neutrum', 'Plural'];

const RULES: Record<GrammarCase, Record<Gender, string>> = {
  Nominativ: {
    Maskulin: '-e',
    Feminin: '-e',
    Neutrum: '-e',
    Plural: '-en',
  },
  Akkusativ: {
    Maskulin: '-en',
    Feminin: '-e',
    Neutrum: '-e',
    Plural: '-en',
  },
  Dativ: {
    Maskulin: '-en',
    Feminin: '-en',
    Neutrum: '-en',
    Plural: '-en',
  },
  Genitiv: {
    Maskulin: '-en',
    Feminin: '-en',
    Neutrum: '-en',
    Plural: '-en',
  },
};

const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: 'sample-1',
    sentence: 'Der klein__ Hund schläft im Flur.',
    ending: '-e',
    caseName: 'Nominativ',
    gender: 'Maskulin',
    number: 'Singular',
  },
  {
    id: 'sample-2',
    sentence: 'Ich sehe den alt__ Mann am Bahnhof.',
    ending: '-en',
    caseName: 'Akkusativ',
    gender: 'Maskulin',
    number: 'Singular',
  },
  {
    id: 'sample-3',
    sentence: 'Sie hilft der freundlich__ Frau.',
    ending: '-en',
    caseName: 'Dativ',
    gender: 'Feminin',
    number: 'Singular',
  },
  {
    id: 'sample-4',
    sentence: 'Wir kaufen frisch__ Brot.',
    ending: '-',
    caseName: 'Akkusativ',
    gender: 'Neutrum',
    number: 'Singular',
  },
];

const COLUMN_ALIASES = {
  sentence: ['sentence', 'sentance', 'satz', 'text'],
  ending: ['ending', 'right ending', 'right_ending', 'endung', 'answer'],
  caseName: ['case', 'caseName', 'case_name', 'fall', 'kasus'],
  gender: ['gender', 'geschlecht', 'genus'],
  number: ['number', 'plural or singular', 'plural_singular', 'numerus'],
};

function normalizeValue(value: string) {
  return value.trim().toLowerCase().replaceAll(/[\s-]+/g, '_');
}

function normalizeEnding(value: string) {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-' || trimmed.toLowerCase() === 'none') {
    return '-';
  }
  return trimmed.startsWith('-') ? trimmed : `-${trimmed}`;
}

function parseCase(value: string): GrammarCase | null {
  const normalized = normalizeValue(value);
  const match = CASES.find((caseName) => normalizeValue(caseName) === normalized);
  return match ?? null;
}

function parseGender(value: string): Gender | null {
  const normalized = normalizeValue(value);
  if (normalized === 'masculine' || normalized === 'maskulin' || normalized === 'm') {
    return 'Maskulin';
  }
  if (normalized === 'feminine' || normalized === 'feminin' || normalized === 'f') {
    return 'Feminin';
  }
  if (normalized === 'neuter' || normalized === 'neutrum' || normalized === 'n') {
    return 'Neutrum';
  }
  if (normalized === 'plural' || normalized === 'pl') {
    return 'Plural';
  }
  return null;
}

function parseNumber(value: string, gender: Gender): NumberValue | null {
  const normalized = normalizeValue(value);
  if (normalized === 'singular' || normalized === 'sg') {
    return 'Singular';
  }
  if (normalized === 'plural' || normalized === 'pl') {
    return 'Plural';
  }
  return gender === 'Plural' ? 'Plural' : null;
}

function splitRow(line: string) {
  const delimiter = line.includes('\t') ? '\t' : ',';
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function findColumn(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.includes(normalizeValue(header)));
}

function parseExercises(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('Upload a CSV or TSV file with a header row and at least one exercise.');
  }

  const headers = splitRow(lines[0]);
  const indexes = {
    sentence: findColumn(headers, COLUMN_ALIASES.sentence),
    ending: findColumn(headers, COLUMN_ALIASES.ending),
    caseName: findColumn(headers, COLUMN_ALIASES.caseName),
    gender: findColumn(headers, COLUMN_ALIASES.gender),
    number: findColumn(headers, COLUMN_ALIASES.number),
  };

  const missing = Object.entries(indexes)
    .filter(([, index]) => index === -1)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing column: ${missing.join(', ')}.`);
  }

  return lines.slice(1).map((line, lineIndex) => {
    const cells = splitRow(line);
    const sentence = cells[indexes.sentence]?.trim() ?? '';
    const caseName = parseCase(cells[indexes.caseName] ?? '');
    const gender = parseGender(cells[indexes.gender] ?? '');
    const number = gender ? parseNumber(cells[indexes.number] ?? '', gender) : null;

    if (!sentence.includes('__')) {
      throw new Error(`Line ${lineIndex + 2}: sentence must include "__".`);
    }

    if (!caseName || !gender || !number) {
      throw new Error(`Line ${lineIndex + 2}: case, gender, or number is not recognized.`);
    }

    return {
      id: `upload-${lineIndex}-${sentence}`,
      sentence,
      ending: normalizeEnding(cells[indexes.ending] ?? ''),
      caseName,
      gender,
      number,
    };
  });
}

function renderSentence(sentence: string) {
  const [before, after] = sentence.split('__');
  return (
    <>
      {before}
      <span className="sentence-gap">__</span>
      {after}
    </>
  );
}

function getRuleKey(exercise: Exercise) {
  return `${exercise.caseName}-${exercise.gender}`;
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [exercises, setExercises] = useState<Exercise[]>(SAMPLE_EXERCISES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentExercise = exercises[currentIndex];
  const isCorrect = feedback === 'correct';
  const activeRuleKey = isCorrect ? getRuleKey(currentExercise) : '';

  const progress = useMemo(() => {
    return `${currentIndex + 1} / ${exercises.length}`;
  }, [currentIndex, exercises.length]);

  function resetQuiz(nextExercises: Exercise[], nextFileName: string) {
    setExercises(nextExercises);
    setCurrentIndex(0);
    setAnswer('');
    setFeedback('idle');
    setError('');
    setFileName(nextFileName);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseExercises(text);
      resetQuiz(parsed, file.name);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not read that file.');
      setFeedback('idle');
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedAnswer = normalizeEnding(answer);

    if (normalizedAnswer === currentExercise.ending) {
      setFeedback('correct');
      return;
    }

    setFeedback('wrong');
    window.setTimeout(() => {
      setFeedback((existing) => (existing === 'wrong' ? 'idle' : existing));
    }, 520);
  }

  function goToNext() {
    if (currentIndex === exercises.length - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((index) => index + 1);
    }

    setAnswer('');
    setFeedback('idle');
  }

  function loadSample() {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    resetQuiz(SAMPLE_EXERCISES, '');
  }

  if (screen === 'home') {
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

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="setup-panel" aria-label="Exercise setup">
          <div>
            <p className="eyebrow">Adjective endings</p>
            <h1>German grammar practice</h1>
          </div>

          <button className="back-button" type="button" onClick={() => setScreen('home')}>
            Back to exercises
          </button>

          <label className="upload-box">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values,text/plain"
              onChange={handleUpload}
            />
            <span className="upload-title">Upload exercise file</span>
            <span className="upload-copy">
              {fileName || 'CSV or TSV with sentence, ending, case, gender, number'}
            </span>
          </label>

          <button className="secondary-button" type="button" onClick={loadSample}>
            Load sample set
          </button>

          {error ? <p className="error-message">{error}</p> : null}

          <div className="format-note">
            <span>Format</span>
            <code>sentence,ending,case,gender,number</code>
            <code>"Der klein__ Hund",-e,Nominativ,Maskulin,Singular</code>
          </div>
        </aside>

        <section className="practice-area" aria-label="Quiz">
          <header className="practice-header">
            <div>
              <p className="eyebrow">Exercise {progress}</p>
              <h2>Choose the adjective ending</h2>
            </div>
            <div className="status-pill">{currentExercise.caseName}</div>
          </header>

          <div className="sentence-panel">
            <p className="sentence">{renderSentence(currentExercise.sentence)}</p>
            <form className="answer-row" onSubmit={handleSubmit}>
              <label htmlFor="ending-answer">Ending</label>
              <input
                id="ending-answer"
                type="text"
                value={answer}
                autoComplete="off"
                placeholder="-e"
                onChange={(event) => setAnswer(event.target.value)}
              />
              <button type="submit">Check</button>
              <button type="button" disabled={!isCorrect} onClick={goToNext}>
                Next
              </button>
            </form>

            <div aria-live="polite" className={`feedback-line ${feedback}`}>
              {feedback === 'correct'
                ? `Correct: ${currentExercise.caseName}, ${currentExercise.gender}, ${currentExercise.number}`
                : ' '}
            </div>
          </div>

          <div className={`rules-wrap ${feedback === 'wrong' ? 'shake-error' : ''}`}>
            <table className="rules-table">
              <caption>Weak adjective ending table</caption>
              <thead>
                <tr>
                  <th scope="col">Case</th>
                  {TABLE_GENDERS.map((gender) => (
                    <th scope="col" key={gender}>
                      {gender}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CASES.map((caseName) => (
                  <tr key={caseName}>
                    <th scope="row">{caseName}</th>
                    {TABLE_GENDERS.map((gender) => {
                      const key = `${caseName}-${gender}`;
                      const singularLabel = SINGULAR_GENDERS.includes(gender) ? 'Sg.' : 'Pl.';
                      return (
                        <td
                          className={activeRuleKey === key ? 'active-cell' : ''}
                          key={key}
                        >
                          <strong>{RULES[caseName][gender]}</strong>
                          <span>{singularLabel}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
