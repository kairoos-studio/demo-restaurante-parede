/**
 * Fotos de banco de imagens (Wikimedia Commons), guardadas em src/assets/fotos.
 * Créditos completos em docs/CREDITOS-IMAGENS.md. Fotos ilustrativas: não são
 * do restaurante.
 */
import type { ImageMetadata } from 'astro';
import brigadeiros from '../assets/fotos/brigadeiros.jpg';
import caipirinha from '../assets/fotos/caipirinha.jpg';
import coxinha from '../assets/fotos/coxinha.jpg';
import coxinha2 from '../assets/fotos/coxinha-2.jpg';
import feijoadaPanela from '../assets/fotos/feijoada-panela.jpg';
import feijoadaPrato from '../assets/fotos/feijoada-prato.jpg';
import feijoadaServida from '../assets/fotos/feijoada-servida.jpg';
import moquecaCamarao from '../assets/fotos/moqueca-camarao.jpg';
import moquecaPanela from '../assets/fotos/moqueca-panela.jpg';
import pastel from '../assets/fotos/pastel.jpg';

export type Foto = {
  ficheiro: string;
  src: ImageMetadata;
  alt: string;
  autor: string;
  licenca: string;
  fonte: string;
};

const CC_BY_SA_4 = 'CC BY-SA 4.0';

export const fotos = {
  feijoadaPanela: {
    ficheiro: 'feijoada-panela.jpg',
    src: feijoadaPanela,
    alt: 'Feijoada a fumegar numa panela de barro',
    autor: 'Melsj',
    licenca: CC_BY_SA_4,
    fonte: 'https://commons.wikimedia.org/wiki/File:Feijoada_%C3%A0_brasileira_1.jpg',
  },
  feijoadaPrato: {
    ficheiro: 'feijoada-prato.jpg',
    src: feijoadaPrato,
    alt: 'Prato de feijoada visto de cima',
    autor: 'Wilfredor',
    licenca: 'CC0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Feijoada_%C3%A0_brasileira_3.jpg',
  },
  feijoadaServida: {
    ficheiro: 'feijoada-servida.jpg',
    src: feijoadaServida,
    alt: 'Feijoada servida com arroz, couve, farofa e laranja',
    autor: 'Ridiculopathy',
    licenca: 'CC0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Feijoada_(Brazilian_dish),_S%C3%A3o_Lu%C3%ADs,_Maranh%C3%A3o.jpg',
  },
  moquecaCamarao: {
    ficheiro: 'moqueca-camarao.jpg',
    src: moquecaCamarao,
    alt: 'Moqueca de camarão com pimentos e coentros',
    autor: 'BR',
    licenca: CC_BY_SA_4,
    fonte: 'https://commons.wikimedia.org/wiki/File:Moqueca.jpg',
  },
  moquecaPanela: {
    ficheiro: 'moqueca-panela.jpg',
    src: moquecaPanela,
    alt: 'Moqueca a ferver numa panela de barro',
    autor: 'Adrian Michael',
    licenca: 'CC BY-SA 3.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Moqueca_S%C3%A3o_Paulo.jpg',
  },
  caipirinha: {
    ficheiro: 'caipirinha.jpg',
    src: caipirinha,
    alt: 'Dois copos de caipirinha com lima e gelo',
    autor: 'rawpixel.com',
    licenca: 'CC0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Caipirinha_with_lime.jpg',
  },
  coxinha: {
    ficheiro: 'coxinha.jpg',
    src: coxinha,
    alt: 'Coxinha dourada num prato',
    autor: 'Tom B',
    licenca: 'Domínio público',
    fonte: 'https://commons.wikimedia.org/wiki/File:Coxinha.jpg',
  },
  coxinha2: {
    ficheiro: 'coxinha-2.jpg',
    src: coxinha2,
    alt: 'Coxinha num prato branco',
    autor: 'Sintegrity',
    licenca: CC_BY_SA_4,
    fonte: 'https://commons.wikimedia.org/wiki/File:Coxinha_-_iguaria_brasileira_03.jpg',
  },
  pastel: {
    ficheiro: 'pastel.jpg',
    src: pastel,
    alt: 'Pastel frito num prato',
    autor: 'Avelludo',
    licenca: CC_BY_SA_4,
    fonte: 'https://commons.wikimedia.org/wiki/File:Pastel_de_Feira_01.jpg',
  },
  brigadeiros: {
    ficheiro: 'brigadeiros.jpg',
    src: brigadeiros,
    alt: 'Brigadeiros e beijinhos em forminhas',
    autor: 'Rodrigogomesonetwo',
    licenca: CC_BY_SA_4,
    fonte: 'https://commons.wikimedia.org/wiki/File:Brigadeiros.jpg',
  },
} satisfies Record<string, Foto>;

export const galeria: Foto[] = [
  fotos.coxinha,
  fotos.pastel,
  fotos.brigadeiros,
  fotos.feijoadaServida,
  fotos.coxinha2,
  fotos.feijoadaPanela,
];
