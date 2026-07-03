export type GrammarCase = 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';
export type Gender = 'Maskulin' | 'Feminin' | 'Neutrum' | 'Plural';
export type NumberValue = 'Singular' | 'Plural';

export type AdjectiveEndingExercise = {
  id: string;
  sentence: string;
  ending: string;
  caseName: GrammarCase;
  gender: Gender;
  number: NumberValue;
};

export type Feedback = 'idle' | 'correct' | 'wrong';
