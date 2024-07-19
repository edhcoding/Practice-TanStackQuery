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