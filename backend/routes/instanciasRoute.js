const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateToken } = require('../middlewares/AuthMiddleware');
const { v4: uuidv4 } = require('uuid');

async function createInstanceAutomation(name) {
  try {
    // Criar o objeto para enviar na requisição
    const requestData = { instanceName: name };

    // Fazer a requisição POST
    const response = await fetch(`${process.env.API_WPP}/api/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    // Verificar se a resposta foi bem-sucedida
    if (response.ok) {
      // Ler e parsear a resposta JSON
      const apiResponse = await response.json();

      // Retornar os dados mapeados
      return {
        nameAutomacao: apiResponse.nameAutomacao || apiResponse.NameAutomacao,
        qrCodeBase64Automacao: apiResponse.qrCodeBase64 || apiResponse.QrCodeBase64,
        statusAutomacao: apiResponse.statusAutomacao || apiResponse.StatusAutomacao
      };
    } else {
      throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
    }

  } catch (error) {
    // Tratamento de erros específicos
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Erro de rede ou conexão
      throw new Error(`Erro ao criar automação: Erro de conexão - ${error.message}`);
    } else if (error.name === 'SyntaxError') {
      // Erro ao parsear JSON
      throw new Error(`Erro ao criar automação: Erro ao processar resposta da API - ${error.message}`);
    } else if (error.message.includes('Erro na requisição:')) {
      // Re-throw erros HTTP que já foram tratados
      throw error;
    } else {
      // Outros erros
      throw new Error(`Erro ao criar automação: ${error.message}`);
    }
  }
}

// Obter todas as instâncias
router.get('/all', validateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM WhatsAppInstances 
      WHERE idUser = @idUser
      ORDER BY Name
    `;

    const result = await db.query(query, { idUser: req.user.id });

    return res.status(200).json(result.recordsets[0]);
  } catch (error) {
    console.error('Erro ao buscar instâncias:', error);
    res.status(500).json({ message: 'Erro ao buscar instâncias', error: error.message });
  }
});

// Obter uma instância específica
router.get('/:id', validateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM WhatsAppInstances 
      WHERE id = @id AND idUser = @idUser
    `;

    const result = await db.query(query, {
      id: req.params.id,
      idUser: req.user.id
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Instância não encontrada' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Erro ao buscar instância:', error);
    res.status(500).json({ message: 'Erro ao buscar instância', error: error.message });
  }
});

router.post('/save-instance', validateToken, async (req, res) => {
  try {
    const {
      name
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos (nome)' });
    }

    const idUser = 'FFB0CEC8-AAEC-4D4C-9186-9BC318B44C66';

    const resultAutomatioNCreate = await createInstanceAutomation(name);

    let _id = uuidv4();

    const query = `
      INSERT INTO WhatsAppInstances (
        Id, Name, Status, QrCodeBase64, CreatedAt, LastActivity, 
        HasSavedSession, ProfilePath, LastConnected, IdUser,
        NameAutomacao, QrCodeBase64Automacao, StatusAutomacao
      )
      VALUES (
        @id, @name, @status, @qrCodeBase64, @createdAt, @lastActivity, 
        @hasSavedSession, @profilePath, @lastConnected, @idUser,
        @nameAutomacao, @qrCodeBase64Automacao, @statusAutomacao
      )
    `;

    const queryParams = {
      id: _id,
      name,
      status: 'Aguardando escaneamento do QR Code',
      qrCodeBase64: null,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      hasSavedSession: false,
      profilePath: `profiles/${_id}`,
      lastConnected: null,
      idUser: idUser,
      nameAutomacao: resultAutomatioNCreate?.nameAutomacao,
      qrCodeBase64Automacao: resultAutomatioNCreate?.qrCodeBase64Automacao,
      statusAutomacao: resultAutomatioNCreate?.statusAutomacao
    };

    console.log(queryParams);

    await db.query(query, queryParams);

    res.status(200).json({
      message: 'Instância WhatsApp criada com sucesso',
      _id,
      action: 'created'
    });

  } catch (error) {
    console.error('Erro ao salvar instância WhatsApp:', error);
    res.status(500).json({
      message: 'Erro ao salvar instância WhatsApp',
      error: error.message
    });
  }
});

module.exports = router;