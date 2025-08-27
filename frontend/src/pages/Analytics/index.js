import React, { useState, useEffect, useCallback } from 'react';
import AuthLayout from '../../components/AuthLayout';
import Card from '../../components/Card';
import Select from '../../components/Select';
import { toast } from 'react-toastify';
import Api from '../../Api';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell
} from 'recharts';
import './style.css';

const Analytics = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');
    const [metrics, setMetrics] = useState({
        totalMensagens: 0,
        taxaEntrega: 0,
        totalCampanhasAtivas: 0,
        totalLeads: 0
    });
    
    const [leadsGrowth, setLeadsGrowth] = useState([]);
    const [campaignPerformance, setCampaignPerformance] = useState([]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    const fetchAnalyticsData = useCallback(async () => {
        setIsLoading(true);
        try {
          // Buscar métricas principais
          const metricsResponse = await Api.getAnalyticsMetrics(timeRange);
          if (metricsResponse.success) {
            setMetrics(metricsResponse.data);
            
            // Criar dados de desempenho de campanha a partir das métricas
            const performanceData = [
              { name: 'Enviadas', value: metricsResponse.data.totalMensagens },
              { name: 'Entregues', value: Math.round(metricsResponse.data.totalMensagens * metricsResponse.data.taxaEntrega / 100) }
            ];
            setCampaignPerformance(performanceData);
          }
    
          // Buscar dados de crescimento de leads
          const leadsResponse = await Api.getAnalyticsLeadsGrowth(timeRange);
          if (leadsResponse.success) {
            setLeadsGrowth(leadsResponse.data);
          }
        } catch (error) {
          console.error('Erro ao buscar dados de analytics:', error);
          toast.error('Erro ao carregar dados de analytics');
        } finally {
          setIsLoading(false);
        }
      }, [timeRange]);

    // Buscar dados ao carregar a página ou quando o intervalo de tempo mudar
    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    // Formatar número com separador de milhares
    const formatNumber = (num) => {
        return num.toLocaleString('pt-BR');
    };

    // Formatar porcentagem
    const formatPercent = (num) => {
        return `${num.toFixed(1)}%`;
    };

    // Renderizar skeleton loader para gráficos
    const renderSkeletonChart = () => (
        <div className="skeleton-chart">
            <div className="skeleton-header"></div>
            <div className="skeleton-body"></div>
        </div>
    );

    return (
        <AuthLayout>
            <div className="analytics-container">
                <div className="analytics-header">
                    <div className="analytics-title">
                        <h1>Analytics</h1>
                        <p>Visualize o desempenho das suas campanhas e mensagens</p>
                    </div>

                    <div className="analytics-time-filter">
                        <Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="time-select"
                        >
                            <option value="7d">Últimos 7 dias</option>
                            <option value="30d">Últimos 30 dias</option>
                            <option value="90d">Últimos 90 dias</option>
                            <option value="year">Este ano</option>
                            <option value="all">Todo o período</option>
                        </Select>
                    </div>
                </div>

                {/* Cards de métricas */}
                <div className="metrics-grid">
                    <Card className="metric-card">
                        <div className="metric-content">
                            <div className="metric-icon total-messages">
                                <i className="fas fa-comment-dots"></i>
                            </div>
                            <div className="metric-data">
                                <h3 className="metric-value">
                                    {isLoading ? (
                                        <div className="skeleton-text"></div>
                                    ) : (
                                        formatNumber(metrics.totalMensagens)
                                    )}
                                </h3>
                                <p className="metric-label">Mensagens Enviadas</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="metric-card">
                        <div className="metric-content">
                            <div className="metric-icon delivery-rate">
                                <i className="fas fa-check-double"></i>
                            </div>
                            <div className="metric-data">
                                <h3 className="metric-value">
                                    {isLoading ? (
                                        <div className="skeleton-text"></div>
                                    ) : (
                                        formatPercent(metrics.taxaEntrega)
                                    )}
                                </h3>
                                <p className="metric-label">Taxa de Entrega</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="metric-card">
                        <div className="metric-content">
                            <div className="metric-icon active-campaigns">
                                <i className="fas fa-bullhorn"></i>
                            </div>
                            <div className="metric-data">
                                <h3 className="metric-value">
                                    {isLoading ? (
                                        <div className="skeleton-text"></div>
                                    ) : (
                                        formatNumber(metrics.totalCampanhasAtivas)
                                    )}
                                </h3>
                                <p className="metric-label">Campanhas Ativas</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="metric-card">
                        <div className="metric-content">
                            <div className="metric-icon total-leads">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="metric-data">
                                <h3 className="metric-value">
                                    {isLoading ? (
                                        <div className="skeleton-text"></div>
                                    ) : (
                                        formatNumber(metrics.totalLeads)
                                    )}
                                </h3>
                                <p className="metric-label">Total de Leads</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Gráficos */}
                <div className="charts-grid">

                    <Card className="chart-card-analytic">
                        <div className="chart-header">
                            <h3>Desempenho de Campanhas</h3>
                        </div>
                        {isLoading ? renderSkeletonChart() : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={campaignPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatNumber(value)} />
                                    <Legend />
                                    <Bar dataKey="value" fill="#0088FE" name="Mensagens" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>


                    <Card className="chart-card-analytic">
                        <div className="chart-header">
                            <h3>Crescimento de Leads</h3>
                        </div>
                        {isLoading ? renderSkeletonChart() : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={leadsGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="data" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatNumber(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="novosLeads" stroke="#00C49F" name="Novos Leads" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>


                    <Card className="chart-card-analytic">
                        <div className="chart-header">
                            <h3>Taxa de Entrega</h3>
                        </div>
                        {isLoading ? renderSkeletonChart() : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Entregues', value: metrics.taxaEntrega },
                                            { name: 'Não Entregues', value: 100 - metrics.taxaEntrega }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    >
                                        {[0, 1].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    {/* Eficiência de Campanhas (Novo indicador) */}
                    <Card className="chart-card large">
                        <div className="chart-header">
                            <h3>Eficiência de Campanhas</h3>
                        </div>
                        {isLoading ? renderSkeletonChart() : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={[
                                        { name: 'Leads por Campanha', valor: metrics.totalCampanhasAtivas > 0 ? metrics.totalLeads / metrics.totalCampanhasAtivas : 0 },
                                        { name: 'Mensagens por Campanha', valor: metrics.totalCampanhasAtivas > 0 ? metrics.totalMensagens / metrics.totalCampanhasAtivas : 0 },
                                        { name: 'Entregas por Campanha', valor: metrics.totalCampanhasAtivas > 0 ? (metrics.totalMensagens * metrics.taxaEntrega / 100) / metrics.totalCampanhasAtivas : 0 }
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatNumber(Math.round(value))} />
                                    <Legend />
                                    <Bar dataKey="valor" fill="#FFBB28" name="Média por Campanha" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                </div>
            </div>
        </AuthLayout>
    );
};

export default Analytics;