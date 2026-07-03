import { AdjectiveEndingExercise, Gender, GrammarCase } from './types';

export const CASES: GrammarCase[] = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'];
export const SINGULAR_GENDERS: Gender[] = ['Maskulin', 'Feminin', 'Neutrum'];
export const TABLE_GENDERS: Gender[] = ['Maskulin', 'Feminin', 'Neutrum', 'Plural'];

export const RULES: Record<GrammarCase, Record<Gender, string>> = {
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

export const SAMPLE_EXERCISES: AdjectiveEndingExercise[] = [
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
