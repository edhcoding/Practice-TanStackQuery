import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  addComment,
  getCommentsByPostId,
  getPosts,
  getUserInfo,
  uploadPost,
} from "./api";

// const PAGE_LIMIT = 10;

export const FEED_VARIANT = {
  HOME_FEED: "HomeFeed",
  MY_FEED: "MyFeed",
};
export const USERNAMES = ["codeit", "react", "query"];
export const QUERY_KEYS = {
  POSTS: "posts",
  USER_INFO: "userInfo",
  COMMENT_COUNT: "commentCount",
  COMMENTS: "comments",
};
export const COMMENTS_PAGE_LIMIT = 3;

export default function HomePage({ currentUserInfo, postId }) {
  // 2. useMutation 연습 (useState 때문에 제일 위로 올림)
  const [content, setContent] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [page, setPage] = useState(0);

  const queryClient = useQueryClient(); // invalidateQueries, removeQueries, prefetchQuery

  const uploadPostMutation = useMutation({
    mutationFn: (newPost) => uploadPost(newPost),
    onSuccess: () => {
      // onSuccess, 즉 뮤테이션이 성공한 시점에 ['post'] 쿼리를 invalidate해 주는 함수를 콜백으로 등록해 주면 포스트를 업로드하자마자
      // 업로드된 포스트까지 화면에 잘 보이는 것을 확인할 수 있습니다.
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // 무효화해서 stale일 상태로 만들어 refetch되게 만듬
    },
  });

  const handleInputChange = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = { username: "codeit", content };
    uploadPostMutation.mutate(newPost); // .mutate는 useMutation의 mutationFn를 실행시켜줌
    setContent("");
  };

  const { data: userInfoData, isPending: isUserInfoPending } = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => getUserInfo(currentUsername),
    enabled: !!currentUsername,
  });

  // ...

  const handleLoginButtonClick = () => {
    setCurrentUsername("codeit");
  };

  const handleLogoutClick = () => {
    queryClient.removeQueries({
      queryKey: ["userInfo", currentUsername],
    });
    setCurrentUsername(undefined);
  };

  const loginMessage = isUserInfoPending
    ? "로그인 중입니다..."
    : `${userInfoData?.name}님 환영합니다!`;

  // 1. useQuery 연습

  // const result = useQuery({ queryKey: ["posts"], queryFn: getPosts });
  // console.log(result);

  // const username = "codeit";
  // const result2 = useQuery({
  //   queryKey: ["posts", username],
  //   queryFn: () => getPostsByUsername(username),
  //   staleTime: 60 * 1000,
  // });
  // console.log(result2);

  // const { data: postsDataByUsername } = useQuery({
  //   queryKey: ["posts", username, { status: private }],
  //   queryFn: () => getPrivatePostsByUsername(username),
  // });

  // const { data: postsDataByUsername } = useQuery({
  //   queryKey: ["posts", username],
  //   queryFn: ({ queryKey }) => getPostsByUserId(queryKey[1]),
  // });

  // const username = "codeit";
  // const { data: postsDataByUsername } = useQuery({
  //   queryKey: ["posts", { username }],
  //   queryFn: ({ queryKey }) => {
  //     const [key, { username }] = queryKey;
  //     return getPostsByUserId(username);
  //   },
  // });

  // const {
  //   data: postsData,
  //   isPending,
  //   isError,
  // } = useQuery({
  //   queryKey: ["posts"],
  //   queryFn: getPosts,
  //   retry: 0, //  테스트할 때는 retry 횟수를 0으로 조정하면 에러 화면을 더 빨리 볼 수 있어서 편하게 테스트할 수 있습니다.
  // });

  // const {
  //   data: postsData,
  //   isPending,
  //   isError,
  //   isPlaceholderData, // 현재 보이는 데이터가 이전 데이터라면 버튼 비활성화 시켜줘야함, 그렇지 않으면 유저가 다음 페이지 버튼을 마구 누르는 경우, 존재하지 않는 페이지로 리퀘스트가 갈 수도 있기 때문임
  // } = useQuery({
  //   queryKey: ["posts", page],
  //   queryFn: () => getPosts(page, PAGE_LIMIT),
  //   placeholderData: keepPreviousData, // 이전의 데이터를 유지해서 보여주다가 새로운 데이터 fetch가 완료되면 자연스럽게 새로운 데이터로 바꿔서 보여주게 됨
  // });

  // useEffect(() => {
  //   // 좀 더 심리스(seamless)(원활한)한 유저 인터페이스를 만들고 싶다면 데이터를 prefetch하는 방법도 있습니다.
  //   if (!isPlaceholderData && postsData?.hasMore) {
  //     queryClient.prefetchQuery({
  //       // 쿼리 클라이언트의 prefetchQuery 함수를 이용하면, 데이터를 미리 fetch해 놓기 때문에 다음 페이지로 갈 때 전혀 어색함이나 끊김이 없이 2 페이지의 데이터를 보여줄 수 있습니다.
  //       queryKey: ["posts", page + 1],
  //       queryFn: () => getPosts(page + 1, PAGE_LIMIT),
  //     });
  //   }
  // }, [isPlaceholderData, postsData, queryClient, page]);

  // if (isPending) return "로딩 중입니다...";

  // if (isError) return "에러가 발생했습니다.";

  // const posts = postsData?.results ?? [];

  // 댓글 목록 페이지네이션
  const {
    data: commentsData,
    isPending,
    isPlaceholderData,
  } = useQuery({
    queryKey: [QUERY_KEYS.COMMENTS, postId, page],
    queryFn: () => getCommentsByPostId(postId, page, COMMENTS_PAGE_LIMIT),
    placeholderData: keepPreviousData,
  });

  const addCommentMutation = useMutation({
    mutationFn: (newComment) => addComment(postId, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COMMENTS, postId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COMMENT_COUNT, postId],
      });
    },
  });

  const handleAddComment = (newComment) => {
    setPage(0);
    addCommentMutation.mutate(newComment);
  };

  useEffect(() => {
    if (!isPlaceholderData && commentsData?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.COMMENTS, postId, page + 1],
        queryFn: () =>
          getCommentsByPostId(postId, page + 1, COMMENTS_PAGE_LIMIT),
      });
    }
  }, [isPlaceholderData, commentsData, queryClient, postId, page]);

  if (isPending) return <div>"로딩 중입니다..."</div>;

  const comments = commentsData?.results ?? [];

  const paginationButtons = (
    <div>
      <button
        disabled={page === 0}
        onClick={() => setPage((old) => Math.max(old - 1, 0))}
      >
        &lt;
      </button>
      <button
        disabled={isPlaceholderData || !commentsData?.hasMore}
        onClick={() => setPage((old) => old + 1)}
      >
        &gt;
      </button>
    </div>
  );

  return (
    <>
      <div>
        {currentUsername ? (
          <>
            <div>{loginMessage}</div>
            <button onClick={() => handleLogoutClick()}>로그아웃</button>
          </>
        ) : (
          <button onClick={handleLoginButtonClick}>codeit으로 로그인</button>
        )}
        <form onSubmit={handleSubmit}>
          <textarea
            name="content"
            value={content}
            onChange={handleInputChange}
          />
          <button disabled={!content} type="submit">
            업로드
          </button>
        </form>
      </div>
      {/* <div>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              {post.user.name}: {post.content}
            </li>
          ))}
        </ul>
        <div>
          <button
            disabled={page === 0}
            onClick={() => setPage((old) => Math.max(old - 1, 0))} // 인수중에 가장 큰 수를 반환함
          >
            &lt;
          </button>
          <button
            disabled={isPlaceholderData || !postsData?.hasMore}
            onClick={() => setPage((old) => old + 1)}
          >
            &gt;
          </button>
        </div>
      </div>
      <div className={styles.commentList}>
        <div>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
          {comments.length > 0 ? paginationButtons : ""}
        </div>
        <CommentForm
          currentUserInfo={currentUserInfo}
          onSubmit={handleAddComment}
          buttonDisabled={addCommentMutation.isLoading}
        />
      </div> */}
    </>
  );
}
