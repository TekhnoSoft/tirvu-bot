import React, { useState, useEffect, useCallback } from 'react';
import AuthLayout from '../../components/AuthLayout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { toast } from 'react-toastify';
import Api from '../../Api';
import './style.css';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const Instancias = () => {
  // Estados
  const [instanceName, setInstanceName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [instancias, setInstancias] = useState([]);
  const [filteredInstancias, setFilteredInstancias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: ''
  });
  
  // Constante para o intervalo de atualização (em milissegundos)
  const UPDATE_INTERVAL = 10000; // 10 segundos
  
  // Função para buscar instâncias
  const fetchInstancias = useCallback(async () => {
    try {
      const response = await Api.getInstancias();
      
      if (response.success) {
        setInstancias(response.data);
      } else {
        console.error('Erro ao carregar instâncias:', response.error);
      }
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Funsção para criação da instancia
  const createWhatsappInstance = async () => {
    try{

      if(instanceName?.legth <= 0){
        toast.warning('Preencha o nome da instância.');
        return;
      }

      const response = await Api.createWhatsappInstance(instanceName);

      console.log(response);

      if(response?.success){
        await fetchInstancias();
        setShowModal(false);
      }else{
        toast.error('Erro ao criar a instância');
      }

    }catch (error) {
      toast.error('Erro ao criar a instância');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateInstancia = () => {
    setInstanceName("");
    setShowModal(true);
  }
  
  // Buscar instâncias ao carregar a página
  useEffect(() => {
    fetchInstancias();
    
    // Configurar intervalo para atualização automática
    const intervalId = setInterval(() => {
      fetchInstancias();
    }, UPDATE_INTERVAL);
    
    // Limpar intervalo ao desmontar o componente
    return () => clearInterval(intervalId);
  }, [fetchInstancias]);
  
  // Filtrar instâncias quando os filtros ou o termo de busca mudam
  useEffect(() => {
    filterInstancias();
  }, [instancias, filters, searchTerm]);
  
  // Filtrar instâncias
  const filterInstancias = () => {
    let result = [...instancias];
    
    // Aplicar filtros
    if (filters.status) {
      result = result.filter(instancia => instancia.Status === filters.status);
    }
    
    // Aplicar termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(instancia => 
        (instancia.Name && instancia.Name.toLowerCase().includes(term))
      );
    }
    
    setFilteredInstancias(result);
  };
  
  // Manipular mudança nos filtros
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      status: ''
    });
    setSearchTerm('');
  };
  
  // Renderizar status da instância
  const renderStatus = (status) => {
    switch (status) {
      case 'Conectado':
        return (
          <div className="instance-status connected">
            <i className="fas fa-check-circle"></i>
            <span>Conectado</span>
          </div>
        );
      case 'Disconected':
        return (
          <div className="instance-status disconnected">
            <i className="fas fa-times-circle"></i>
            <span>Desconectado</span>
          </div>
        );
      case 'Aguardando':
        return (
          <div className="instance-status qrcode">
            <i className="fas fa-qrcode"></i>
            <span>Aguardando QR Code</span>
          </div>
        );
      case 'Inicializando':
        return (
          <div className="instance-status qrcode">
            <i className="fas fa-qrcode"></i>
            <span>Aguardando QR Code</span>
          </div>
        );
        break;
      case 'loading':
        return (
          <div className="instance-status loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Carregando</span>
          </div>
        );
      default:
        return (
          <div className="instance-status unknown">
            <i className="fas fa-question-circle"></i>
            <span>Desconhecido</span>
          </div>
        );
    }
  };
  
  // Formatar número para exibição
  const formatPhoneNumber = (number) => {
    if (!number) return 'Não disponível';
    
    // Formatar número como +XX (XX) XXXXX-XXXX
    const cleaned = ('' + number).replace(/\D/g, '');
    
    if (cleaned.length < 10) return number;
    
    const countryCode = cleaned.slice(0, 2);
    const areaCode = cleaned.slice(2, 4);
    const firstPart = cleaned.slice(4, 9);
    const secondPart = cleaned.slice(9);
    
    return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
  };

  return (
    <AuthLayout>
      <div className="instancias-container">
        <div className="instancias-header">
          <div className="instancias-title">
            <h1>Instâncias WhatsApp</h1>
            <p>Gerencie suas conexões com WhatsApp</p>
          </div>
          <Button 
            onClick={handleCreateInstancia}
            className="create-automacao-btn"
          >
            <i className="fas fa-plus"></i> Nova Instancia
          </Button>
        </div>
        
        <Card className="instancias-filter-card">
          <div className="instancias-filters">
            <div className="filter-row">
              <div className="filter-group">
                <Input
                  type="text"
                  placeholder="Buscar instâncias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon="fas fa-search"
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <Select
                  name="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  placeholder="Status"
                >
                  <option value="">Todos os status</option>
                  <option value="Conectado">Conectado</option>
                  <option value="Desconectado">Desconectado</option>
                  <option value="Aguardando escaneamento do QR Code">Aguardando QR Code</option>
                </Select>
              </div>
              
              <button 
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </Card>
        
        {isLoading ? (
          <div className="instancias-loading">
            <div className="loading-spinner"></div>
            <p>Carregando instâncias...</p>
          </div>
        ) : filteredInstancias.length === 0 ? (
          <div className="instancias-empty">
            <i className="fab fa-whatsapp instancias-empty-icon"></i>
            <h3>Nenhuma instância encontrada</h3>
            <p>Não há instâncias disponíveis ou que correspondam aos filtros aplicados.</p>
          </div>
        ) : (
          <div className="instancias-grid">
            {filteredInstancias.map(instancia => (
              <Card key={instancia.Id} className="instancia-card">
                <div className="instancia-header">
                  <h3 className="instancia-name">{instancia.Name}</h3>
                  {renderStatus(
                    instancia.Status == "Conectado" && instancia.StatusAutomacao == "Conectado" ? "Conectado" :
                    instancia.Status == "Aguardando escaneamento do QR Code" && instancia?.StatusAutomacao == "Inicializando" ? "Aguardando" : "Aguardando"
                  )}
                </div>
                
                <div style={{display: 'flex', alignContent: 'center', justifyContent: 'center'}}>
                  {/*<div>
                    <div style={{color: "gray", marginTop: "15px", fontSize: '10pt', textAlign: 'center'}}>
                      <b>Disparador</b>
                    </div>
                    <div className="instancia-content">
                      {instancia.Status === 'Aguardando escaneamento do QR Code' && instancia.QrCodeBase64 ? (
                        <div className="instancia-qrcode">
                          <img 
                            src={"data:image/png;base64,"+instancia.QrCodeBase64} 
                            alt="QR Code para conexão" 
                            className="qrcode-image" 
                          />
                          <p className="qrcode-instruction">
                            Escaneie o QR Code com seu WhatsApp para conectar
                          </p>
                        </div>
                      ) : instancia.Status === 'Conectado' ? (
                        <div className="instancia-connected">
                          <div className="connected-icon">
                            <i className="fas fa-check-circle"></i>
                          </div>
                          <p className="connected-message">
                            Instância conectada e pronta para uso
                          </p>
                        </div>
                      ) : (
                        <div className="instancia-disconnected">
                          <div className="disconnected-icon">
                            <i className="fas fa-plug"></i>
                          </div>
                          <p className="disconnected-message">
                            Instância desconectada. Aguardando inicialização...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>*/}
                  
                  <div>
                    <div style={{color: "gray", marginTop: "15px", fontSize: '10pt', textAlign: 'center'}}>
                      <b>Automação</b>
                    </div>
                    <div className="instancia-content">
                      {instancia.StatusAutomacao === 'Inicializando' && instancia.QrCodeBase64Automacao ? (
                        <div className="instancia-qrcode">
                          <img 
                            src={"data:image/png;base64,"+instancia.QrCodeBase64Automacao} 
                            alt="QR Code para conexão" 
                            className="qrcode-image" 
                            style={{padding: '12px'}}
                          />
                          <p className="qrcode-instruction">
                            Escaneie o QR Code com seu WhatsApp para conectar
                          </p>
                        </div>
                      ) : instancia.StatusAutomacao === 'Conectado' ? (
                        <div className="instancia-connected">
                          <div className="connected-icon">
                            <i className="fas fa-check-circle"></i>
                          </div>
                          <p className="connected-message">
                            Instância conectada e pronta para uso
                          </p>
                        </div>
                      ) : (
                        <div className="instancia-disconnected">
                          <div className="disconnected-icon">
                            <i className="fas fa-plug"></i>
                          </div>
                          <p className="disconnected-message">
                            Instância desconectada. Aguardando inicialização...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="instancia-info">
                  <div className="info-item">
                    <span className="info-label">Nome:</span>
                    <span className="info-value">
                      {instancia.Status === 'Conectado' 
                        ? instancia.Name
                        : 'Não conectado'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Mensagens Enviadas:</span>
                    <span className="info-value">
                      {instancia.mensagensEnviadas?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Última Atualização:</span>
                    <span className="info-value">
                      {instancia.LastConnected 
                        ? new Date(instancia.LastConnected).toLocaleString() 
                        : 'Nunca'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          size="large"
          title={'Nova Instância'}
        >
          <div className="automacao-modal">
            <div className="modal-content">
              <div className="form-group" style={{marginTop: '10px'}}>
                <Input
                  label="Nome da Instância"
                  name="nome"
                  value={instanceName}
                  onChange={e => setInstanceName(e.target.value)}
                  placeholder="Ex: Bot Automação"
                  required
                />
              </div>
            </div>
            <Button style={{marginBottom: '20px', marginTop: '20px'}} onClick={createWhatsappInstance}>
              {'Salvar'}
            </Button>
          </div>
        </Modal>

      </div>
    </AuthLayout>
  );
};

export default Instancias;