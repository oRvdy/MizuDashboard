const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const express = require('express');
const next = require('next');

const port = process.env.PORT || 8080;
const dev = false;

async function start() {
    console.log('📦 Iniciando setup...');
    
    try {
        const nextDir = path.join(__dirname, '.next');
        if (fs.existsSync(nextDir)) {
            console.log('🧹 Limpando build anterior...');
            fs.rmSync(nextDir, { recursive: true, force: true });
        }

        if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
            console.log('📥 Instalando dependências...');
            execSync('npm install', { stdio: 'inherit' });
        }

        console.log('🏗️ Gerando build...');
        execSync('npm run build', { stdio: 'inherit' });

        console.log('🚀 Iniciando servidor...');
        execSync('node server.js', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

async function startServer() {
    const app = next({ dev });
    await app.prepare();
    
    const expressApp = express();
    expressApp.use((req, res) => {
        return app.getRequestHandler()(req, res);
    });
    
    expressApp.listen(port, '0.0.0.0', () => {
        console.log(`> Ready on http://0.0.0.0:${port}`);
    });
}

start();
