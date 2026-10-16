// Cada foto no repositório tem de ter crédito no documento e no site.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const fotos = readdirSync('src/assets/fotos').filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
const doc = readFileSync('docs/CREDITOS-IMAGENS.md', 'utf8');
const config = readFileSync('src/config/imagens.ts', 'utf8');

test('há fotos', () => assert.ok(fotos.length > 0));

for (const f of fotos) {
  test(`crédito de ${f}`, () => {
    assert.ok(doc.includes(f), `${f} em falta em docs/CREDITOS-IMAGENS.md`);
    assert.ok(config.includes(`ficheiro: '${f}'`), `${f} em falta em src/config/imagens.ts`);
  });
}

test('README lista os [POR CONFIRMAR] e a nota de conceito', () => {
  const readme = readFileSync('README.md', 'utf8');
  assert.ok(readme.includes('Conceito não oficial, feito para apresentação. Não é o site do restaurante.'));
  for (const tipo of ['horário', 'telefone', 'preço', 'WhatsApp']) {
    assert.ok(readme.includes(`[POR CONFIRMAR: ${tipo}]`), `README sem [POR CONFIRMAR: ${tipo}]`);
  }
});
