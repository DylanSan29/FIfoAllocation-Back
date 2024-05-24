const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

async function allocate(salesOrders, purchaseOrders, res) {
    salesOrders.sort((a, b) => new Date(a.created) - new Date(b.created));
    purchaseOrders.sort((a, b) => new Date(a.receiving) - new Date(b.receiving));

    let inventory = 0;
    let purchaseIndex = 0;
    let result = [];

    for (let i = 0; i < salesOrders.length; i++) {
        const salesOrder = salesOrders[i];
        while (inventory < salesOrder.quantity && purchaseIndex < purchaseOrders.length) {
            inventory += purchaseOrders[purchaseIndex].quantity;
            purchaseIndex++;
        }

        if (inventory >= salesOrder.quantity) {
            let fulfillmentDate = purchaseOrders[purchaseIndex - 1].receiving;
            result.push({
                id: salesOrder.id,
                expected: fulfillmentDate
            });
            inventory -= salesOrder.quantity;
        } else {
            result.push({
                id: salesOrder.id,
                expected: 'Not enough supply'
            });
        }

        // Enviar un evento de progreso con un pequeño retraso
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.write(`data: ${JSON.stringify({ progress: (i + 1) / salesOrders.length })}\n\n`);
    }
    return result;
}

// Datos de ejemplo
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

// Ruta para obtener la asignación
app.get('/api/allocate', cors(), async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    const result = await allocate(salesOrders, purchaseOrders, res);
    res.write(`data: ${JSON.stringify({ progress: 1 })}\n\n`); // Evento de progreso completo
    res.write(`data: ${JSON.stringify(result)}\n\n`); // Enviar el resultado final
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
