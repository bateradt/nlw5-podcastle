import { GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import api from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

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
    duration: BigInteger;
  };
};

type HomeProps = {
  episodes: Array<Episode>;
};

const TOTAL_TIME_REVALIDATE = 60 * 60 * 8;

export default function Home(props: HomeProps) {
  return (
    <>
      <h1>Hello world Next.js</h1>
      <p>{JSON.stringify(props.episodes)}</p>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get<Episode[]>('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc',
    },
  });

  const episodes = data.map((episode) => {
    return {
      ...episode,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR,
      }),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
    };
  });

  return {
    props: {
      episodes,
    },
    revalidate: TOTAL_TIME_REVALIDATE,
  };
};
