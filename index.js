function allocate(salesOrders, purchaseOrders) {
    // Ordenar las órdenes de venta por fecha de creación
    salesOrders.sort((a, b) => new Date(a.created) - new Date(b.created));
    // Ordenar las órdenes de compra por fecha de recepción
    purchaseOrders.sort((a, b) => new Date(a.receiving) - new Date(b.receiving));
    
    let inventory = 0;
    let purchaseIndex = 0;
    let result = [];

    // Procesar cada orden de venta
    for (let salesOrder of salesOrders) {
        // Acumular inventario hasta que podamos cumplir la orden de venta actual
        while (inventory < salesOrder.quantity && purchaseIndex < purchaseOrders.length) {
            inventory += purchaseOrders[purchaseIndex].quantity;
            purchaseIndex++;
        }
        
        if (inventory >= salesOrder.quantity) {
            // Si tenemos suficiente inventario, determinamos la fecha de cumplimiento
            let fulfillmentDate = purchaseOrders[purchaseIndex - 1].receiving;
            result.push({
                id: salesOrder.id,
                expected: fulfillmentDate
            });
            // Reducimos el inventario por la cantidad de la orden de venta cumplida
            inventory -= salesOrder.quantity;
        } else {
            // Este caso maneja escenarios donde no tenemos suficiente suministro,
            result.push({
                id: salesOrder.id,
                expected: 'Not enough supply'
            });
        }
    }
    return result;
}

// Ejemplo de uso
const salesOrders = [
    { 'id': 'S1', 'created': '2020-01-02', 'quantity': 6 },
    { 'id': 'S2', 'created': '2020-11-05', 'quantity': 2 },
    { 'id': 'S3', 'created': '2019-12-04', 'quantity': 3 },
    { 'id': 'S4', 'created': '2020-01-20', 'quantity': 2 },
    { 'id': 'S5', 'created': '2019-12-15', 'quantity': 9 }
];

const purchaseOrders = [
    { 'id': 'P1', 'receiving': '2020-01-04', 'quantity': 4 },
    { 'id': 'P2', 'receiving': '2020-01-05', 'quantity': 3 },
    { 'id': 'P3', 'receiving': '2020-02-01', 'quantity': 5 },
    { 'id': 'P4', 'receiving': '2020-03-05', 'quantity': 1 },
    { 'id': 'P5', 'receiving': '2020-02-20', 'quantity': 7 }
];

console.log(allocate(salesOrders, purchaseOrders));
