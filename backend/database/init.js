const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuração do banco PostgreSQL
const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Conectar ao banco
const pool = new Pool(config);

// Ler e executar o script SQL
const initSQL = fs.readFileSync(path.join(__dirname, 'init-postgres.sql'), 'utf8');

async function initializeDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('✅ Conectado ao NeonDB (PostgreSQL)');
        
        // Executar script de inicialização
        await client.query(initSQL);
        
        console.log('✅ Banco de dados inicializado com sucesso!');
        console.log('🌐 Banco: NeonDB (PostgreSQL)');
        console.log('🎉 Schema e dados demo criados!');
        
    } catch (err) {
        console.error('Erro ao inicializar banco:', err.message);
    } finally {
        client.release();
        await pool.end();
        console.log('✅ Conexão fechada');
    }
}

// Executar inicialização
initializeDatabase().catch(console.error);
