#!/bin/bash

echo "========================================"
echo "   SISTEMA DE CONTROLE FINANCEIRO"
echo "========================================"
echo

echo "[1/3] Instalando dependências do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependências"
    exit 1
fi

echo
echo "[2/3] Inicializando banco de dados..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao inicializar banco de dados"
    exit 1
fi

echo
echo "[3/3] Iniciando servidor..."
echo
echo "✅ Sistema iniciado com sucesso!"
echo "🌐 Frontend: http://localhost:3000"
echo "📊 API: http://localhost:3000/api"
echo "💾 Banco: SQLite (backend/database/finance.db)"
echo
echo "Pressione Ctrl+C para parar o servidor"
echo

npm start
