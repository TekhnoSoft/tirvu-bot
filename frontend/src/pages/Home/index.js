import React, { useState, useEffect, useCallback } from 'react';
import AuthLayout from '../../components/AuthLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { toast } from 'react-toastify';
import Api from '../../Api';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, RadialBarChart, RadialBar
} from 'recharts';
import './style.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [summaryData, setSummaryData] = useState({
    campanhasAtivas: 0,
    totalLeads: 0,
    mensagensEnviadas: 0,
    instanciasAtivas: 0,
    taxaEntrega: 0,
    taxaConversao: 0,
    automacoes: 0
  });
  
  const [messagesByDay, setMessagesByDay] = useState([]);
  const [leadsBySource, setLeadsBySource] = useState([]);
  const [leadsByState, setLeadsByState] = useState([]);
  const [leadsByFunnel, setLeadsByFunnel] = useState([]);
  const [genderDistribution, setGenderDistribution] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [campaignPerformance, setCampaignPerformance] = useState([]);
  const [whatsappStatus, setWhatsappStatus] = useState([]);
  const [whatsappActivity, setWhatsappActivity] = useState({
    instances: [],
    dates: [],
    activityData: []
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentWhatsappInstances, setRecentWhatsappInstances] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  
  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#ffc658', '#8dd1e1'];
  
  // Status de WhatsApp cores
  const STATUS_COLORS = {
    'CONNECTED': '#00C49F',
    'DISCONNECTED': '#FF8042',
    'CONNECTING': '#FFBB28',
    'SCANNING': '#0088FE',
    'INITIALIZING': '#8884D8'
  };
  
  // Buscar dados do dashboard
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Buscar dados de resumo
      const summaryResponse = await Api.getDashboardSummary(timeRange);
      if (summaryResponse.success) {
        setSummaryData(summaryResponse.data);
      }
      
      // Buscar mensagens por dia
      const messagesByDayResponse = await Api.getDashboardMessagesByDay(timeRange);
      if (messagesByDayResponse.success) {
        setMessagesByDay(messagesByDayResponse.data);
      }
      
      // Buscar leads por fonte
      const leadsBySourceResponse = await Api.getDashboardLeadsBySource(timeRange);
      if (leadsBySourceResponse.success) {
        setLeadsBySource(leadsBySourceResponse.data);
      }
      
      // Buscar leads por estado
      const leadsByStateResponse = await Api.getDashboardLeadsByState(timeRange);
      if (leadsByStateResponse.success) {
        setLeadsByState(leadsByStateResponse.data);
      }
      
      // Buscar leads por etapa do funil
      const leadsByFunnelResponse = await Api.getDashboardLeadsByFunnel(timeRange);
      if (leadsByFunnelResponse.success) {
        setLeadsByFunnel(leadsByFunnelResponse.data);
      }
      
      // Buscar distribuição por gênero
      const genderDistributionResponse = await Api.getDashboardGenderDistribution(timeRange);
      if (genderDistributionResponse.success) {
        setGenderDistribution(genderDistributionResponse.data);
      }
      
      // Buscar distribuição por idade
      const ageDistributionResponse = await Api.getDashboardAgeDistribution(timeRange);
      if (ageDistributionResponse.success) {
        setAgeDistribution(ageDistributionResponse.data);
      }
      
      // Buscar desempenho de campanhas
      const campaignPerformanceResponse = await Api.getDashboardCampaignPerformance(timeRange);
      if (campaignPerformanceResponse.success) {
        setCampaignPerformance(campaignPerformanceResponse.data);
      }
      
      // Buscar status das instâncias WhatsApp
      const whatsappStatusResponse = await Api.getDashboardWhatsAppInstancesStatus();
      if (whatsappStatusResponse.success) {
        setWhatsappStatus(whatsappStatusResponse.data);
      }
      
      // Buscar atividade das instâncias WhatsApp
      const whatsappActivityResponse = await Api.getDashboardWhatsAppInstancesActivity(timeRange);
      if (whatsappActivityResponse.success) {
        setWhatsappActivity(whatsappActivityResponse.data);
      }
      
      // Buscar leads recentes
      const recentLeadsResponse = await Api.getDashboardRecentLeads();
      if (recentLeadsResponse.success) {
        setRecentLeads(recentLeadsResponse.data);
      }
      
      // Buscar instâncias WhatsApp recentes
      const recentWhatsappInstancesResponse = await Api.getDashboardRecentWhatsAppInstances();
      if (recentWhatsappInstancesResponse.success) {
        setRecentWhatsappInstances(recentWhatsappInstancesResponse.data);
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);
  
  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  // Formatar número com separador de milhares
  const formatNumber = (num) => {
    return num.toLocaleString('pt-BR');
  };
  
  // Formatar porcentagem
  const formatPercent = (num) => {
    return `${num.toFixed(1)}%`;
  };
  
  // Formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Formatar hora
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Renderizar skeleton loader para métricas
  const renderSkeletonMetric = () => (
    <div className="skeleton-metric">
      <div className="skeleton-value"></div>
      <div className="skeleton-label"></div>
    </div>
  );
  
  // Renderizar skeleton loader para gráficos
  const renderSkeletonChart = () => (
    <div className="skeleton-chart">
      <div className="skeleton-header"></div>
      <div className="skeleton-body"></div>
    </div>
  );
  
  // Renderizar skeleton loader para listas
  const renderSkeletonList = (itemCount = 5) => (
    <div className="skeleton-list">
      {Array(itemCount).fill(0).map((_, index) => (
        <div key={index} className="skeleton-list-item">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AuthLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Dashboard</h1>
            <p>Visão geral do seu sistema de automação de marketing</p>
          </div>
          
          <div className="dashboard-actions">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="year">Este ano</option>
              <option value="all">Todo o período</option>
            </Select>
            
            <Button 
              onClick={fetchDashboardData}
              variant="secondary"
              className="refresh-btn"
            >
              <i className="fas fa-sync-alt"></i> Atualizar
            </Button>
          </div>
        </div>
        
        {/* Cards de métricas */}
        <div className="metrics-grid">
          <Card className="metric-card">
            <div className="metric-content">
              <div className="metric-icon campaigns">
                <i className="fas fa-bullhorn"></i>
              </div>
              <div className="metric-data">
                <h3 className="metric-value">
                  {isLoading ? renderSkeletonMetric() : formatNumber(summaryData.campanhasAtivas)}
                </h3>
                <p className="metric-label">Campanhas Ativas</p>
              </div>
            </div>
          </Card>
          
          <Card className="metric-card">
            <div className="metric-content">
              <div className="metric-icon leads">
                <i className="fas fa-users"></i>
              </div>
              <div className="metric-data">
                <h3 className="metric-value">
                  {isLoading ? renderSkeletonMetric() : formatNumber(summaryData.totalLeads)}
                </h3>
                <p className="metric-label">Total de Leads</p>
              </div>
            </div>
          </Card>
          
          <Card className="metric-card">
            <div className="metric-content">
              <div className="metric-icon messages">
                <i className="fas fa-comment-dots"></i>
              </div>
              <div className="metric-data">
                <h3 className="metric-value">
                  {isLoading ? renderSkeletonMetric() : formatNumber(summaryData.mensagensEnviadas)}
                </h3>
                <p className="metric-label">Mensagens Enviadas</p>
              </div>
            </div>
          </Card>
          
          <Card className="metric-card">
            <div className="metric-content">
              <div className="metric-icon instances">
                <i className="fab fa-whatsapp"></i>
              </div>
              <div className="metric-data">
                <h3 className="metric-value">
                  {isLoading ? renderSkeletonMetric() : formatNumber(summaryData.instanciasAtivas)}
                </h3>
                <p className="metric-label">Instâncias Ativas</p>
              </div>
            </div>
          </Card>
          
          <Card className="metric-card">
            <div className="metric-content">
              <div className="metric-icon delivery">
                <i className="fas fa-check-double"></i>
              </div>
              <div className="metric-data">
                <h3 className="metric-value">
                  {isLoading ? renderSkeletonMetric() : formatPercent(summaryData.taxaEntrega)}
                </h3>
                <p className="metric-label">Taxa de Entrega</p>
              </div>
            </div>
          </Card>
          
          <Card className="metric-card">
            <div className="metric-content">
              <div className="metric-icon conversion">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <div className="metric-data">
                <h3 className="metric-value">
                  {isLoading ? renderSkeletonMetric() : formatPercent(summaryData.taxaConversao)}
                </h3>
                <p className="metric-label">Taxa de Conversão</p>
              </div>
            </div>
          </Card>
          
          <Card className="metric-card">
            <div className="metric-content">
              <div className="metric-icon automation">
                <i className="fas fa-robot"></i>
              </div>
              <div className="metric-data">
                <h3 className="metric-value">
                  {isLoading ? renderSkeletonMetric() : formatNumber(summaryData.automacoes)}
                </h3>
                <p className="metric-label">Automações Ativas</p>
              </div>
            </div>
          </Card>
          
          <Card className="metric-card quick-actions">
            <div className="quick-actions-content">
              <h3 className="quick-actions-title">Ações Rápidas</h3>
              <div className="quick-actions-buttons">
                <Button 
                  onClick={() => navigate('/campaigns')}
                  variant="primary"
                  className="quick-action-btn"
                  style={{display: 'none'}}
                >
                  <i className="fas fa-plus"></i> Nova Campanha
                </Button>
                
                <Button 
                  onClick={() => navigate('/leads')}
                  variant="secondary"
                  className="quick-action-btn"
                >
                  <i className="fas fa-upload"></i> Importar Leads
                </Button>
                
                <Button 
                  onClick={() => navigate('/automation')}
                  variant="success"
                  className="quick-action-btn"
                >
                  <i className="fas fa-robot"></i> Nova Automação
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Gráficos e tabelas */}
        <div className="dashboard-charts-grid">
          {/* Mensagens por dia */}
          <Card className="chart-card large">
            <div className="chart-header">
              <h3>Mensagens por Dia</h3>
            </div>
            
            <div className="chart-body">
              {isLoading ? (
                renderSkeletonChart()
              ) : messagesByDay.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-chart-area"></i>
                  <p>Nenhum dado disponível para o período selecionado</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={messagesByDay}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="data" 
                      stroke="#888" 
                      fontSize={12}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                      }}
                    />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Mensagens']}
                      labelFormatter={(value) => formatDate(value)}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="enviadas" 
                      stackId="1"
                      stroke="#0088FE" 
                      fill="#0088FE" 
                      fillOpacity={0.6}
                      name="Enviadas"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="entregues" 
                      stackId="2"
                      stroke="#00C49F" 
                      fill="#00C49F" 
                      fillOpacity={0.6}
                      name="Entregues"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          {/* Status das instâncias WhatsApp */}
          <Card className="chart-card large">
            <div className="chart-header">
              <h3>Status das Instâncias WhatsApp</h3>
            </div>
            
            <div className="chart-body">
              {isLoading ? (
                renderSkeletonChart()
              ) : whatsappStatus.length === 0 ? (
                <div className="no-data">
                  <i className="fab fa-whatsapp"></i>
                  <p>Nenhuma instância de WhatsApp encontrada</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={whatsappStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="quantidade"
                      nameKey="status"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {whatsappStatus.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Instâncias']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          {/* Leads por fonte */}
          <Card className="chart-card large">
            <div className="chart-header">
              <h3>Leads por Grupo</h3>
            </div>
            
            <div className="chart-body">
              {isLoading ? (
                renderSkeletonChart()
              ) : leadsBySource.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-users"></i>
                  <p>Nenhum dado disponível para o período selecionado</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadsBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="fonte"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {leadsBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Leads']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          {/* Leads por estado */}
          <Card className="chart-card large">
            <div className="chart-header">
              <h3>Leads por Estado</h3>
            </div>
            
            <div className="chart-body">
              {isLoading ? (
                renderSkeletonChart()
              ) : leadsByState.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-map-marker-alt"></i>
                  <p>Nenhum dado disponível para o período selecionado</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={leadsByState.slice(0, 10)} // Mostrar apenas os 10 principais estados
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#888" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="estado" 
                      stroke="#888" 
                      fontSize={12} 
                      width={80}
                      tickFormatter={(value) => 
                        value.length > 15 ? `${value.substring(0, 15)}...` : value
                      }
                    />
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Leads']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Bar 
                      dataKey="valor" 
                      name="Leads" 
                      fill="#0088FE" 
                      radius={[0, 4, 4, 0]}
                    >
                      {leadsByState.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          {/* Distribuição por gênero */}
          <Card className="chart-card large">
            <div className="chart-header">
              <h3>Distribuição por Gênero</h3>
            </div>
            
            <div className="chart-body">
              {isLoading ? (
                renderSkeletonChart()
              ) : genderDistribution.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-venus-mars"></i>
                  <p>Nenhum dado disponível para o período selecionado</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="genero"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {genderDistribution.map((entry, index) => {
                        let color;
                        if (entry.genero.toLowerCase() === 'masculino') color = '#0088FE';
                        else if (entry.genero.toLowerCase() === 'feminino') color = '#FF8042';
                        else color = '#FFBB28';
                        
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Leads']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          {/* Distribuição por idade */}
          <Card className="chart-card large">
            <div className="chart-header">
              <h3>Distribuição por Idade</h3>
            </div>
            
            <div className="chart-body">
              {isLoading ? (
                renderSkeletonChart()
              ) : ageDistribution.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-birthday-cake"></i>
                  <p>Nenhum dado disponível para o período selecionado</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={ageDistribution.filter(item => item.faixaEtaria !== 'Não Informado')}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="faixaEtaria" 
                      stroke="#888" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Leads']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Bar 
                      dataKey="valor" 
                      name="Leads" 
                      fill="#8884D8" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          {/* Leads por etapa do funil */}
          <Card className="chart-card large">
            <div className="chart-header">
              <h3>Leads por Etapa do Funil</h3>
            </div>
            
            <div className="chart-body">
              {isLoading ? (
                renderSkeletonChart()
              ) : leadsByFunnel.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-filter"></i>
                  <p>Nenhum dado disponível para o período selecionado</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadsByFunnel}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="etapa"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {leadsByFunnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Leads']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          {/* Desempenho de campanhas */}
          <Card className="chart-card large">
            <div className="chart-header">
              <h3>Desempenho de Campanhas</h3>
            </div>
            
            <div className="chart-body">
              {isLoading ? (
                renderSkeletonChart()
              ) : campaignPerformance.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-bullhorn"></i>
                  <p>Nenhum dado disponível para o período selecionado</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={campaignPerformance}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#888" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="nome" 
                      stroke="#888" 
                      fontSize={12} 
                      width={100}
                      tickFormatter={(value) => 
                        value.length > 15 ? `${value.substring(0, 15)}...` : value
                      }
                    />
                    <Tooltip 
                      formatter={(value) => [formatNumber(value), 'Mensagens']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
                    <Bar 
                      dataKey="enviadas" 
                      name="Enviadas" 
                      fill="#0088FE" 
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar 
                      dataKey="entregues" 
                      name="Entregues" 
                      fill="#00C49F" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          
          {/* Leads recentes */}
          <Card className="list-card large">
            <div className="list-header">
              <h3>Leads Recentes</h3>
              <Button 
                onClick={() => window.location.href = '/leads'}
                variant="text"
                className="view-all-btn"
              >
                Ver Todos <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
            
            <div className="list-body">
              {isLoading ? (
                renderSkeletonList()
              ) : recentLeads.length === 0 ? (
                <div className="empty-list">
                  <p>Nenhum lead encontrado</p>
                </div>
              ) : (
                <div className="leads-list">
                  {recentLeads.map(lead => (
                    <div key={lead.id} className="lead-item">
                      <div className="lead-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="lead-info">
                        <div className="lead-name">{lead.nome || "Sem nome"}</div>
                        <div className="lead-details">
                          <span className="lead-phone">
                            <i className="fas fa-phone"></i> {lead.telefone || "Não informado"}
                          </span>
                          <span className="lead-source">
                            <i className="fas fa-tag"></i> {lead.fonte}
                          </span>
                        </div>
                      </div>
                      <div className="lead-date">
                        {formatDate(lead.dataCadastro)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
          
          {/* Instâncias WhatsApp recentes */}
          <Card className="list-card large">
            <div className="list-header">
              <h3>Instâncias WhatsApp</h3>
              <Button 
                onClick={() => window.location.href = '/instancias'}
                variant="text"
                className="view-all-btn"
              >
                Ver Todas <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
            
            <div className="list-body">
              {isLoading ? (
                renderSkeletonList()
              ) : recentWhatsappInstances.length === 0 ? (
                <div className="empty-list">
                  <p>Nenhuma instância encontrada</p>
                </div>
              ) : (
                <div className="instances-list">
                  {recentWhatsappInstances.map(instance => (
                    <div key={instance.id} className="instance-item">
                      <div className={`instance-status ${instance.status.toLowerCase()}`}>
                        <i className="fab fa-whatsapp"></i>
                      </div>
                      <div className="instance-info">
                        <div className="instance-name">{instance.nome || "Sem nome"}</div>
                        <div className="instance-details">
                          <span className="instance-status-text">
                            <i className="fas fa-circle"></i> {instance.status}
                          </span>
                          <span className="instance-last-activity">
                            <i className="fas fa-clock"></i> Última atividade: {formatDate(instance.ultimaAtividade)}
                          </span>
                        </div>
                      </div>
                      <div className="instance-actions">
                        <Button 
                          onClick={() => navigate('/instances')}
                          variant="text"
                          className="view-instance-btn"
                          title="Ver Detalhes"
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
          
        </div>
      </div>
    </AuthLayout>
  );
};

export default Dashboard;