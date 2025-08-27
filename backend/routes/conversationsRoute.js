const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateToken } = require('../middlewares/AuthMiddleware');

// Obter todas as conversas únicas (agrupadas por número de telefone)
router.get('/', validateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                (
                    SELECT TOP 1 i2.id
                    FROM [vcarclub_vbot].[vcarclube].[Interacoes] i2
                    WHERE i2.phoneNumber = i1.phoneNumber
                    AND i2.instanceName = i1.instanceName
                    ORDER BY i2.createdAt DESC
                ) AS id,
                i1.phoneNumber,
                i1.campaignId,
                i1.instanceName,
                MAX(i1.createdAt) AS lastMessageTime,
                (
                    SELECT TOP 1 
                        CASE 
                            WHEN i2.userMessage IS NOT NULL THEN i2.userMessage 
                            ELSE i2.botResponse 
                        END
                    FROM [vcarclub_vbot].[vcarclube].[Interacoes] i2
                    WHERE i2.phoneNumber = i1.phoneNumber
                    AND i2.instanceName = i1.instanceName
                    ORDER BY i2.createdAt DESC
                ) AS lastMessage,
                (
                    SELECT TOP 1 i2.leadId
                    FROM [vcarclub_vbot].[vcarclube].[Interacoes] i2
                    WHERE i2.phoneNumber = i1.phoneNumber 
                    AND i2.instanceName = i1.instanceName
                    AND i2.leadId IS NOT NULL
                    ORDER BY i2.createdAt DESC
                ) AS leadId,
                (
                    SELECT COUNT(*)
                    FROM [vcarclub_vbot].[vcarclube].[Interacoes] i2
                    WHERE i2.phoneNumber = i1.phoneNumber
                    AND i2.instanceName = i1.instanceName
                ) AS messageCount
            FROM [vcarclub_vbot].[vcarclube].[Interacoes] i1
            WHERE i1.campaignId IN (
                SELECT id FROM Campaigns WHERE idUser = @idUser
            )
            GROUP BY i1.phoneNumber, i1.campaignId, i1.instanceName
            ORDER BY lastMessageTime DESC
        `;

        const result = await db.query(query, { idUser: req.user.id });

        // Buscar informações adicionais dos leads
        const conversations = await Promise.all(result.recordsets[0].map(async (conversation) => {
            let leadInfo = {};
            
            if (conversation.leadId) {
                const leadQuery = `
                    SELECT 
                        Nome, 
                        Celular
                    FROM 
                        ImportedLeads
                    WHERE 
                        REPLACE(REPLACE(REPLACE(REPLACE(Celular, '(', ''), ')', ''), '-', ''), ' ', '') = 
                        REPLACE(REPLACE(REPLACE(REPLACE(@phoneNumber, '(', ''), ')', ''), '-', ''), ' ', '')
                `;

                const leadResult = await db.query(leadQuery, { phoneNumber: conversation.phoneNumber });
            
                if (leadResult.recordsets[0].length > 0) {
                    leadInfo = {
                        name: leadResult.recordsets[0][0].Nome,
                        phoneNumber: leadResult.recordsets[0][0].Celular,
                        status: leadResult.recordsets[0][0].EtapaFunil,
                    };
                }
            }
            
            return {
                id: conversation.id, // Usando o número como ID
                instanceName: conversation.instanceName,
                campaignId: conversation.campaignId,
                phoneNumber: conversation.phoneNumber,
                name: leadInfo.name || conversation.phoneNumber, // Nome do lead ou número se não tiver
                lastMessage: conversation.lastMessage,
                timestamp: conversation.lastMessageTime,
                messageCount: conversation.messageCount,
                status: leadInfo.status,
                unreadCount: 0 // Implementar lógica de não lidos se necessário
            };
        }));

        return res.json(conversations);
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        res.status(500).json({ message: 'Erro ao buscar conversas', error: error.message });
    }
});

// Obter mensagens de uma conversa específica
router.get('/:instanceName/:phoneNumber', validateToken, async (req, res) => {
    try {
        const { id, instanceName, phoneNumber } = req.params;
        
        const query = `
            SELECT 
                id,
                phoneNumber,
                userMessage,
                botResponse,
                createdAt,
                campaignId,
                leadId
            FROM [vcarclub_vbot].[vcarclube].[Interacoes]
            WHERE phoneNumber = @phoneNumber
            AND instanceName = @instanceName
            ORDER BY createdAt ASC
        `;
        
        const result = await db.query(query, { instanceName: instanceName, phoneNumber: phoneNumber });
        
        // Formatar mensagens para o formato esperado pelo frontend
        const messages = result.recordsets[0].map(msg => {
            // Mensagem do usuário
            const messages = [];
            
            if (msg.userMessage) {
                messages.push({
                    id: `${msg.id}-user`,
                    conversationId: id,
                    text: msg.userMessage,
                    timestamp: msg.createdAt,
                    sender: 'contact', // Mensagem do contato
                    status: 'read'
                });
            }
            
            // Resposta do bot
            if (msg.botResponse) {
                messages.push({
                    id: `${msg.id}-bot`,
                    conversationId: id,
                    text: msg.botResponse,
                    timestamp: msg.createdAt,
                    sender: 'user', // Mensagem do sistema (aparece como nossa)
                    status: 'read'
                });
            }
            
            return messages;
        }).flat(); // Achatar o array de arrays
        
        return res.json(messages);
    } catch (error) {
        console.error('Erro ao buscar mensagens da conversa:', error);
        res.status(500).json({ 
            message: 'Erro ao buscar mensagens da conversa', 
            error: error.message 
        });
    }
});

// Enviar nova mensagem para uma conversa
router.post('/:phoneNumber/send', validateToken, async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const { message, campaignId, leadId } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: 'Mensagem é obrigatória' });
        }
        
        // Verificar se o usuário tem acesso a esta campanha
        if (campaignId) {
            const campaignCheckQuery = `
                SELECT COUNT(*) as count
                FROM Campaigns
                WHERE id = @campaignId AND idUser = @idUser
            `;
            
            const campaignCheck = await db.query(campaignCheckQuery, { 
                campaignId, 
                idUser: req.user.id 
            });
            
            if (!campaignCheck.recordsets[0][0].count) {
                return res.status(403).json({ message: 'Acesso negado a esta campanha' });
            }
        }
        
        // Inserir a nova mensagem
        const insertQuery = `
            INSERT INTO [vcarclub_vbot].[vcarclube].[Interacoes]
            (phoneNumber, botResponse, createdAt, campaignId, leadId)
            VALUES (@phoneNumber, @message, GETDATE(), @campaignId, @leadId);
            
            SELECT SCOPE_IDENTITY() as id;
        `;
        
        const result = await db.query(insertQuery, { 
            phoneNumber, 
            message, 
            campaignId: campaignId || null, 
            leadId: leadId || null 
        });
        
        const newMessageId = result.recordsets[0][0].id;
        
        // Aqui você integraria com o serviço de WhatsApp para enviar a mensagem
        // Exemplo: await whatsappService.sendMessage(phoneNumber, message);
        
        // Retornar a mensagem formatada
        const newMessage = {
            id: `${newMessageId}-bot`,
            conversationId: phoneNumber,
            text: message,
            timestamp: new Date().toISOString(),
            sender: 'user', // Mensagem enviada pelo sistema (aparece como nossa)
            status: 'sent'
        };
        
        return res.json(newMessage);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ 
            message: 'Erro ao enviar mensagem', 
            error: error.message 
        });
    }
});

// Buscar detalhes de um contato específico
router.get('/details/lead/:phoneNumber', validateToken, async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        const leadQuery = `
            SELECT 
                l.id,
                l.Nome,
                l.Celular,
                l.EtapaFunil,
                c.name AS campaignName,
                c.id AS campaignId
            FROM 
                ImportedLeads l
            LEFT JOIN 
                Leads ld ON 
                    REPLACE(REPLACE(REPLACE(REPLACE(ld.PhoneNumber, '(', ''), ')', ''), '-', ''), ' ', '') = 
                    REPLACE(REPLACE(REPLACE(REPLACE(l.Celular, '(', ''), ')', ''), '-', ''), ' ', '')
            LEFT JOIN 
                Campaigns c ON ld.campaignId = c.id
            WHERE 
                REPLACE(REPLACE(REPLACE(REPLACE(l.Celular, '(', ''), ')', ''), '-', ''), ' ', '') = 
                REPLACE(REPLACE(REPLACE(REPLACE(@phoneNumber, '(', ''), ')', ''), '-', ''), ' ', '')
                AND l.idUser = @idUser
        `;

        const leadResult = await db.query(leadQuery, { 
            phoneNumber, 
            idUser: req.user.id 
        });

        let contactDetails = {
            phoneNumber,
            name: phoneNumber,
            status: '(nenhum)',
            messageCount: 0,
            firstContact: null,
            lastContact: null
        };
        
        if (leadResult.recordsets[0].length > 0) {
            const lead = leadResult.recordsets[0][0];
            contactDetails = {
                ...contactDetails,
                name: lead.Nome || phoneNumber,
                leadId: lead.id,
                status: lead.EtapaFunil || '(nenhum)',
                campaignName: lead.campaignName,
                campaignId: lead.campaignId,
            };
        }
        
        const statsQuery = `
            SELECT 
                COUNT(*) as messageCount,
                MIN(createdAt) as firstContact,
                MAX(createdAt) as lastContact
            FROM [vcarclub_vbot].[vcarclube].[Interacoes]
            WHERE phoneNumber = @phoneNumber
        `;
        
        const statsResult = await db.query(statsQuery, { phoneNumber });
        
        if (statsResult.recordsets[0].length > 0) {
            const stats = statsResult.recordsets[0][0];
            contactDetails = {
                ...contactDetails,
                messageCount: stats.messageCount,
                firstContact: stats.firstContact,
                lastContact: stats.lastContact
            };
        }
        
        return res.json(contactDetails);
    } catch (error) {
        console.error('Erro ao buscar detalhes do contato:', error);
        res.status(500).json({ 
            message: 'Erro ao buscar detalhes do contato', 
            error: error.message 
        });
    }
});

module.exports = router;