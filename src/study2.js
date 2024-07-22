/**
 * useMutation
 * 뮤테이션이란, 사이드 이펙트를 가진 함수를 의미합니다.
 * 데이터베이스에 새로운 값을 추가하거나 수정, 삭제하는 행위는 사이드 이펙트에 해당합니다.
 *
 * useMutation()은 useQuery()와 차이점이 하나 있습니다.
 * useQuery()의 쿼리 함수는 컴포넌트가 마운트되면서 자동으로 실행되지만, useMutation()은 실제로 뮤테이션하는 함수를 직접 실행해 줘야 하는데요.
 * mutate() 함수를 통해 mutationFn으로 등록했던 함수를 실행할 수 있고, 그래야만 백엔드 데이터를 실제로 수정하게 됩니다.
 *
 * 참고로 mutate()를 하면 백엔드의 데이터는 변경이 되지만, 현재 캐시에 저장된 데이터는 refetch를 하지 않는 이상 기존의 데이터가 그대로 저장되어 있습니다.
 * 따라서 refetch를 해줘야만 변경된 데이터를 화면에 제대로 반영할 수 있는데요.
 *
 *
 * useMutation()훅을 이용해 새로운 데이터를 추가해 보았음 그런데 캐시에 있는 데이터가 업데이트되지 않아, 새로운 데이터를 확인하려면 새로고침을 해 줬어야 함
 * 해결법 : invalidateQueries() 함수
 * 이럴 때 쿼리 클라이언트의 invalidateQueries()라는 함수를 사용하면 업로드가 끝난 이후에 자동으로 refetch를 하도록 설정할 수 있습니다.
 * 말 그대로 캐시에 있는 모든 쿼리 혹은 특정 쿼리들을 invalidate하는 함수인데요.
 * invalidate은 '무효화하다' 라는 뜻을 가지고 있는데, 여기서는 캐시에 저장된 쿼리를 무효화한다는 의미입니다.
 * 쿼리를 invalidate하면 해당 쿼리를 통해 받아 온 데이터를 stale time이 지났는지 아닌지에 상관없이
 * 무조건 stale 상태로 만들고, 해당 데이터를 백그라운드에서 refetch하게 됩니다.
 * 쿼리 클라이언트는 useQueryClient() 훅을 사용해서 가져올 수 있고요, 원하는 시점에 queryClient.invalidateQueries() 함수를 실행하면 됩니다.
 *
 *
 * 뮤테이션 객체에는 onMutate, onSuccess, onError, onSettled와 같은 주요 옵션들이 있음
 *
 * mutate() 함수의 콜백 옵션
 * onSuccess, onError, onSettled와 같은 옵션은 useMutation()에서도 사용할 수 있고 mutate() 함수에서도 사용할 수 있습니다.
 * 이때 useMutation()에 등록한 콜백 함수들이 먼저 실행되고, 그다음에 mutate()에 등록한 콜백 함수들이 실행됩니다.
 * uploadPostMutation.mutate(newPost, {
 * onSuccess: () => {
 *   console.log('onSuccess in mutate');
 * },
 * onSettled: () => {
 *   console.log('onSettled in mutate');
 * },
 * });
 *
 * 여기서 한 가지 주의할 점이 있습니다. useMutation()에 등록된 콜백 함수들은 컴포넌트가 언마운트되더라도 실행이 되지만,
 * mutate()의 콜백 함수들은 만약 뮤테이션이 끝나기 전에 해당 컴포넌트가 언마운트되면 실행되지 않는 특징을 가지고 있어요.
 * 따라서 query invalidation과 같이 뮤테이션 과정에서 꼭 필요한 로직은 useMutation()을 통해 등록하고, 그 외에 다른 페이지로 리다이렉트한다든가,
 * 혹은 결과를 토스트로 띄워주는 것과 같이 해당 컴포넌트에 종속적인 로직은 mutate()를 통해 등록해 주면 됩니다.
 */

/**
 * isPending 프로퍼티 활용하기
 * 포스트가 업로드되는 중에는 중복해서 업로드를 하면 안 되니까 버튼을 비활성화해 보도록 합시다. 뮤테이션에는 isPending이라는 값이 있는데요.
 * 다음과 같이 uploadPostMutation.isPending 값을 이용하면 간단히 구현할 수 있습니다.
 */

/**
 * Dependant Query란?
 * enabled 옵션을 사용하면 enabled 값이 true가 되어야만 해당 쿼리가 실행되는데요.
 * 이렇게 어떤 특정 값이나 조건이 충족된 이후에 실행되는 쿼리를 Dependant Query라고 합니다.
 */
// ex)
// const { data: user } = useQuery({
//   queryKey: ['user', email],
//   queryFn: getUserByEmail,
// });

// const userId = user?.id

