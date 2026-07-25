export const getShopSchema = () => [
    `CREATE TABLE IF NOT EXISTS shops (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS categories (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      shop_id int(11) NOT NULL,
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY shop_id (shop_id),
      CONSTRAINT fk_category_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS products (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      sku varchar(100) DEFAULT NULL,
      description text DEFAULT NULL,
      category_id int(11) DEFAULT NULL,
      shop_id int(11) NOT NULL,
      price decimal(10,2) NOT NULL DEFAULT 0.00,
      cost_price decimal(10,2) NOT NULL DEFAULT 0.00,
      stock int(11) NOT NULL DEFAULT 0,
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY fk_product_category (category_id),
      KEY shop_id (shop_id),
      CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT fk_product_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS customers (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      contact varchar(50) DEFAULT NULL,
      address text DEFAULT NULL,
      shop_id int(11) NOT NULL,
      balance decimal(10,2) NOT NULL DEFAULT 0.00,
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY shop_id (shop_id),
      CONSTRAINT fk_customer_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS suppliers (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      contact varchar(50) DEFAULT NULL,
      address text DEFAULT NULL,
      shop_id int(11) NOT NULL,
      balance decimal(10,2) NOT NULL DEFAULT 0.00,
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY shop_id (shop_id),
      CONSTRAINT fk_supplier_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS users (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      email varchar(255) NOT NULL,
      password varchar(255) NOT NULL,
      shop_id int(11) NOT NULL,
      role enum('admin','user') NOT NULL DEFAULT 'user',
      reset_token varchar(255) DEFAULT NULL,
      reset_token_expiry datetime DEFAULT NULL,
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY email_shop (email, shop_id),
      KEY shop_id (shop_id),
      CONSTRAINT fk_user_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS sales (
      id int(11) NOT NULL AUTO_INCREMENT,
      ref_no varchar(100) NOT NULL,
      customer_id int(11) DEFAULT NULL,
      shop_id int(11) NOT NULL,
      actual_amount decimal(10,2) NOT NULL,
      total_amount decimal(10,2) NOT NULL,
      amount_tendered decimal(10,2) NOT NULL,
      amount_change decimal(10,2) NOT NULL,
      paymode tinyint(1) NOT NULL COMMENT '0=pending, 1=cash, 2=credit',
      status tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=Pending, 1=Paid, 2=Partial, 3=Unpaid',
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY shop_id (shop_id),
      KEY customer_id (customer_id),
      CONSTRAINT sales_ibfk_2 FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE,
      CONSTRAINT sales_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS sales_items (
      id int(11) NOT NULL AUTO_INCREMENT,
      sale_id int(11) NOT NULL,
      product_id int(11) NOT NULL,
      quantity int(11) NOT NULL,
      price decimal(10,2) NOT NULL,
      cost_price decimal(10,2) NOT NULL,
      PRIMARY KEY (id),
      KEY sale_id (sale_id),
      KEY product_id (product_id),
      CONSTRAINT sales_items_ibfk_1 FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT sales_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS receiving (
      id int(11) NOT NULL AUTO_INCREMENT,
      ref_no varchar(100) NOT NULL,
      supplier_id int(11) NOT NULL,
      shop_id int(11) NOT NULL,
      total_amount decimal(10,2) NOT NULL,
      status tinyint(1) NOT NULL DEFAULT 3 COMMENT '1=Paid, 2=Partial, 3=Unpaid',
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY shop_id (shop_id),
      KEY supplier_id (supplier_id),
      CONSTRAINT receiving_ibfk_2 FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE,
      CONSTRAINT receiving_ibfk_1 FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS receiving_items (
      id int(11) NOT NULL AUTO_INCREMENT,
      receiving_id int(11) NOT NULL,
      product_id int(11) NOT NULL,
      quantity int(11) NOT NULL,
      cost_price decimal(10,2) NOT NULL,
      PRIMARY KEY (id),
      KEY receiving_id (receiving_id),
      CONSTRAINT receiving_items_ibfk_1 FOREIGN KEY (receiving_id) REFERENCES receiving (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS customer_payments (
      id int(11) NOT NULL AUTO_INCREMENT,
      customer_id int(11) NOT NULL,
      shop_id int(11) NOT NULL,
      amount_paid decimal(10,2) NOT NULL,
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY customer_id (customer_id),
      KEY shop_id (shop_id),
      CONSTRAINT customer_payments_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS supplier_payments (
      id int(11) NOT NULL AUTO_INCREMENT,
      supplier_id int(11) NOT NULL,
      shop_id int(11) NOT NULL,
      amount_paid decimal(10,2) NOT NULL,
      date_created datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY supplier_id (supplier_id),
      KEY shop_id (shop_id),
      CONSTRAINT supplier_payments_ibfk_1 FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
];