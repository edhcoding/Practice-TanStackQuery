const BASE_URL = "https://learn.codeit.kr/api/codestudit";

// 모든 포스트 조회
// export async function getPosts() {
//   const response = await fetch(`${BASE_URL}/posts`);
//   return await response.json();
// }

// 모든 포스트 조회 (페이지 네이션)
export async function getPosts(page = 0, limit = 10) {
  const response = await fetch(`${BASE_URL}/posts?page=${page}&limit=${limit}`);
  return await response.json();
}

// 유저 이름으로 따로 포스트 데이터 저장
export async function getPostsByUsername(username) {
  const response = await fetch(`${BASE_URL}/posts?username=${username}`);
  return await response.json();
}

// 포스트 작성
export async function uploadPost(newPost) {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPost),
  });

  if (!response.ok) {
    throw new Error("Failed to upload the post.");
  }

  return await response.json();
}

// 로그인 유저 조회
export async function getUserInfo(username) {
  const response = await fetch(`${BASE_URL}/users/${username}`);
  return await response.json();
}

// 댓글 조회

export async function getCommentCountByPostId(postId) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/comments`);
  const body = await response.json();
  return body.count;
}

export async function getCommentsByPostId(postId, page, limit) {
  const response = await fetch(
    `${BASE_URL}/posts/${postId}/comments?page=${page}&limit=${limit}`
  );
  return await response.json();
}

// 댓글 작성

export async function addComment(postId, newComment) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newComment),
  });

  if (!response.ok) {
    throw new Error("Failed to add the comment.");
  }
  return await response.json();
}

// 좋아요 API
// 모든 좋아요 조회
export async function getLikeCountByPostId(postId) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/likes`);
  const body = await response.json();
  return body.count;
}

// 특정 유저의 좋아요 조회
export async function getLikeStatusByUsername(postId, username) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/likes/${username}`);
  if (response.status === 200) {
    return true;
  } else if (response.status === 404) {
    return false;
  } else {
    throw new Error("Failed to get like status of the post.");
  }
}

// 좋아요 생성
export async function likePost(postId, username) {
  const response = await fetch(
    `${BASE_URL}/posts/${postId}/likes/${username}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to like the post.");
  }
}

// 좋아요 삭제
export async function unlikePost(postId, username) {
  const response = await fetch(
    `${BASE_URL}/posts/${postId}/likes/${username}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to unlike the post.");
  }
}
