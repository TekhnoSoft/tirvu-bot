const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const router = express.Router();

// Importação dos middlewares
const { validateOrigin } = require('../middlewares/CorsMiddleware');
const { validateToken } = require('../middlewares/AuthMiddleware');

// Importação da conexão com o banco de dados
const db = require('../database');

// Utilitário para validação de email
const Utils = {
    validateEmail: (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
};

// Rota para validar o token
router.get('/auth', validateToken, async (req, res) => {
    try {
        return res.status(200).json({ message: "Token válido", data: req.user.id });
    } catch (err) {
        return res.status(401).json({ message: "Erro ao recuperar o token", data: null });
    }
});

// Rota para obter dados do usuário
router.get('/get', validateToken, async (req, res) => {
    try {
        const id = req.user.id;
        
        // Consulta SQL para buscar o usuário pelo ID
        const result = await db.query(`
            SELECT Id, Nome, Email, UsuarioAtivo, DataCriacao 
            FROM Users 
            WHERE Id = @userId AND UsuarioAtivo = 1
        `, { userId: id });
        
        const user = result.recordset[0];
        
        if (!user || user === null) {
            return res.status(404).json({ message: "Usuário não encontrado.", data: null });
        }
        
        return res.status(200).json({
            message: "Usuário recuperado com sucesso!", 
            data: {
                id: user.Id,
                email: user.Email,
                name: user.Nome,
                active: user.UsuarioAtivo,
                createdAt: user.DataCriacao
            }
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(400).json({ message: error.message, data: null });
    }
});

// Rota para login
router.post('/login', validateOrigin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validação do email
        if (!Utils.validateEmail(email)) {
            return res.status(401).json({ message: "Email inválido" });
        }

        // Consulta SQL para buscar o usuário pelo email
        const result = await db.query(`
            SELECT Id, Email, Nome, Senha_Hash, UsuarioAtivo 
            FROM Users 
            WHERE Email = @email
        `, { email });
        
        const user = result.recordset[0];

        // Verifica se o usuário existe
        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // Verifica se o usuário está ativo
        if (!user.UsuarioAtivo) {
            return res.status(401).json({ message: "Usuário inativo. Entre em contato com o administrador." });
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(password, user.Senha_Hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: user.Id, email: user.Email }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ 
            message: "Login realizado com sucesso.", 
            token,
            user: {
                id: user.Id,
                name: user.Nome,
                email: user.Email
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});

// Rota para registro de usuário
router.post('/register', async (req, res) => {
    try {
        const { nome, email, password } = req.body;

        // Validação dos campos
        if (!nome || !email || !password) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        if (!Utils.validateEmail(email)) {
            return res.status(400).json({ message: "Email inválido." });
        }

        // Verifica se o email já está em uso
        const checkEmail = await db.query(`
            SELECT COUNT(*) as count FROM Users WHERE Email = @email
        `, { email });

        if (checkEmail.recordset[0].count > 0) {
            return res.status(400).json({ message: "Este email já está em uso." });
        }

        // Gera o hash da senha
        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(password, salt);

        // Insere o novo usuário
        const result = await db.query(`
            INSERT INTO Users (Nome, Email, Senha_Hash, UsuarioAtivo, DataCriacao)
            OUTPUT INSERTED.Id, INSERTED.Nome, INSERTED.Email, INSERTED.UsuarioAtivo, INSERTED.DataCriacao
            VALUES (@nome, @email, @senha_hash, 1, GETDATE())
        `, { 
            nome, 
            email, 
            senha_hash 
        });

        const newUser = result.recordset[0];

        // Gera o token JWT para o novo usuário
        const token = jwt.sign(
            { id: newUser.Id, email: newUser.Email }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            message: "Usuário registrado com sucesso.",
            token,
            user: {
                id: newUser.Id,
                name: newUser.Nome,
                email: newUser.Email
            }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});

// Rota para atualizar dados do usuário
router.put('/update', validateToken, async (req, res) => {
    try {
        const { nome } = req.body;
        const userId = req.user.id;

        if (!nome) {
            return res.status(400).json({ message: "Nome é obrigatório." });
        }

        // Atualiza o nome do usuário
        await db.query(`
            UPDATE Users
            SET Nome = @nome
            WHERE Id = @userId
        `, { nome, userId });

        return res.status(200).json({ message: "Usuário atualizado com sucesso." });
    } catch (error) {
        console.error('Erro na atualização:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});

// Rota para alterar senha
router.put('/change-password', validateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        // Busca o usuário para verificar a senha atual
        const result = await db.query(`
            SELECT Senha_Hash FROM Users WHERE Id = @userId
        `, { userId });

        const user = result.recordset[0];
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Verifica se a senha atual está correta
        const isPasswordValid = await bcrypt.compare(currentPassword, user.Senha_Hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Senha atual incorreta." });
        }

        // Gera o hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(newPassword, salt);

        // Atualiza a senha
        await db.query(`
            UPDATE Users
            SET Senha_Hash = @senha_hash
            WHERE Id = @userId
        `, { senha_hash, userId });

        return res.status(200).json({ message: "Senha alterada com sucesso." });
    } catch (error) {
        console.error('Erro na alteração de senha:', error);
        return res.status(500).json({ message: "Erro no servidor. Tente novamente mais tarde." });
    }
});

module.exports = router;