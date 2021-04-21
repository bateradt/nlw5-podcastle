export default function Home(props) {
  return (
    <>
      <h1>Hello world Next.js</h1>
      <p>{JSON.stringify(props.episode)}</p>
    </>
  );
}

export async function getStaticProps() {
  const response = await fetch('http://localhost:3335/episodes');
  const data = await response.json();
  return {
    props: {
      episode: data,
    },
    revalidate: 60 * 60 * 8,
  };
}
