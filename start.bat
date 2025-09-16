@echo off
echo ========================================
echo   SISTEMA DE CONTROLE FINANCEIRO
echo ========================================
echo.

echo [1/3] Instalando dependencias do backend...
cd backend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [2/3] Inicializando banco de dados...
call npm run init-db
if errorlevel 1 (
    echo ERRO: Falha ao inicializar banco de dados
    pause
    exit /b 1
)

echo.
echo [3/3] Iniciando servidor...
echo.
echo ✅ Sistema iniciado com sucesso!
echo 🌐 Frontend: http://localhost:3000
echo 📊 API: http://localhost:3000/api
echo 💾 Banco: SQLite (backend/database/finance.db)
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm start
