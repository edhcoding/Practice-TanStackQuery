/**
 * 다양한 쿼리 사용하기 정리
 * 
 * Dependant Query
 * 어떤 특정 값을 먼저 받아오거나 어떤 조건이 되었을 때 쿼리 함수를 실행하려면 다음과 같이 enabled 옵션을 사용하면 됩니다.
 * const { data: userInfoData } = useQuery({
 *  queryKey: queryKey,
 *  queryFn: queryFn,
 *  enabled: !!username,
 * });
 * 
 * Paginated Query
 * 쿼리 키에 페이지 정보를 포함해서 페이지네이션을 구현할 수 있습니다. placeholderData 옵션을 활용하면, 새로운 페이지를 보여줄 때 이전의 데이터를 보여 주다가 새로운 데이터가 오면 자연스럽게 전환할 수 있습니다.
 * const {data: postsData } = useQuery({
 *  queryKey: ['posts', page],
 *  queryFn: () => getPosts(page, PAGE_LIMIT),
 *  placeholderData: keepPreviousData,
 * });
 * prefetchQuery() 함수를 사용하면 다음 페이지의 데이터를 미리 fetch하도록 구현할 수도 있습니다.
 * useEffect(() => {
 *  if (!isPlaceholderData && postsData?.hasMore) {
 *     queryClient.prefetchQuery({
 *       queryKey: ['posts', page + 1],
 *       queryFn: () => getPosts(page + 1, PAGE_LIMIT),
 *    });
 *  }
 * }, [isPlaceholderData, postsData, queryClient, page]);
 * 
 * Infinite Query
 * const {
 * data: postsData,
 * isPending,
 * isError,
 * hasNextPage,
 * fetchNextPage,
 * isFetchingNextPage,
 * } = useInfiniteQuery({
 * queryKey: ['posts'],
 * queryFn: ({ pageParam }) => getPosts(pageParam, LIMIT),
 * initialPageParam: 0,
 * getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
 *   lastPage.hasMore ? lastPageParam + 1 : undefined,
 * });
 * useInfiniteQuery() 훅에서는 page param 값을 활용하여 페이지를 더 불러옵니다.
 * useQuery()에서는 data에 한 페이지에 해당하는 데이터만 담고 있었지만, useInfiniteQuery()에서는 data에 모든 페이지의 데이터가 pages라는 프로퍼티로 배열에 담겨 있습니다.
 * getNextPageParam() 함수에서 다음 페이지가 있는 경우 다음 page param 값을 리턴하는데요, fetchNextPage() 함수에서는 이렇게 리턴된 page param 값을 쿼리 함수로 전달해 다음 페이지의 데이터를 받아옵니다.
 * 만약 getNextPageParams() 함수에서 undefined나 null 값을 리턴하면 다음 페이지가 없는 것으로 간주해 fetchNextPage() 함수를 실행해도 더 이상 데이터를 받아오지 않고, hasNextPage의 값도 false가 됩니다.
 * 
 * Optimistic updates
 * Optimistic updates는 서버가 제대로 동작할 것을 낙관적으로 기대하며, 서버로부터의 리스폰스를 기다리지 않고 유저에게 바로 피드백을 주는 방식을 말합니다.
 * useMutation()의 onMutate, onError, onSettled 옵션을 활용해 Optimistic updates를 구현할 수 있습니다.
 * const likeMutation = useMutation({
  mutationFn: async ({ postId, username, userAction }) => {
    if (userAction === USER_ACTION.LIKE_POST) {
      await likePost(postId, username);
    } else {
      await unlikePost(postId, username);
    }
  },
  onMutate: async ({ postId, username, userAction }) => {
    await queryClient.cancelQueries({
      queryKey: [QUERY_KEYS.LIKE_STATUS, postId],
    });
    await queryClient.cancelQueries({
      queryKey: [QUERY_KEYS.NUM_OF_LIKES, postId],
    });

    const prevLikeStatus = queryClient.getQueryData([
      QUERY_KEYS.LIKE_STATUS,
      postId,
      username,
    ]);
    const prevLikeCount = queryClient.getQueryData([
      QUERY_KEYS.LIKE_COUNT,
      postId,
    ]);

    queryClient.setQueryData(
      [QUERY_KEYS.LIKE_STATUS, postId, username],
      () => userAction === USER_ACTION.LIKE_POST
    );
    queryClient.setQueryData([QUERY_KEYS.LIKE_COUNT, postId], (prev) => {
      userAction === USER_ACTION.LIKE_POST ? prev + 1 : prev - 1;
    });

    return { prevLikeStatus, prevLikeCount };
  },
  onError: (err, { postId, username }, context) => {
    queryClient.setQueryData(
      [QUERY_KEYS.LIKE_STATUS, postId, username],
      context.prevLikeStatus
    );
    queryClient.setQueryData(
      [QUERY_KEYS.LIKE_COUNT, postId],
      context.prevLikeCount
    );
  },
  onSettled: (data, err, { postId, username }) => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.LIKE_STATUS, postId, username],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.LIKE_COUNT, postId],
    });
  },
});

onMutate
1.우리가 옵티미스틱 업데이트를 통해 변경하려고 하는 데이터가 refetch로 인해 덮어씌워지는 것을 막기 위해 cancelQueries()를 실행하여, 좋아요 관련 데이터를 받아 오지 않도록 쿼리를 취소해 줍니다.
2.에러가 발생했을 때는 이전의 데이터로 롤백해 줘야 하는데요. 롤백용 데이터를 따로 저장해 줍니다.
3.우리가 원하는 값으로 쿼리 데이터를 미리 변경합니다.
4.마지막으로 롤백용 데이터를 리턴해 주면 됩니다.

onError
롤백용 데이터를 세 번째 파라미터인 context로 받아 옵니다. context 값으로 쿼리 데이터를 변경해 줍니다.

onSettled
에러 여부와 상관없이 백엔드 서버와 데이터를 동기화해주기 위해 좋아요 관련 데이터 쿼리를 invalidate해 줍니다.
 */