import { expect, test } from 'vitest';
import { expensesToCsv } from './csv';

const categories = [
  { id: 1, name: 'Food', color: '#FF6B6B' },
];

test('neutralizes spreadsheet formulas when exporting CSV', () => {
  const csv = expensesToCsv([
    { id: 1, title: '=HYPERLINK("https://example.com")', amount: 10, date: '2026-06-10', categoryId: 1 },
    { id: 2, title: '+SUM(1,2)', amount: 20, date: '2026-06-11', categoryId: 1 },
    { id: 3, title: '-10+20', amount: 30, date: '2026-06-12', categoryId: 1 },
    { id: 4, title: '@cmd', amount: 40, date: '2026-06-13', categoryId: 1 },
  ], categories);

  expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")"');
  expect(csv).toContain("'+SUM(1,2)");
  expect(csv).toContain("'-10+20");
  expect(csv).toContain("'@cmd");
});
