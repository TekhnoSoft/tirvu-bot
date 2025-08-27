import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import './style.css';

const PageNotFound = () => {
  const navigate = useNavigate();

  // Função para voltar à página anterior
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-header">
          <Link to="/" className="not-found-logo-link">
            <Logo size="medium" />
          </Link>
        </div>
        
        <div className="not-found-main">
          <div className="not-found-illustration">
            <div className="not-found-code">404</div>
            <div className="not-found-robot">
              <div className="robot-head">
                <div className="robot-eye left"></div>
                <div className="robot-eye right"></div>
                <div className="robot-mouth"></div>
              </div>
              <div className="robot-body">
                <div className="robot-arm left"></div>
                <div className="robot-arm right"></div>
              </div>
            </div>
          </div>
          
          <h1 className="not-found-title">Página não encontrada</h1>
          <p className="not-found-message">
            Ops! Parece que você está tentando acessar uma página que não existe ou foi movida.
          </p>
          
          <div className="not-found-actions">
            <Button 
              variant="primary" 
              size="large" 
              onClick={() => navigate('/')}
              className="not-found-home-button"
            >
              <i className="fas fa-home"></i> Ir para o início
            </Button>
            
            <Button 
              variant="secondary" 
              size="large" 
              onClick={goBack}
              className="not-found-back-button"
            >
              <i className="fas fa-arrow-left"></i> Voltar
            </Button>
          </div>
          
          <div className="not-found-help">
            <h2>Precisa de ajuda?</h2>
            <p>
              Se você acredita que isso é um erro, entre em contato com nosso suporte:
            </p>
            <a href="mailto:suporte@vbot.com.br" className="not-found-contact">
              <i className="fas fa-envelope"></i> suporte@vbot.com.br
            </a>
          </div>
        </div>
        
        <div className="not-found-suggestions">
          <h3>Você pode tentar:</h3>
          <ul>
            <li>
              <Link to="/">
                <i className="fas fa-home"></i> Página inicial
              </Link>
            </li>
            <li>
              <Link to="/campaigns">
                <i className="fas fa-bullhorn"></i> Campanhas
              </Link>
            </li>
            <li>
              <Link to="/leads">
                <i className="fas fa-users"></i> Leads
              </Link>
            </li>
            <li>
              <Link to="/analytics">
                <i className="fas fa-chart-line"></i> Análises
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="not-found-footer">
          <p>© 2023 VBOT. Todos os direitos reservados.</p>
          <div className="not-found-footer-links">
            <Link to="/terms">Termos de Uso</Link>
            <Link to="/privacy">Política de Privacidade</Link>
          </div>
        </div>
      </div>
      
      <div className="not-found-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
    </div>
  );
};

export default PageNotFound;