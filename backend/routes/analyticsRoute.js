const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateToken } = require('../middlewares/AuthMiddleware');

const getTimeRangeCondition = (timeRange) => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
        case '7d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            break;
        case '90d':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 90);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1); // 1º de janeiro do ano atual
            break;
        case 'all':
        default:
            return '';
    }

    if (startDate) {
        return `AND SentDate >= '${startDate.toISOString()}'`;
    }

    return '';
};

// Obter métricas principais
router.get('/metrics', validateToken, async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;
        const timeCondition = getTimeRangeCondition(timeRange);

        const messagesQuery = `
            SELECT 
                COUNT(*) as totalMensagens,
                AVG(CASE WHEN l.status = 'Enviado' THEN 100.0 ELSE 0 END) as taxaEntrega
            FROM Leads l
                JOIN Campaigns c ON c.id = l.CampaignId
                WHERE c.idUser = @idUser
                ${timeCondition}
        `;

        const messagesResult = await db.query(messagesQuery, { idUser: req.user.id });

        const campaignsQuery = `
            SELECT COUNT(*) as totalCampanhasAtivas
            FROM Campaigns
            WHERE idUser = @idUser AND Status = 'Ativo'
        `;

        const campaignsResult = await db.query(campaignsQuery, { idUser: req.user.id });

        const leadsQuery = `
            SELECT COUNT(*) as totalLeads
            FROM ImportedLeads
            WHERE idUser = @idUser
        `;

        const leadsResult = await db.query(leadsQuery, { idUser: req.user.id });

        const metrics = {
            totalMensagens: parseInt(messagesResult?.recordsets[0][0]?.totalMensagens || 0),
            taxaEntrega: parseFloat(messagesResult?.recordsets[0][0]?.taxaEntrega || 0),
            totalCampanhasAtivas: parseInt(campaignsResult?.recordsets[0][0]?.totalCampanhasAtivas || 0),
            totalLeads: parseInt(leadsResult?.recordsets[0][0]?.totalLeads || 0)
        };

        return res.json(metrics);
    } catch (error) {
        console.error('Erro ao buscar métricas:', error);
        res.status(500).json({ message: 'Erro ao buscar métricas', error: error.message });
    }
});

router.get('/leads-growth', validateToken, async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;
        const timeCondition = getTimeRangeCondition(timeRange);

        const query = `
            SELECT 
            CONVERT(date, dataCadastro) as data,
            COUNT(*) as novosLeads
            FROM ImportedLeads
            WHERE idUser = @idUser ${timeCondition.replace('SentDate', 'DataCadastro')}
            GROUP BY CONVERT(date, dataCadastro)
            ORDER BY data
        `;

        const result = await db.query(query, { idUser: req.user.id });

        const formattedResult = result.recordsets[0]?.map(item => ({
            data: item.data.toISOString().split('T')[0],
            novosLeads: parseInt(item.novosLeads || 0)
        }));

        return res.json(formattedResult);
    } catch (error) {
        console.error('Erro ao buscar dados de crescimento de leads:', error);
        res.status(500).json({ message: 'Erro ao buscar dados de crescimento de leads', error: error.message });
    }
});

module.exports = router;