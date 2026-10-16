import { expect, test, type Page } from '@playwright/test';

/** Regista pedidos para fora de localhost e erros da consola. */
function vigiar(page: Page) {
  const externos: string[] = [];
  const erros: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol !== 'data:') externos.push(r.url());
  });
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  page.on('pageerror', (e) => erros.push(e.message));
  return { externos, erros };
}

async function percorrer(page: Page) {
  const altura = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= altura; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(40);
  }
}

test('primeiro ecrã: faixa de conceito, nome, mote e botão de reserva visíveis', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Conceito não oficial, feito para apresentação. Não é o site do restaurante.').first()).toBeInViewport();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Soul');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Carioca');
  await expect(page.locator('.hero__mote')).toHaveText(/Melhor Boteco da Linha/);
  const reservar = page.getByRole('link', { name: 'Reservar mesa' });
  await expect(reservar).toBeInViewport();
  await reservar.click();
  await expect(page.locator('#reserva-titulo')).toBeInViewport();
});

test('formulário mock: valida, confirma, não faz pedidos de rede e deixa repetir', async ({ page }) => {
  const { externos, erros } = vigiar(page);
  await page.goto('/');
  await page.locator('#form-reserva').scrollIntoViewIfNeeded();

  // Envios possíveis: navegação, fetch/XHR, beacons ou qualquer método que não GET.
  // (As imagens lazy da galeria podem carregar durante o scroll e não contam.)
  const envios: string[] = [];
  page.on('request', (r) => {
    if (r.method() !== 'GET' || ['document', 'fetch', 'xhr', 'ping', 'eventsource', 'websocket'].includes(r.resourceType())) {
      envios.push(`${r.method()} ${r.resourceType()} ${r.url()}`);
    }
  });

  // Vazio: mostra erro e não confirma
  await page.getByRole('button', { name: 'Pedir reserva' }).click();
  await expect(page.getByRole('alert')).toHaveText('Preencha o nome, o dia e a hora.');
  await expect(page.locator('#confirmacao')).toBeHidden();

  // Preenchido: confirma com o resumo
  await page.getByLabel('Nome').fill('Ana Exemplo');
  const amanha = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await page.locator('input[name="dia"]').fill(amanha);
  await page.locator('input[name="hora"]').fill('20:30');
  await page.getByLabel('Pessoas').selectOption('4');
  await page.getByRole('button', { name: 'Pedir reserva' }).click();

  const confirmacao = page.locator('#confirmacao');
  await expect(confirmacao).toBeVisible();
  await expect(confirmacao).toBeFocused();
  await expect(page.locator('#confirmacao-resumo')).toHaveText(/^Ana Exemplo, mesa para 4 pessoas, .+, às 20:30\.$/);
  await expect(confirmacao).toContainText('nada foi enviado nem guardado');
  await expect(page.locator('#form-reserva')).toBeHidden();
  expect(page.url()).not.toContain('?');
  expect(envios, 'a submissão não pode enviar dados').toEqual([]);

  // Novo pedido: formulário limpo
  await page.getByRole('button', { name: 'Fazer outro pedido' }).click();
  await expect(page.locator('#form-reserva')).toBeVisible();
  await expect(page.getByLabel('Nome')).toHaveValue('');

  expect(externos).toEqual([]);
  expect(erros).toEqual([]);
});

test('página inteira sem pedidos externos nem erros', async ({ page }) => {
  const { externos, erros } = vigiar(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  await percorrer(page);
  await page.waitForLoadState('networkidle');
  expect(externos).toEqual([]);
  expect(erros).toEqual([]);
  // Todas as imagens carregaram
  const partidas = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length);
  expect(partidas).toBe(0);
});

test('WhatsApp por confirmar: botão desativado e assinalado', async ({ page }) => {
  await page.goto('/');
  const botao = page.locator('[data-whatsapp]');
  await expect(botao).toHaveCount(1);
  await expect(botao).toBeDisabled();
  await expect(page.getByText('WhatsApp por confirmar.')).toBeVisible();
  await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
});

test('marcadores por confirmar visíveis e sem texto cru no ecrã', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-por-confirmar="preço"]')).toHaveCount(10);
  await expect(page.locator('[data-por-confirmar="horário"]').first()).toBeVisible();
  await expect(page.locator('[data-por-confirmar="telefone"]')).toHaveCount(1);
  await expect(page.locator('[data-por-confirmar="preço"]').first()).toHaveAttribute('title', '[POR CONFIRMAR: preço]');
});

test('barra de atalhos só no telemóvel, depois do hero', async ({ page, isMobile }) => {
  await page.goto('/');
  const barra = page.locator('[data-barra]');
  if (!isMobile) {
    await expect(barra).toBeHidden();
    return;
  }
  await expect(barra).not.toHaveClass(/barra--visivel/);
  await page.locator('#menu').scrollIntoViewIfNeeded();
  await expect(barra).toHaveClass(/barra--visivel/);
  await expect(barra.getByRole('link', { name: 'Reservar' })).toBeInViewport();
});

test('sem deslocamento horizontal', async ({ page }) => {
  await page.goto('/');
  const largura = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(largura).toBeLessThanOrEqual(0);
});
