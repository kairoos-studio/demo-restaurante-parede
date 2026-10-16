/** Funções puras (testadas em tests/formatar.test.ts). */

export const MARCADOR_PRECO = '—,— €';
export const MARCADOR_HORA = '—:— – —:—';
export const MARCADOR_DIAS = 'Dias —';
export const MARCADOR_TELEFONE = '+351 ——— ——— ———';

/** Preço em euros no formato português, ou o marcador se não estiver confirmado. */
export function formatarPreco(preco: number | null): string {
  if (preco === null) return MARCADOR_PRECO;
  return `${preco.toFixed(2).replace('.', ',')} €`;
}

/**
 * Link do WhatsApp com mensagem pré-preenchida.
 * Sem número confirmado devolve `null`: o botão fica desativado em vez de abrir
 * uma conversa sem destinatário.
 */
export function linkWhatsApp(numero: string | null, mensagem: string): string | null {
  if (numero === null) return null;
  const texto = encodeURIComponent(mensagem);
  const digitos = numero.replace(/\D/g, '');
  if (digitos.length < 8) throw new Error('Número de WhatsApp inválido: usar formato internacional, só dígitos.');
  return `https://wa.me/${digitos}?text=${texto}`;
}

/** Data no formato AAAA-MM-DD no fuso local (não em UTC, como `toISOString`). */
export function dataLocalISO(data: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}`;
}

/** Link de pesquisa do Google Maps (sem embed, sem chave). */
export function linkMapa(morada: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(morada)}`;
}
