/**
 * Único ficheiro a editar para personalizar a demo.
 *
 * Tudo o que está a `null` é mostrado no site como [POR CONFIRMAR] de forma
 * discreta (ex.: "—,— €"). Não preencher com valores inventados: só com dados
 * confirmados pelo restaurante.
 */

export const restaurante = {
  nome: 'Soul Carioca',
  mote: 'Melhor Boteco da Linha',
  tipo: 'Boteco brasileiro em Parede, Cascais',

  morada: {
    linha1: 'Av. dos Plátanos 125A, Loja D',
    linha2: 'Jardins da Parede',
    codigoPostal: '2775-352 Parede',
  },

  /**
   * Número de WhatsApp em formato internacional, só dígitos (ex.: '351XXXXXXXXX').
   * [POR CONFIRMAR: WhatsApp] Enquanto for `null`, o botão abre o WhatsApp com a
   * mensagem preenchida e deixa escolher o contacto.
   */
  whatsapp: null as string | null,

  /** Mensagem pré-preenchida do botão de reserva. */
  mensagemReserva:
    'Olá Soul Carioca! Gostava de reservar uma mesa.\nDia: \nHora: \nPessoas: \nNome: ',

  /** [POR CONFIRMAR: telefone] Telefone único a mostrar no rodapé. */
  telefone: null as string | null,

  /**
   * [POR CONFIRMAR: horário] Um único bloco de horário.
   * `dias` e `horas` a `null` aparecem como marcadores.
   */
  horario: [
    { dias: null, horas: null },
    { dias: null, horas: null },
  ] as { dias: string | null; horas: string | null }[],

  servicos: [
    'Esplanada',
    'Take away',
    'Entrega',
    'Eventos privados',
    'Estacionamento gratuito na zona',
  ],
} as const;

export type ItemMenu = {
  nome: string;
  descricao: string;
  /** [POR CONFIRMAR: preço] em euros, ex.: 12.5. `null` mostra "—,— €". */
  preco: number | null;
};

/** Destaques com foto. Pratos referidos em avaliações públicas. */
export const destaques: (ItemMenu & { foto: 'feijoada' | 'moqueca' | 'caipirinha'; etiqueta: string })[] = [
  {
    nome: 'Feijoada',
    descricao: 'Feijão preto com carnes, arroz, couve, farofa e laranja.',
    preco: null,
    foto: 'feijoada',
    etiqueta: 'O clássico',
  },
  {
    nome: 'Moqueca de peixe e camarão',
    descricao: 'Cozida em leite de coco, azeite de dendê, tomate e coentros.',
    preco: null,
    foto: 'moqueca',
    etiqueta: 'Para partilhar',
  },
  {
    nome: 'Caipirinha',
    descricao: 'Cachaça, lima, açúcar e muito gelo.',
    preco: null,
    foto: 'caipirinha',
    etiqueta: 'Para brindar',
  },
];

export const menu: { titulo: string; itens: ItemMenu[] }[] = [
  {
    titulo: 'Petiscos',
    itens: [
      { nome: 'Coxinha', descricao: 'Massa estaladiça, recheio de frango desfiado.', preco: null },
      { nome: 'Pastel', descricao: 'Massa fina e frita na hora.', preco: null },
      { nome: 'Dadinhos de tapioca', descricao: 'Cubos de tapioca e queijo, fritos.', preco: null },
    ],
  },
  {
    titulo: 'Pratos',
    itens: [
      { nome: 'Bitoque', descricao: 'Bife, ovo estrelado, batata frita e arroz.', preco: null },
      { nome: 'Pizzas', descricao: 'Sabores a confirmar.', preco: null },
    ],
  },
  {
    titulo: 'Sobremesas',
    itens: [
      { nome: 'Mousse de tapioca', descricao: 'Leve e cremosa.', preco: null },
      { nome: 'Brigadeiro', descricao: 'Chocolate e granulado, como manda a tradição.', preco: null },
    ],
  },
];
