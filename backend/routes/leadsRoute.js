const express = require('express');
const router = express.Router();
const db = require('../database');
const { validateToken } = require('../middlewares/AuthMiddleware');
const { v4: uuidv4 } = require('uuid');

const converterParaData = (entrada) => {
  if (!entrada || typeof entrada !== 'string') return null;

  // Limpa e normaliza separadores
  const limpa = entrada.trim().replace(/[.\/]/g, '-');

  const partes = limpa.split('-');

  let ano, mes, dia;

  if (partes.length === 3) {
    if (partes[0].length === 4) {
      // Formato: YYYY-MM-DD
      [ano, mes, dia] = partes;
    } else if (partes[2].length === 4) {
      // Formato: DD-MM-YYYY ou MM-DD-YYYY (vamos assumir DD-MM-YYYY como mais comum no Brasil)
      [dia, mes, ano] = partes;
    } else {
      return null; // Formato não identificado
    }

    // Ajuste para garantir dois dígitos
    mes = mes.padStart(2, '0');
    dia = dia.padStart(2, '0');

    const dataFormatada = `${ano}-${mes}-${dia}`;
    const dataObj = new Date(dataFormatada);

    return isNaN(dataObj.getTime()) ? null : dataObj;
  }

  return null; // Formato inválido
}

const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return null;

  // Tenta substituir separadores comuns por "-"
  const dataLimpa = dataNascimento.replace(/[./]/g, '-').trim();

  // Tenta identificar o formato e reorganizar para YYYY-MM-DD
  let partes = dataLimpa.split('-');

  // Se vier no formato DD-MM-YYYY ou MM-DD-YYYY
  if (partes.length === 3) {
    const [a, b, c] = partes;

    if (a.length === 4) {
      // Já está no formato YYYY-MM-DD
      dataFormatada = `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
    } else if (c.length === 4) {
      // Provavelmente está em DD-MM-YYYY ou MM-DD-YYYY
      dataFormatada = `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
    } else {
      return null; // Formato inválido
    }
  } else {
    return null; // Formato inválido
  }

  const nascimento = new Date(dataFormatada);
  if (isNaN(nascimento)) return null;

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  const mesNasc = nascimento.getMonth();
  const diaNasc = nascimento.getDate();

  if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
    idade--;
  }

  return idade;
}

const normalizarGenero = (genero) => {
  if (!genero || typeof genero !== 'string') return genero;

  const valor = genero.trim().toUpperCase();

  if (valor === 'M') return 'Masculino';
  if (valor === 'F') return 'Feminino';

  // Se já vier como nome ou outro valor, retorna como está
  return genero;
}

const normalizarEstado = (estado) => {
  const estados = {
    AC: "Acre",
    AL: "Alagoas",
    AP: "Amapá",
    AM: "Amazonas",
    BA: "Bahia",
    CE: "Ceará",
    DF: "Distrito Federal",
    ES: "Espírito Santo",
    GO: "Goiás",
    MA: "Maranhão",
    MT: "Mato Grosso",
    MS: "Mato Grosso do Sul",
    MG: "Minas Gerais",
    PA: "Pará",
    PB: "Paraíba",
    PR: "Paraná",
    PE: "Pernambuco",
    PI: "Piauí",
    RJ: "Rio de Janeiro",
    RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul",
    RO: "Rondônia",
    RR: "Roraima",
    SC: "Santa Catarina",
    SP: "São Paulo",
    SE: "Sergipe",
    TO: "Tocantins"
  };

  // Verifica se é uma sigla válida e retorna o nome completo
  if (estado && typeof estado === 'string') {
    const sigla = estado.toUpperCase();
    if (estados[sigla]) {
      return estados[sigla];
    }
  }

  // Se não for uma sigla conhecida, retorna como está
  return estado;
}

// Obter todos os leads
router.get('/all', validateToken, async (req, res) => {
  try {
    const { property_id, search } = req.query;

    const idUser = req.user.id;

    let query = 'SELECT * FROM ImportedLeads WHERE 1=1';
    const params = {};

    if (property_id) {
      query += ' AND nomeGrupo = @property_id';
      params.property_id = property_id;
    }

    if (search) {
      query += ' AND (nome LIKE @search OR email LIKE @search OR celular LIKE @search OR cpf LIKE @search)';
      params.search = `%${search}%`;
    }

    if (idUser) {
      params.idUser = idUser;
    }

    query += ' AND idUser=@idUser ORDER BY dataCadastro DESC';

    const result = await db.query(query, params);

    return res.status(200).json(result?.recordsets[0]);
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    res.status(500).json({ message: 'Erro ao buscar leads', error: error.message });
  }
});

