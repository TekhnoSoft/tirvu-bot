import axios from "axios";
import Environment from "./Environment";

const API_BASE = Environment.API_BASE;
const API_AUTOMATION = Environment.API_AUTOMATION;

const Api = {

    // Métodos genéricos
    generic_get: async (url, headers, params) => {
        try {
            const response = await axios.get(url, { params }, headers);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    generic_post: async (url, headers, data) => {
        try {
            const response = await axios.post(url, data, headers);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    generic_put: async (url, headers, data) => {
        try {
            const response = await axios.put(url, data, headers);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    generic_delete: async (url, headers) => {
        try {
            const response = await axios.delete(url, headers);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    auth: async () => {
        return await axios.get(`${API_BASE}/users/auth`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    get: async () => {
        return await axios.get(`${API_BASE}/users/get`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    login: async ({ email, password }) => {
        return await axios.post(`${API_BASE}/users/login`, { email, password }).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },
    // Leads
    getLeads: async () => {
        return await axios.get(`${API_BASE}/leads/all`, Environment.HEADERS).then(async (response) => {
            return await response;
        }).catch(err => {
            return err;
        });
    },

    getLead: async (id) => {
        try {
            const response = await axios.get(`${API_BASE}/leads/${id}`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    createLead: async (leadData) => {
        try {
            const response = await axios.post(`${API_BASE}/leads/save`, leadData, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    updateLead: async (id, leadData) => {
        try {
            const response = await axios.put(`${API_BASE}/leads/${id}`, leadData, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    deleteLead: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE}/leads/delete/${id}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error };
        }
    },

    importLeads: async (leadsData, grupoNome) => {
        try {
            const response = await axios.post(`${API_BASE}/leads/import`, { leads: leadsData, grupoNome: grupoNome }, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao importar leads' };
        }
    },

    // Métodos para campanhas
    getCampanhas: async () => {
        try {
            const response = await axios.get(`${API_BASE}/campanhas`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar campanhas' };
        }
    },

    getCampanha: async (id) => {
        try {
            const response = await axios.get(`${API_BASE}/campanhas/${id}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar campanha' };
        }
    },

    createCampanha: async (data) => {
        try {
            const response = await axios.post(`${API_BASE}/campanhas`, data, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao criar campanha' };
        }
    },

    updateCampanha: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE}/campanhas/${id}`, data, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao atualizar campanha' };
        }
    },

    updateCampanhaStatus: async (id, status) => {
        try {
            const response = await axios.put(`${API_BASE}/campanhas/${id}/status`, { status }, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao atualizar status da campanha' };
        }
    },

    deleteCampanha: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE}/campanhas/${id}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao remover campanha' };
        }
    },

    getGruposLeads: async () => {
        try {
            const response = await axios.get(`${API_BASE}/campanhas/leads/grupos`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar grupos de leads' };
        }
    },

    getInstancias: async () => {
        try {
            const response = await axios.get(`${API_BASE}/instancias/all`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar instâncias' };
        }
    },

    getInstancia: async (id) => {
        try {
            const response = await axios.get(`${API_BASE}/instancias/${id}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar instância' };
        }
    },

    getAnalyticsLeadsGrowth: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/analytics/leads-growth?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar dados de crescimento de leads' };
        }
    },

    getAnalyticsMetrics: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/analytics/metrics?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar dados de crescimento de leads' };
        }
    },

    // Métodos para automações
    getAutomacoes: async () => {
        try {
            const response = await axios.get(`${API_BASE}/automacoes`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar automações' };
        }
    },

    getAutomacao: async (id) => {
        try {
            const response = await axios.get(`${API_BASE}/automacoes/${id}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar automação' };
        }
    },

    createAutomacao: async (data) => {
        try {
            const response = await axios.post(`${API_BASE}/automacoes`, data, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao criar automação' };
        }
    },

    updateAutomacao: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE}/automacoes/${id}`, data, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao atualizar automação' };
        }
    },

    updateAutomacaoStatus: async (id, status) => {
        try {
            const response = await axios.patch(`${API_BASE}/automacoes/${id}/status`, { status }, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao atualizar status da automação' };
        }
    },

    deleteAutomacao: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE}/automacoes/${id}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao excluir automação' };
        }
    },

    // Métodos para dashboard
    getDashboardSummary: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/summary?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar resumo do dashboard' };
        }
    },

    getDashboardMessagesByDay: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/messages-by-day?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar mensagens por dia' };
        }
    },

    getDashboardLeadsBySource: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/leads-by-source?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar leads por fonte' };
        }
    },

    getDashboardLeadsByState: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/leads-by-state?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar leads por estado' };
        }
    },

    getDashboardLeadsByFunnel: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/leads-by-funnel?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar leads por etapa do funil' };
        }
    },

    getDashboardCampaignPerformance: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/campaign-performance?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar desempenho de campanhas' };
        }
    },

    getDashboardWhatsAppInstancesStatus: async () => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/whatsapp-instances-status`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar status das instâncias WhatsApp' };
        }
    },

    getDashboardWhatsAppInstancesActivity: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/whatsapp-instances-activity?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar atividade das instâncias WhatsApp' };
        }
    },

    getDashboardRecentWhatsAppInstances: async () => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/recent-whatsapp-instances`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar instâncias WhatsApp recentes' };
        }
    },

    getDashboardRecentLeads: async () => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/recent-leads`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar leads recentes' };
        }
    },

    getDashboardGenderDistribution: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/gender-distribution?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar distribuição por gênero' };
        }
    },

    getDashboardAgeDistribution: async (timeRange) => {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/age-distribution?timeRange=${timeRange}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Erro ao buscar distribuição por idade' };
        }
    },

    // Obter todas as conversas
    getConversations: async () => {
        try {
            const response = await axios.get(`${API_BASE}/conversations`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
            return { success: false, error };
        }
    },
    
    // Obter mensagens de uma conversa específica
    getConversationMessages: async (instanceName, phoneNumber) => {
        try {
            const response = await axios.get(`${API_BASE}/conversations/${instanceName}/${phoneNumber}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erro ao buscar mensagens da conversa:', error);
            return { success: false, error };
        }
    },
    
    // Enviar mensagem para uma conversa
    sendMessage: async (instanceName, phoneNumber, message, campaignId = null, leadId = null) => {
        try {
            const response = await axios.post(
                `${API_AUTOMATION}/api/send-message`,
                { instanceName, phoneNumber, message, campaignId, leadId },
            );

            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return { success: false, error };
        }
    },
    
    // Obter detalhes de um contato
    getContactDetails: async (phoneNumber) => {
        try {
            const response = await axios.get(`${API_BASE}/conversations/details/lead/${phoneNumber}`, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erro ao buscar detalhes do contato:', error);
            return { success: false, error };
        }
    },

    // Criar intancias de whatsapp
    createWhatsappInstance: async (name) => {
        try {
            const response = await axios.post(`${API_BASE}/instancias/save-instance`, { name }, Environment.HEADERS);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erro ao criar instâncias de whatsapp:', error);
            return { success: false, error };
        }
    }
}

export default Api;