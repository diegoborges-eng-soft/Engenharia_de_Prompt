import { useAuth } from './hooks/useAuth';
import { Auth } from './components/Auth';
import { HomePage } from './components/HomePage';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return session ? <HomePage /> : <Auth />;
}

export default App;
