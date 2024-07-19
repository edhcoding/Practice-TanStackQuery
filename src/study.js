/**
   * data - data에는 우리가 백엔드에서 받아온 데이터들이 들어 있고 리스폰스 바디로 받은 데이터가 객체로 되어 있고,
   *  페이지네이션에 필요한 정보들과 함께 results란 항목에 실제 포스트 데이터가 배열로 들어가 있는 것을 볼 수 있음
   *
   * dataUpdatedAt -  현재의 데이터를 받아온 시간을 나타내는 항목임,
   * 이 시간을 기준으로 언제 데이터를 refetch 할 것인지 등을 정하게 됨
   *
   * 그다음에 isError, isFetched, isPending, isPaused, isSuccess와 같은 다양한 상태 정보도 확인해 볼 수 있고
   * status라는 항목에는 success라고 적혀있는 걸 보니 데이터를 성공적으로 받아왔다는 뜻인 것 같음
   * 그 외에도 fetchStatus, isStale, isPlaceholderData 등등 아직은 잘 모르는 값들이 많은데요. 앞으로 하나씩 차근차근 알아보도록 합시다.
   */

/**
 * status 두가지 종류
 * query status는 실제로 받아 온 data 값이 있는지 없는지를 나타내는 상태 값입니다.
 * fetch status는 queryFn() 함수가 현재 실행되는 중인지 아닌지를 나타냄
 *
 * Query Status
 * 총 세가지 상태를 가짐 "pending", "success", "error"
 * pending - 아직 데이터를 받지 못했다
 * error - 데이터를 받아오는 중 오류발생했다
 * success - 데이터 성공적으로 받아왔다
 * 이러한 세가지의 상태는 isPending, isError, isSuccess와 매칭이 됨 => 이 값들을 이용해 현재 쿼리의 상태가 어떤지 알 수 있음
 *
 * Fetch Status
 * 총 세가지 상태를 가짐 "fetching", "paused", "idle"
 * 우리가 useQuery 사용할 때 쿼리 함수라는 걸 queryFn로 등록해줬는데 이 쿼리함수의 실행상태를 알려주는 것이 fetch status임
 * fetching - 쿼리 함수가 실행중임
 * paused - 쿼리 함수가 시작은 되었지만 실제로는 실행은되지 않다면
 * idle - 쿼리 함수가 어떠한 작업도(fetching, paused)하지 않는 상태
 *
 * 정리
 * query status와 fetch status는 엄연히 독립적인 상태이기 때문에, 상황에 따라 query status와 fetch status가 다양한 조합의 형태로 나타날 수 있습니다.
 * 이상적인 상황에서는 "pending & fetching" 상태에서 "success & idle" 상태가 되겠지만, 에러가 발생하는 경우 "error & idle" 상태가 될 수도 있고
 * "success & idle" 상태에서 데이터를 refetch하게 되면 "success & fetching" 상태가 되기도 합니다.
 */

