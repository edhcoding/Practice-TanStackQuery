/**
 * next.js 초기설정
 * app 컴포넌트에서 초기설정해줌
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function App({ Component, pageProps }) {
  const [queryClient] = React.useState(          => 배열로 작성하는 이유 : 상태를 업데이트 함수가 필요없기 때문에 첫번째 현재상태를 보여주는
    () =>                                        => useState를 사용하는 이유는 QueryClient가 컴포넌트가 마운트될 때마다 재생성되지 않도록 보장하기 위해서입니다.
                                                 => useState를 사용하여 queryClient를 상태로 관리하면, 컴포넌트가 마운트될 때 한 번만 QueryClient가 생성되고 이후로는 동일한 인스턴스를 사용하게 됩니다.
      new QueryClient({    => QueryClient를 사용하여 캐시와 상호 작용할 수 있다.
        defaultOptions: {
          queries: {
            // 보통 SSR에서는 staleTime을 0 이상으로 해줌으로써
            // 클라이언트 사이드에서 바로 다시 데이터를 refetch 하는 것을 피한다.
            staleTime: 60 * 1000,
          },
        },
      })
  );

  Next.js는 SSR을 지원하므로, 클라이언트와 서버 모두에서 상태 관리가 필요합니다. 
  QueryClientProvider를 최상위 컴포넌트로 감싸는 것은 Next.js 페이지가 렌더링될 때마다 
  QueryClient가 초기화되고 공유될 수 있도록 하기 위함입니다.
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
먼저 App 컴포넌트에서 초기 설정을 해 줍니다. Next.js에서는 기존의 리액트 프로젝트와는 다르게 App 컴포넌트 안에 새로운 QueryClient를 useState()를 사용해 state로 선언해 줘야 합니다.
App 컴포넌트 바깥에 선언하게 되면 서버 렌더링시 쿼리 캐시가 다른 사용자들과 리퀘스트 간에 공유가 될 수 있기 때문에 반드시 App 컴포넌트 내부에 선언을 해주고요. Next.js에서는 페이지를 이동하면 App 컴포넌트부터 새롭게 렌더링되기 때문에 쿼리 클라이언트가 매번 새롭게 생성되는 것을 막기 위하여 state로 저장해 줍니다.




Prefetch 구현하기
리액트 쿼리에서는 두 가지 방법으로 prefetching을 지원합니다.
initialData를 사용한 prefetching
- 쿼리에 대한 초기 데이터가 필요하기 전에 캐시에 제공하는 방법이 있다.
- initialData 옵션을 통해서 쿼리를 미리 채우는 데 사용할 수 있으며, 초기 로드 상태도 건너뛸 수도 있다.

export async function getServerSideProps() {
  const posts = await getPosts()
  return { props: { posts } }
}

function Posts(props) {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    initialData: props.posts,
  })

  // ...
}

이 방법은 Next.js에서 정적 생성, 서버 사이드 렌더링을 하면서 prefetch한 데이터를 useQuery()의 initialData로 설정해 주는 방법입니다. 
사용 방법이 매우 간단한데요, prefetching 단계에서는 리액트 쿼리를 전혀 사용하지 않아도 된다는 장점이 있습니다.
다만 몇 가지 단점들도 있는데요.
getStaticProps(), getServerSideProps()는 pages 폴더 안에서만 동작하기 때문에 useQuery()를 사용하려는 컴포넌트까지 prefetch한 데이터를 props drilling으로 내려 줘야만 합니다.
또한 같은 쿼리의 useQuery()를 여러 군데서 사용한다면, 모든 useQuery()에 똑같은 initialData를 설정해 줘야 하는 문제도 있고요.
쿼리가 서버로부터 언제 fetch 되었는지 정확히 알 수 없기 때문에, dataUpdatedAt의 시간이나 쿼리 refetching이 필요한지 여부는 페이지가 로드된 시점으로부터 계산된다는 한계점도 있습니다.
추가적으로 만약 어떤 쿼리 키로 캐싱된 데이터가 이미 있다면 initialData는 해당 데이터를 절대 덮어쓰지 않는데요. 따라서 이미 캐싱된 데이터가 더 오래 된 것이더라도, getServerSideProps() 함수로 받아 온 데이터는 initialData로 설정이 되기 때문에 새로운 데이터로 업데이트할 수 없다는 단점이 있습니다.




Hydration API 사용하기
import { dehydrate, HydrationBoundary, QueryClient, useQuery } from '@tanstack/react-query'

export async function getStaticProps() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({     => queryClient.prefetchQuery을 통해서 prefetch 기능을 제공한다.
    queryKey: ['posts'],
    queryFn: getPosts,
  })

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    }, => dehydrate는 hydration의 반대의 개념인데, React Query에서는 쿼리 결과를 서버에서 클라이언트로 전송할 수 있도록 쿼리 캐시를 직렬화하는 과정을 의미한다.
  }
}

function Posts() {
  const { data } = useQuery({ queryKey: ['posts'], queryFn: getPosts })

  // 이 쿼리는 서버에서 prefetch하지 않는 데이터. 
    // prefetch하는 데이터와 아닌 데이터를 자유롭게 섞어서 활용할 수 있다.
  const { data: commentsData } = useQuery({
    queryKey: ['posts-comments'],
    queryFn: getComments,
  })

  // ...
}

export default PostsRoute({ dehydratedState }) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Posts />
    </HydrationBoundary>
  )
}
Hydration에 대한 설명은 Nextjs의 프리렌더링이란? 강의에서 간단히 살펴보았었는데요. 간단히 말해서 이미 렌더링된 HTML과 리액트를 연결하는 작업을 말합니다. 정적인 HTML을 리액트 코드와 연결해서 동적인 상태로 바꿔 주는 걸 수분을 보충한다는 의미로 hydrate이라고 표현합니다.
dehydrate은 hydrate의 반대되는 말인데요. 동적인 것을 다시 정적인 상태로 만드는 작업을 말합니다. 위 코드에서는 prefetch한 결괏값이 담긴 queryClient를 dehydrate해서 클라이언트로 보내 주었습니다.
이렇게 하면 초기 설정 코드가 늘어나지만 initialData를 이용하면서 발생하는 여러 단점을 모두 해결할 수 있습니다.
 */