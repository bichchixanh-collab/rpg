// Design reminder: The application has one full-screen Mộc Bản Giang Hồ canvas; no dashboard chrome competes with play.

import ErrorBoundary from "./components/ErrorBoundary";
import GameCanvas from "./components/GameCanvas";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <GameCanvas />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
