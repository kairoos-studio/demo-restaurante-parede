// Verifica o HTML gerado (corre depois de `npm run build`).
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const INDEX = 'dist/index.html';
assert.ok(existsSync(INDEX), 'Falta dist/index.html: correr `npm run build` antes dos testes.');
const html = readFileSync(INDEX, 'utf8');
const FAIXA = 'Conceito não oficial, feito para apresentação. Não é o site do restaurante.';

test('faixa de conceito não oficial visível no topo e no rodapé', () => {
  assert.ok(html.split(FAIXA).length - 1 >= 2);
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
});

test('todas as secções pedidas existem', () => {
  for (const id of ['topo', 'horario', 'menu', 'galeria', 'sobre', 'reservar', 'onde']) {
    assert.match(html, new RegExp(`id="${id}"`), `falta a secção #${id}`);
  }
  assert.match(html, /<footer/);
  assert.match(html, /Soul/);
  assert.match(html, /Melhor Boteco da Linha/);
});

test('marcadores [POR CONFIRMAR] de horário, telefone e preço', () => {
  for (const tipo of ['horário', 'telefone', 'preço', 'WhatsApp']) {
    assert.ok(html.includes(`[POR CONFIRMAR: ${tipo}]`), `falta [POR CONFIRMAR: ${tipo}]`);
  }
  const precos = html.match(/data-por-confirmar="preço"/g) ?? [];
  assert.equal(precos.length, 10, 'todos os 10 itens do menu devem ter preço por confirmar');
});

test('nenhum preço, telefone ou horário inventado', () => {
  const texto = html.replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(texto, /\d+,\d{2}\s?€/, 'há um preço em euros');
  assert.doesNotMatch(texto, /\b\d{1,2}[:h]\d{2}\b/, 'há uma hora escrita');
  assert.doesNotMatch(texto, /(\+351\s?)?\b9\d{2}\s?\d{3}\s?\d{3}\b|\b2\d{2}\s?\d{3}\s?\d{3}\b/, 'há um telefone');
  assert.doesNotMatch(html, /href="tel:/);
});

test('um único botão de WhatsApp; sem número confirmado fica desativado e assinalado', () => {
  assert.equal((html.match(/data-whatsapp/g) ?? []).length, 1);
  const links = html.match(/href="https:\/\/wa\.me\/[^"]*"/g) ?? [];
  if (html.includes('data-por-confirmar="WhatsApp"')) {
    assert.equal(links.length, 0, 'sem número não pode haver link wa.me');
    assert.match(html, /<button[^>]*disabled[^>]*data-whatsapp/);
    assert.match(html, /WhatsApp por confirmar/);
  } else {
    assert.equal(links.length, 1);
    const url = new URL(links[0].slice(6, -1).replaceAll('&amp;', '&'));
    assert.match(url.pathname, /^\/\d{8,}$/);
    assert.match(url.searchParams.get('text') ?? '', /Soul Carioca/);
  }
  assert.doesNotMatch(html, /Respondemos/);
});

test('formulário de reserva é mock e está assinalado', () => {
  assert.match(html, /id="form-reserva"/);
  assert.doesNotMatch(html, /<form[^>]*action=/, 'o formulário não deve ter action');
  assert.match(html, /Demo · não envia/);
  assert.match(html, /nada foi enviado nem guardado/);
});

test('sem serviços externos: scripts, estilos, iframes e fontes locais', () => {
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  assert.doesNotMatch(html, /<link[^>]+href="https?:\/\/[^"]+"[^>]*rel="stylesheet"|<link[^>]+rel="stylesheet"[^>]+href="https?:/);
  assert.doesNotMatch(html, /<iframe/);
  assert.doesNotMatch(html, /googletagmanager|google-analytics|gtag\(|plausible|fonts\.googleapis/);
  for (const ficheiro of readdirSync('dist/_astro').filter((f) => f.endsWith('.css') || f.endsWith('.js'))) {
    const conteudo = readFileSync(`dist/_astro/${ficheiro}`, 'utf8');
    assert.doesNotMatch(conteudo, /url\(["']?https?:/, `${ficheiro} carrega recursos externos`);
  }
});

test('link do mapa sem embed nem chave', () => {
  assert.match(html, /href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=[^"]+"/);
  assert.doesNotMatch(html, /[?&](amp;)?key=/);
});

test('imagens com texto alternativo', () => {
  const imgs = html.match(/<img[^>]*>/g) ?? [];
  assert.ok(imgs.length >= 10);
  for (const img of imgs) assert.match(img, /alt="[^"]+"/);
});
