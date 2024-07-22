import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLikeCountByPostId,
  getLikeStatusByUsername,
  likePost,
  unlikePost,
} from "./api";

function Post({ post, currentUsername }) {
  const queryClient = useQueryClient();

  const { data: likeCount } = useQuery({
    queryKey: ["likeCount", post.id],
    queryFn: () => getLikeCountByPostId(post.id),
  });

  const { data: isPostLikedByCurrentUser } = useQuery({
    queryKey: ["likeStatus", post.id, currentUsername],
    queryFn: () => getLikeStatusByUsername(post.id, currentUsername),
    enabled: !!currentUsername,
  });

  const likesMutation = useMutation({
    mutationFn: async ({ postId, username, userAction }) => {
      if (userAction === "LIKE_POST") {
        await likePost(postId, username); // 좋아요 생성
      } else {
        await unlikePost(postId, username); // 좋아요 삭제
      }
    },
    onMutate: async ({ postId, username, userAction }) => {
      // onMutate는 mutation 함수가 실행되기 전에 실행되고, mutation 함수가 받을 동일한 변수가 전달됨
      // onMutate 함수는 일반적으로 Optimistic Update(낙관적 업데이트)를 구현하기 위해 사용됩니다. 즉, 실제 서버 응답을 기다리지 않고, UI를 즉시 업데이트하여 사용자에게 빠른 피드백을 제공합니다.
      // onMutate 함수에서 쿼리를 취소하고 이전 데이터를 저장한 후, 캐시 데이터를 임시로 업데이트합니다. 이 임시 업데이트는 mutationFn의 성공 여부에 따라 롤백되거나 유지됩니다.
      await queryClient.cancelQueries({
        // cancelQueries 쿼리 수동 취소 => 쿼리를 수동으로 취소하고 싶을 수도 있습니다.
        // 예를 들어, 요청이 완료되는 데 시간이 오래 걸리는 경우 사용자가 취소 버튼을 클릭하여 요청을 중지하도록 허용할 수 있습니다.
        // 이를 위해 queryClient.cancelQueries({ queryKey }) 를 호출하기만 하면 쿼리가 취소되고 이전 상태로 돌아갑니다.
        // 쿼리 함수에 전달된 신호를 소비한 경우 TanStack Query는 또한 Promise를 취소합니다.
        queryKey: ["likeStatus", postId, username],
      });
      await queryClient.cancelQueries({ queryKey: ["likeCount", postId] });

      const prevLikeStatus = queryClient.getQueryData([ // getQueryData는 쿼리의 캐시 된 데이터를 가져오는 함수임
        // 이전 좋아요 상태 저장
        "likeStatus",
        postId,
        username,
      ]);
      const prevLikeCount = queryClient.getQueryData(["likeCount", postId]); // 이전 좋아요 수 저장
      // getQueryData 메서드는 기존 쿼리의 캐싱 된 데이터를 가져오는 데 사용할 수 있는 동기 함수이다. 쿼리가 존재하지 않으면 undefined를 반환함

      queryClient.setQueryData(
        // 새로운 좋아요 상태 설정, queryClient.setQueryData는 캐시 데이터를 즉시 업데이트하기 위해쓰임 (queryClient.invalidateQueries랑 비슷함, 최신화)
        // queryClient.setQueryData는 쿼리의 캐시 된 데이터를 즉시 업데이트하는 데 사용할 수 있는 동기 함수이다.
        // setQueryData의 두 번째 인자는 updater 함수이다. 해당 함수의 첫 번째 매개변수는 oldData로 기존 데이터를 가져온다.
        ["likeStatus", postId, username], // 가져다가 사용하려면 포멧 똑같이 해야함, !! 쿼리 존재하지 않을 경우 쿼리가 생성되므로 포멧 일치!
        () => userAction === "LIKE_POST" // 좋아요 누르면 true 아니면 false
      );
      queryClient.setQueryData(
        ["likeCount", postId],
        (prev) => (userAction === "LIKE_POST" ? prev + 1 : prev - 1) // 새로운 좋아요 수 설정,  좋아요 누른 경우 +1, 취소한 경우 -1
      );

      return { prevLikeStatus, prevLikeCount };
    },
    onError: (err, { postId, username }, context) => { // context => onMutate 함수의 반환값
      queryClient.setQueryData( // 이전 좋아요 상태로 되돌림
        ["likeStatus", postId, username],
        context.prevLikeStatus
      );
      queryClient.setQueryData(["likeCount", postId], context.prevLikeCount); // 이전 좋아요 수로 되돌림
    },
    onSettled: (data, err, { postId, username }) => {
      queryClient.invalidateQueries({ // 해당 쿼리를 무효화하고 데이터를 다시 가져오는 비동기 함수
        queryKey: ["likeStatus", postId, username],
      });
      queryClient.invalidateQueries({
        queryKey: ["likeCount", postId],
      });
    },
  });

  const handleLikeButtonClick = (userAction) => {
    console.log("@@@here", currentUsername);
    if (!currentUsername) return;
    likesMutation.mutate({
      postId: post.id,
      username: currentUsername,
      userAction,
    });
  };

  return (
    <li>
      <div>
        {post.user.name}: {post.content}
      </div>
      <button
        onClick={() =>
          handleLikeButtonClick(
            isPostLikedByCurrentUser ? "UNLIKE_POST" : "LIKE_POST"
          )
        }
      >
        {isPostLikedByCurrentUser ? "♥️ " : "♡ "}
        {`좋아요 ${likeCount ?? 0}개`}
      </button>
    </li>
  );
}

export default Post;
