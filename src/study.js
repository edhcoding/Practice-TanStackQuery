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