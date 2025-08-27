import React, { useState, useEffect } from 'react';
import AuthLayout from '../../components/AuthLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { toast } from 'react-toastify';
import Api from '../../Api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './style.css';

const Campanhas = () => {
    // Estados
    const [campanhas, setCampanhas] = useState([]);
    const [filteredCampanhas, setFilteredCampanhas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCampanha, setCurrentCampanha] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: ''
    });

    // Estados para o formulário
    const [formData, setFormData] = useState({
        nome: '',
        grupos: [],
        mensagens: [''],
        dataInicio: '',
        horaInicio: '',
        dataFim: '',
        horaFim: '',
        status: 'Ativo'
    });

    // Estado para os grupos de leads disponíveis
    const [gruposLeads, setGruposLeads] = useState([]);

    // Buscar campanhas ao carregar a página
    useEffect(() => {
        fetchCampanhas();
        fetchGruposLeads();
    }, []);

    // Filtrar campanhas quando os filtros ou o termo de busca mudam
    useEffect(() => {
        filterCampanhas();
    }, [campanhas, filters, searchTerm]);

    // Buscar campanhas da API
    const fetchCampanhas = async () => {
        setIsLoading(true);
        try {
            const response = await Api.getCampanhas();

            console.log(response)

            if (response.success) {
                setCampanhas(response.data);
            } else {
                toast.error('Erro ao carregar campanhas');
            }
        } catch (error) {
            console.error('Erro ao buscar campanhas:', error);
            toast.error('Erro ao carregar campanhas');
        } finally {
            setIsLoading(false);
        }
    };

    // Buscar grupos de leads
    const fetchGruposLeads = async () => {
        try {
            const response = await Api.getGruposLeads();

            if (response.success) {
                setGruposLeads(response.data);
            } else {
                toast.error('Erro ao carregar grupos de leads');
            }
        } catch (error) {
            console.error('Erro ao buscar grupos de leads:', error);
            toast.error('Erro ao carregar grupos de leads');
        }
    };

    // Filtrar campanhas
    const filterCampanhas = () => {
        let result = [...campanhas];

        // Aplicar filtros
        if (filters.status) {
            result = result.filter(campanha => campanha.Status === filters.status);
        }

        // Aplicar termo de busca
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(campanha =>
                (campanha.Name && campanha.Name.toLowerCase().includes(term))
            );
        }

        setFilteredCampanhas(result);
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

    // Abrir modal para adicionar nova campanha
    const handleAddCampanha = () => {
        setIsEditing(false);
        setCurrentCampanha(null);
        setFormData({
            nome: '',
            grupos: [],
            mensagens: [''],
            dataInicio: getTomorrowDate(),
            horaInicio: '08:00',
            dataFim: getNextWeekDate(),
            horaFim: '18:00',
            status: 'Ativo'
        });
        setModalOpen(true);
    };

    // Obter data de amanhã formatada para o input
    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // Obter data da próxima semana formatada para o input
    const getNextWeekDate = () => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
    };

    // Abrir modal para editar campanha
    const handleEditCampanha = (campanha) => {
        setIsEditing(true);
        setCurrentCampanha(campanha);

        // Formatar datas e horas para o formulário
        const dataInicio = campanha.StartDate ? campanha.StartDate.split('T')[0] : '';
        const horaInicio = campanha.StartDate ? campanha.StartDate.split('T')[1].substring(0, 5) : '';
        const dataFim = campanha.EndDate ? campanha.EndDate.split('T')[0] : '';
        const horaFim = campanha.EndDate ? campanha.EndDate.split('T')[1].substring(0, 5) : '';

        console.log(campanha.Messages?.map(m => m.message))

        setFormData({
            nome: campanha.Name || '',
            grupos: campanha.Groups?.split("|") || [],
            mensagens: campanha.Messages?.map(m => m.message) || [''],
            dataInicio,
            horaInicio,
            dataFim,
            horaFim,
            status: campanha.Status || 'Ativo'
        });
        setModalOpen(true);
    };

    // Alterar status da campanha
    const handleChangeStatus = async (id, newStatus) => {
        try {
            const response = await Api.updateCampanhaStatus(id, newStatus);

            if (response.success) {
                toast.success(`Status da campanha alterado para ${newStatus}`);
                fetchCampanhas();
            } else {
                toast.error('Erro ao alterar status da campanha');
            }
        } catch (error) {
            console.error('Erro ao alterar status da campanha:', error);
            toast.error('Erro ao alterar status da campanha');
        }
    };

    // Remover campanha
    const handleDeleteCampanha = async (id) => {
        if (window.confirm('Tem certeza que deseja remover esta campanha?')) {
            try {
                const response = await Api.deleteCampanha(id);

                if (response.success) {
                    toast.success('Campanha removida com sucesso');
                    fetchCampanhas();
                } else {
                    toast.error('Erro ao remover campanha');
                }
            } catch (error) {
                console.error('Erro ao remover campanha:', error);
                toast.error('Erro ao remover campanha');
            }
        }
    };

    // Manipular mudanças no formulário
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manipular mudanças nos grupos selecionados (multiselect)
    const handleGruposChange = (e) => {
        const options = e.target.options;
        const selectedValues = [];

        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }

        setFormData(prev => ({
            ...prev,
            grupos: selectedValues
        }));
    };

    // Adicionar campo de mensagem
    const handleAddMensagem = () => {
        setFormData(prev => ({
            ...prev,
            mensagens: [...prev.mensagens, '']
        }));
    };

    // Remover campo de mensagem
    const handleRemoveMensagem = (index) => {
        if (formData.mensagens.length > 1) {
            setFormData(prev => ({
                ...prev,
                mensagens: prev.mensagens.filter((_, i) => i !== index)
            }));
        }
    };

    // Atualizar mensagem
    const handleMensagemChange = (index, value) => {
        const updatedMensagens = [...formData.mensagens];
        updatedMensagens[index] = value;

        setFormData(prev => ({
            ...prev,
            mensagens: updatedMensagens
        }));
    };

    // Enviar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome || formData.grupos.length === 0 || !formData.mensagens[0]) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        // Validar datas
        const dataInicioCompleta = `${formData.dataInicio}T${formData.horaInicio}:00`;
        const dataFimCompleta = `${formData.dataFim}T${formData.horaFim}:00`;

        const dataInicio = new Date(dataInicioCompleta);
        const dataFim = new Date(dataFimCompleta);

        if (dataInicio >= dataFim) {
            toast.error('A data de início deve ser anterior à data de fim');
            return;
        }

        // Preparar dados para envio
        const campanhaData = {
            Name: formData.nome,
            Groups: formData.grupos,
            Messages: formData.mensagens.filter(msg => msg.trim() !== ''),
            StartDate: dataInicioCompleta,
            EndDate: dataFimCompleta,
            Status: formData.status
        };

        console.log(campanhaData)

        try {
            let response = null;

            if (isEditing) {
                response = await Api.updateCampanha(currentCampanha?.Id, campanhaData);
            } else {
                response = await Api.createCampanha(campanhaData);
            }

            if (response.success) {
                toast.success(isEditing ? 'Campanha atualizada com sucesso' : 'Campanha criada com sucesso');
                setModalOpen(false);
                fetchCampanhas();
            } else {
                toast.error('Erro ao salvar campanha');
            }
        } catch (error) {
            console.error('Erro ao salvar campanha:', error);
            toast.error('Erro ao salvar campanha');
        }
    };

    // Formatar data para exibição
    const formatDate = (dateString) => {
        if (!dateString) return '-';

        try {
            return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        } catch (error) {
            return dateString;
        }
    };

    // Obter classe CSS para o status
    const getStatusClass = (status) => {
        switch (status) {
            case 'Ativo':
                return 'status-ativo';
            case 'Pausada':
                return 'status-pausada';
            case 'Agendada':
                return 'status-agendada';
            case 'Finalizada':
                return 'status-finalizada';
            default:
                return '';
        }
    };

    return (
        <AuthLayout>
            <div className="campanhas-container">
                <div className="campanhas-header">
                    <div className="campanhas-title">
                        <h1>Campanhas</h1>
                        <p>Gerencie suas campanhas de marketing</p>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleAddCampanha}
                        className="add-campanha-btn"
                    >
                        <i className="fas fa-plus"></i> Nova Campanha
                    </Button>
                </div>

                <Card className="campanhas-filter-card">
                    <div className="campanhas-filters">
                        <div className="filter-row">
                            <div className="filter-group">
                                <Input
                                    type="text"
                                    placeholder="Buscar campanhas..."
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
                                    <option value="Ativo">Ativo</option>
                                    <option value="Pausada">Pausada</option>
                                    <option value="Agendada">Agendada</option>
                                    <option value="Finalizada">Finalizada</option>
                                </Select>
                            </div>

                            <Button
                                variant="secondary"
                                onClick={clearFilters}
                                className="clear-filters-btn"
                            >
                                Limpar Filtros
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="campanhas-table-card">
                    {isLoading ? (
                        <div className="campanhas-loading">
                            <div className="campanhas-loading-spinner"></div>
                            <p>Carregando campanhas...</p>
                        </div>
                    ) : filteredCampanhas.length === 0 ? (
                        <div className="campanhas-empty">
                            <i className="fas fa-bullhorn campanhas-empty-icon"></i>
                            <h3>Nenhuma campanha encontrada</h3>
                            <p>Crie uma nova campanha para começar a enviar mensagens para seus leads.</p>
                            <Button
                                variant="primary"
                                onClick={handleAddCampanha}
                                className="add-campanha-empty-btn"
                            >
                                <i className="fas fa-plus"></i> Criar Campanha
                            </Button>
                        </div>
                    ) : (
                        <div className="campanhas-table-container">
                            <table className="campanhas-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Início</th>
                                        <th>Término</th>
                                        <th>Status</th>
                                        <th style={{textAlign: 'right'}}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCampanhas?.map(campanha => (
                                        <tr key={campanha.Id}>
                                            <td className="campanha-name">{campanha.Name}</td>
                                            <td>{formatDate(campanha.StartDate)}</td>
                                            <td>{formatDate(campanha.EndDate)}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(campanha.Status)}`}>
                                                    {campanha.Status}
                                                </span>
                                            </td>
                                            <td className="campanha-actions">
                                                <div className="action-buttons">
                                                    {/* Botão Editar */}
                                                    {campanha.Status !== 'Ativo' && (
                                                        <button
                                                            onClick={() => handleEditCampanha(campanha)}
                                                            className="action-btn-cmp edit-btn-cmp-cmp"
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    )}

                                                    {/* Botão Ativar (visível apenas quando não estiver ativo) */}
                                                    {campanha.Status !== 'Ativo' && (
                                                        <button
                                                            onClick={() => handleChangeStatus(campanha.Id, 'Ativo')}
                                                            className="action-btn-cmp activate-btn-cmp"
                                                            title="Ativar"
                                                        >
                                                            <i className="fas fa-play"></i>
                                                        </button>
                                                    )}

                                                    {/* Botão Pausar (visível apenas quando estiver ativo) */}
                                                    {campanha.Status === 'Ativo' && (
                                                        <button
                                                            onClick={() => handleChangeStatus(campanha.Id, 'Pausada')}
                                                            className="action-btn-cmp pause-btn"
                                                            title="Pausar"
                                                        >
                                                            <i className="fas fa-pause"></i>
                                                        </button>
                                                    )}

                                                    {/* Botão Finalizar (visível apenas quando estiver pausada ou agendada) */}
                                                    {['Pausada', 'Agendada'].includes(campanha.Status) && (
                                                        <button
                                                            onClick={() => handleChangeStatus(campanha.Id, 'Finalizada')}
                                                            className="action-btn-cmp finish-btn-cmp"
                                                            title="Finalizar"
                                                        >
                                                            <i className="fas fa-stop"></i>
                                                        </button>
                                                    )}

                                                    {/* Botão Excluir */}
                                                    <button
                                                        onClick={() => handleDeleteCampanha(campanha.Id)}
                                                        className="action-btn-cmp delete-btn-cmp"
                                                        title="Excluir"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal para adicionar/editar campanha */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? 'Editar Campanha' : 'Nova Campanha'}
                size="large"
            >
                <form onSubmit={handleSubmit} className="campanha-form">
                    <div className="form-section">
                        <h3 className="section-title">Informações Básicas</h3>

                        <div className="form-group">
                            <Input
                                label="Nome da Campanha *"
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Grupos de Leads *</label>
                            <select
                                multiple
                                name="grupos"
                                value={formData.grupos}
                                onChange={handleGruposChange}
                                className="multi-select"
                                required
                            >
                                {gruposLeads?.map((grupo, index) => (
                                    <option key={index} value={grupo.NomeGrupo}>
                                        {grupo.NomeGrupo}
                                    </option>
                                ))}
                            </select>
                            <small className="form-text">Segure Ctrl para selecionar múltiplos grupos</small>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Mensagens de Saudação</h3>

                        {formData.mensagens?.map((mensagem, index) => (
                            <div key={index} className="mensagem-container">
                                <div className="mensagem-header">
                                    <h4>Mensagem {index + 1}</h4>
                                    {formData.mensagens.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-mensagem-btn"
                                            onClick={() => handleRemoveMensagem(index)}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>

                                <textarea
                                    value={mensagem}
                                    onChange={(e) => handleMensagemChange(index, e.target.value)}
                                    placeholder="Digite a mensagem de saudação..."
                                    className="mensagem-textarea"
                                    required={index === 0}
                                ></textarea>

                                <div className="mensagem-variables">
                                    <p>Variáveis disponíveis:</p>
                                    <button
                                        type="button"
                                        className="variable-btn"
                                        onClick={() => handleMensagemChange(index, mensagem + '{nome}')}
                                    >
                                        {'{nome}'}
                                    </button>
                                    {/*<button 
                    type="button" 
                    className="variable-btn"
                    onClick={() => handleMensagemChange(index, mensagem + '{grupo}')}
                  >
                    {'{grupo}'}
                  </button>*/}
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddMensagem}
                            className="add-mensagem-btn"
                        >
                            <i className="fas fa-plus"></i> Adicionar Mensagem
                        </Button>
                        <small className="form-text">
                            Múltiplas mensagens serão enviadas aleatoriamente para cada lead.
                        </small>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Agendamento</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Data de Início *</label>
                                <Input
                                    type="date"
                                    name="dataInicio"
                                    value={formData.dataInicio}
                                    onChange={handleFormChange}
                                    min={(new Date().toISOString().split('T')[0])}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hora de Início *</label>
                                <Input
                                    type="time"
                                    name="horaInicio"
                                    value={formData.horaInicio}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Data de Término *</label>
                                <Input
                                    type="date"
                                    name="dataFim"
                                    value={formData.dataFim}
                                    onChange={handleFormChange}
                                    min={formData.dataInicio}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hora de Término *</label>
                                <Input
                                    type="time"
                                    name="horaFim"
                                    value={formData.horaFim}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">Status</h3>

                        <div className="form-group">
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleFormChange}
                                required
                            >
                                <option selected value="Ativo">Ativo</option>
                                <option value="Pausada">Pausada</option>
                            </Select>
                            <small className="form-text">
                                Campanhas ativas começarão a enviar mensagens imediatamente a partir da data de início.
                            </small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                        >
                            {isEditing ? 'Atualizar' : 'Criar Campanha'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthLayout>
    );
};

export default Campanhas;