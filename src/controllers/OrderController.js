
//Para isolar a resp do meu controller vou utilizar padrão repository.
const OrderRepository = require('../repositories/OrderRepository');
const { mapperToApi, mapperToDb } = require('../mappers/orderMapper');//fazer o mapper de dados api/bd


//tratamento de erro comuns e genericos
function handleControllerError(error, response) {
  if (error.code === '23505') {
    return response.send(409, { error: 'Order already exists' });
  }

  return response.send(500, { error: 'Internal server error' });
}

// Valida o corpo da requisição para criar/atualizar um pedido
// Retorna false e envia resposta HTTP se algum campo obrigatório estiver ausente
function validateOrderPayload(body, response) {
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    response.send(400, { error: 'Items is required and cannot be empty' });
    return false;
  }

  if (!body.numeroPedido) {
    response.send(400, { error: 'numeroPedido is required' });
    return false;
  }

  if (!body.valorTotal || body.valorTotal <= 0) {
    response.send(400, { error: 'valorTotal must be greater than 0' });
    return false;
  }

  for (const item of body.items) { // ✅ plural
    if (!item.idItem || item.idItem <= 0) {
      response.send(400, { error: 'idItem must be greater than 0' });
      return false; // ✅ interrompe
    }
    if (!item.quantidadeItem || item.quantidadeItem <= 0) {
      response.send(400, { error: 'quantidadeItem must be greater than 0' });
      return false;
    }
    if (!item.valorItem || item.valorItem <= 0) {
      response.send(400, { error: 'valorItem must be greater than 0' });
      return false;
    }
  }

  return true;
}
module.exports = {

  // GET /order/list
  // Retorna todos os pedidos, aplicando mapeamento para o formato da API
  async listOrders(request, response) {
    try {
      const { order } = request.query;

      const orders = await OrderRepository.findAll(order);

      const responseOrders = orders.map(mapperToApi);

      return response.send(200, responseOrders);
    } catch (error) {
      return handleControllerError(error, response);
    }
  },

  // GET /order/:numeroPedido
  // Retorna um pedido específico pelo numeroPedido ou 404 se não encontrado
  async getOrderListById(request, response) {
    try {
      const { numeroPedido } = request.params;

      const order = await OrderRepository.findById(numeroPedido);

      if (!order) {
        return response.send(404, { error: 'Order not found!' });
      }

      return response.send(200, mapperToApi(order));
    } catch (error) {
      return handleControllerError(error, response);
    }
  },

  // POST /order
  // Cria um novo pedido após validação e mapeamento para o banco
  async createOrder(request, response) {
    try {
      const { body } = request;

      if (!validateOrderPayload(body, response)) {
        return true;
      }

      const mapperOrder = mapperToDb(body);

      const order = await OrderRepository.create(mapperOrder);

      return response.send(201, mapperToApi(order));
    } catch (error) {
      return handleControllerError(error, response);
    }
  },

  // PUT /order/:numeroPedido
  // Atualiza um pedido existente, garantindo que o numeroPedido do body(request) e params
  async updateOrder(request, response) {
    try {
      const { numeroPedido } = request.params;
      const { body } = request;

      if (!body.numeroPedido) {
        body.numeroPedido = numeroPedido;
      }

      if (body.numeroPedido !== numeroPedido) {
        return response.send(400, {
          error: 'numeroPedido in body must match the URL parameter'
        });
      }

      if (!validateOrderPayload(body, response)) {
        return;
      }

      const mapperOrder = mapperToDb(body);
      const updatedOrder = await OrderRepository.update(mapperOrder);

      if (!updatedOrder) {
        return response.send(404, { error: 'Order not found!' });
      }

      return response.send(200, mapperToApi(updatedOrder));
    } catch (error) {
      return handleControllerError(error, response);
    }
  },

  // DELETE /order/:numeroPedido
  // Remove um pedido existente. Retorna 204 se sucesso ou 404 se não encontrado
  async deleteOrder(request, response) {
    try {
      const { numeroPedido } = request.params;

      const order = await OrderRepository.findById(numeroPedido);

      if (!order) {
        return response.send(404, { error: 'Order not found!' });
      }

      await OrderRepository.delete(numeroPedido);

      return response.send(204);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
