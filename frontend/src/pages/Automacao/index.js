import React, { useState, useEffect, useCallback } from 'react';
import AuthLayout from '../../components/AuthLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Switch from '../../components/Switch';
import Modal from '../../components/Modal';
import { toast } from 'react-toastify';
import Api from '../../Api';
import './style.css';

const Automacoes = () => {
  // Estados
  const [automacoes, setAutomacoes] = useState([]);
  const [filteredAutomacoes, setFilteredAutomacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dados para os selects
  const [campanhas, setCampanhas] = useState([]);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    campanhaId: '',
    status: 'Ativo',
    detalheProduto: '',
    missaoIA: '',
    dadosColeta: [],
    estrategiaConvencimento: '',
    acaoConvencido: '',
    acaoNaoConvencido: '',
    respostasRapidas: [],
    nivelPersonalidade: 'Equilibrado',
    tonConversa: 'Profissional',
    palavrasEvitar: '',
    limiteTentativas: 3,
    tempoEspera: 60,
    notificarHumano: true
  });
  
  // Estado para novo dado a ser coletado
  const [novoDado, setNovoDado] = useState({
    nome: '',
    descricao: '',
    obrigatorio: true
  });
  
  // Estado para nova resposta rápida
  const [novaResposta, setNovaResposta] = useState({
    gatilho: '',
    resposta: ''
  });
  
  // Buscar automações
  const fetchAutomacoes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await Api.getAutomacoes();
      if (response.success) {
        setAutomacoes(response.data);
        setFilteredAutomacoes(response.data);
      } else {
        toast.error('Erro ao carregar automações');
      }
    } catch (error) {
      console.error('Erro ao buscar automações:', error);
      toast.error('Erro ao carregar automações');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Buscar dados para os selects
  const fetchSelectData = useCallback(async () => {
    try {
      // Buscar campanhas
      const campanhasResponse = await Api.getCampanhas();
      if (campanhasResponse.success) {
        setCampanhas(campanhasResponse.data);
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados para selects:', error);
      toast.error('Erro ao carregar dados necessários');
    }
  }, []);
  
  // Carregar dados iniciais
  useEffect(() => {
    fetchAutomacoes();
    fetchSelectData();
  }, [fetchAutomacoes, fetchSelectData]);
  
  // Filtrar automações quando os filtros mudarem
  useEffect(() => {
    filterAutomacoes();
  }, [automacoes, searchTerm, statusFilter]);
  
  // Função para filtrar automações
  const filterAutomacoes = () => {
    let filtered = [...automacoes];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(automacao => 
        automacao.nome.toLowerCase().includes(term) || 
        automacao.descricao.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de status
    if (statusFilter) {
      filtered = filtered.filter(automacao => automacao.status === statusFilter);
    }
    
    setFilteredAutomacoes(filtered);
  };
  
  // Abrir modal para criar nova automação
  const handleCreateAutomacao = () => {
    setFormData({
      id: '',
      nome: '',
      descricao: '',
      campanhaId: '',
      instanciaId: '',
      status: 'Ativo',
      detalheProduto: '',
      missaoIA: '',
      dadosColeta: [],
      estrategiaConvencimento: '',
      acaoConvencido: '',
      acaoNaoConvencido: '',
      respostasRapidas: [],
      nivelPersonalidade: 'Equilibrado',
      tonConversa: 'Profissional',
      palavrasEvitar: '',
      limiteTentativas: 3,
      tempoEspera: 60,
      notificarHumano: true
    });
    setModalMode('create');
    setCurrentStep(1);
    setShowModal(true);
  };
  
  // Abrir modal para editar automação
  const handleEditAutomacao = (automacao) => {
    setFormData({
      ...automacao,
      campanhaId: automacao.campanhaId || '',
      instanciaId: automacao.instanciaId || ''
    });
    setModalMode('edit');
    setCurrentStep(1);
    setShowModal(true);
  };
  
  // Deletar automação
  const handleDeleteAutomacao = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta automação?')) {
      try {
        const response = await Api.deleteAutomacao(id);
        if (response.success) {
          toast.success('Automação excluída com sucesso');
          fetchAutomacoes();
        } else {
          toast.error(response.error || 'Erro ao excluir automação');
        }
      } catch (error) {
        console.error('Erro ao excluir automação:', error);
        toast.error('Erro ao excluir automação');
      }
    }
  };
  
  // Alternar status da automação
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      const response = await Api.updateAutomacaoStatus(id, newStatus);
      if (response.success) {
        toast.success(`Automação ${newStatus === 'Ativo' ? 'ativada' : 'desativada'} com sucesso`);
        
        // Atualizar estado local
        setAutomacoes(prev => prev.map(automacao => 
          automacao.id === id ? { ...automacao, status: newStatus } : automacao
        ));
      } else {
        toast.error(response.error || 'Erro ao atualizar status da automação');
      }
    } catch (error) {
      console.error('Erro ao atualizar status da automação:', error);
      toast.error('Erro ao atualizar status da automação');
    }
  };
  
  // Salvar automação (criar ou editar)
  const handleSaveAutomacao = async () => {
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await Api.createAutomacao(formData);
        if (response.success) {
          toast.success('Automação criada com sucesso');
        }
      } else {
        response = await Api.updateAutomacao(formData.id, formData);
        if (response.success) {
          toast.success('Automação atualizada com sucesso');
        }
      }
      
      if (response.success) {
        setShowModal(false);
        fetchAutomacoes();
      } else {
        toast.error(response.error || 'Erro ao salvar automação');
      }
    } catch (error) {
      console.error('Erro ao salvar automação:', error);
      toast.error('Erro ao salvar automação');
    }
  };
  
  // Manipular mudanças no formulário
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Adicionar novo dado a ser coletado
  const handleAddDadoColeta = () => {
    if (!novoDado.nome) {
      toast.warning('Informe o nome do dado a ser coletado');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      dadosColeta: [...prev.dadosColeta, { ...novoDado, id: Date.now() }]
    }));
    
    setNovoDado({
      nome: '',
      descricao: '',
      obrigatorio: true
    });
  };
  
  // Remover dado a ser coletado
  const handleRemoveDadoColeta = (id) => {
    setFormData(prev => ({
      ...prev,
      dadosColeta: prev.dadosColeta.filter(dado => dado.id !== id)
    }));
  };
  
  // Adicionar nova resposta rápida
  const handleAddRespostaRapida = () => {
    if (!novaResposta.gatilho || !novaResposta.resposta) {
      toast.warning('Preencha o gatilho e a resposta');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      respostasRapidas: [...prev.respostasRapidas, { ...novaResposta, id: Date.now() }]
    }));
    
    setNovaResposta({
      gatilho: '',
      resposta: ''
    });
  };
  
  // Remover resposta rápida
  const handleRemoveRespostaRapida = (id) => {
    setFormData(prev => ({
      ...prev,
      respostasRapidas: prev.respostasRapidas.filter(resposta => resposta.id !== id)
    }));
  };
  
  // Avançar para o próximo passo
  const handleNextStep = () => {
    // Validação do passo atual
    if (currentStep === 1) {
      if (!formData.nome) {
        toast.warning('Preencha todos os campos obrigatórios');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.detalheProduto || !formData.missaoIA) {
        toast.warning('Preencha todos os campos obrigatórios');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  // Voltar para o passo anterior
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Renderizar o conteúdo do modal com base no passo atual
  const renderModalContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="modal-title">
              {modalMode === 'create' ? 'Nova Automação' : 'Editar Automação'}
            </h2>
            <p className="modal-subtitle">Informações Básicas</p>
            
            <div className="form-group">
              <Input
                label="Nome da Automação *"
                name="nome"
                value={formData.nome}
                onChange={handleFormChange}
                placeholder="Ex: Automação de Vendas"
                required
              />
            </div>
            
            <div className="form-group">
              <Input
                label="Descrição"
                name="descricao"
                value={formData.descricao}
                onChange={handleFormChange}
                placeholder="Descreva o objetivo desta automação"
              />
            </div>
            
            <div className="form-row" style={{display: 'none'}}>
              <div className="form-group">
                <Select
                  label="Campanha"
                  name="campanhaId"
                  value={formData.campanhaId}
                  onChange={handleFormChange}
                >
                  <option value="">Selecione uma campanha (opcional)</option>
                  {campanhas.map(campanha => (
                    <option key={campanha.Id} value={campanha.Id}>
                      {campanha.Name}
                    </option>
                  ))}
                </Select>
              </div>
              
            </div>
            
            <div className="form-group">
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </Select>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <h2 className="modal-title">Configuração da IA</h2>
            <p className="modal-subtitle">Defina como a IA deve interagir</p>
            
            <div className="form-group">
              <label className="form-label">Detalhes do Produto/Serviço *</label>
              <textarea
                name="detalheProduto"
                value={formData.detalheProduto}
                onChange={handleFormChange}
                className="form-textarea"
                placeholder="Descreva detalhadamente o produto ou serviço que será oferecido..."
                rows={5}
                required
              ></textarea>
              <small className="form-text">
                Quanto mais detalhes você fornecer, melhor a IA poderá responder às dúvidas dos leads.
              </small>
            </div>
            
            <div className="form-group">
              <label className="form-label">Missão da IA *</label>
              <textarea
                name="missaoIA"
                value={formData.missaoIA}
                onChange={handleFormChange}
                className="form-textarea"
                placeholder="Qual o objetivo principal que a IA deve alcançar nesta conversa?"
                rows={4}
                required
              ></textarea>
              <small className="form-text">
                Ex: Qualificar leads interessados em energia solar, agendar demonstrações, coletar informações para orçamento.
              </small>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h2 className="modal-title">Coleta de Dados</h2>
            <p className="modal-subtitle">Defina quais informações a IA deve coletar</p>
            
            <div className="dados-coleta-container">
              <div className="dados-coleta-form">
                <div className="form-row">
                  <div className="form-group">
                    <Input
                      label="Nome do Dado"
                      value={novoDado.nome}
                      onChange={(e) => setNovoDado({...novoDado, nome: e.target.value})}
                      placeholder="Ex: Telefone, E-mail, Endereço"
                    />
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={novoDado.obrigatorio}
                        onChange={(e) => setNovoDado({...novoDado, obrigatorio: e.target.checked})}
                      />
                      <span className="checkbox-text">Obrigatório</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-group">
                  <Input
                    label="Descrição/Contexto"
                    value={novoDado.descricao}
                    onChange={(e) => setNovoDado({...novoDado, descricao: e.target.value})}
                    placeholder="Como a IA deve solicitar esta informação"
                  />
                </div>
                
                <Button 
                  onClick={handleAddDadoColeta}
                  className="add-dado-btn"
                >
                  <i className="fas fa-plus"></i> Adicionar Dado
                </Button>
              </div>
              
              <div className="dados-coleta-list">
                <h4>Dados a Serem Coletados</h4>
                {formData.dadosColeta.length === 0 ? (
                  <p className="no-data-message">Nenhum dado adicionado</p>
                ) : (
                  <ul className="dados-list">
                    {formData.dadosColeta.map(dado => (
                      <li key={dado.id} className="dado-item">
                        <div className="dado-info">
                          <span className="dado-nome">{dado.nome}</span>
                          {dado.obrigatorio && <span className="dado-badge">Obrigatório</span>}
                          {dado.descricao && <p className="dado-descricao">{dado.descricao}</p>}
                        </div>
                        <button 
                          className="remove-dado-btn"
                          onClick={() => handleRemoveDadoColeta(dado.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        );
        
      case 4:
        return (
          <>
            <h2 className="modal-title">Estratégias de Conversão</h2>
            <p className="modal-subtitle">Defina como a IA deve agir em diferentes cenários</p>
            
            <div className="form-group">
              <label className="form-label">Estratégia para Leads Indecisos</label>
              <textarea
                name="estrategiaConvencimento"
                value={formData.estrategiaConvencimento}
                onChange={handleFormChange}
                className="form-textarea"
                placeholder="O que a IA deve fazer quando perceber que o lead está indeciso ou com objeções?"
                rows={4}
              ></textarea>
              <small className="form-text">
                Ex: Oferecer um desconto especial, destacar diferenciais do produto, compartilhar casos de sucesso.
              </small>
            </div>
            
            <div className="form-group">
              <label className="form-label">Ação para Leads Convencidos</label>
              <textarea
                name="acaoConvencido"
                value={formData.acaoConvencido}
                onChange={handleFormChange}
                className="form-textarea"
                placeholder="O que a IA deve fazer quando o lead demonstrar interesse claro em avançar?"
                rows={3}
              ></textarea>
              <small className="form-text">
                Ex: Agendar uma demonstração, encaminhar para um consultor humano, enviar um link para pagamento.
              </small>
            </div>
            
            <div className="form-group">
              <label className="form-label">Ação para Leads Não Convencidos</label>
              <textarea
                name="acaoNaoConvencido"
                value={formData.acaoNaoConvencido}
                onChange={handleFormChange}
                className="form-textarea"
                placeholder="O que a IA deve fazer quando o lead claramente não tiver interesse?"
                rows={3}
              ></textarea>
              <small className="form-text">
                Ex: Oferecer material educativo, agendar um novo contato futuro, perguntar o motivo da recusa.
              </small>
            </div>
          </>
        );
        
      case 5:
        return (
          <>
            <h2 className="modal-title">Respostas Rápidas</h2>
            <p className="modal-subtitle">Configure respostas para perguntas frequentes</p>
            
            <div className="respostas-rapidas-container">
              <div className="respostas-rapidas-form">
                <div className="form-group">
                  <Input
                    label="Palavra ou Frase Gatilho"
                    value={novaResposta.gatilho}
                    onChange={(e) => setNovaResposta({...novaResposta, gatilho: e.target.value})}
                    placeholder="Ex: preço, garantia, como funciona"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Resposta</label>
                  <textarea
                    value={novaResposta.resposta}
                    onChange={(e) => setNovaResposta({...novaResposta, resposta: e.target.value})}
                    className="form-textarea"
                    placeholder="Resposta que a IA deve dar quando o gatilho for mencionado"
                    rows={3}
                  ></textarea>
                </div>
                
                <Button 
                  onClick={handleAddRespostaRapida}
                  className="add-resposta-btn"
                >
                  <i className="fas fa-plus"></i> Adicionar Resposta
                </Button>
              </div>
              
              <div className="respostas-rapidas-list">
                <h4>Respostas Configuradas</h4>
                {formData.respostasRapidas.length === 0 ? (
                  <p className="no-data-message">Nenhuma resposta adicionada</p>
                ) : (
                  <ul className="respostas-list">
                    {formData.respostasRapidas.map(resposta => (
                      <li key={resposta.id} className="resposta-item">
                        <div className="resposta-info">
                          <span className="resposta-gatilho">"{resposta.gatilho}"</span>
                          <p className="resposta-texto">{resposta.resposta}</p>
                        </div>
                        <button 
                          className="remove-resposta-btn"
                          onClick={() => handleRemoveRespostaRapida(resposta.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        );
        
      case 6:
        return (
          <>
            <h2 className="modal-title">Configurações Avançadas</h2>
            <p className="modal-subtitle">Ajuste o comportamento da IA</p>
            
            <div className="form-group">
              <label className="form-label">Nível de Personalidade da IA</label>
              <div className="personality-slider-container">
                <span className="slider-label">Formal</span>
                <input
                  type="range"
                  name="nivelPersonalidade"
                  min="1"
                  max="5"
                  value={
                    formData.nivelPersonalidade === 'Muito Formal' ? 1 :
                    formData.nivelPersonalidade === 'Formal' ? 2 :
                    formData.nivelPersonalidade === 'Equilibrado' ? 3 :
                    formData.nivelPersonalidade === 'Amigável' ? 4 : 5
                  }
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    const personalityMap = {
                      1: 'Muito Formal',
                      2: 'Formal',
                      3: 'Equilibrado',
                      4: 'Amigável',
                      5: 'Muito Amigável'
                    };
                    setFormData({...formData, nivelPersonalidade: personalityMap[value]});
                  }}
                  className="personality-slider"
                />
                <span className="slider-label">Amigável</span>
              </div>
              <div className="personality-value">
                {formData.nivelPersonalidade}
              </div>
            </div>
            
            <div className="form-group">
              <Select
                label="Tom da Conversa"
                name="tonConversa"
                value={formData.tonConversa}
                onChange={handleFormChange}
              >
                <option value="Profissional">Profissional</option>
                <option value="Casual">Casual</option>
                <option value="Entusiasmado">Entusiasmado</option>
                <option value="Informativo">Informativo</option>
                <option value="Persuasivo">Persuasivo</option>
              </Select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Palavras ou Frases a Evitar</label>
              <textarea
                name="palavrasEvitar"
                value={formData.palavrasEvitar}
                onChange={handleFormChange}
                className="form-textarea"
                placeholder="Liste palavras ou frases que a IA deve evitar usar, separadas por vírgula"
                rows={2}
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Limite de Tentativas</label>
                <input
                  type="number"
                  name="limiteTentativas"
                  value={formData.limiteTentativas}
                  onChange={handleFormChange}
                  min="1"
                  max="10"
                  className="form-control"
                />
                <small className="form-text">
                  Número máximo de tentativas para obter uma informação
                </small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Tempo de Espera (segundos)</label>
                <input
                  type="number"
                  name="tempoEspera"
                  value={formData.tempoEspera}
                  onChange={handleFormChange}
                  min="30"
                  max="300"
                  className="form-control"
                />
                <small className="form-text">
                  Tempo de espera antes de enviar outra mensagem
                </small>
              </div>
            </div>
            
            <div className="form-group switch-group">
              <div className="switch-label">
                <span>Notificar Humano</span>
                <small className="form-text">
                  Notificar um atendente humano quando a IA não conseguir resolver
                </small>
              </div>
              <Switch
                checked={formData.notificarHumano}
                onChange={(checked) => setFormData({...formData, notificarHumano: checked})}
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  // Renderizar botões do modal com base no passo atual
  const renderModalFooter = () => {
    return (
      <div className="modal-footer">
        {currentStep > 1 && (
          <Button 
            onClick={handlePrevStep}
            variant="secondary"
          >
            Voltar
          </Button>
        )}
        
        {currentStep < 6 ? (
          <Button onClick={handleNextStep}>
            Próximo
          </Button>
        ) : (
          <Button onClick={handleSaveAutomacao}>
            {modalMode === 'create' ? 'Criar Automação' : 'Salvar Alterações'}
          </Button>
        )}
      </div>
    );
  };
  
  // Renderizar ícone de status
  const renderStatusIcon = (status) => {
    if (status === 'Ativo') {
      return <span className="status-badge active">Ativo</span>;
    } else {
      return <span className="status-badge inactive">Inativo</span>;
    }
  };

  return (
    <AuthLayout>
      <div className="automacoes-container">
        <div className="automacoes-header">
          <div className="automacoes-title">
            <h1>Automações com IA</h1>
            <p>Crie e gerencie assistentes virtuais inteligentes para suas campanhas</p>
          </div>
          
          <Button 
            onClick={handleCreateAutomacao}
            className="create-automacao-btn"
          >
            <i className="fas fa-plus"></i> Nova Automação
          </Button>
        </div>
        
        <Card className="automacoes-filter-card">
          <div className="automacoes-filters">
            <div className="filter-row">
              <div className="filter-group">
                <Input
                  type="text"
                  placeholder="Buscar automações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="fas fa-search"
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  placeholder="Status"
                >
                  <option value="">Todos os status</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </Select>
              </div>
              
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </Card>
        
        {isLoading ? (
          <div className="automacoes-loading">
            <div className="loading-spinner"></div>
            <p>Carregando automações...</p>
          </div>
        ) : filteredAutomacoes.length === 0 ? (
          <div className="automacoes-empty">
            <div className="empty-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>Nenhuma automação encontrada</h3>
            <p>Crie sua primeira automação com IA para automatizar o atendimento aos seus leads.</p>
            <Button 
              onClick={handleCreateAutomacao}
              className="create-first-automacao-btn"
            >
              Criar Automação
            </Button>
          </div>
        ) : (
          <div className="automacoes-grid">
            {filteredAutomacoes.map(automacao => (
              <Card key={automacao.id} className="automacao-card">
                <div className="automacao-header">
                  <h3 className="automacao-name">{automacao.nome}</h3>
                  {renderStatusIcon(automacao.status)}
                </div>
                
                <div className="automacao-content">
                  <p className="automacao-description">
                    {automacao.descricao || 'Sem descrição'}
                  </p>
                  
                  <div className="automacao-details">
                    <div className="detail-item">
                      <i className="fas fa-bullhorn"></i>
                      <span>
                        {campanhas.find(c => c.Id === automacao.campanhaId)?.Name || 'Campanha não encontrada'}
                      </span>
                    </div>
                    
                    <div className="detail-item">
                      <i className="fas fa-database"></i>
                      <span>{automacao.dadosColeta?.length || 0} {automacao.dadosColeta?.length > 1 ? 'coletas de dados' : 'coleta de dado'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="automacao-stats">
                  <div className="stat-item">
                    <div className="stat-value">0</div>
                    <div className="stat-label">Conversas</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-value">0%</div>
                    <div className="stat-label">Conversão</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-value">0</div>
                    <div className="stat-label">Leads</div>
                  </div>
                </div>
                
                <div className="automacao-actions">
                  
                  <button 
                    className="action-btn edit-btn" 
                    title="Editar"
                    onClick={() => handleEditAutomacao(automacao)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  
                  <button 
                    className={`action-btn ${automacao.status === 'Ativo' ? 'pause-btn' : 'play-btn'}`}
                    title={automacao.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                    onClick={() => handleToggleStatus(automacao.id, automacao.status)}
                  >
                    <i className={`fas ${automacao.status === 'Ativo' ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>
                  
                  <button 
                    className="action-btn delete-btn" 
                    title="Excluir"
                    onClick={() => handleDeleteAutomacao(automacao.id)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* Modal para criar/editar automação */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          size="large"
          title={modalMode === 'create' ? 'Nova Automação' : 'Editar Automação'}
        >
          <div className="automacao-modal">
            <div className="modal-steps">
              <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Básico</div>
              </div>
              
              <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Configuração</div>
              </div>
              
              <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Coleta</div>
              </div>
              
              <div className={`step-item ${currentStep >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Estratégias</div>
              </div>
              
              <div className={`step-item ${currentStep >= 5 ? 'active' : ''}`}>
                <div className="step-number">5</div>
                <div className="step-label">Respostas</div>
              </div>
              
              <div className={`step-item ${currentStep >= 6 ? 'active' : ''}`}>
                <div className="step-number">6</div>
                <div className="step-label">Avançado</div>
              </div>
            </div>
            
            <div className="modal-content">
              {renderModalContent()}
            </div>
            
            {renderModalFooter()}
          </div>
        </Modal>
      </div>
    </AuthLayout>
  );
};

export default Automacoes;