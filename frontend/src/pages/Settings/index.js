import React, { useState, useEffect } from 'react';
import AuthLayout from '../../components/AuthLayout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Switch from '../../components/Switch';
import { toast } from 'react-toastify';
import Api from '../../Api';
import './style.css';

const Settings = () => {
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState('profile');
  
  // Estados para as diferentes seções de configurações
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: ''
  });
  
  const [securityData, setSecurityData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    leadNotifications: true,
    campaignNotifications: true,
    weeklyReports: false,
    monthlyReports: true
  });
  
  const [whatsappSettings, setWhatsappSettings] = useState({
    messageDelay: 10,
    maxMessagesPerDay: 100,
    autoReconnect: true,
    messageTemplate: 'Olá {nome}, tudo bem? Aqui é da {empresa}.'
  });
  
  const [apiSettings, setApiSettings] = useState({
    apiKey: '',
    webhookUrl: '',
    enableWebhooks: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await Api.getUserSettings();
        if (response.success) {
          const { profile, notifications, whatsapp, api } = response.data;
          
          if (profile) {
            setProfileData(profile);
          }
          
          if (notifications) {
            setNotificationSettings(notifications);
          }
          
          if (whatsapp) {
            setWhatsappSettings(whatsapp);
          }
          
          if (api) {
            setApiSettings(api);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        //toast.error('Não foi possível carregar suas configurações');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Manipuladores de alteração para cada seção
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (name, checked) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleWhatsappChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWhatsappSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleApiChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApiSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Funções para salvar cada seção
  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await Api.updateUserProfile(profileData);
      if (response.success) {
        toast.success('Perfil atualizado com sucesso');
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };
  
  const changePassword = async () => {
    // Validação básica
    if (securityData.novaSenha !== securityData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (securityData.novaSenha.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await Api.changePassword(securityData);
      if (response.success) {
        toast.success('Senha alterada com sucesso');
        setSecurityData({
          senhaAtual: '',
          novaSenha: '',
          confirmarSenha: ''
        });
      } else {
        toast.error(response.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setIsSaving(false);
    }
  };
  
  const saveNotifications = async () => {
    setIsSaving(true);
    try {
      const response = await Api.updateNotificationSettings(notificationSettings);
      if (response.success) {
        toast.success('Configurações de notificações atualizadas');
      } else {
        toast.error('Erro ao atualizar configurações de notificações');
      }
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
      toast.error('Erro ao atualizar configurações de notificações');
    } finally {
      setIsSaving(false);
    }
  };
  
  const saveWhatsappSettings = async () => {
    setIsSaving(true);
    try {
      const response = await Api.updateWhatsappSettings(whatsappSettings);
      if (response.success) {
        toast.success('Configurações do WhatsApp atualizadas');
      } else {
        toast.error('Erro ao atualizar configurações do WhatsApp');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações do WhatsApp:', error);
      toast.error('Erro ao atualizar configurações do WhatsApp');
    } finally {
      setIsSaving(false);
    }
  };
  
  const saveApiSettings = async () => {
    setIsSaving(true);
    try {
      const response = await Api.updateApiSettings(apiSettings);
      if (response.success) {
        toast.success('Configurações da API atualizadas');
      } else {
        toast.error('Erro ao atualizar configurações da API');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações da API:', error);
      toast.error('Erro ao atualizar configurações da API');
    } finally {
      setIsSaving(false);
    }
  };
  
  const generateNewApiKey = async () => {
    if (window.confirm('Tem certeza que deseja gerar uma nova chave de API? A chave atual deixará de funcionar.')) {
      setIsSaving(true);
      try {
        const response = await Api.generateNewApiKey();
        if (response.success) {
          setApiSettings(prev => ({
            ...prev,
            apiKey: response.data.apiKey
          }));
          toast.success('Nova chave de API gerada com sucesso');
        } else {
          toast.error('Erro ao gerar nova chave de API');
        }
      } catch (error) {
        console.error('Erro ao gerar nova chave de API:', error);
        toast.error('Erro ao gerar nova chave de API');
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  // Renderizar o conteúdo com base na aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section">
            <h2>Informações do Perfil</h2>
            <p className="section-description">
              Atualize suas informações pessoais e de contato.
            </p>
            
            <div className="form-group">
              <Input
                label="Nome Completo"
                name="nome"
                value={profileData.nome}
                onChange={handleProfileChange}
                placeholder="Seu nome completo"
                required
              />
            </div>
            
            <div className="form-group">
              <Input
                label="E-mail"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>
            
            <div className="form-group">
              <Input
                label="Telefone"
                name="telefone"
                value={profileData.telefone}
                onChange={handleProfileChange}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="form-group">
              <Input
                label="Empresa"
                name="empresa"
                value={profileData.empresa}
                onChange={handleProfileChange}
                placeholder="Nome da sua empresa"
              />
            </div>
            
            <div className="form-group">
              <Input
                label="Cargo"
                name="cargo"
                value={profileData.cargo}
                onChange={handleProfileChange}
                placeholder="Seu cargo na empresa"
              />
            </div>
            
            <div className="form-actions">
              <Button 
                onClick={saveProfile} 
                disabled={isSaving}
                loading={isSaving}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        );
        
      case 'security':
        return (
          <div className="settings-section">
            <h2>Segurança</h2>
            <p className="section-description">
              Altere sua senha e configure opções de segurança da conta.
            </p>
            
            <div className="form-group">
              <Input
                label="Senha Atual"
                type="password"
                name="senhaAtual"
                value={securityData.senhaAtual}
                onChange={handleSecurityChange}
                placeholder="Digite sua senha atual"
                required
              />
            </div>
            
            <div className="form-group">
              <Input
                label="Nova Senha"
                type="password"
                name="novaSenha"
                value={securityData.novaSenha}
                onChange={handleSecurityChange}
                placeholder="Digite a nova senha"
                required
              />
              <small className="form-text">
                A senha deve ter pelo menos 8 caracteres e incluir letras e números.
              </small>
            </div>
            
            <div className="form-group">
              <Input
                label="Confirmar Nova Senha"
                type="password"
                name="confirmarSenha"
                value={securityData.confirmarSenha}
                onChange={handleSecurityChange}
                placeholder="Confirme a nova senha"
                required
              />
            </div>
            
            <div className="form-actions">
              <Button 
                onClick={changePassword} 
                disabled={isSaving}
                loading={isSaving}
              >
                Alterar Senha
              </Button>
            </div>
            
            <div className="security-additional">
              <h3>Sessões Ativas</h3>
              <p>
                Você pode encerrar todas as sessões ativas em outros dispositivos.
                Isso fará com que você precise fazer login novamente em todos os dispositivos.
              </p>
              <Button variant="danger">Encerrar Todas as Sessões</Button>
            </div>
          </div>
        );
        
      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notificações</h2>
            <p className="section-description">
              Configure como e quando deseja receber notificações.
            </p>
            
            <div className="notification-options">
              <div className="notification-option">
                <div className="notification-info">
                  <h4>Notificações por E-mail</h4>
                  <p>Receba atualizações importantes por e-mail</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="notification-option">
                <div className="notification-info">
                  <h4>Novos Leads</h4>
                  <p>Seja notificado quando novos leads forem adicionados</p>
                </div>
                <Switch
                  checked={notificationSettings.leadNotifications}
                  onChange={(checked) => handleNotificationChange('leadNotifications', checked)}
                />
              </div>
              
              <div className="notification-option">
                <div className="notification-info">
                  <h4>Atualizações de Campanhas</h4>
                  <p>Receba notificações sobre o status das suas campanhas</p>
                </div>
                <Switch
                  checked={notificationSettings.campaignNotifications}
                  onChange={(checked) => handleNotificationChange('campaignNotifications', checked)}
                />
              </div>
              
              <div className="notification-option">
                <div className="notification-info">
                  <h4>Relatórios Semanais</h4>
                  <p>Receba um resumo semanal das suas atividades</p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyReports}
                  onChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                />
              </div>
              
              <div className="notification-option">
                <div className="notification-info">
                  <h4>Relatórios Mensais</h4>
                  <p>Receba um relatório detalhado mensal</p>
                </div>
                <Switch
                  checked={notificationSettings.monthlyReports}
                  onChange={(checked) => handleNotificationChange('monthlyReports', checked)}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <Button 
                onClick={saveNotifications} 
                disabled={isSaving}
                loading={isSaving}
              >
                Salvar Preferências
              </Button>
            </div>
          </div>
        );
        
      case 'whatsapp':
        return (
          <div className="settings-section">
            <h2>Configurações do WhatsApp</h2>
            <p className="section-description">
              Configure as opções de envio de mensagens e comportamento das instâncias.
            </p>
            
            <div className="form-group">
              <label>Intervalo entre Mensagens (segundos)</label>
              <input
                type="number"
                name="messageDelay"
                value={whatsappSettings.messageDelay}
                onChange={handleWhatsappChange}
                min="1"
                max="60"
                className="form-control"
              />
              <small className="form-text">
                Tempo de espera entre o envio de mensagens consecutivas.
              </small>
            </div>
            
            <div className="form-group">
              <label>Limite de Mensagens Diárias</label>
              <input
                type="number"
                name="maxMessagesPerDay"
                value={whatsappSettings.maxMessagesPerDay}
                onChange={handleWhatsappChange}
                min="1"
                max="1000"
                className="form-control"
              />
              <small className="form-text">
                Número máximo de mensagens que podem ser enviadas por dia por instância.
              </small>
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="autoReconnect"
                  checked={whatsappSettings.autoReconnect}
                  onChange={handleWhatsappChange}
                />
                Reconexão Automática
              </label>
              <small className="form-text">
                Tentar reconectar automaticamente quando uma instância for desconectada.
              </small>
            </div>
            
            <div className="form-group">
              <label>Modelo de Mensagem Padrão</label>
              <textarea
                name="messageTemplate"
                value={whatsappSettings.messageTemplate}
                onChange={handleWhatsappChange}
                rows="4"
                className="form-control"
                placeholder="Digite o modelo de mensagem padrão..."
              ></textarea>
              <small className="form-text">
                Você pode usar variáveis como {'{nome}'}, {'{empresa}'}, etc.
              </small>
            </div>
            
            <div className="form-actions">
              <Button 
                onClick={saveWhatsappSettings} 
                disabled={isSaving}
                loading={isSaving}
              >
                Salvar Configurações
              </Button>
            </div>
          </div>
        );
        
      case 'api':
        return (
          <div className="settings-section">
            <h2>Configurações de API</h2>
            <p className="section-description">
              Gerencie sua chave de API e configure webhooks para integração com outros sistemas.
            </p>
            
            <div className="api-key-section">
              <h3>Chave de API</h3>
              <div className="api-key-display">
                <Input
                  type="text"
                  value={apiSettings.apiKey}
                  readOnly
                  className="api-key-input"
                />
                <Button 
                  onClick={() => navigator.clipboard.writeText(apiSettings.apiKey)}
                  variant="secondary"
                >
                  Copiar
                </Button>
              </div>
              <Button 
                onClick={generateNewApiKey}
                variant="danger"
                className="generate-key-btn"
                disabled={isSaving}
              >
                Gerar Nova Chave
              </Button>
              <p className="api-key-warning">
                <i className="fas fa-exclamation-triangle"></i>
                Atenção: Gerar uma nova chave invalidará a chave atual.
              </p>
            </div>
            
            <div className="webhook-section">
              <h3>Webhooks</h3>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enableWebhooks"
                    checked={apiSettings.enableWebhooks}
                    onChange={handleApiChange}
                  />
                  Habilitar Webhooks
                </label>
              </div>
              
              <div className="form-group">
                <Input
                  label="URL do Webhook"
                  name="webhookUrl"
                  value={apiSettings.webhookUrl}
                  onChange={handleApiChange}
                  placeholder="https://seu-site.com/webhook"
                  disabled={!apiSettings.enableWebhooks}
                />
                <small className="form-text">
                  Esta URL receberá notificações em tempo real sobre eventos do sistema.
                </small>
              </div>
            </div>
            
            <div className="form-actions">
              <Button 
                onClick={saveApiSettings} 
                disabled={isSaving}
                loading={isSaving}
              >
                Salvar Configurações
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      <div className="settings-container">
        <div className="settings-header">
          <h1>Configurações</h1>
          <p>Gerencie suas preferências e configurações da conta</p>
        </div>
        
        <div className="settings-content">
          <div className="settings-sidebar">
            <ul className="settings-tabs">
              <li 
                className={activeTab === 'profile' ? 'active' : ''}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user"></i>
                <span>Perfil</span>
              </li>
              <li 
                className={activeTab === 'security' ? 'active' : ''}
                onClick={() => setActiveTab('security')}
              >
                <i className="fas fa-lock"></i>
                <span>Segurança</span>
              </li>
              <li 
                className={activeTab === 'notifications' ? 'active' : ''}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="fas fa-bell"></i>
                <span>Notificações</span>
              </li>
              <li 
                className={activeTab === 'whatsapp' ? 'active' : ''}
                onClick={() => setActiveTab('whatsapp')}
              >
                <i className="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
              </li>
              <li 
                className={activeTab === 'api' ? 'active' : ''}
                onClick={() => setActiveTab('api')}
              >
                <i className="fas fa-code"></i>
                <span>API</span>
              </li>
            </ul>
          </div>
          
          <div className="settings-main">
            <Card className="settings-card">
              {isLoading ? (
                <div className="settings-loading">
                  <div className="spinner"></div>
                  <p>Carregando configurações...</p>
                </div>
              ) : (
                renderTabContent()
              )}
            </Card>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Settings;