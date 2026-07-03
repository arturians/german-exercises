import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import './adjective-endings.css';
import {
  CASES,
  DECLENSIONS,
  RULES,
  SAMPLE_EXERCISES,
  TABLE_GENDERS,
} from './data';
import { normalizeEnding, parseExercises } from './parser';
import { AdjectiveEndingExercise, DeclensionType, Feedback, Gender, GrammarCase } from './types';

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
  return `${exercise.declension}-${exercise.caseName}-${exercise.gender}`;
}

function getMergedRuleCells(declension: DeclensionType, caseName: GrammarCase) {
  return TABLE_GENDERS.reduce<Array<{ ending: string; genders: Gender[] }>>((groups, gender) => {
    const ending = RULES[declension][caseName][gender];
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.ending === ending) {
      lastGroup.genders.push(gender);
    } else {
      groups.push({ ending, genders: [gender] });
    }

    return groups;
  }, []);
}

function getCellLabel(genders: Gender[]) {
  if (genders.length === TABLE_GENDERS.length) {
    return 'All';
  }

  return genders.join(' / ');
}

function getGenderAbbreviation(gender: Gender) {
  return {
    Maskulin: 'Ma',
    Feminin: 'Fe',
    Neutrum: 'Ne',
    Plural: 'Pl',
  }[gender];
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
            {fileName || 'CSV or TSV with sentence, ending, declension, case, gender, number'}
          </span>
        </label>

        <button className="secondary-button" type="button" onClick={loadSample}>
          Load sample set
        </button>

        {error ? <p className="error-message">{error}</p> : null}

        <div className="format-note">
          <span>Format</span>
          <code>sentence,ending,declension,case,gender,number</code>
          <code>"Ein klein__ Hund",-er,mixed,Nominativ,Maskulin,Singular</code>
        </div>
      </aside>

      <section className="practice-area" aria-label="Quiz">
        <header className="practice-header">
          <div>
            <p className="eyebrow">Exercise {progress}</p>
            <h2>Choose the adjective ending</h2>
          </div>
          <div className="status-stack">
            <div className="status-pill">{currentExercise.declension}</div>
            <div className="status-pill">{currentExercise.caseName}</div>
          </div>
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
              ? `Correct: ${currentExercise.declension}, ${currentExercise.caseName}, ${currentExercise.gender}, ${currentExercise.number}`
              : ' '}
          </div>
        </div>

        <div className={`rules-wrap ${feedback === 'wrong' ? 'shake-error' : ''}`}>
          <table className="rules-table">
            <caption>German adjective ending table</caption>
            <thead>
              <tr>
                <th rowSpan={2} scope="col">
                  Case
                </th>
                {DECLENSIONS.map((declension) => (
                  <th className="article-group-heading" colSpan={TABLE_GENDERS.length} scope="colgroup" key={declension.id}>
                    <strong>{declension.label}</strong>
                    <span>{declension.hint}</span>
                  </th>
                ))}
              </tr>
              <tr>
                {DECLENSIONS.flatMap((declension) =>
                  TABLE_GENDERS.map((gender) => (
                    <th className="gender-heading" scope="col" key={`${declension.id}-${gender}`}>
                      <abbr title={gender}>{getGenderAbbreviation(gender)}</abbr>
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {CASES.map((caseName) => (
                <tr key={caseName}>
                  <th className="case-cell" scope="row">
                    {caseName}
                  </th>
                  {DECLENSIONS.flatMap((declension) =>
                    getMergedRuleCells(declension.id, caseName).map(({ ending, genders }, index) => {
                      const isActive = genders.some(
                        (gender) => activeRuleKey === `${declension.id}-${caseName}-${gender}`,
                      );

                      return (
                        <td
                          className={`${index === 0 ? 'group-start' : ''} ${
                            isActive ? 'active-cell' : ''
                          }`}
                          colSpan={genders.length}
                          key={`${caseName}-${declension.id}-${genders.join('-')}`}
                        >
                          <strong>{ending}</strong>
                          <span className="visually-hidden">{getCellLabel(genders)}</span>
                        </td>
                      );
                    }),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
