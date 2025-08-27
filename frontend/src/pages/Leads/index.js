import React, { useState, useEffect, useRef } from 'react';
import AuthLayout from '../../components/AuthLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { toast } from 'react-toastify';
import Api from '../../Api';
import * as XLSX from 'xlsx';
import './style.css';
import Environment from '../../Environment';
import Utils from '../../Utils';
import LeadsTable from '../../components/LeadsTable';

const Leads = () => {
    // Estados
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentLead, setCurrentLead] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        Estado: '',
        Cidade: '',
        NomeGrupo: '',
        EtapaFunil: ''
    });

    // Estados para importação/exportação
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importPreview, setImportPreview] = useState([]);
    const [importColumns, setImportColumns] = useState({});
    const [importLoading, setImportLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [importHeaders, setImportHeaders] = useState([]);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Ref para o input de arquivo
    const fileInputRef = useRef(null);

    // Opções para os filtros
    const [filterOptions, setFilterOptions] = useState({
        estados: [],
        cidades: [],
        grupos: [],
        etapasFunil: []
    });

    // Formulário de lead
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        celular: '',
        cpf: '',
        nascimento: '',
        genero: '',
        idade: '',
        estado: '',
        cidade: '',
        bairro: '',
        nomeGrupo: '',
        etapaFunil: '',
        tags: ''
    });

    const [grupoNome, setGrupoNome] = useState("");

    // Buscar leads ao carregar a página
    useEffect(() => {
        fetchLeads();
    }, []);

    // Filtrar leads quando os filtros ou o termo de busca mudam
    useEffect(() => {
        filterLeads();
    }, [leads, filters, searchTerm]);

    // Buscar leads da API
    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            let url = `${Environment.API_BASE}/leads/all`;
            const params = new URLSearchParams();

            if (filters.NomeGrupo) {
                params.append('property_id', filters.NomeGrupo);
            }

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const { success, data } = await Utils.processRequest(Api.getLeads, {}, false);

            if (success) {
                setLeads(data);

                const estados = [...new Set(data.map(lead => lead.Estado).filter(Boolean))];
                const cidades = [...new Set(data.map(lead => lead.Cidade).filter(Boolean))];
                const grupos = [...new Set(data.map(lead => lead.NomeGrupo).filter(Boolean))];
                const etapas = [...new Set(data.map(lead => lead.EtapaFunil).filter(Boolean))];

                setFilterOptions({
                    estados,
                    cidades,
                    grupos,
                    etapas
                });
            } else {
                toast.error('Erro ao carregar leads');
            }
        } catch (error) {
            console.error('Erro ao buscar leads:', error);
            toast.error('Erro ao carregar leads');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrar leads com base nos filtros e termo de busca
    const filterLeads = () => {
        let result = [...leads];

        // Aplicar filtros
        if (filters.Estado) {
            result = result.filter(lead => lead.Estado && lead.Estado === filters.Estado);
        }

        if (filters.Cidade) {
            result = result.filter(lead => lead.Cidade && lead.Cidade === filters.Cidade);
        }

        if (filters.NomeGrupo) {
            result = result.filter(lead => lead.NomeGrupo && lead.NomeGrupo === filters.NomeGrupo);
        }

        if (filters.EtapaFunil) {
            result = result.filter(lead => lead.EtapaFunil && lead.EtapaFunil === filters.EtapaFunil);
        }

        // Aplicar termo de busca
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(lead =>
                (lead.Nome && lead.Nome.toLowerCase().includes(term)) ||
                (lead.Email && lead.Email.toLowerCase().includes(term)) ||
                (lead.Celular && lead.Celular.toString().includes(term)) ||
                (lead.Cpf && lead.Cpf.toString().includes(term))
            );
        }

        setFilteredLeads(result);
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
            Estado: '',
            Cidade: '',
            NomeGrupo: '',
            EtapaFunil: ''
        });
        setSearchTerm('');
    };

    // Abrir modal para adicionar novo lead
    const handleAddLead = () => {
        setIsEditing(false);
        setCurrentLead(null);
        setFormData({
            nome: '',
            email: '',
            celular: '',
            cpf: '',
            nascimento: '',
            genero: '',
            idade: '',
            estado: '',
            cidade: '',
            bairro: '',
            nomeGrupo: '',
            etapaFunil: '',
            tags: ''
        });
        setModalOpen(true);
    };

    // Abrir modal para editar lead
    const handleEditLead = (lead) => {
        setIsEditing(true);
        setCurrentLead(lead);
        setFormData({
            nome: lead.Nome || '',
            email: lead.Email || '',
            celular: lead.Celular || '',
            cpf: lead.Cpf || '',
            nascimento: lead.Nascimento || '',
            genero: lead.Genero || '',
            idade: lead.Idade || '',
            estado: lead.Estado || '',
            cidade: lead.Cidade || '',
            bairro: lead.Bairro || '',
            nomeGrupo: lead.NomeGrupo || '',
            etapaFunil: lead.EtapaFunil || '',
            tags: lead.Tags || ''
        });
        setModalOpen(true);
    };

    // Remover lead
    const handleDeleteLead = async (id) => {
        if (window.confirm('Tem certeza que deseja remover este lead?')) {
            try {
                const response = await Api.deleteLead(id);

                if (response.success) {
                    toast.success('Lead removido com sucesso');
                    fetchLeads();
                } else {
                    toast.error('Erro ao remover lead');
                }
            } catch (error) {
                console.error('Erro ao remover lead:', error);
                toast.error('Erro ao remover lead');
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

    // Enviar formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;

            if (isEditing) {
                response = await Api.generic_put(`${Environment.API_BASE}/leads/${currentLead.Id}`, Environment.HEADERS, formData);
            } else {
                response = await Api.generic_post(`${Environment.API_BASE}/leads/save`, Environment.HEADERS, formData); // Alterado para /save
            }

            if (response.success) {
                toast.success(isEditing ? 'Lead atualizado com sucesso' : 'Lead criado com sucesso');
                setModalOpen(false);
                fetchLeads();
            } else {
                toast.error('Erro ao salvar lead');
            }
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            toast.error('Erro ao salvar lead');
        }
    };

    // Formatar data para exibição
    const formatDate = (dateString) => {
        if (!dateString) return '-';

        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch (error) {
            return dateString;
        }
    };

    // Funções para importação/exportação

    // Abrir modal de importação
    const handleImportClick = () => {
        setImportFile(null);
        setImportPreview([]);
        setImportColumns({});
        setGrupoNome("");
        setImportModalOpen(true);
    };

    // Selecionar arquivo para importação
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
            toast.error('Formato de arquivo não suportado. Use Excel (XLS, XLSX) ou CSV.');
            return;
        }

        setImportFile(file);
        parseFile(file);
    };

    // Analisar o arquivo selecionado
    const parseFile = (file) => {
        setImportLoading(true);

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (json.length < 2) {
                    toast.error('O arquivo está vazio ou não contém dados suficientes.');
                    setImportLoading(false);
                    return;
                }

                // Cabeçalhos da primeira linha
                const headers = json[0];

                // Dados (excluindo a primeira linha)
                const rows = json.slice(1, 11); // Mostrar apenas as 10 primeiras linhas na prévia

                setImportHeaders(headers);
                setImportPreview(rows);

                // Inicializar mapeamento de colunas
                const initialColumnMapping = {
                    nome: findColumnIndex(headers, ['nome', 'name', 'nome completo', 'full name', 'Nome', 'Nome Completo', 'Name']),
                    email: findColumnIndex(headers, ['email', 'e-mail', 'correio eletrônico', 'Email', 'E-mail', 'E-Mail']),
                    celular: findColumnIndex(headers, ['celular', 'telefone', 'mobile', 'phone', 'tel', 'Celular', 'Telefone', 'Mobile']),
                    cpf: findColumnIndex(headers, ['cpf', 'documento', 'document', 'Cpf', 'CPF']),
                    nascimento: findColumnIndex(headers, ['nascimento', 'data de nascimento', 'birth', 'birthday', 'Nascimento', 'Data de Nascimento']),
                    genero: findColumnIndex(headers, ['genero', 'gênero', 'sexo', 'gender', 'sex', 'Genero', 'Gênero', 'Sexo', 'Sex']),
                    idade: findColumnIndex(headers, ['idade', 'age', 'Idade']),
                    estado: findColumnIndex(headers, ['estado', 'uf', 'state', 'Estado', 'EnderecoUF']),
                    cidade: findColumnIndex(headers, ['cidade', 'city', 'Cidade', 'EnderecoCidade']),
                    bairro: findColumnIndex(headers, ['bairro', 'neighborhood', 'Bairro', 'EnderecoBairro']),
                    nomeGrupo: findColumnIndex(headers, ['grupo', 'group', 'segmento', 'segment', 'Grupo']),
                    etapaFunil: findColumnIndex(headers, ['etapa', 'etapa do funil', 'stage', 'funnel stage', 'Etapa']),
                    tags: findColumnIndex(headers, ['tags', 'etiquetas', 'labels', 'Tags', 'Etiquetas', 'Labels'])
                };

                setImportColumns(initialColumnMapping);
            } catch (error) {
                console.error('Erro ao analisar o arquivo:', error);
                toast.error('Erro ao analisar o arquivo. Verifique se o formato é válido.');
            } finally {
                setImportLoading(false);
            }
        };

        reader.onerror = () => {
            toast.error('Erro ao ler o arquivo.');
            setImportLoading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    // Encontrar índice da coluna com base em possíveis nomes
    const findColumnIndex = (headers, possibleNames) => {
        const index = headers.findIndex(header =>
            header && possibleNames.includes(header.toString().toLowerCase().trim())
        );
        return index !== -1 ? index : '';
    };

    // Atualizar mapeamento de colunas
    const handleColumnMappingChange = (field, columnIndex) => {
        setImportColumns(prev => ({
            ...prev,
            [field]: columnIndex
        }));
    };

    // Importar dados do arquivo
    const handleImportSubmit = async () => {
        if (!importFile) {
            toast.error('Selecione um arquivo para importar.');
            return;
        }

        const tipoValido = (valor) => {
            if (valor === null || valor === undefined) {
              return false;
            }
          
            if (typeof valor === 'string') {
              return valor.trim() !== '';
            }
          
            if (typeof valor === 'number') {
              return !isNaN(valor);
            }
          
            return false;
        }

        if (!tipoValido(importColumns.nome) || !tipoValido(importColumns.celular)) {
            toast.error('Os campos Nome e Celular são obrigatórios para importação.');
            return;
        }

        if(Utils.stringIsNullOrEmpty(grupoNome)){
            toast.error('Digite o nome do grupo dessa planilha de leads.');
            return;
        }

        setImportLoading(true);

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    // Pular a primeira linha (cabeçalhos)
                    const rows = json.slice(1);

                    // Converter para o formato esperado pela API
                    const leads = rows?.map(row => {
                        const lead = {};

                        // Mapear cada campo conforme definido no importColumns
                        Object.entries(importColumns).forEach(([field, columnIndex]) => {
                            if (columnIndex !== '' && row[columnIndex] !== undefined) {
                                lead[field] = row[columnIndex];
                            }
                        });

                        return lead;
                    });

                    // Filtrar leads sem nome ou celular
                    const validLeads = leads.filter(lead => lead.nome && lead.celular);

                    if (validLeads.length === 0) {
                        toast.error('Os campos Nome e Celular são obrigatórios para importação.');
                        setImportLoading(false);
                        return;
                    }
                    
                    console.log(grupoNome);

                    // Enviar para a API
                    const response = await Api.importLeads(validLeads, grupoNome);

                    if (response.success) {
                        toast.success(`${response.data.imported} leads importados com sucesso!`);
                        setImportModalOpen(false);
                        fetchLeads();
                    } else {
                        toast.error(response.error || 'Erro ao importar leads.');
                    }
                } catch (error) {
                    console.error('Erro ao processar arquivo para importação:', error);
                    toast.error('Erro ao processar arquivo para importação.');
                } finally {
                    setImportLoading(false);
                }
            };

            reader.onerror = () => {
                toast.error('Erro ao ler o arquivo.');
                setImportLoading(false);
            };

            reader.readAsArrayBuffer(importFile);
        } catch (error) {
            console.error('Erro ao importar leads:', error);
            toast.error('Erro ao importar leads.');
            setImportLoading(false);
        }
    };

    // Exportar leads
    const handleExportLeads = async (format) => {
        setExportLoading(true);

        try {
            // Usar os leads filtrados ou todos os leads se não houver filtro
            const dataToExport = filteredLeads.length > 0 ? filteredLeads : leads;

            if (dataToExport.length === 0) {
                toast.error('Não há leads para exportar.');
                setExportLoading(false);
                return;
            }

            // Criar workbook e worksheet
            const workbook = XLSX.utils.book_new();

            // Definir cabeçalhos
            const headers = [
                'Nome', 'Email', 'Celular', 'CPF', 'Data de Nascimento',
                'Gênero', 'Idade', 'Estado', 'Cidade', 'Bairro',
                'Grupo', 'Etapa do Funil', 'Tags', 'Data de Cadastro'
            ];

            // Mapear dados para o formato de exportação
            const data = [
                headers,
                ...dataToExport?.map(lead => [
                    lead.Nome || '',
                    lead.Email || '',
                    lead.Celular || '',
                    lead.Cpf || '',
                    lead.Nascimento || '',
                    lead.Genero || '',
                    lead.Idade || '',
                    lead.Estado || '',
                    lead.Cidade || '',
                    lead.Bairro || '',
                    lead.NomeGrupo || '',
                    lead.EtapaFunil || '',
                    lead.Tags || '',
                    lead.DataCadastro ? new Date(lead.DataCadastro).toLocaleDateString('pt-BR') : ''
                ])
            ];

            // Criar worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(data);

            // Adicionar worksheet ao workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

            // Definir nome do arquivo e extensão
            let filename = `leads_export_${new Date().toISOString().slice(0, 10)}`;

            // Exportar de acordo com o formato escolhido
            if (format === 'xlsx') {
                XLSX.writeFile(workbook, `${filename}.xlsx`);
            } else if (format === 'csv') {
                XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
            } else if (format === 'xls') {
                XLSX.writeFile(workbook, `${filename}.xls`, { bookType: 'biff8' });
            }

            toast.success(`Leads exportados com sucesso no formato ${format.toUpperCase()}.`);
        } catch (error) {
            console.error('Erro ao exportar leads:', error);
            toast.error('Erro ao exportar leads.');
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="leads-container">
                <div className="leads-header">
                    <div className="leads-title">
                        <h1>Leads {leads?.length > 0 ? `(${leads?.length})` : ``}</h1>
                        <p>Gerencie seus leads e contatos</p>
                    </div>

                    <div className="leads-actions">
                        <div className="leads-import-export">
                            <Button
                                variant="secondary"
                                onClick={handleImportClick}
                                className="import-btn"
                                disabled={importLoading || exportLoading}
                            >
                                <i className="fas fa-file-import"></i> Importar Leads
                            </Button>


                            <div className="export-dropdown">
                                <Button
                                    variant="secondary"
                                    className="export-btn"
                                    disabled={isLoading || exportLoading || leads.length === 0}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <i className="fas fa-file-export"></i> Exportar Leads
                                    <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'} export-icon-down`}></i>
                                </Button>
                                {dropdownOpen && (
                                    <div
                                        className="export-dropdown-content show"
                                        onMouseLeave={() => setDropdownOpen(false)}
                                    >
                                        <button onClick={() => handleExportLeads('xlsx')}>
                                            <i className="fas fa-file-excel"></i> Exportar como XLSX
                                        </button>
                                        <button onClick={() => handleExportLeads('xls')}>
                                            <i className="fas fa-file-excel"></i> Exportar como XLS
                                        </button>
                                        <button onClick={() => handleExportLeads('csv')}>
                                            <i className="fas fa-file-csv"></i> Exportar como CSV
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Button
                            variant="primary"
                            onClick={handleAddLead}
                            className="add-lead-btn"
                        >
                            <i className="fas fa-plus"></i> Novo Lead
                        </Button>

                        </div>

                        
                    </div>
                </div>

                <Card className="leads-filter-card">
                    <div className="leads-filters">
                        <div className="filter-row">
                            <div className="filter-group">
                                <Input
                                    type="text"
                                    placeholder="Buscar leads..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    icon="fas fa-search"
                                    className="search-input"
                                />
                            </div>

                            <div className="filter-group">
                                <Select
                                    name="estado"
                                    value={filters.Estado}
                                    onChange={(e) => handleFilterChange('Estado', e.target.value)}
                                    placeholder="Estado"
                                >
                                    <option value="">Todos os estados</option>
                                    {filterOptions.estados?.map(estado => (
                                        <option key={estado} value={estado}>{estado}</option>
                                    ))}
                                </Select>
                            </div>

                            <div className="filter-group">
                                <Select
                                    name="cidade"
                                    value={filters.Cidade}
                                    onChange={(e) => handleFilterChange('Cidade', e.target.value)}
                                    placeholder="Cidade"
                                >
                                    <option value="">Todas as cidades</option>
                                    {filterOptions.cidades?.map(cidade => (
                                        <option key={cidade} value={cidade}>{cidade}</option>
                                    ))}
                                </Select>
                            </div>

                            <div className="filter-group">
                                <Select
                                    name="nomeGrupo"
                                    value={filters.NomeGrupo}
                                    onChange={(e) => handleFilterChange('NomeGrupo', e.target.value)}
                                    placeholder="Grupo"
                                >
                                    <option value="">Todos os grupos</option>
                                    {filterOptions.grupos?.map(grupo => (
                                        <option key={grupo} value={grupo}>{grupo}</option>
                                    ))}
                                </Select>
                            </div>

                            <div className="filter-group">
                                <Select
                                    name="etapaFunil"
                                    value={filters.EtapaFunil}
                                    onChange={(e) => handleFilterChange('EtapaFunil', e.target.value)}
                                    placeholder="Etapa do Funil"
                                >
                                    <option value="">Todas as etapas</option>
                                    {filterOptions.etapas?.map(etapa => (
                                        <option key={etapa} value={etapa}>{etapa}</option>
                                    ))}
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

                <Card className="leads-table-card">
                    {isLoading ? (
                        <div className="leads-loading">
                            <div className="leads-loading-spinner"></div>
                            <p>Carregando leads...</p>
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="leads-empty">
                            <i className="fas fa-users-slash leads-empty-icon"></i>
                            <h3>Nenhum lead encontrado</h3>
                            <p>Tente ajustar seus filtros ou adicione novos leads.</p>
                            <Button
                                variant="primary"
                                onClick={handleAddLead}
                                className="add-lead-empty-btn"
                            >
                                <i className="fas fa-plus"></i> Adicionar Lead
                            </Button>
                        </div>
                    ) : (
                        <>
                        <LeadsTable filteredLeads={filteredLeads} handleEditLead={handleEditLead} handleDeleteLead={handleDeleteLead}/>
                        </>
                    )}
                </Card>

            </div>

            {/* Modal para adicionar/editar lead */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? 'Editar Lead' : 'Novo Lead'}
            >
                <form onSubmit={handleSubmit} className="lead-form">
                    <div className="form-row">
                        <div className="form-group">
                            <Input
                                label="Nome"
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <Input
                                label="Celular"
                                type="text"
                                name="celular"
                                value={formData.celular}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                label="CPF"
                                type="text"
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <Input
                                label="Data de Nascimento"
                                type="date"
                                name="nascimento"
                                value={formData.nascimento}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <Select
                                label="Gênero"
                                name="genero"
                                value={formData.genero}
                                onChange={handleFormChange}
                            >
                                <option value="">Selecione</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </Select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <Input
                                label="Idade"
                                type="number"
                                name="idade"
                                value={formData.idade}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <Select
                                label="Estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleFormChange}
                            >
                                <option value="">Selecione</option>
                                <option value="Acre">Acre</option>
                                <option value="Alagoas">Alagoas</option>
                                <option value="Amapá">Amapá</option>
                                <option value="Amazonas">Amazonas</option>
                                <option value="Bahia">Bahia</option>
                                <option value="Ceará">Ceará</option>
                                <option value="Distrito Federal">Distrito Federal</option>
                                <option value="Espírito Santo">Espírito Santo</option>
                                <option value="Goiás">Goiás</option>
                                <option value="Maranhão">Maranhão</option>
                                <option value="Mato Grosso">Mato Grosso</option>
                                <option value="Mato Grosso do Sul">Mato Grosso do Sul</option>
                                <option value="Minas Gerais">Minas Gerais</option>
                                <option value="Pará">Pará</option>
                                <option value="Paraíba">Paraíba</option>
                                <option value="Paraná">Paraná</option>
                                <option value="Pernambuco">Pernambuco</option>
                                <option value="Piauí">Piauí</option>
                                <option value="Rio de Janeiro">Rio de Janeiro</option>
                                <option value="Rio Grande do Norte">Rio Grande do Norte</option>
                                <option value="Rio Grande do Sul">Rio Grande do Sul</option>
                                <option value="Rondônia">Rondônia</option>
                                <option value="Roraima">Roraima</option>
                                <option value="Santa Catarina">Santa Catarina</option>
                                <option value="São Paulo">São Paulo</option>
                                <option value="Sergipe">Sergipe</option>
                                <option value="Tocantins">Tocantins</option>
                            </Select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <Input
                                label="Cidade"
                                type="text"
                                name="cidade"
                                value={formData.cidade}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                label="Bairro"
                                type="text"
                                name="bairro"
                                value={formData.bairro}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <Input
                                label="Grupo"
                                type="text"
                                name="nomeGrupo"
                                value={formData.nomeGrupo}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <Select
                                label="Etapa do Funil"
                                name="etapaFunil"
                                value={formData.etapaFunil}
                                onChange={handleFormChange}
                            >
                                <option value="">Selecione</option>
                                <option key={0} value={"Prospecção"}>Prospecção</option>
                                <option key={1} value={"Indeciso"}>Indeciso</option>
                                <option key={2} value={"Interessado"}>Interessado</option>
                                <option key={3} value={"Convencido"}>Convencido</option>
                                <option key={4} value={"Aquisição"}>Aquisição</option>
                                <option key={5} value={"Pós-aquisição"}>Pós-aquisição</option>
                            </Select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <Input
                                label="Tags (separadas por vírgula)"
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleFormChange}
                            />
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
                            {isEditing ? 'Atualizar' : 'Cadastrar'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal para importação de leads */}
            <Modal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                title="Importar Leads"
                size="large"
            >
                <div className="import-modal-content">
                    <div className="import-instructions">
                        <h4>Instruções para importação:</h4>
                        <ol>
                            <li>Selecione um arquivo Excel (XLS, XLSX) ou CSV.</li>
                            <li>Verifique a prévia dos dados e mapeie as colunas corretamente.</li>
                            <li>Os campos Nome e Celular são obrigatórios.</li>
                            <li>Clique em "Importar" para concluir.</li>
                        </ol>

                        <div className="import-file-section">
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                            />

                            <Button
                                variant="secondary"
                                onClick={() => fileInputRef.current.click()}
                                disabled={importLoading}
                                className="select-file-btn"
                            >
                                <i className="fas fa-file-upload"></i> Selecionar Arquivo
                            </Button>

                            {importFile && (
                                <div className="selected-file">
                                    <i className="fas fa-file-alt"></i>
                                    <span>{importFile.name}</span>
                                    <button
                                        className="remove-file-btn"
                                        onClick={() => {
                                            setImportFile(null);
                                            setImportPreview([]);
                                            setImportColumns({});
                                            setGrupoNome("");
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {importLoading ? (
                        <div className="import-loading">
                            <div className="import-loading-spinner"></div>
                            <p>Processando arquivo...</p>
                        </div>
                    ) : importFile && importPreview.length > 0 ? (
                        <>
                            <div className="import-preview">
                                <h4>Prévia dos dados:</h4>
                                <p>Mostrando as primeiras {importPreview.length} linhas do arquivo.</p>

                                <div className="import-table-container">
                                    <table className="import-table">
                                        <thead>
                                            <tr>
                                                {importPreview[0]?.map((item, index) => (
                                                    <th key={index}>{importHeaders[index]}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {importPreview?.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {row?.map((cell, cellIndex) => (
                                                        <td key={cellIndex}>{cell || '-'}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="import-mapping">
                                <h4>Mapeamento de colunas:</h4>
                                <p>Selecione qual coluna corresponde a cada campo. Os campos marcados com * são obrigatórios.</p>

                                <div className="mapping-grid">
                                    <div className="mapping-item">
                                        <label>Nome *  (obrigatório)</label>
                                        <Select
                                            value={importColumns.nome}
                                            onChange={(e) => handleColumnMappingChange('nome', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Email</label>
                                        <Select
                                            value={importColumns.email}
                                            onChange={(e) => handleColumnMappingChange('email', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Celular * (obrigatório)</label>
                                        <Select
                                            value={importColumns.celular}
                                            onChange={(e) => handleColumnMappingChange('celular', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>CPF</label>
                                        <Select
                                            value={importColumns.cpf}
                                            onChange={(e) => handleColumnMappingChange('cpf', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Data de Nascimento</label>
                                        <Select
                                            value={importColumns.nascimento}
                                            onChange={(e) => handleColumnMappingChange('nascimento', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Gênero</label>
                                        <Select
                                            value={importColumns.genero}
                                            onChange={(e) => handleColumnMappingChange('genero', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Idade</label>
                                        <Select
                                            value={importColumns.idade}
                                            onChange={(e) => handleColumnMappingChange('idade', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Estado</label>
                                        <Select
                                            value={importColumns.estado}
                                            onChange={(e) => handleColumnMappingChange('estado', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Cidade</label>
                                        <Select
                                            value={importColumns.cidade}
                                            onChange={(e) => handleColumnMappingChange('cidade', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Bairro</label>
                                        <Select
                                            value={importColumns.bairro}
                                            onChange={(e) => handleColumnMappingChange('bairro', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Grupo</label>
                                        <Select
                                            value={importColumns.nomeGrupo}
                                            onChange={(e) => handleColumnMappingChange('nomeGrupo', e.target.value)}
                                            disabled={true}
                                        >
                                            <option value=""> {Utils.stringIsNullOrEmpty(grupoNome) ? `(Á Definir)` : grupoNome }</option>
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Etapa do Funil</label>
                                        <Select
                                            value={importColumns.etapaFunil}
                                            onChange={(e) => handleColumnMappingChange('etapaFunil', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="mapping-item">
                                        <label>Tags</label>
                                        <Select
                                            value={importColumns.tags}
                                            onChange={(e) => handleColumnMappingChange('tags', e.target.value)}
                                        >
                                            <option value="">Selecione a coluna</option>
                                            {importPreview[0]?.map((_, index) => (
                                                <option key={index} value={index}>{importHeaders[index]}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="import-mapping">
                                            
                                <h4>Grupo de Leads:</h4>
                                <p>Identificação do grupo de leads para associar à campanha.</p>

                                <div className="form-group">
                                    <Input
                                        label="Nome do Grupo"
                                        type="text"
                                        name="nomeGrupo"
                                        value={grupoNome}
                                        onChange={(e) => {setGrupoNome(e.target.value)}}
                                        required
                                    />
                                </div>

                            </div>

                        </>
                    ) : null}

                    <div className="import-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setImportModalOpen(false)
                            }}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleImportSubmit}
                            disabled={importLoading}
                        >
                            {importLoading ? 'Importando...' : 'Importar Leads'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthLayout>
    );
};

export default Leads;