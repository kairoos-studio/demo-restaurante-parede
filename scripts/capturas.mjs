// Gera os prints (docs/prints/) e o vídeo mobile (docs/video/) a partir do build.
// Uso: npm run build && npm run capturas   (precisa de `npx playwright install chromium`)
import { createReadStream } from 'node:fs';
import { mkdir, readdir, rename, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { chromium, devices } from '@playwright/test';

const PORTA = 4329;
const URL_BASE = `http://localhost:${PORTA}/`;
const PRINTS = 'docs/prints';
const VIDEO = 'docs/video';
const TMP_VIDEO = 'docs/video/.tmp';
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

// Servidor estático mínimo sobre dist/ (o `astro preview` pode ficar em segundo plano).
const servidor = createServer(async (pedido, resposta) => {
  const caminho = normalize(decodeURIComponent(new URL(pedido.url ?? '/', URL_BASE).pathname));
  let ficheiro = join('dist', caminho);
  try {
    if ((await stat(ficheiro)).isDirectory()) ficheiro = join(ficheiro, 'index.html');
    await stat(ficheiro);
    resposta.writeHead(200, { 'Content-Type': TIPOS[extname(ficheiro)] ?? 'application/octet-stream' });
    createReadStream(ficheiro).pipe(resposta);
  } catch {
    resposta.writeHead(404).end();
  }
}).listen(PORTA);

async function esperarServidor() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(URL_BASE);
      if (r.ok) return;
    } catch {
      // ainda a arrancar
    }
    await new Promise((ok) => setTimeout(ok, 500));
  }
  throw new Error('O servidor de preview não arrancou.');
}

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

/** Mostra todos os blocos com animação de entrada (para prints de página inteira). */
async function revelarTudo(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.revelar').forEach((el) => el.classList.add('visivel'));
    document.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
  });
  await page.waitForFunction(() => [...document.images].every((img) => img.complete));
  // Percorrer a página para o Chromium pintar todas as imagens antes da captura inteira.
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < altura; y += 400) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await esperar(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready);
  await esperar(800);
}

/** Scroll suave até um elemento, em passos pequenos (para o vídeo). */
async function deslizarAte(page, seletor, duracao = 1800) {
  await page.evaluate(
    async ({ seletor, duracao }) => {
      const alvo = document.querySelector(seletor);
      if (!alvo) return;
      const inicio = window.scrollY;
      const fim = Math.min(
        alvo.getBoundingClientRect().top + window.scrollY - 12,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const t0 = performance.now();
      await new Promise((ok) => {
        const passo = (t) => {
          const p = Math.min(1, (t - t0) / duracao);
          const s = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
          window.scrollTo(0, inicio + (fim - inicio) * s);
          if (p < 1) requestAnimationFrame(passo);
          else ok();
        };
        requestAnimationFrame(passo);
      });
    },
    { seletor, duracao },
  );
}

async function prints(browser) {
  // Mobile
  const mobile = await browser.newContext({ ...devices['iPhone 13'], locale: 'pt-PT', deviceScaleFactor: 2 });
  let page = await mobile.newPage();
  await page.goto(URL_BASE, { waitUntil: 'networkidle' });
  await esperar(1500);
  await page.screenshot({ path: `${PRINTS}/mobile-1-hero.png` });
  await revelarTudo(page);
  for (const [nome, sel] of [
    ['mobile-2-menu', '#menu'],
    ['mobile-3-reserva', '#reservar'],
  ]) {
    await page.locator(sel).evaluate((el) => el.scrollIntoView());
    await esperar(600);
    await page.screenshot({ path: `${PRINTS}/${nome}.png` });
  }
  await mobile.close();

  const mobileInteiro = await browser.newContext({ ...devices['iPhone 13'], locale: 'pt-PT', deviceScaleFactor: 1 });
  page = await mobileInteiro.newPage();
  await page.goto(URL_BASE, { waitUntil: 'networkidle' });
  await revelarTudo(page);
  // A barra fixa ficaria a meio da imagem numa captura de página inteira.
  await page.addStyleTag({ content: '[data-barra]{display:none!important}' });
  await page.screenshot({ path: `${PRINTS}/mobile-pagina-inteira.png`, fullPage: true });
  await mobileInteiro.close();

  // Desktop
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'pt-PT' });
  page = await desktop.newPage();
  await page.goto(URL_BASE, { waitUntil: 'networkidle' });
  await esperar(1500);
  await page.screenshot({ path: `${PRINTS}/desktop-1-hero.png` });
  await revelarTudo(page);
  await page.screenshot({ path: `${PRINTS}/desktop-pagina-inteira.png`, fullPage: true });
  await desktop.close();
}

async function video(browser) {
  await rm(TMP_VIDEO, { recursive: true, force: true });
  const { viewport } = devices['iPhone 13'];
  const ctx = await browser.newContext({
    ...devices['iPhone 13'],
    locale: 'pt-PT',
    deviceScaleFactor: 2,
    recordVideo: { dir: TMP_VIDEO, size: { width: viewport.width * 2, height: viewport.height * 2 } },
  });
  const page = await ctx.newPage();
  await page.goto(URL_BASE, { waitUntil: 'networkidle' });
  await esperar(3000);
  for (const [sel, pausa] of [
    ['#horario', 2500],
    ['#menu', 1500],
    ['.destaque:nth-child(2)', 1500],
    ['.destaque:nth-child(3)', 1500],
    ['.carta', 2000],
    ['#galeria', 1200],
  ]) {
    await deslizarAte(page, sel);
    await esperar(pausa);
  }
  // Galeria: deslizar na horizontal
  await page.evaluate(() => document.querySelector('.galeria__fita')?.scrollBy({ left: 600, behavior: 'smooth' }));
  await esperar(1800);
  for (const [sel, pausa] of [
    ['#sobre', 2000],
    ['#reservar', 1500],
  ]) {
    await deslizarAte(page, sel);
    await esperar(pausa);
  }
  // Formulário de demonstração
  await deslizarAte(page, '#form-reserva', 1000);
  await page.fill('input[name="nome"]', 'Ana Exemplo', { timeout: 5000 });
  const amanha = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await page.fill('input[name="dia"]', amanha);
  await page.fill('input[name="hora"]', '20:30');
  await page.selectOption('select[name="pessoas"]', '4');
  await esperar(800);
  await page.click('.form__enviar');
  await esperar(3000);
  for (const [sel, pausa] of [
    ['#onde', 2000],
    ['.rodape', 2500],
  ]) {
    await deslizarAte(page, sel);
    await esperar(pausa);
  }
  await deslizarAte(page, '#topo', 2200);
  await esperar(1500);
  const caminho = await page.video()?.path();
  await ctx.close();
  if (caminho) await rename(caminho, `${VIDEO}/percurso-mobile.webm`);
  await rm(TMP_VIDEO, { recursive: true, force: true });
}

try {
  await mkdir(PRINTS, { recursive: true });
  await mkdir(VIDEO, { recursive: true });
  await esperarServidor();
  const browser = await chromium.launch({ chromiumSandbox: false, args: ['--lang=pt-PT'] });
  await prints(browser);
  await video(browser);
  await browser.close();
  console.log('Prints:', (await readdir(PRINTS)).join(', '));
  console.log('Vídeo:', (await readdir(VIDEO)).join(', '));
} finally {
  servidor.close();
}
