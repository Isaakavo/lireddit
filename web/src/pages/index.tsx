import { ChevronDownIcon, ChevronUpIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import { Layout } from '../components/Layout';
import { UpdootSection } from '../components/UpdootSection';
import { useDeletePostMutation, usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });

  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>you query failed for some reason :C</div>;
  }
  return (
    <Layout>
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((x) => !x ? null : (
            <Flex key={x.id} p={5} shadow='md' borderWidth='1px'>
              <UpdootSection post={x} />
              <Box flex={1}>
                <NextLink href='/post/[id]' as={`/post/${x.id}`}>
                  <Link>
                    <Heading fontSize='xl'>{x.title}</Heading>
                  </Link>
                </NextLink>
                <Text>Posted by {x.creator.username}</Text>
                <Flex>
                  <Text mt={4}>{x.textSnippet}</Text>
                  <IconButton
                    ml='auto'
                    icon={<DeleteIcon />}
                    aria-label='delete post'
                    color='red'
                    onClick={() => {
                      deletePost({ id: x.id });
                    }}
                  />
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            m='auto'
            my={4}
            isLoading={fetching}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
