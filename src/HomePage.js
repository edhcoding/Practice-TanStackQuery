export default function HomePage() {
  // const result = useQuery({ queryKey: ["posts"], queryFn: getPosts });
  // console.log(result);
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

  return <div>hi</div>;
}
