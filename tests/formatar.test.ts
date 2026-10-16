import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatarPreco, linkMapa, linkWhatsApp, MARCADOR_PRECO } from '../src/lib/formatar.ts';

test('preço por confirmar mostra o marcador', () => {
  assert.equal(formatarPreco(null), MARCADOR_PRECO);
  assert.equal(MARCADOR_PRECO, '—,— €');
});

test('preço confirmado usa vírgula decimal', () => {
  assert.equal(formatarPreco(12.5), '12,50 €');
  assert.equal(formatarPreco(3), '3,00 €');
});

test('WhatsApp sem número abre a escolha de contacto com a mensagem', () => {
  const url = new URL(linkWhatsApp(null, 'Olá! Mesa para 2?'));
  assert.equal(url.origin + url.pathname, 'https://wa.me/');
  assert.equal(url.searchParams.get('text'), 'Olá! Mesa para 2?');
});

test('WhatsApp com número limpa espaços e o +', () => {
  const url = new URL(linkWhatsApp('+351 900 000 000', 'Olá'));
  assert.equal(url.pathname, '/351900000000');
  assert.equal(url.searchParams.get('text'), 'Olá');
});

test('WhatsApp rejeita número curto demais', () => {
  assert.throws(() => linkWhatsApp('123', 'Olá'));
});

test('link do mapa é uma pesquisa, sem chave', () => {
  const url = new URL(linkMapa('Av. dos Plátanos 125A, 2775-352 Parede'));
  assert.equal(url.hostname, 'www.google.com');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('query'), 'Av. dos Plátanos 125A, 2775-352 Parede');
  assert.ok(!url.searchParams.has('key'));
});
