function mapperToDb(body) {
  return {
    orderId: body.numeroPedido,
    value: body.valorTotal,
    creationDate: new Date(body.dataCriacao).toISOString(),
    items: body.items.map(item => ({
      productId: Number(item.idItem),
      quantity: item.quantidadeItem,
      price: item.valorItem
    }))
  };
}
function mapperToApi(order) {
  return {
    numeroPedido: order.orderid || order.orderId,
    valorTotal: order.value,
    dataCriacao: order.creationdate || order.creationDate,

    items: (order.items || []).map(item => ({
      idItem: item.productid || item.productId,
      quantidadeItem: item.quantity,
      valorItem: item.price
    }))
  };
}
module.exports = {
  mapperToDb,
  mapperToApi
}