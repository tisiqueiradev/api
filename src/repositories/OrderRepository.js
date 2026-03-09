/**
 * OrderRepository.js
 * Camada de acesso ao banco de dados para pedidos e seus itens
 * Contém funções CRUD (Create, Read, Update, Delete)
 * Todas as funções usam PostgreSQL via módulo db
 */


// Importa módulo de conexão com o banco PostgreSQL
const db = require('../database/index');

module.exports = {

  /**
   * Busca todos os pedidos com seus itens
   * @param {string} order - 'asc' ou 'desc' para ordenação pelo orderid
   * @returns {Array} Lista de pedidos, cada um com array de items
   */

  async findAll(order) {

    //tratamos o order (opcional)
    const direction = order === 'desc' ? 'DESC' : 'ASC';

    // Busca todos os pedidos com seus itens
    const rows = await db.query(`
    SELECT
      o.orderid,
      o.value,
      o.creationdate,
      i.productid,
      i.quantity,
      i.price
    FROM orders o
    LEFT JOIN items i
      ON i.orderid = o.orderid
    ORDER BY o.orderid ${direction}
  `);

    // Agrupa resultados do JOIN por pedido e monta lista de items para cada pedido
    const orders = {};

    rows.forEach(row => {

      if (!orders[row.orderid]) {
        orders[row.orderid] = {
          orderid: row.orderid,
          value: row.value,
          creationdate: row.creationdate,
          items: []
        };
      }

      if (row.productid) {
        orders[row.orderid].items.push({
          productid: row.productid,
          quantity: row.quantity,
          price: row.price
        });
      }

    });

    return Object.values(orders);
  },

  /**
  * Busca um pedido específico pelo orderId
  * @param {string} orderId - ID do pedido
  * @returns {Object|null} Pedido com array de items ou null se não existir
  */
  async findById(orderId) {

    const order = await db.query(
      `SELECT * FROM orders WHERE orderid = $1`,
      [orderId]
    );

    const items = await db.query(
      `SELECT productid, quantity, price
       FROM items
       WHERE orderid = $1`,
      [orderId]
    );

    if (!order.length) {
      return null;
    }

    return {
      ...order[0],
      items
    };
  },

  /**
  * Cria um novo pedido e seus itens em transação
  * @param {Object} order - Pedido com itens
  * @returns {Object} Pedido criado
  * @throws Erro em caso de falha (rollback)
  */
  async create(order) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');// Inicia transação

      await client.query(
        `INSERT INTO orders (orderid, value, creationdate)
         VALUES ($1, $2, $3)`,
        [order.orderId, order.value, order.creationDate]
      );

      for (const item of order.items) {
        await client.query(
          `INSERT INTO items (orderid, productid, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [
            order.orderId,
            item.productId,
            item.quantity,
            item.price
          ]
        );
      }

      await client.query('COMMIT');// Confirma transação

      return {
        ...order
      };
    } catch (error) {
      await client.query('ROLLBACK');// Desfaz alterações em caso de erro
      throw error;
    } finally {
      client.release();// Libera client para pool
    }
  },

  /**
  * Atualiza um pedido e seus itens em transação
  * @param {Object} order - Pedido completo para atualizar
  * @returns {Object|null} Pedido atualizado ou null se não encontrado
  */
  async update(order) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Atualiza dados do pedido
      const updatedOrder = await client.query(
        `UPDATE orders
         SET value = $1, creationdate = $2
         WHERE orderid = $3
         RETURNING *`,
        [order.value, order.creationDate, order.orderId]
      );

      if (!updatedOrder.rows.length) {
        await client.query('ROLLBACK');
        return null;
      }

      // Remove todos os itens antigos
      await client.query(
        `DELETE FROM items
         WHERE orderid = $1`,
        [order.orderId]
      );

      // Insere itens novos
      for (const item of order.items) {
        await client.query(
          `INSERT INTO items (orderid, productid, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [
            order.orderId,
            item.productId,
            item.quantity,
            item.price
          ]
        );
      }

      await client.query('COMMIT');// Confirma transação

      // Retorna pedido atualizado com itens mapeados
      return {
        ...updatedOrder.rows[0],
        items: order.items.map((item) => ({
          productid: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Deleta um pedido e todos os seus itens
   * @param {string} orderId - ID do pedido a deletar
   */
  async delete(orderId) {

    // Primeiro deleta itens relacionados
    await db.query(
      `DELETE FROM items WHERE orderid = $1`,
      [orderId]
    );

    // Depois deleta o pedido
    await db.query(
      `DELETE FROM orders WHERE orderid = $1`,
      [orderId]
    );
  }

};
