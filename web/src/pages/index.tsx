import { NavBar } from '../components/NavBar';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePOstsQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = usePOstsQuery();
  return (
    <>
      <NavBar />
      <div>Hello world</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}> {p.title}</div>)
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
