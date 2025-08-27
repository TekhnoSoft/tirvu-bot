const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateToken } = require('../middlewares/AuthMiddleware');

// Função para calcular a condição de filtro por período
const getTimeRangeCondition = (timeRange, dateField = 'DataCadastro') => {
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
    return `AND ${dateField} >= '${startDate.toISOString()}'`;
  }

  return '';
};

// Obter resumo do dashboard
router.get('/summary', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const leadsTimeCondition = getTimeRangeCondition(timeRange, 'DataCadastro');
    const messageTimeCondition = getTimeRangeCondition(timeRange, 'SentDate');

    // Campanhas ativas
    const campanhasQuery = `
      SELECT COUNT(*) as campanhasAtivas
      FROM Campaigns
      WHERE idUser = @idUser AND Status = 'Ativo'
    `;
    const campanhasResult = await db.query(campanhasQuery, { idUser: req.user.id });

    // Total de leads
    const leadsQuery = `
      SELECT COUNT(*) as totalLeads
      FROM ImportedLeads
      WHERE IdUser = @idUser
      ${leadsTimeCondition}
    `;
    const leadsResult = await db.query(leadsQuery, { idUser: req.user.id });

    // Mensagens enviadas e taxa de entrega
    const mensagensQuery = `
      SELECT 
        COUNT(*) as mensagensEnviadas,
        SUM(CASE WHEN l.status = 'Enviado' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) as taxaEntrega
      FROM Leads l
      JOIN Campaigns c ON c.id = l.CampaignId
      WHERE c.idUser = @idUser
      ${messageTimeCondition}
    `;
    const mensagensResult = await db.query(mensagensQuery, { idUser: req.user.id });

    // Instâncias ativas
    const instanciasQuery = `
      SELECT COUNT(*) as instanciasAtivas
      FROM WhatsAppInstances
      WHERE IdUser = @idUser AND Status = 'Conectado'
    `;
    const instanciasResult = await db.query(instanciasQuery, { idUser: req.user.id });

    // Taxa de conversão (leads que responderam / total de leads contatados)
    const conversaoQuery = `
      SELECT 
        SUM(CASE WHEN l.status = 'Respondido' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) as taxaConversao
      FROM Leads l
      JOIN Campaigns c ON c.id = l.CampaignId
      WHERE c.idUser = @idUser
      ${messageTimeCondition}
    `;
    const conversaoResult = await db.query(conversaoQuery, { idUser: req.user.id });

    // Automações ativas
    const automacoesQuery = `
      SELECT COUNT(*) as automacoes
      FROM Automacoes
      WHERE idUser = @idUser AND status = 'Ativo'
    `;
    const automacoesResult = await db.query(automacoesQuery, { idUser: req.user.id });

    // Combinar resultados
    const summary = {
      campanhasAtivas: parseInt(campanhasResult?.recordsets[0][0]?.campanhasAtivas || 0),
      totalLeads: parseInt(leadsResult?.recordsets[0][0]?.totalLeads || 0),
      mensagensEnviadas: parseInt(mensagensResult?.recordsets[0][0]?.mensagensEnviadas || 0),
      taxaEntrega: parseFloat(mensagensResult?.recordsets[0][0]?.taxaEntrega || 0),
      instanciasAtivas: parseInt(instanciasResult?.recordsets[0][0]?.instanciasAtivas || 0),
      taxaConversao: parseFloat(conversaoResult?.recordsets[0][0]?.taxaConversao || 0),
      automacoes: parseInt(automacoesResult?.recordsets[0][0]?.automacoes || 0)
    };

    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    res.status(500).json({ message: 'Erro ao buscar resumo do dashboard', error: error.message });
  }
});

// Obter mensagens por dia
router.get('/messages-by-day', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeCondition = getTimeRangeCondition(timeRange, 'SentDate');

    const query = `
      SELECT 
        CONVERT(date, SentDate) as data,
        COUNT(*) as enviadas,
        SUM(CASE WHEN l.status = 'Enviado' THEN 1 ELSE 0 END) as entregues
      FROM Leads l
      JOIN Campaigns c ON c.id = l.CampaignId
      WHERE c.idUser = @idUser
      ${timeCondition}
      GROUP BY CONVERT(date, SentDate)
      ORDER BY data
    `;

    const result = await db.query(query, { idUser: req.user.id });

    // Formatar datas para string
    const formattedResult = result.recordsets[0]?.map(item => ({
      data: item.data.toISOString().split('T')[0],
      enviadas: parseInt(item.enviadas || 0),
      entregues: parseInt(item.entregues || 0)
    })) || [];

    res.json(formattedResult);
  } catch (error) {
    console.error('Erro ao buscar mensagens por dia:', error);
    res.status(500).json({ message: 'Erro ao buscar mensagens por dia', error: error.message });
  }
});