// Obter um lead específico
router.get('/:id', validateToken, async (req, res) => {
  try {

    const idUser = req.user.id;

    const result = await db.query('SELECT * FROM ImportedLeads WHERE id = @id AND idUser = @idUser', { id: req.params.id, idUser: idUser });

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Lead não encontrado' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Erro ao buscar lead:', error);
    res.status(500).json({ message: 'Erro ao buscar lead', error: error.message });
  }
});

// Criar um novo lead
router.post('/save', validateToken, async (req, res) => {
  try {
    const {
      nome,
      email,
      celular,
      cpf,
      nascimento,
      genero,
      idade,
      estado,
      cidade,
      bairro,
      nomeGrupo,
      etapaFunil,
      tags
    } = req.body;

    // Validação básica
    if (!nome || !celular) {
      return res.status(400).json({ message: 'Nome e celular são obrigatórios' });
    }

    const now = new Date();
    const idUser = req.user.id; // Assumindo que o middleware de autenticação adiciona o usuário ao request

    let id = uuidv4();

    const query = `
        INSERT INTO ImportedLeads (
          id, nome, email, celular, cpf, nascimento, genero, idade,
          estado, cidade, bairro, nomeGrupo, etapaFunil, tags, dataCadastro, idUser
        ) VALUES (
          @id, @nome, @email, @celular, @cpf, @nascimento, @genero, @idade,
          @estado, @cidade, @bairro, @nomeGrupo, @etapaFunil, @tags, @dataCadastro, @idUser
        );
        SELECT SCOPE_IDENTITY() AS id;
      `;

    const params = {
      id,
      nome,
      email,
      celular,
      cpf,
      nascimento,
      genero,
      idade: idade || null,
      estado,
      cidade,
      bairro,
      nomeGrupo,
      etapaFunil,
      tags,
      dataCadastro: now,
      idUser: idUser || null
    };

    await db.query(query, params);

    return res.status(201).json(id);
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    res.status(500).json({ message: 'Erro ao criar lead', error: error.message });
  }
});

// Atualizar um lead
router.put('/:id', validateToken, async (req, res) => {
  try {
    const {
      nome,
      email,
      celular,
      cpf,
      nascimento,
      genero,
      idade,
      estado,
      cidade,
      bairro,
      nomeGrupo,
      etapaFunil,
      tags
    } = req.body;

    // Validação básica
    if (!nome || !celular) {
      return res.status(400).json({ message: 'Nome e celular são obrigatórios' });
    }

    // Verificar se o lead existe
    const checkResult = await db.query('SELECT * FROM ImportedLeads WHERE id = @id', { id: req.params.id });

    if (!checkResult || checkResult.length === 0) {
      return res.status(404).json({ message: 'Lead não encontrado' });
    }

    const query = `
        UPDATE ImportedLeads SET
          nome = @nome, 
          email = @email, 
          celular = @celular, 
          cpf = @cpf, 
          nascimento = @nascimento, 
          genero = @genero, 
          idade = @idade,
          estado = @estado, 
          cidade = @cidade, 
          bairro = @bairro, 
          nomeGrupo = @nomeGrupo, 
          etapaFunil = @etapaFunil, 
          tags = @tags
        WHERE id = @id
      `;

    const params = {
      nome,
      email,
      celular,
      cpf,
      nascimento,
      genero,
      idade: idade || null,
      estado,
      cidade,
      bairro,
      nomeGrupo,
      etapaFunil,
      tags,
      id: req.params.id
    };

    await db.query(query, params);

    // Buscar o lead atualizado
    const updatedLead = await db.query('SELECT * FROM ImportedLeads WHERE id = @id', { id: req.params.id });

    res.json(updatedLead[0]);
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    res.status(500).json({ message: 'Erro ao atualizar lead', error: error.message });
  }
});