// const {
//   data: projects,
// } = useQuery({
//   queryKey: ['projects', userId],
//   queryFn: getProjectsByUser,
//   enabled: !!userId,                ............
// });

// 만약 어떤 쿼리가 userId 값이 있을 때만 실행하도록 하고 싶으면 다음과 같이 설정해 주면 됩니다.
// 그러면 userId가 있는 경우 true, 없는 경우 false로 옵션값이 설정될 거에요.
// enabled 옵션값으로 꼭 앞선 쿼리에서 가져온 데이터가 들어가야만 하는 것은 아닙니다.
// 사실 위의 경우에도 백엔드 API 설계에 따라서 두 번의 쿼리가 아니라 한 번의 쿼리로 끝낼 수도 있는데요.
// 예를 들어 getProjectsByUserEmail() 이라는 함수를 통해 유저의 이메일 주소를 백엔드로 전달하고,
// 그에 맞는 유저의 프로젝트를 받을 수 있는 API가 있다면 한 번의 쿼리로 끝낼 수도 있을 겁니다.
// 실제로 enabled 옵션은 쿼리의 순서를 정하기 위해 사용하기보다는 어떤 쿼리를 바로 실행하지 않고 특정한 값이 있거나
// 특정 상황이 되었을 때 실행하도록 하는 등, 다양한 시나리오에서 활용할 수 있습니다.

/**
 * paginated query
 * 리액트 쿼리에서는 좀 더 부드러운 UI 전환을 위해 placeholderData 라는 것을 설정해 줄 수 있습니다.
 * useQuery()에서 placeholderData 옵션에 keepPreviousData 혹은 (prevData) => prevData를 넣어주면 페이지가 새로 바뀌더라도
 * 매번 pending 상태가 되지 않고, 이전의 데이터를 유지해서 보여주다가 새로운 데이터 fetch가 완료되면 자연스럽게 새로운 데이터로 바꿔서 보여주게 됩니다.
 *
 * 그런데 이때 중간 과정에서 다음 페이지 버튼이 활성화된 채로 있는데요.
 * 현재 보이는 데이터가 이전 데이터, 즉 placeholderData라면 다음 페이지 버튼을 비활성화해 주도록 합시다.
 * 그렇지 않으면 유저가 다음 페이지 버튼을 마구 누르는 경우, 존재하지 않는 페이지로 리퀘스트가 갈 수도 있기 때문이에요.
 * useQuery()의 리턴 값에서 isPlaceholderData 값을 활용하면 됩니다.
 */

/**
 * 더 불러오기 기능 구현
 * 리액트 쿼리에 useInfiniteQuery를 이용하면 쉽게 구현가능함
 */

