const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateToken } = require('../middlewares/AuthMiddleware');
const { v4: uuidv4 } = require('uuid');

// Obter todas as automações
router.get('/', validateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM Automacoes
      WHERE idUser = @idUser
      ORDER BY nome
    `;
    
    const result = await db.query(query, { idUser: req.user.id });
    
    // Processar os resultados para converter strings JSON em objetos
    const automacoes = result.recordsets[0].map(automacao => ({
      ...automacao,
      dadosColeta: JSON.parse(automacao.dadosColeta || '[]'),
      respostasRapidas: JSON.parse(automacao.respostasRapidas || '[]')
    }));
    
    res.json(automacoes);
  } catch (error) {
    console.error('Erro ao buscar automações:', error);
    res.status(500).json({ message: 'Erro ao buscar automações', error: error.message });
  }
});

// Obter uma automação específica
router.get('/:id', validateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM Automacoes
      WHERE id = @id AND idUser = @idUser
    `;
    
    const result = await db.query(query, { 
      id: req.params.id,
      idUser: req.user.id
    });
    
    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ message: 'Automação não encontrada' });
    }
    
    // Processar o resultado para converter strings JSON em objetos
    const automacao = {
        ...result.recordset[0],
        dadosColeta: JSON.parse(result.recordset[0].dadosColeta || '[]'),
        respostasRapidas: JSON.parse(result.recordset[0].respostasRapidas || '[]')
      };
      
      res.json(automacao);
    } catch (error) {
      console.error('Erro ao buscar automação:', error);
      res.status(500).json({ message: 'Erro ao buscar automação', error: error.message });
    }
  });
  
  // Criar uma nova automação
  router.post('/', validateToken, async (req, res) => {
    try {
      const {
        nome,
        descricao,
        campanhaId,
        status,
        detalheProduto,
        missaoIA,
        dadosColeta,
        estrategiaConvencimento,
        acaoConvencido,
        acaoNaoConvencido,
        respostasRapidas,
        nivelPersonalidade,
        tonConversa,
        palavrasEvitar,
        limiteTentativas,
        tempoEspera,
        notificarHumano
      } = req.body;

      console.log(req.body)
      
      // Validações básicas
      if (!nome) {
        return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
      }
      
      if(campanhaId){

        // Verificar se a campanha já possui uma automação
        const checkCampanhaQuery = `
          SELECT id FROM Automacoes
          WHERE campanhaId = @campanhaId AND idUser = @idUser
        `;
        
        const checkCampanhaResult = await db.query(checkCampanhaQuery, {
          campanhaId,
          idUser: req.user.id
        });
        
        if (checkCampanhaResult.recordset && checkCampanhaResult.recordset.length > 0) {
          return res.status(400).json({ 
            message: 'Esta campanha já possui uma automação vinculada. Cada campanha pode ter apenas uma automação.'
          });
        }

      }
      
      const id = uuidv4();
      const dataCriacao = new Date().toISOString();
      
      const query = `
        INSERT INTO Automacoes (
          id, nome, descricao, campanhaId, status, 
          detalheProduto, missaoIA, dadosColeta, estrategiaConvencimento, 
          acaoConvencido, acaoNaoConvencido, respostasRapidas, 
          nivelPersonalidade, tonConversa, palavrasEvitar, 
          limiteTentativas, tempoEspera, notificarHumano, 
          dataCriacao, idUser
        )
        VALUES (
          @id, @nome, @descricao, @campanhaId, @status, 
          @detalheProduto, @missaoIA, @dadosColeta, @estrategiaConvencimento, 
          @acaoConvencido, @acaoNaoConvencido, @respostasRapidas, 
          @nivelPersonalidade, @tonConversa, @palavrasEvitar, 
          @limiteTentativas, @tempoEspera, @notificarHumano, 
          @dataCriacao, @idUser
        )
      `;
      
      await db.query(query, {
        id,
        nome,
        descricao: descricao || '',
        campanhaId: campanhaId || '00000000-0000-0000-0000-000000000000',
        status: status || 'Ativo',
        detalheProduto: detalheProduto || '',
        missaoIA: missaoIA || '',
        dadosColeta: JSON.stringify(dadosColeta || []),
        estrategiaConvencimento: estrategiaConvencimento || '',
        acaoConvencido: acaoConvencido || '',
        acaoNaoConvencido: acaoNaoConvencido || '',
        respostasRapidas: JSON.stringify(respostasRapidas || []),
        nivelPersonalidade: nivelPersonalidade || 'Equilibrado',
        tonConversa: tonConversa || 'Profissional',
        palavrasEvitar: palavrasEvitar || '',
        limiteTentativas: limiteTentativas || 3,
        tempoEspera: tempoEspera || 60,
        notificarHumano: notificarHumano === undefined ? true : notificarHumano,
        dataCriacao,
        idUser: req.user.id
      });
      
      res.status(201).json({ 
        message: 'Automação criada com sucesso',
        id
      });
    } catch (error) {
      console.error('Erro ao criar automação:', error);
      res.status(500).json({ message: 'Erro ao criar automação', error: error.message });
    }
  });
  
  // Atualizar uma automação
  router.put('/:id', validateToken, async (req, res) => {
    try {
      const {
        nome,
        descricao,
        campanhaId,
        status,
        detalheProduto,
        missaoIA,
        dadosColeta,
        estrategiaConvencimento,
        acaoConvencido,
        acaoNaoConvencido,
        respostasRapidas,
        nivelPersonalidade,
        tonConversa,
        palavrasEvitar,
        limiteTentativas,
        tempoEspera,
        notificarHumano
      } = req.body;
      
      // Validações básicas
      if (!nome || !campanhaId) {
        return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
      }
      
      // Verificar se a automação existe e pertence ao usuário
      const checkQuery = `
        SELECT id, campanhaId FROM Automacoes
        WHERE id = @id AND idUser = @idUser
      `;
      
      const checkResult = await db.query(checkQuery, {
        id: req.params.id,
        idUser: req.user.id
      });
      
      if (!checkResult.recordset || checkResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Automação não encontrada' });
      }
      
      const currentCampanhaId = checkResult.recordset[0].campanhaId;
      
      // Se estiver alterando a campanha, verificar se a nova campanha já possui automação
      if (campanhaId !== currentCampanhaId) {
        const checkCampanhaQuery = `
          SELECT id FROM Automacoes
          WHERE campanhaId = @campanhaId AND idUser = @idUser AND id != @id
        `;
        
        const checkCampanhaResult = await db.query(checkCampanhaQuery, {
          campanhaId,
          idUser: req.user.id,
          id: req.params.id
        });
        
        if (checkCampanhaResult.recordset && checkCampanhaResult.recordset.length > 0) {
          return res.status(400).json({ 
            message: 'A campanha selecionada já possui uma automação vinculada. Cada campanha pode ter apenas uma automação.'
          });
        }
      }
      
      const updateQuery = `
        UPDATE Automacoes
        SET
          nome = @nome,
          descricao = @descricao,
          campanhaId = @campanhaId,
          status = @status,
          detalheProduto = @detalheProduto,
          missaoIA = @missaoIA,
          dadosColeta = @dadosColeta,
          estrategiaConvencimento = @estrategiaConvencimento,
          acaoConvencido = @acaoConvencido,
          acaoNaoConvencido = @acaoNaoConvencido,
          respostasRapidas = @respostasRapidas,
          nivelPersonalidade = @nivelPersonalidade,
          tonConversa = @tonConversa,
          palavrasEvitar = @palavrasEvitar,
          limiteTentativas = @limiteTentativas,
          tempoEspera = @tempoEspera,
          notificarHumano = @notificarHumano,
          dataAtualizacao = @dataAtualizacao
        WHERE id = @id AND idUser = @idUser
      `;
      
      await db.query(updateQuery, {
        id: req.params.id,
        nome,
        descricao: descricao || '',
        campanhaId,
        status: status || 'Ativo',
        detalheProduto: detalheProduto || '',
        missaoIA: missaoIA || '',
        dadosColeta: JSON.stringify(dadosColeta || []),
        estrategiaConvencimento: estrategiaConvencimento || '',
        acaoConvencido: acaoConvencido || '',
        acaoNaoConvencido: acaoNaoConvencido || '',
        respostasRapidas: JSON.stringify(respostasRapidas || []),
        nivelPersonalidade: nivelPersonalidade || 'Equilibrado',
        tonConversa: tonConversa || 'Profissional',
        palavrasEvitar: palavrasEvitar || '',
        limiteTentativas: limiteTentativas || 3,
        tempoEspera: tempoEspera || 60,
        notificarHumano: notificarHumano === undefined ? true : notificarHumano,
        dataAtualizacao: new Date().toISOString(),
        idUser: req.user.id
      });
      
      res.json({ message: 'Automação atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar automação:', error);
      res.status(500).json({ message: 'Erro ao atualizar automação', error: error.message });
    }
  });
  
  // Atualizar status de uma automação
  router.patch('/:id/status', validateToken, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status || !['Ativo', 'Inativo'].includes(status)) {
        return res.status(400).json({ message: 'Status inválido' });
      }
      
      // Verificar se a automação existe e pertence ao usuário
      const checkQuery = `
        SELECT id FROM Automacoes
        WHERE id = @id AND idUser = @idUser
      `;
      
      const checkResult = await db.query(checkQuery, {
        id: req.params.id,
        idUser: req.user.id
      });
      
      if (!checkResult.recordset || checkResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Automação não encontrada' });
      }
      
      const updateQuery = `
        UPDATE Automacoes
        SET status = @status
        WHERE id = @id AND idUser = @idUser
      `;
      
      await db.query(updateQuery, {
        id: req.params.id,
        status,
        idUser: req.user.id
      });
      
      res.json({ message: 'Status da automação atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar status da automação:', error);
      res.status(500).json({ message: 'Erro ao atualizar status da automação', error: error.message });
    }
  });
  
  // Excluir uma automação
  router.delete('/:id', validateToken, async (req, res) => {
    try {
      // Verificar se a automação existe e pertence ao usuário
      const checkQuery = `
        SELECT id FROM Automacoes
        WHERE id = @id AND idUser = @idUser
      `;
      
      const checkResult = await db.query(checkQuery, {
        id: req.params.id,
        idUser: req.user.id
      });
      
      if (!checkResult.recordset || checkResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Automação não encontrada' });
      }
      
      const deleteQuery = `
        DELETE FROM Automacoes
        WHERE id = @id AND idUser = @idUser
      `;
      
      await db.query(deleteQuery, {
        id: req.params.id,
        idUser: req.user.id
      });
      
      res.json({ message: 'Automação excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir automação:', error);
      res.status(500).json({ message: 'Erro ao excluir automação', error: error.message });
    }
  });
  
  module.exports = router;