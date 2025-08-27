import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import Api from '../../Api';
import './style.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await Api.login({
        email: formData.email,
        password: formData.password
      });
      
      if (response.status === 200) {
        // Salva o token no localStorage
        localStorage.setItem('VBOT_ACCESS_TOKEN', response.data.token);
        
        // Redireciona para a página inicial
        window.location.reload();

      } else {
        setLoginError(response.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setLoginError('Erro ao fazer login. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-left">
          <div className="login-left-content">
            <Logo size="large" className="login-logo" />
            <h1>Potencialize suas campanhas com IA</h1>
            <p className="login-subtitle">
              Plataforma inteligente para criação e gestão de campanhas com resultados superiores.
            </p>
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="login-feature-text">
                  <h3>IA Avançada</h3>
                  <p>Crie campanhas otimizadas com nossa inteligência artificial que entende seu público-alvo.</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <i className="fas fa-bullseye"></i>
                </div>
                <div className="login-feature-text">
                  <h3>Segmentação Precisa</h3>
                  <p>Direcione suas mensagens para os leads certos no momento certo.</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div className="login-feature-text">
                  <h3>Análise em Tempo Real</h3>
                  <p>Acompanhe o desempenho das suas campanhas com métricas detalhadas.</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="login-feature-text">
                  <h3>Automação Inteligente</h3>
                  <p>Automatize disparos e interações com base no comportamento dos leads.</p>
                </div>
              </div>
            </div>
            <div className="login-testimonial">
              <p>"O VBOT irá revolucionar a estratégia de marketing, aumentando sua taxa de conversão."</p>
              <div className="login-testimonial-author">
                <strong>Andréia Brito</strong> - Diretora VBOT
              </div>
            </div>
          </div>
        </div>
        
        <div className="login-right">
          <Card className="login-card">
            <div className="login-card-header">
              <h2>Acesse sua conta</h2>
              <p>Entre para gerenciar suas campanhas inteligentes</p>
            </div>
            
            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <Input
                label="E-mail"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Seu e-mail corporativo"
                error={errors.email}
                required
              />
              
              <Input
                label="Senha"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Sua senha"
                error={errors.password}
                required
              />
              
              <div className="login-options">
                <label className="login-remember">
                  <input type="checkbox" /> Lembrar-me
                </label>
                {/*<a href="/forgot-password" className="login-forgot">
                  Esqueceu a senha?
                </a>*/}
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                size="large" 
                fullWidth 
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
              
              <div className="login-register">
                <span>Não tem uma conta?</span>
                <a target="_blank" href="https://api.whatsapp.com/send/?phone=5561981644455&text=Ol%C3%A1%20Gostaria%20do%20acesso%20ao%20VBot&type=phone_number&app_absent=0">Solicitar acesso</a>
              </div>
            </form>
            
            <div className="login-footer">
              <p>Ao entrar, você concorda com nossos <Link to="/terms">Termos de Serviço</Link> e <Link to="/privacy">Política de Privacidade</Link>.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;