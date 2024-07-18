import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import HomePage from "./HomePage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomePage />
      <ReactQueryDevtools initialIsOpen={false} />
      {/* initialIsOpen은 리액트 쿼리 개발자 도구가 열려있는 채로 실행할 것인가를 선택하는 옵션 */}
    </QueryClientProvider>
  );
}

export default App;
