const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const swaggerUiDist = require('swagger-ui-dist');

const { verifyToken } = require('./auth');
const bodyParser = require('./helpers/bodyParser');
const routes = require('./routes');


// Caminho do swagger.json -- regras da api para o swagger
const swaggerFile = path.join(__dirname, 'swagger.json');

// Caminho da pasta completa do swagger-ui-dist 
const swaggerUiPath = swaggerUiDist.getAbsoluteFSPath();


//criando o server 
const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  let { pathname } = parsedUrl;
  let id;

  //Rotas que vamos proteger com o Login/JWT
  const protectedRoutes = [
    '/order',
    '/order/:id',
    '/order/list'
  ];

  //validação das rotas prtegidas
  if (protectedRoutes.includes(pathname)) {

    //obtendo a autorização
    const authHeader = request.headers['authorization'];


    if (!authHeader) {
      response.writeHead(401, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ error: 'Token missing' }));
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    const user = verifyToken(token);

    if (!user) {
      response.writeHead(401, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ error: 'Token invalid' }));
    }

    request.user = user; // informar ao usuário as rotas disponíveis.
  }

  //debug method e endpoint 
  console.log(`Request method: ${request.method} | Endpoint: ${pathname}`);

  // === Servir Swagger UI (Config)===
  if (pathname === '/docs') {
    response.writeHead(302, { Location: '/docs/' });
    response.end();
    return;
  }

  if (pathname.startsWith('/docs/')) {
    //configuração do initializer do swagger e jwt_token para testar as rotas.
    if (pathname === '/docs/swagger-initializer.js') {
      const initializer = `window.onload = function() {
        const storageKey = 'swagger_jwt_token';

        window.ui = SwaggerUIBundle({
          url: "/swagger.json",
          dom_id: '#swagger-ui',
          deepLinking: true,
          persistAuthorization: true,
          requestInterceptor: (req) => {
            const token = window.localStorage.getItem(storageKey);

            if (token && !req.loadSpec) {
              req.headers = req.headers || {};
              req.headers.Authorization = 'Bearer ' + token;
            }

            return req;
          },
          responseInterceptor: (res) => {
            const isLoginRequest = res.url && res.url.endsWith('/login') && res.status === 200;

            if (isLoginRequest) {
              try {
                const payload = JSON.parse(res.text);

                if (payload.token) {
                  window.localStorage.setItem(storageKey, payload.token);
                }
              } catch (error) {
              }
            }

            return res;
          },
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout"
        });
      };
      `;

      response.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-store'
      });
      response.end(initializer);
      return;
    }

    let filePath = pathname === '/docs/' ? 'index.html' : pathname.replace('/docs/', '');
    filePath = path.join(swaggerUiPath, filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.writeHead(404);
        return response.end('Arquivo não encontrado');
      }

      let contentType = 'text/html';
      if (filePath.endsWith('.js')) contentType = 'application/javascript';
      else if (filePath.endsWith('.css')) contentType = 'text/css';
      else if (filePath.endsWith('.png')) contentType = 'image/png';
      else if (filePath.endsWith('.json')) contentType = 'application/json';

      const output = data.toString();

      response.writeHead(200, { 'Content-Type': contentType });
      response.end(output);
    });
    return;
  }

  // Servir swagger.json
  if (pathname === '/swagger.json') {
    const swaggerData = fs.readFileSync(swaggerFile, 'utf8');
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(swaggerData);
    return;
  }

  // === Processar API normal ===
  const splitEndpoint = pathname.split('/').filter(Boolean);

  //fazer o split do id.
  if (splitEndpoint.length > 1 && splitEndpoint[1] !== 'list') {
    pathname = `/${splitEndpoint[0]}/:id`;
    id = splitEndpoint[1];
  }

  const route = routes.find(
    (routeObj) => routeObj.endpoint === pathname && routeObj.method === request.method
  );

  if (route) {
    //injetar query e params nas request
    request.query = parsedUrl.query;
    request.params = { numeroPedido: id };

    response.send = (statusCode, body) => {
      response.writeHead(statusCode, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(body));
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      //utilizar o helper para evitar duplicidade de código do parser.
      bodyParser(request, response, () => route.handler(request, response));
    } else {
      route.handler(request, response);
    }
  } else {
    response.writeHead(404, { 'Content-Type': 'text/html' });
    response.end(`Cannot ${request.method} ${pathname}`);
  }
});

server.listen(3000, () => console.log('Server rodando em http://localhost:3000'));
