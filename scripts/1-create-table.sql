\c api

DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS orders;


CREATE TABLE orders (
    orderId VARCHAR(50) PRIMARY KEY,
    value NUMERIC(10,2) NOT NULL,
    creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    orderId VARCHAR(50),
    productId INTEGER,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,

    PRIMARY KEY (orderId, productId),

    FOREIGN KEY (orderId)
        REFERENCES orders(orderId)
);