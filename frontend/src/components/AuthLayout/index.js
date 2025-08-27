import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMainContext } from '../../helpers/MainContext';
import Sidebar from '../Sidebar';
import './style.css';

const AuthLayout = ({ children }) => {
  const { authenticated, loading } = useMainContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Verifica se o usuário está autenticado
  useEffect(() => {
    if (!loading && !authenticated) {
      navigate('/login');
    }
  }, [authenticated, loading, navigate]);
  
  // Ajusta o sidebar com base no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Configura o estado inicial
    handleResize();
    
    // Adiciona o listener para redimensionamento
    window.addEventListener('resize', handleResize);
    
    // Limpa o listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Alterna o estado do sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Mostra um loading enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }
  
  // Se não estiver autenticado, não renderiza nada (o useEffect redirecionará)
  if (!authenticated) {
    return null;
  }
  
  return (
    <div className={`auth-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className="auth-content">
        <div className="auth-content-inner">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;