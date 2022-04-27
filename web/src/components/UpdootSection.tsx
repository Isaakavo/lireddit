import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'updoot-loading' | 'downdoot-loading' | 'not-loading'
  >('not-loading');
  const [, vote] = useVoteMutation();
  return (
    <Flex direction='column' justifyContent='center' alignItems='center' mr={4}>
      <IconButton
        icon={<ChevronUpIcon />}
        aria-label='updoot'
        size='lg'
        isLoading={loadingState === 'updoot-loading'}
        color={post.voteStatus === 1 ? 'green' : ''}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState('updoot-loading');
          await vote({ value: 1, postId: post.id });
          setLoadingState('not-loading');
        }}
      />
      {post.points}
      <IconButton
        icon={<ChevronDownIcon />}
        aria-label='downdoot'
        size='lg'
        isLoading={loadingState === 'downdoot-loading'}
        color={post.voteStatus === -1 ? 'tomato' : ''}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState('downdoot-loading');
          await vote({ value: -1, postId: post.id });
          setLoadingState('not-loading');
        }}
      />
    </Flex>
  );
};
