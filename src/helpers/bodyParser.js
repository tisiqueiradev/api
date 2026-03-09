function bodyParser(request, response, callback) {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk;
  });

  request.on('end', () => {
    try {
      body = JSON.parse(body);
      request.body = body;
      callback();
    } catch {
      response.send(400, { error: 'Invalid JSON' });
    }
  });
}

module.exports = bodyParser;