// Obter leads por fonte (usando NomeGrupo como fonte)
router.get('/leads-by-source', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeCondition = getTimeRangeCondition(timeRange);

    const query = `
      SELECT 
        COALESCE(NomeGrupo, 'Sem Grupo') as fonte,
        COUNT(*) as valor
      FROM ImportedLeads
      WHERE IdUser = @idUser
      ${timeCondition}
      GROUP BY NomeGrupo
      ORDER BY valor DESC
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar leads por fonte:', error);
    res.status(500).json({ message: 'Erro ao buscar leads por fonte', error: error.message });
  }
});

// Obter leads por estado
router.get('/leads-by-state', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeCondition = getTimeRangeCondition(timeRange);

    const query = `
      SELECT 
        COALESCE(Estado, 'Não Informado') as estado,
        COUNT(*) as valor
      FROM ImportedLeads
      WHERE IdUser = @idUser
      ${timeCondition}
      GROUP BY Estado
      ORDER BY valor DESC
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar leads por estado:', error);
    res.status(500).json({ message: 'Erro ao buscar leads por estado', error: error.message });
  }
});

// Obter leads por etapa do funil
router.get('/leads-by-funnel', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeCondition = getTimeRangeCondition(timeRange);

    const query = `
      SELECT 
        COALESCE(EtapaFunil, 'Não Classificado') as etapa,
        COUNT(*) as valor
      FROM ImportedLeads
      WHERE IdUser = @idUser
      ${timeCondition}
      GROUP BY EtapaFunil
      ORDER BY valor DESC
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar leads por etapa do funil:', error);
    res.status(500).json({ message: 'Erro ao buscar leads por etapa do funil', error: error.message });
  }
});

// Obter desempenho de campanhas
router.get('/campaign-performance', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeCondition = getTimeRangeCondition(timeRange, 'SentDate');

    const query = `
      SELECT TOP 5
        c.Name,
        COUNT(*) as enviadas,
        SUM(CASE WHEN l.status = 'Enviado' THEN 1 ELSE 0 END) as entregues
      FROM Leads l
      JOIN Campaigns c ON c.id = l.CampaignId
      WHERE c.idUser = @idUser
      ${timeCondition}
      GROUP BY c.Name
      ORDER BY enviadas DESC
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar desempenho de campanhas:', error);
    res.status(500).json({ message: 'Erro ao buscar desempenho de campanhas', error: error.message });
  }
});

// Obter status das instâncias WhatsApp
router.get('/whatsapp-instances-status', validateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        Status as status,
        COUNT(*) as quantidade
      FROM WhatsAppInstances
      WHERE IdUser = @idUser
      GROUP BY Status
      ORDER BY quantidade DESC
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar status das instâncias WhatsApp:', error);
    res.status(500).json({ message: 'Erro ao buscar status das instâncias WhatsApp', error: error.message });
  }
});

// Obter atividade das instâncias WhatsApp
router.get('/whatsapp-instances-activity', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calcular data de início com base no timeRange
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
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    const query = `
      SELECT 
        Name as nome,
        CONVERT(date, LastActivity) as data,
        1 as ativo
      FROM WhatsAppInstances
      WHERE IdUser = @idUser AND LastActivity >= @startDate
      ORDER BY data, nome
    `;

    const result = await db.query(query, { 
      idUser: req.user.id,
      startDate: startDate.toISOString()
    });

    // Processar os dados para criar um formato adequado para um gráfico de calor
    const instances = [...new Set(result.recordsets[0]?.map(item => item.nome) || [])];
    const dates = [...new Set(result.recordsets[0]?.map(item => 
      item.data ? item.data.toISOString().split('T')[0] : null
    ).filter(Boolean) || [])];
    
    // Preencher datas faltantes
    const allDates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= now) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Criar matriz de atividade
    const activityData = instances.map(instance => {
      const instanceData = { nome: instance };
      
      allDates.forEach(date => {
        const activity = result.recordsets[0]?.find(item => 
          item.nome === instance && 
          item.data && 
          item.data.toISOString().split('T')[0] === date
        );
        
        instanceData[date] = activity ? 1 : 0;
      });
      
      return instanceData;
    });

    res.json({
      instances,
      dates: allDates,
      activityData
    });
  } catch (error) {
    console.error('Erro ao buscar atividade das instâncias WhatsApp:', error);
    res.status(500).json({ message: 'Erro ao buscar atividade das instâncias WhatsApp', error: error.message });
  }
});