/**
 * 캐시 (cache)
 * 캐시란 데이터를 미리 복사해 놓는 임시 장소를 말하는데요. 보통 저장 공간의 크기는 작지만, 데이터를 가져오는 속도는 아주 빠르다는 특징이 있습니다.
 * 따라서 자주 사용하는 데이터를 캐시에 저장해 두면, 해당 데이터를 훨씬 빠르게 가져와서 사용할 수 있습니다.
 * 웹 브라우저는 기본적으로 캐시를 사용해서 속도를 높이고 네트워크 비용을 아끼는데요. 사이트에 접속했을 때 받아 온 데이터를 캐시 형태로 저장해서,
 * 사용자가 같은 사이트에 접속하면 서버에 매번 데이터를 다시 요청하는 게 아니라 저장해 놓은 데이터를 유저에게 보여줍니다.
 * 그리고 이렇게 캐시를 사용하는 걸 '캐싱'이라고 합니다.
 *
 *
 * React Query의 캐시
 *
 * 지난 시간까지 우리는 useQuery()를 이용해 포스트 데이터를 받아왔는데요. 코드를 보면 다음과 같았습니다.
 * function HomePage() {
 * const result = useQuery({ queryKey: ['posts'], queryFn: getPosts });
 * console.log(result);
 * return <div>홈페이지</div>;
 * }
 * 쿼리 함수로 설정한 getPosts() 함수를 통해 백엔드로부터 포스트 데이터를 받아왔었음
 * 그런데 useQuery()를 사용한다고 무조건 쿼리 함수가 실행되어 백엔드로부터 데이터를 받아오는 것은 아님 => 우리는 쿼리 함수말고도 쿼리 키를 지정해줬음
 * 쿼리 개발자 도구를 보면 ['posts']라는 쿼리 키로 우리가 받아 온 포스트 데이터가 캐시에 저장되어 있는 것을 볼 수 있습니다.
 * useQuery()는 먼저 전달받은 쿼리 키로 캐시에 저장된 데이터가 있는지 확인합니다. 만약 저장되어 있는 데이터가 없으면 쿼리 함수를 실행해 데이터를 백엔드로부터 받아오게 되죠.
 * 그런 다음에 쿼리 키, 여기서는 ['posts']라는 키로 데이터를 캐시에 저장합니다.
 *
 * 그럼 만약 useQuery()가 실행이 되었는데, 이미 ['posts']라는 쿼리 키로 저장된 데이터가 캐시에 있으면 어떻게 될까요?
 * 이때에는 데이터의 상태에 따라 조금 다르게 동작하는데요.
 * 리액트 쿼리는 백엔드에서 이제 막 데이터를 받아와 캐시에 저장된 데이터는 fresh, 즉 신선한 상태로 판단합니다.
 * 그러다가 stale time이라고 불리는 특정 시간이 지나면 데이터는 stale, 즉 신선하지 않은 상태가 됩니다.
 * 마지막으로 컴포넌트가 언마운트되면(DOM 트리에서 제거되면) 해당 데이터가 쓰이지 않는 상태가 되어서 데이터는 inactive 상태가 됩니다.
 * 결론은 fresh 상태라면 캐시에 저장된 데이터를 리턴하고 끝, stale 상태라면 백그라운드에서 refetch함 . 그리고 백엔드에서 새로 받아 온 데이터로 기존의 ['posts']로 저장되어 있는 데이터를 갱신하죠.
 *
 * 데이터가 stale 상태라면 리액트 쿼리는 기본적으로 다음 네 가지 상황에서 refetch를 진행하게 됨
 * 1. 새로운 쿼리 인스턴스가 마운트 되거나 (refetchOnMount)
 * 2. 브라우저 창에 다시 포커스가 가거나 (refetchOnWindowFocus)
 * 3. 네트워크가 다시 연결되거나 (refetchOnReconnect)
 * 4. 혹은 미리 설정해 둔 refetch interval 시간이 지났을 때 refetch를 하게 됩니다. (refetchInterval)
 * 이를 변경하고 싶다면 각각 refetchOnMount, refetchOnWindowFocus, refetchOnReconnect, refetchInterval 옵션을 변경하면 됩니다.
 */


/**
 * stale time
 * 리액트 쿼리에서는 디폴트 값으로 stale time은 0으로 설정되어 있음
 * 그렇기 때문에 사실상 모든 데이터는 백엔드에서 막 받아왔어도 바로 stale 상태가 되고, 따라서 매번 데이터가 필요할 때마다 refetch를 하게 됨
 * 구현하려는 사이트의 특성에 따라 매번 refetch를 할 필요가 없는 상황에서는 stale time 값을 적절히 변경해 주면 되겠죠.
 * 
 * Garbage Collection Time
 * 캐시는 한정된 공간이기 때문에 필요 없는 데이터는 삭제해서 다른 데이터가 사용할 수 있는 공간을 마련해줘야 하는데요.
 * 리액트 쿼리는 필요 없는 데이터를 삭제하는 것도 알아서 해줍니다. 
 * 쿼리 컴포넌트가 언마운트 되어 해당 데이터가 쓰이지 않는 상황이 되면 데이터는 inactive 상태가 된다고 했는데요. 
 * inactive 상태의 데이터는 가비지 컬렉션 타임(garbage collection time)이 지나면 캐시에서 삭제가 됩니다. 
 * 가비지 컬렉션 타임은 기본적으로 5분으로 설정되어 있는데, 이 역시 값을 변경할 수 있습니다.
 */

