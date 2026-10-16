// Valida os entregáveis versionados: prints (PNG) e vídeo mobile (WebM, até 1 minuto).
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function dimensoesPng(caminho) {
  const b = readFileSync(caminho);
  assert.ok(b.subarray(0, 8).equals(PNG), `${caminho} não é PNG`);
  return { largura: b.readUInt32BE(16), altura: b.readUInt32BE(20) };
}

/** Duração em segundos de um WebM (elemento Duration da secção Info). */
export function duracaoWebm(b) {
  assert.equal(b.readUInt32BE(0), 0x1a45dfa3, 'não é EBML/WebM');
  const cabecalho = b.subarray(0, 8192);
  let escala = 1_000_000;
  const iEscala = cabecalho.indexOf(Buffer.from([0x2a, 0xd7, 0xb1]));
  if (iEscala >= 0) {
    const n = cabecalho[iEscala + 3] & 0x0f;
    escala = Number(cabecalho.readUIntBE(iEscala + 4, n));
  }
  const i = cabecalho.indexOf(Buffer.from([0x44, 0x89]));
  assert.ok(i >= 0, 'WebM sem Duration');
  const tamanho = cabecalho[i + 2] & 0x7f;
  const valor = tamanho === 4 ? cabecalho.readFloatBE(i + 3) : cabecalho.readDoubleBE(i + 3);
  return (valor * escala) / 1e9;
}

const PRINTS = {
  'mobile-1-hero.png': { largura: 780, altura: 1328 },
  'mobile-2-menu.png': { largura: 780, altura: 1328 },
  'mobile-3-reserva.png': { largura: 780, altura: 1328 },
  'mobile-pagina-inteira.png': { largura: 390 },
  'desktop-1-hero.png': { largura: 1440, altura: 900 },
  'desktop-pagina-inteira.png': { largura: 1440 },
};

for (const [nome, esperado] of Object.entries(PRINTS)) {
  test(`print ${nome}`, () => {
    const d = dimensoesPng(`docs/prints/${nome}`);
    assert.equal(d.largura, esperado.largura);
    if (esperado.altura) assert.equal(d.altura, esperado.altura);
    else assert.ok(d.altura > 3000, 'página inteira demasiado curta');
  });
}

test('vídeo mobile em WebM com até 1 minuto', () => {
  const caminho = 'docs/video/percurso-mobile.webm';
  assert.ok(statSync(caminho).size < 25 * 1024 * 1024, 'vídeo demasiado grande');
  const s = duracaoWebm(readFileSync(caminho));
  assert.ok(s > 15 && s <= 60, `duração inesperada: ${s.toFixed(1)} s`);
});
