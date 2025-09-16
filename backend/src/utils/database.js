const { Pool } = require('pg');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = null;
        this.config = {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            max: 20, // Máximo de conexões no pool
            idleTimeoutMillis: 30000, // 30 segundos
            connectionTimeoutMillis: 2000, // 2 segundos
        };
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.pool = new Pool(this.config);
                
                // Testar conexão
                this.pool.query('SELECT NOW()', (err, result) => {
                    if (err) {
                        console.error('Erro ao conectar ao banco:', err.message);
                        reject(err);
                    } else {
                        console.log('✅ Conectado ao NeonDB (PostgreSQL)');
                        console.log('🕐 Timestamp do servidor:', result.rows[0].now);
                        resolve();
                    }
                });
            } catch (error) {
                console.error('Erro na configuração do banco:', error.message);
                reject(error);
            }
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.pool) {
                this.pool.end((err) => {
                    if (err) {
                        console.error('Erro ao fechar banco:', err.message);
                        reject(err);
                    } else {
                        console.log('✅ Conexão fechada');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // Executar query com parâmetros (INSERT, UPDATE, DELETE)
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, params, (err, result) => {
                if (err) {
                    console.error('Erro na query:', err.message);
                    reject(err);
                } else {
                    resolve({ 
                        id: result.rows[0]?.id || result.insertId, 
                        changes: result.rowCount 
                    });
                }
            });
        });
    }

    // Buscar um registro
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, params, (err, result) => {
                if (err) {
                    console.error('Erro na query:', err.message);
                    reject(err);
                } else {
                    resolve(result.rows[0] || null);
                }
            });
        });
    }

    // Buscar múltiplos registros
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, params, (err, result) => {
                if (err) {
                    console.error('Erro na query:', err.message);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    }

    // Executar transação
    async transaction(queries) {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            for (const query of queries) {
                await client.query(query.sql, query.params);
            }
            
            await client.query('COMMIT');
            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

// Instância singleton
const database = new Database();

module.exports = database;