/**
 *  기존에 사용하던 useQuery()를 useInfiniteQuery()로 바꿔 줍시다. 이때 useQuery()와는 달리 useInfiniteQuery()에서는
 * initialPageParam과 getNextPageParam 옵션을 설정해 줘야 하는데요.
 * 페이지네이션과는 달리 페이지 별로 데이터를 별도로 저장하지 않고 전체 포스트를 한 번에 관리할 것이기 때문에 쿼리 키는 다시 ['posts']로 변경해 줍니다.
 * 쿼리 함수도 pageParam이라는 값을 받아서 백엔드에 전달할 페이지값으로 사용하도록 변경해 주겠습니다.
 *
 * useInfiniteQuery()가 어떻게 동작하는지 자세히 알아봅시다. useQuery()에서는 data가 백엔드에서 받아 온 하나의 페이지 정보만 담고 있지만,
 * useInfiniteQuery()에서는 data.pages에 배열의 형태로 모든 페이지의 정보를 담고 있게 됩니다.
 * 페이지네이션을 생각해 보면, 처음엔 첫 번째 페이지(0 페이지)의 데이터를 백엔드로부터 받아와 해당 데이터만 화면에 보여주고,
 * 첫번째 페이지의 데이터는 ['posts', 0]의 쿼리 키로 캐싱했었죠?
 * 그 이후에 다음 페이지로 넘어가면 두 번째 페이지(1 페이지)의 데이터를 백엔드로부터 받아 와 역시 해당 데이터만 화면에 보여 주고,
 * 두 번째 페이지의 데이터는 ['posts', 1]의 쿼리 키로 캐싱했고요.
 * 그런데 useInfiniteQuery()에서는 data.pages 라는 배열 안에 지금까지 받아 온 모든 페이지의 데이터가 담기게 됩니다.
 * 맨 처음 첫 번째 페이지의 데이터를 받아오면 data.pages 배열의 0번 인덱스에 해당 데이터가 저장되고,
 * 두 번째 페이지로 넘어가면 data.pages 배열의 1번 인덱스에 데이터가 저장되는 식이에요.
 * 하나의 배열에 두 페이지의 데이터들이 모두 담겨있으므로 첫 번째와 두 번째 데이터를 한 번에 화면에 보여 줄 수 있는데요.
 * 이런 식으로 더 불러오기를 구현할 수 있습니다. 이 데이터들은 ['posts']라는 하나의 쿼리 키로 캐싱됩니다.
 *
 * page param 사용하기
 * initialPageParam: 0,
 * getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
 *    lastPage.hasMore ? lastPageParam + 1 : undefined,
 * 이때, initialPageParam으로는 초기 페이지 설정값을 정하게 되는데요.
 * 우리가 사용하는 API에서는 0 페이지가 초기 페이지니까 값을 0으로 설정했습니다.
 *
 * 그리고 getNextPageParam() 함수로는 다음 페이지의 설정값을 정하게 됩니다.
 * getNextPageParam()은 lastPage, allPages, lastPageParam, allPageParams를 파라미터로 전달받는데요.
 * - lastPage는 현재까지 중 가장 마지막 페이지의 데이터가 전달됩니다.
 * 만약 현재 2 페이지에 해당하는 데이터까지 받아 왔다면 2 페이지의 데이터가 lastPage로 전달되겠죠.
 * - allPages로는 모든 페이지의 데이터가 전달되고요.
 * - lastPageParam은 현재까지 중 가장 마지막 페이지의 설정값을 말하는데요.
 * 즉 현재 2 페이지까지 받아 왔다면 lastPageParam은 2가 됩니다.
 * - allPageParams는 모든 페이지의 각각의 페이지 설정값을 가지고 있게 되고요.
 *
 * 다음 페이지 불러오기
 * 다음 페이지를 불러오려면 useInfiniteQuery()의 리턴 값 중 하나인 fetchNextPage() 함수를 이용하면 되는데요.
 * fetchNextPage() 함수를 실행하면 getNextPageParam() 함수의 리턴 값이 undefined나 null이 아닌 경우,
 * 해당 리턴 값을 쿼리 함수의 pageParam으로 전달해 그다음 페이지 데이터를 가져옵니다.
 * 따라서 우리는 "더 불러오기" 버튼의 onClick() 함수로 fetchNextPage() 함수를 등록해 주면 되겠죠.
 *
 * 버튼 비활성화 처리하기
 * useInfiniteQuery()의 리턴 값 중 hasNextPage와 isFetchingNextPage를 이용하면 다음과 같이 간단히 구현할 수 있습니다.
 * <button
 *   onClick={fetchNextPage}
 *   disabled={!hasNextPage || isFetchingNextPage}
 * >
 */

/**
 * Optimistic Updates
 * 좋아요를 누를 때마다 1~2초 로딩 시간이 걸린다면 어떨까요? 아마 매번 답답한 마음이 들겠죠.
 * 옵티미스틱 업데이트는 좋아요 기능과 같이 유저에게 빠른 피드백을 제공해야 하는 경우에 사용합니다.
 * 간단히 말하자면 서버로부터의 리스폰스를 기다리지 않고 유저에게 바로 낙관적인 피드백을 주는 것이 옵티미스틱 업데이트인데요.
 * 서버가 제대로 동작하는 걸 낙관적으로 기대하는 것이죠. 예를 들어 '좋아요' 버튼을 눌렀을 때 실제로 서버에 반영이
 * 제대로 되었는지를 확인하지 않고 유저에게 바로 '좋아요' 버튼을 누른 것처럼 버튼을 활성화해서 보여주는 거죠.
 *
 * 이렇게 해도 괜찮은 이유는 리퀘스트는 보통 99% 이상의 확률로 서버에 제대로 반영될 것이고,
 * 또한 만에 하나 중간에 에러가 발생한다고 해도 치명적인 결함이 아니기 때문입니다. 아마 경험하셨을 수도 있겠지만,
 * 내가 좋아요를 눌렀던 포스트를 나중에 봤을 때 좋아요가 안 돼 있다면 보통은 "어라? 내가 이거 좋아요 안 눌렀었나?"하면서
 * 다시 좋아요를 누르면 그만이니까요. 따라서 이러한 상황에서는 매번 서버의 리스폰스를 기다리느라 유저에게 답답함을 주기보다는
 * 옵티미스틱 업데이트를 이용해 빠른 피드백을 제공하는 것이 더 좋습니다.
 *
 * 옵티미스틱 업데이트로 좋아요 구현하기
 * useMutation()의 다양한 콜백을 이용해 구현해 볼 거임
 * 실제 뮤테이션 리퀘스트를 보내기 전에 기존의 캐시 데이터를 조작해서 새로운 데이터를 반영해 유저에게 먼저 보여주고,
 * 그 이후에 뮤테이션이 끝나면 서버에 반영된 데이터를 refetch해서 최신 데이터로 동기화해 주겠습니다.
 */
