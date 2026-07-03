import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

const AI_GENERATION_PROMPT = `Generate German adjective-ending practice sentences as CSV.

Requirements:
- Return only CSV text, no markdown.
- Header must be exactly: sentence,ending,declension,case,gender,number
- Create 30 rows.
- In each sentence, put exactly two underscores where the adjective ending belongs.
- The ending column must contain the correct ending with a leading hyphen, e.g. -e, -en, -er, -es, -em.
- Use declension values only: weak, mixed, strong.
- Use case values only: Nominativ, Akkusativ, Dativ, Genitiv.
- Use gender values only: Maskulin, Feminin, Neutrum, Plural.
- Use number values only: Singular, Plural.
- Cover all declension types, all cases, all genders, and plural.
- Keep sentences natural, short, and suitable for A2-B1 German learners.

Example:
"Ein klein__ Hund wartet.",-er,mixed,Nominativ,Maskulin,Singular`;

function renderSentence(sentence: string, gap: ReactNode) {
  const [before, after] = sentence.split('__');
  return (
    <>
      {before}
      {gap}
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
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [exercises, setExercises] = useState<AdjectiveEndingExercise[]>(SAMPLE_EXERCISES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const currentExercise = exercises[currentIndex];
  const isCorrect = feedback === 'correct';
  const activeRuleKey = isCorrect ? getRuleKey(currentExercise) : '';

  const progress = useMemo(() => {
    return `${currentIndex + 1} / ${exercises.length}`;
  }, [currentIndex, exercises.length]);

  useEffect(() => {
    if (isSetupComplete) {
      answerInputRef.current?.focus();
    }
  }, [currentIndex, isSetupComplete]);

  function resetQuiz(nextExercises: AdjectiveEndingExercise[], nextFileName: string) {
    setExercises(nextExercises);
    setCurrentIndex(0);
    setAnswer('');
    setFeedback('idle');
    setError('');
    setFileName(nextFileName);
    setIsSetupComplete(true);
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

  function handleAnswerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowRight' && isCorrect) {
      event.preventDefault();
      goToNext();
    }
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

  function skipUpload() {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    resetQuiz(SAMPLE_EXERCISES, '');
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(AI_GENERATION_PROMPT);
      setCopyStatus('Copied');
    } catch {
      setCopyStatus('Copy failed');
    }

    window.setTimeout(() => setCopyStatus(''), 1800);
  }

  if (!isSetupComplete) {
    return (
      <section className="setup-screen" aria-label="Exercise setup">
        <header className="setup-header">
          <div>
            <p className="eyebrow">Adjective endings</p>
            <h1>Choose sentence source</h1>
          </div>

          <button
            aria-label="Back to exercises"
            className="back-button"
            title="Back to exercises"
            type="button"
            onClick={onBack}
          />
        </header>

        <div className="setup-options">
          <section className="setup-option setup-option-primary" aria-labelledby="upload-option-title">
            <div className="option-heading">
              <span className="option-step">Option 1</span>
              <h2 id="upload-option-title">Generate a file, then upload it</h2>
              <p>
                Copy the prompt into an AI chat, save the CSV response, and upload that file here.
              </p>
            </div>

            <div className="prompt-helper" aria-label="AI prompt helper">
              <header className="prompt-helper-header">
                <span>Prompt for sentence generation</span>
                <button type="button" onClick={copyPrompt}>
                  {copyStatus || 'Copy prompt'}
                </button>
              </header>
              <pre>{AI_GENERATION_PROMPT}</pre>
            </div>

            <div className="format-note">
              <span>Expected file row</span>
              <code>"Ein klein__ Hund",-er,mixed,Nominativ,Maskulin,Singular</code>
            </div>

            <div className="upload-area">
              <label className="upload-box">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,text/csv,text/tab-separated-values,text/plain"
                  onChange={handleUpload}
                />
                <span className="upload-title">Upload CSV or TSV file</span>
                <span className="upload-action">Choose file</span>
                <span className="upload-copy">
                  {fileName || 'Expected columns: sentence, ending, declension, case, gender, number'}
                </span>
              </label>

              {error ? <p className="error-message">{error}</p> : null}
            </div>
          </section>

          <section className="setup-option setup-option-secondary" aria-labelledby="examples-option-title">
            <div className="option-heading">
              <span className="option-step">Option 2</span>
              <h2 id="examples-option-title">Start with built-in examples</h2>
              <p>
                Skip file creation and practice with the small predefined set already included.
              </p>
            </div>

            <button className="secondary-button" type="button" onClick={skipUpload}>
              Use built-in examples
            </button>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className="practice-layout">
      <section className="practice-area" aria-label="Quiz">
        <header className="practice-header">
          <div>
            <p className="eyebrow">Exercise {progress}</p>
            <h2>Choose the adjective ending</h2>
          </div>
          <button
            aria-label="Back to exercises"
            className="back-button inline-back-button"
            title="Back to exercises"
            type="button"
            onClick={onBack}
          />
        </header>

        <div className="sentence-panel">
          <form className="sentence-form" onSubmit={handleSubmit}>
            <p className="sentence">
              {renderSentence(
                currentExercise.sentence,
                <span className="sentence-gap">
                  <label className="visually-hidden" htmlFor="ending-answer">
                    Ending
                  </label>
                  <input
                    ref={answerInputRef}
                    id="ending-answer"
                    type="text"
                    value={answer}
                    autoComplete="off"
                    placeholder="-e"
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={handleAnswerKeyDown}
                  />
                </span>,
              )}
            </p>

            <div className="answer-actions">
              <button type="submit">
                <span>Check</span>
                <kbd>Enter</kbd>
              </button>
              <button type="button" disabled={!isCorrect} onClick={goToNext}>
                <span>Next</span>
                <kbd>→</kbd>
              </button>
            </div>
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
