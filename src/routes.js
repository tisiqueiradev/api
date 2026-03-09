const OrderController = require("./controllers/OrderController");
const { login } = require("./auth");

module.exports = [
  {
    endpoint: '/order/list',
    method: 'GET',
    handler: OrderController.listOrders,
  },
  {
    endpoint: '/order/:id',
    method: 'GET',
    handler: OrderController.getOrderListById,

  },
  {
    endpoint: '/order',
    method: 'POST',
    handler: OrderController.createOrder,
  },
  {
    endpoint: '/order/:id',
    method: 'PUT',
    handler: OrderController.updateOrder,

  }, {
    endpoint: '/order/:id',
    method: 'DELETE',
    handler: OrderController.deleteOrder,

  },
  {
    endpoint: '/login',
    method: 'POST',
    handler: async (req, res) => {
      try {
        const { username, password } = req.body;

        const token = await login(username, password);

        if (!token) {
          return res.send(401, { error: 'Invalid credentials' });
        }

        return res.send(200, { token });
      } catch (err) {
        return res.send(500, { error: 'Internal server error' });
      }
    }
  }
]
