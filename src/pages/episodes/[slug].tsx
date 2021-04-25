import React from 'react';
import Head from 'next/head';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import api from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';

const TOTAL_TIME_REVALIDATE_24_HOURS = 60 * 60 * 24;

type Episode = {
  id: string;
  title: string;
  members: string;
  published_at: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  durationAsString: string;
  file: {
    url: string;
    type: string;
    duration: number;
  };
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episodes({ episode }: EpisodeProps) {
  // const router = useRouter();

  // if (router.isFallback) {
  //   return <p>Carregando...</p>;
  // }

  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastle</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button
          type="button"
          onClick={() =>
            play({
              file: {
                duration: episode.file.duration,
                url: episode.file.url,
              },
              members: episode.members,
              thumbnail: episode.thumbnail,
              title: episode.title,
            })
          }
        >
          <img src="/play.svg" alt="Tocar episódios" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  //busca os 2 primeiros registros
  const { data } = await api.get<Episode[]>('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc',
    },
  });

  //gera o objeto para gerar estaticamente as paginas
  const paths = data.map((episode) => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });

  //manda por parametro para gerar as paginas estaticas no momento do build
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;

  const { data } = await api.get<Episode>(`/episodes/${slug}`);

  const episode = {
    ...data,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
      locale: ptBR,
    }),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
  };

  return {
    props: {
      episode,
    },
    revalidate: TOTAL_TIME_REVALIDATE_24_HOURS,
  };
};