// Obter instâncias WhatsApp recentes
router.get('/recent-whatsapp-instances', validateToken, async (req, res) => {
  try {
    const query = `
      SELECT TOP 5
        Id as id,
        Name as nome,
        Status as status,
        CreatedAt as dataCriacao,
        LastActivity as ultimaAtividade,
        HasSavedSession as temSessaoSalva
      FROM WhatsAppInstances
      WHERE IdUser = @idUser
      ORDER BY LastActivity DESC
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar instâncias WhatsApp recentes:', error);
    res.status(500).json({ message: 'Erro ao buscar instâncias WhatsApp recentes', error: error.message });
  }
});

// Obter leads recentes
router.get('/recent-leads', validateToken, async (req, res) => {
  try {
    const query = `
      SELECT TOP 5
        Id as id,
        Nome as nome,
        Celular as telefone,
        COALESCE(NomeGrupo, 'Sem Grupo') as fonte,
        DataCadastro as dataCadastro
      FROM ImportedLeads
      WHERE IdUser = @idUser
      ORDER BY DataCadastro DESC
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar leads recentes:', error);
    res.status(500).json({ message: 'Erro ao buscar leads recentes', error: error.message });
  }
});

// Obter distribuição por gênero
router.get('/gender-distribution', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeCondition = getTimeRangeCondition(timeRange);

    const query = `
      SELECT 
        COALESCE(Genero, 'Não Informado') as genero,
        COUNT(*) as valor
      FROM ImportedLeads
      WHERE IdUser = @idUser
      ${timeCondition}
      GROUP BY Genero
      ORDER BY valor DESC
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar distribuição por gênero:', error);
    res.status(500).json({ message: 'Erro ao buscar distribuição por gênero', error: error.message });
  }
});

// Obter distribuição por idade
router.get('/age-distribution', validateToken, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const timeCondition = getTimeRangeCondition(timeRange);

    const query = `
      WITH FaixaEtariaCTE AS (
            SELECT 
                CASE
                    WHEN Idade < 18 THEN 'Menor de 18'
                    WHEN Idade BETWEEN 18 AND 24 THEN '18-24'
                    WHEN Idade BETWEEN 25 AND 34 THEN '25-34'
                    WHEN Idade BETWEEN 35 AND 44 THEN '35-44'
                    WHEN Idade BETWEEN 45 AND 54 THEN '45-54'
                    WHEN Idade >= 55 THEN '55+'
                    ELSE 'Não Informado'
                END as faixaEtaria,
                COUNT(*) as valor
            FROM ImportedLeads
            WHERE IdUser = @idUser
            ${timeCondition}
            GROUP BY 
                CASE
                    WHEN Idade < 18 THEN 'Menor de 18'
                    WHEN Idade BETWEEN 18 AND 24 THEN '18-24'
                    WHEN Idade BETWEEN 25 AND 34 THEN '25-34'
                    WHEN Idade BETWEEN 35 AND 44 THEN '35-44'
                    WHEN Idade BETWEEN 45 AND 54 THEN '45-54'
                    WHEN Idade >= 55 THEN '55+'
                    ELSE 'Não Informado'
                END
        )
        SELECT faixaEtaria, valor
        FROM FaixaEtariaCTE
        ORDER BY 
            CASE 
                WHEN faixaEtaria = 'Menor de 18' THEN 1
                WHEN faixaEtaria = '18-24' THEN 2
                WHEN faixaEtaria = '25-34' THEN 3
                WHEN faixaEtaria = '35-44' THEN 4
                WHEN faixaEtaria = '45-54' THEN 5
                WHEN faixaEtaria = '55+' THEN 6
                ELSE 7
            END
    `;

    const result = await db.query(query, { idUser: req.user.id });

    res.json(result.recordsets[0] || []);
  } catch (error) {
    console.error('Erro ao buscar distribuição por idade:', error);
    res.status(500).json({ message: 'Erro ao buscar distribuição por idade', error: error.message });
  }
});


module.exports = router;