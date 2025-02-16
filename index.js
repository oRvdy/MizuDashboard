const { execSync } = require('child_process');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = process.env.PORT || 3000;

console.log('🚀 Iniciando aplicação...');

try {
    console.log('📦 Instalando dependências...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('🏗️ Building...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('✨ Iniciando servidor Next.js...');
    const app = next({ dev: false });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
        createServer((req, res) => {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        }).listen(port, '0.0.0.0', (err) => {
            if (err) throw err;
            console.log(`📡 Servidor rodando na porta ${port}`);
        });
    });
} catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
}
