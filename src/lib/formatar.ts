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

/** Link do WhatsApp com mensagem pré-preenchida. Sem número, abre a escolha de contacto. */
export function linkWhatsApp(numero: string | null, mensagem: string): string {
  const texto = encodeURIComponent(mensagem);
  if (numero === null) return `https://wa.me/?text=${texto}`;
  const digitos = numero.replace(/\D/g, '');
  if (digitos.length < 8) throw new Error('Número de WhatsApp inválido: usar formato internacional, só dígitos.');
  return `https://wa.me/${digitos}?text=${texto}`;
}

/** Link de pesquisa do Google Maps (sem embed, sem chave). */
export function linkMapa(morada: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(morada)}`;
}
