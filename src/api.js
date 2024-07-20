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
