import { CASES } from './data';
import { AdjectiveEndingExercise, Gender, GrammarCase, NumberValue } from './types';

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

export function normalizeEnding(value: string) {
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

export function parseExercises(rawText: string): AdjectiveEndingExercise[] {
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
