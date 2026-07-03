import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import './adjective-endings.css';
import { CASES, RULES, SAMPLE_EXERCISES, SINGULAR_GENDERS, TABLE_GENDERS } from './data';
import { normalizeEnding, parseExercises } from './parser';
import { AdjectiveEndingExercise, Feedback } from './types';

type AdjectiveEndingsExerciseProps = {
  onBack: () => void;
};

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

function getRuleKey(exercise: AdjectiveEndingExercise) {
  return `${exercise.caseName}-${exercise.gender}`;
}

export function AdjectiveEndingsExercise({ onBack }: AdjectiveEndingsExerciseProps) {
  const [exercises, setExercises] = useState<AdjectiveEndingExercise[]>(SAMPLE_EXERCISES);
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

  function resetQuiz(nextExercises: AdjectiveEndingExercise[], nextFileName: string) {
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

  return (
    <section className="workspace">
      <aside className="setup-panel" aria-label="Exercise setup">
        <div>
          <p className="eyebrow">Adjective endings</p>
          <h1>German grammar practice</h1>
        </div>

        <button className="back-button" type="button" onClick={onBack}>
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
                      <td className={activeRuleKey === key ? 'active-cell' : ''} key={key}>
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
  );
}