// Remover um lead
router.delete('/delete/:id', validateToken, async (req, res) => {
  try {
    // Verificar se o lead existe
    const checkResult = await db.query('SELECT * FROM ImportedLeads WHERE id = @id', { id: req.params.id });

    if (!checkResult || checkResult.length === 0) {
      return res.status(404).json({ message: 'Lead não encontrado' });
    }

    await db.query('DELETE FROM ImportedLeads WHERE id = @id', { id: req.params.id });

    res.json({ message: 'Lead removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover lead:', error);
    res.status(500).json({ message: 'Erro ao remover lead', error: error.message });
  }
});

// Importar leads em massa
// Importar leads em massa
router.post('/import', validateToken, async (req, res) => {
  try {
    const { leads, grupoNome } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ message: 'Nenhum lead válido para importação' });
    }

    const validLeads = leads.filter(lead => lead.nome && lead.celular);

    if (validLeads.length === 0) {
      return res.status(400).json({ message: 'Nenhum lead válido para importação' });
    }

    const now = new Date();
    const idUser = req.user.id;

    // Calcular tamanho do lote baseado no número de parâmetros
    // Cada lead tem aproximadamente 16 parâmetros
    // Limite do SQL Server: 2100 parâmetros
    // Margem de segurança: usar 2000 parâmetros como limite
    const parametersPerLead = 16;
    const maxParameters = 2000;
    const batchSize = Math.floor(maxParameters / parametersPerLead);

    let totalImported = 0;
    const errors = [];

    // Processar leads em lotes
    for (let i = 0; i < validLeads.length; i += batchSize) {
      const batch = validLeads.slice(i, i + batchSize);

      try {
        await processBatch(batch, grupoNome, now, idUser);
        totalImported += batch.length;

        // Log de progresso para lotes grandes
        if (validLeads.length > 100) {
          console.log(`Processado lote ${Math.floor(i / batchSize) + 1}: ${batch.length} leads`);
        }
      } catch (batchError) {
        console.error(`Erro no lote ${Math.floor(i / batchSize) + 1}:`, batchError);
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          leads: batch.length,
          error: batchError.message
        });
      }
    }

    // Função para processar um lote de leads
    async function processBatch(batch, grupoNome, now, idUser) {
      const queryBase = `
        INSERT INTO ImportedLeads (
          Id, Nome, Email, Celular, Cpf, Nascimento, Genero, Idade,
          Estado, Cidade, Bairro, NomeGrupo, EtapaFunil, Tags, DataCadastro, IdUser
        ) VALUES
      `;

      const valuesClause = [];
      const params = {};

      batch.forEach((lead, index) => {
        const id = uuidv4();
        const paramPrefix = `lead${index}`;

        valuesClause.push(`(
          @${paramPrefix}_id, @${paramPrefix}_nome, @${paramPrefix}_email, @${paramPrefix}_celular,
          @${paramPrefix}_cpf, @${paramPrefix}_nascimento, @${paramPrefix}_genero, @${paramPrefix}_idade,
          @${paramPrefix}_estado, @${paramPrefix}_cidade, @${paramPrefix}_bairro,
          @${paramPrefix}_nomeGrupo, @${paramPrefix}_etapaFunil, @${paramPrefix}_tags,
          @${paramPrefix}_dataCadastro, @${paramPrefix}_idUser
        )`);

        // Parâmetros do lead
        params[`${paramPrefix}_id`] = id;
        params[`${paramPrefix}_nome`] = lead.nome || '';
        params[`${paramPrefix}_email`] = lead.email || '';
        params[`${paramPrefix}_celular`] = ("" + lead.celular) || '';
        params[`${paramPrefix}_cpf`] = lead.cpf || '';
        params[`${paramPrefix}_nascimento`] = lead.nascimento ? new Date(converterParaData(lead.nascimento)) : null;
        params[`${paramPrefix}_genero`] = normalizarGenero(lead.genero) || '';
        params[`${paramPrefix}_idade`] = lead.idade ? parseInt(lead.idade, 10) : lead.nascimento ? calcularIdade(lead.nascimento) : null;
        params[`${paramPrefix}_estado`] = normalizarEstado(lead.estado) || '';
        params[`${paramPrefix}_cidade`] = lead.cidade || '';
        params[`${paramPrefix}_bairro`] = lead.bairro || '';
        params[`${paramPrefix}_nomeGrupo`] = grupoNome || '';
        params[`${paramPrefix}_etapaFunil`] = lead.etapaFunil || '';
        params[`${paramPrefix}_tags`] = lead.tags || '';
        params[`${paramPrefix}_dataCadastro`] = now;
        params[`${paramPrefix}_idUser`] = idUser;
      });

      const fullQuery = queryBase + valuesClause.join(", ");
      await db.query(fullQuery, params);
    }

    // Resposta com resultado da importação
    if (errors.length === 0) {
      res.status(201).json({
        message: 'Leads importados com sucesso',
        imported: totalImported,
        total: validLeads.length,
        batches: Math.ceil(validLeads.length / batchSize)
      });
    } else {
      res.status(207).json({
        message: 'Importação parcialmente concluída',
        imported: totalImported,
        total: validLeads.length,
        batches: Math.ceil(validLeads.length / batchSize),
        errors: errors
      });
    }

  } catch (error) {
    console.error('Erro ao importar leads:', error);
    res.status(500).json({
      message: 'Erro ao importar leads',
      error: error.message
    });
  }
});
module.exports = router;