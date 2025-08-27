// database.js
const sql = require('mssql');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do pool de conexão
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433'),
  pool: {
    max: 10,                   // Número máximo de conexões no pool
    min: 0,                    // Número mínimo de conexões no pool
    idleTimeoutMillis: 30000   // Tempo máximo (em ms) que uma conexão pode ficar inativa antes de ser encerrada
  },
  options: {
    encrypt: true,             // Para conexões Azure
    trustServerCertificate: true, // Mudar para false em produção
    enableArithAbort: true,
    connectionTimeout: 15000,  // Timeout de conexão em ms
    requestTimeout: 15000      // Timeout de requisição em ms
  }
};

// Classe para gerenciar o pool de conexões
class Database {
  constructor() {
    this.pool = null;
    this.connected = false;
  }

  // Inicializa o pool de conexões
  async connect() {
    try {
      if (this.pool) {
        return this.pool;
      }

      this.pool = await sql.connect(sqlConfig);
      this.connected = true;
      console.log('Conexão com SQL Server estabelecida com sucesso');
      
      // Evento para quando a conexão for fechada
      this.pool.on('error', err => {
        console.error('Erro no pool de conexão SQL:', err);
        this.connected = false;
        this.pool = null;
      });
      
      return this.pool;
    } catch (err) {
      console.error('Erro ao conectar ao SQL Server:', err);
      throw err;
    }
  }

  // Executa uma query com parâmetros
  async query(text, params = []) {
    try {
      if (!this.connected) {
        await this.connect();
      }
      
      const request = this.pool.request();
      
      // Adiciona parâmetros à requisição
      if (params && Array.isArray(params)) {
        params.forEach((param, index) => {
          request.input(`param${index}`, param);
        });
      } else if (params && typeof params === 'object') {
        Object.keys(params).forEach(key => {
          request.input(key, params[key]);
        });
      }
      
      const result = await request.query(text);
      return result;
    } catch (err) {
      console.error('Erro ao executar query:', err);
      throw err;
    }
  }

  // Executa uma stored procedure
  async executeProcedure(procedureName, params = {}) {
    try {
      if (!this.connected) {
        await this.connect();
      }
      
      const request = this.pool.request();
      
      // Adiciona parâmetros à requisição
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(key => {
          request.input(key, params[key]);
        });
      }
      
      const result = await request.execute(procedureName);
      return result;
    } catch (err) {
      console.error(`Erro ao executar procedure ${procedureName}:`, err);
      throw err;
    }
  }

  // Fecha o pool de conexões
  async close() {
    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
        this.connected = false;
        console.log('Conexão com SQL Server fechada com sucesso');
      }
    } catch (err) {
      console.error('Erro ao fechar conexão com SQL Server:', err);
      throw err;
    }
  }
}

// Exporta uma instância única da classe Database (Singleton)
module.exports = new Database();