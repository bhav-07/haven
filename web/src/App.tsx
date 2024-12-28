import AuthProvider from "./auth/authProvider";
import Routes from "./Routes";

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