/**
 * 라이프 사이클 살펴보기
 * 먼저 useQuery()가 실행되는 컴포넌트가 마운트되면 useQuery()를 통해 쿼리 함수가 실행되고 데이터를 받아옵니다. 
 * 받아 온 데이터는 useQuery()에서 지정해 줬던 쿼리 키를 이용해 캐싱, 즉 캐시에 저장이 되는데요. 
 * 이렇게 캐시에 저장된 데이터는 fresh 상태에서 staleTime이 지나면 stale 상태로 변경됩니다. 
 * 유저가 데이터를 요청하게 되면 캐시된 데이터를 먼저 보여주게 되는데, 이때 데이터가 fresh 상태면 추가적인 refetch를 진행하지 않고, 
 * stale 상태면 백그라운드에서(자체적으로 알아서) refetch를 진행합니다. 
 * refetch가 끝나면 새로운 데이터로 유저에게 보여주고요. 
 * 컴포넌트가 언마운트되어서 데이터가 inactive 상태가 되면 gcTime(가비지 컬렉션 타임) 동안 캐시에 저장되어 있다가 
 * 그 이후에 가비지 콜렉터에 의해 삭제가 되면서 이 여정은 마무리 됩니다.
 * 
 * 
 * 
 * 시간 설정하기
 * 리액트 쿼리에서는 기본적으로 staleTime은 0, gcTime은 5분인데요. 
 * staleTime이 0이므로 기본적으로는 매번 서버에서 데이터를 다시 받아오게 됩니다. 
 * 이를 변경하려면 useQuery()에서  staleTime 옵션값을 변경해 주면 됩니다. 
 * 
 * ex)
 * function HomePage() {
 * const result = useQuery({
 *   queryKey: ['posts'],
 *   queryFn: getPosts,
 *   staleTime: 60 * 1000,
 *   gcTime: 60 * 1000 * 10,
 * });
 * console.log(result);
 * return <div>홈페이지</div>;
 * }
 * 참고로 staleTime과 gcTime은 밀리초(ms)가 기준이기 때문에, 1000이 곧 1초를 의미합니다. 
 * 1분은 60초이니 60을 곱해 주었고요. 여기서 gcTime은 10을 추가로 곱해서 10분으로 설정해 보았습니다.
 */

/**
 * queryKey가 왜 배열 형태일까?
 * 전체 포스트를 저장하고 있는 ['posts'] 쿼리 키와는 구분되는 방식으로 특정 유저의 포스트 데이터만 따로 저장하면 좋을 것 같습니다. 
 * 그럴 때 다음과 같이 계층적으로 쿼리 키를 지정하는 것이 가능합니다.
 * 
 * function HomePage() {
 * const username = 'codeit'; // 임의로 username을 지정
 * const { data: postsDataByUsername } = useQuery({
 *   queryKey: ['posts', username],
 *   queryFn: () => getPostsByUsername(username),
 * });
 * console.log(postsDataByUsername);
 * return <div>홈페이지</div>;
 * }
 * 이렇게 하면 특정 username에 대한 쿼리만 따로 캐싱이 됩니다.
 * 쿼리 개발자 도구 보면
 * 1. ["posts"]
 * 2. ["posts", "codeit"] 2개 나옴
 * 
 * 이렇게 배열을 활용해 계층적인 쿼리 키를 설정하는 것이 가능하고, 또 상황에 따라 다양한 파라미터를 활용해 쿼리 키를 설정할 수도 있어요. 
 * 코드스터딧 사이트에는 없는 기능이지만, 만약 포스트를 나만 볼 수 있는 private 상태로 지정할 수 있다고 가정해 볼까요? 
 * 그러면 특정 유저의 포스트 중 private 상태의 포스트만 받아 와서 다음과 같은 쿼리 키로 저장할 수도 있습니다.
 * 
 * const { data: postsDataByUsername } = useQuery({ 
 *   queryKey: ['posts', username, { status: private }], 
 *   queryFn: () => getPrivatePostsByUsername(username)  ===============> queryFn: ({ queryKey }) => getPostsByUserId(queryKey[1]), queryKey의 index를 이용해서도 작성가능
 * });
 * 
 */


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