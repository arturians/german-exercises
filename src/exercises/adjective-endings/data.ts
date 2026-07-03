import { AdjectiveEndingExercise, DeclensionType, Gender, GrammarCase } from './types';

export const CASES: GrammarCase[] = ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'];
export const SINGULAR_GENDERS: Gender[] = ['Maskulin', 'Feminin', 'Neutrum'];
export const TABLE_GENDERS: Gender[] = ['Maskulin', 'Feminin', 'Neutrum', 'Plural'];

export const DECLENSIONS: Array<{
  id: DeclensionType;
  label: string;
  hint: string;
}> = [
  {
    id: 'weak',
    label: 'Definite article',
    hint: 'weak endings',
  },
  {
    id: 'mixed',
    label: 'Indefinite / kein / possessive',
    hint: 'mixed endings',
  },
  {
    id: 'strong',
    label: 'No article',
    hint: 'strong endings',
  },
];

export const RULES: Record<DeclensionType, Record<GrammarCase, Record<Gender, string>>> = {
  weak: {
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
  },
  mixed: {
    Nominativ: {
      Maskulin: '-er',
      Feminin: '-e',
      Neutrum: '-es',
      Plural: '-en',
    },
    Akkusativ: {
      Maskulin: '-en',
      Feminin: '-e',
      Neutrum: '-es',
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
  },
  strong: {
    Nominativ: {
      Maskulin: '-er',
      Feminin: '-e',
      Neutrum: '-es',
      Plural: '-e',
    },
    Akkusativ: {
      Maskulin: '-en',
      Feminin: '-e',
      Neutrum: '-es',
      Plural: '-e',
    },
    Dativ: {
      Maskulin: '-em',
      Feminin: '-er',
      Neutrum: '-em',
      Plural: '-en',
    },
    Genitiv: {
      Maskulin: '-en',
      Feminin: '-er',
      Neutrum: '-en',
      Plural: '-er',
    },
  },
};

export const SAMPLE_EXERCISES: AdjectiveEndingExercise[] = [
  {
    id: 'sample-1',
    sentence: 'Der klein__ Hund schläft im Flur.',
    ending: '-e',
    declension: 'weak',
    caseName: 'Nominativ',
    gender: 'Maskulin',
    number: 'Singular',
  },
  {
    id: 'sample-2',
    sentence: 'Ich sehe den alt__ Mann am Bahnhof.',
    ending: '-en',
    declension: 'weak',
    caseName: 'Akkusativ',
    gender: 'Maskulin',
    number: 'Singular',
  },
  {
    id: 'sample-3',
    sentence: 'Ein freundlich__ Mann wartet draußen.',
    ending: '-er',
    declension: 'mixed',
    caseName: 'Nominativ',
    gender: 'Maskulin',
    number: 'Singular',
  },
  {
    id: 'sample-4',
    sentence: 'Wir kaufen frisch__ Brot.',
    ending: '-es',
    declension: 'strong',
    caseName: 'Akkusativ',
    gender: 'Neutrum',
    number: 'Singular',
  },
  {
    id: 'sample-5',
    sentence: 'Mit gut__ Freunden lernt man schneller.',
    ending: '-en',
    declension: 'strong',
    caseName: 'Dativ',
    gender: 'Plural',
    number: 'Plural',
  },
  {
    id: 'sample-6',
    sentence: 'Sie hilft einer freundlich__ Frau.',
    ending: '-en',
    declension: 'mixed',
    caseName: 'Dativ',
    gender: 'Feminin',
    number: 'Singular',
  },
];
