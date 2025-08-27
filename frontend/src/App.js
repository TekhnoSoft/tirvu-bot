import { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { MainContext } from "./helpers/MainContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Api from './Api';
import Utils from './Utils';

// Importação de páginas
import { Analytics, Automacao, Campanhas, Conversations, Home, Instancias, Leads, Login, PageNotFound, Settings } from './pages';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import LoadingScreen from './components/LoadingScreen';

// Componente para rotas privadas
const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useMainContext();
  const location = useLocation();
  
  // Enquanto verifica a autenticação, pode mostrar um loading
  if (loading) {
    return  <LoadingScreen />;
  }
  
  // Redireciona para login se não estiver autenticado
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Componente para rotas públicas (redireciona se já estiver logado)
const PublicRoute = ({ children, restricted = false }) => {
  const { authenticated, loading } = useMainContext();
  const location = useLocation();
  
  // Se a rota for restrita (como login) e o usuário estiver autenticado, redireciona para home
  if (loading) {
    return  <LoadingScreen />;
  }
  
  if (authenticated && restricted) {
    // Redireciona para a página que o usuário tentou acessar originalmente, ou para home
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  return children;
};

// Hook personalizado para acessar o contexto
const useMainContext = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error('useMainContext deve ser usado dentro de um MainContextProvider');
  }
  return context;
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Verifica se há token no localStorage
      const token = localStorage.getItem("VBOT_ACCESS_TOKEN");
      
      if (!token) {
        setAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Configura o token nos headers para as requisições
      Utils.setAuthToken(token);
      
      // Verifica se o token é válido
      const authResponse = await Api.auth();
      
      if (authResponse.status === 200) {
        // Busca os dados do usuário
        const userResponse = await Api.get();
        
        if (userResponse.status === 200) {
          setAuthenticated(true);
          setUser(userResponse.data.data);
        } else {
          logout(false);
        }
      } else {
        logout(false);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      logout(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("VBOT_ACCESS_TOKEN", token);
    Utils.setAuthToken(token);
    setAuthenticated(true);
    setUser(userData);
  };

  const logout = (reloadPage = false, callback) => {
    localStorage.removeItem("VBOT_ACCESS_TOKEN");
    Utils.removeAuthToken();
    setAuthenticated(false);
    setUser(null);
    
    if (callback) {
      callback();
    }
    
    if (reloadPage) {
      window.location.reload();
    }
  };

  // Valores do contexto
  const contextValue = {
    authenticated,
    user,
    setUser,
    loading,
    login,
    logout,
    refreshUserData: loadUserData
  };

  return (
    <MainContext.Provider value={contextValue}>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route 
            path="/login" 
            element={
              <PublicRoute restricted>
                <Login />
              </PublicRoute>
            } 
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Rotas privadas */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          
          {/* Outras rotas privadas que serão adicionadas no futuro */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/campaigns" 
            element={
              <PrivateRoute>
                <Campanhas/>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/leads" 
            element={
              <PrivateRoute>
                <Leads/>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/automation" 
            element={
              <PrivateRoute>
                <Automacao/>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/instances" 
            element={
              <PrivateRoute>
                <Instancias/>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <PrivateRoute>
                <Analytics/>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Settings/>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/conversations" 
            element={
              <PrivateRoute>
                <Conversations/>
              </PrivateRoute>
            } 
          />

          {/* Rota para página não encontrada */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 999999 }} 
        />
      </Router>
    </MainContext.Provider>
  );
}

export default App;