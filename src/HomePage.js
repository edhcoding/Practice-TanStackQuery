import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getPosts, uploadPost } from "./api";

export default function HomePage() {
  // 2. useMutation 연습 (useState 때문에 제일 위로 올림)
  const [content, setContent] = useState("");

  const queryClient = useQueryClient();

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
    uploadPostMutation.mutate(newPost);
    setContent("");
  };

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

  const {
    data: postsData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
    retry: 0, //  테스트할 때는 retry 횟수를 0으로 조정하면 에러 화면을 더 빨리 볼 수 있어서 편하게 테스트할 수 있습니다.
  });

  if (isPending) return "로딩 중입니다...";

  if (isError) return "에러가 발생했습니다.";

  const posts = postsData?.results ?? [];

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <textarea
            name="content"
            value={content}
            onChange={handleInputChange}
          />
          <button disabled={uploadPostMutation.isPending || !content} type="submit">
            업로드
          </button>
        </form>
      </div>
      <div>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              {post.user.name}: {post.content}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
