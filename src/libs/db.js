import { encPassword } from './auth';
import faker from 'faker';

const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database(':memory:');
const db = new sqlite3.Database('db.sqlite3');

async function initUser(numOfUser) {
  await run(
    'CREATE TABLE user (name TEXT, email TEXT, password TEXT, avatar TEXT, lastestLoginAt DATE, createdAt DATE, updatedAt DATE)',
  );
  const stmt = db.prepare(
    'INSERT INTO user(name, email, password, avatar, lastestLoginAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );

  stmt.run(
    Object.values({
      name: '홍길동',
      email: 'hgd_test@gmail.com',
      password: encPassword('1111'),
      avatar: faker.internet.avatar(),
      lastestLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }),
  );

  for (let i = 0; i < numOfUser - 1; i++) {
    const name = faker.name.findName(); // Rowan Nikolaus
    const email = faker.internet.email();
    const avatar = faker.internet.avatar();
    const password = encPassword('1111');
    const lastestLoginAt = null;
    const createdAt = new Date().toISOString();
    const updatedAt = null;

    stmt.run([
      name,
      email,
      password,
      avatar,
      lastestLoginAt,
      createdAt,
      updatedAt,
    ]);
  }

  stmt.finalize();

  // db.each(
  //   'SELECT rowid AS id, name, email, password, avatar, lastestLoginAt, createdAt, updatedAt FROM user',
  //   function (err, row) {
  //     console.log(row);
  //   },
  // );
}

async function initProduct(numOfProduct) {
  await run(
    'CREATE TABLE product(color TEXT, imageUrl Text, productName TEXT, price INTEGER, productMaterial TEXT, product TEXT, productDescription TEXT, createdAt DATE, updatedAt DATE)',
  );
  const stmt = db.prepare(
    'INSERT INTO product(color, imageUrl, productName, price, productMaterial, product, productDescription, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  for (let i = 0; i < numOfProduct; i++) {
    const color = faker.commerce.color();
    const imageUrl = faker.image.imageUrl();
    const productName = faker.commerce.productName();
    const price = faker.commerce.price() * 1000;
    const productMaterial = faker.commerce.productMaterial();
    const product = faker.commerce.product();
    const productDescription = faker.commerce.productDescription();
    const createdAt = new Date().toISOString();
    const updatedAt = null;

    stmt.run([
      color,
      imageUrl,
      productName,
      price,
      productMaterial,
      product,
      productDescription,
      createdAt,
      updatedAt,
    ]);
  }

  stmt.finalize();

  // db.each(
  //   'SELECT rowid AS id, color, imageUrl, productName, price, productMaterial, product, productDescription, createdAt, updatedAt FROM product',
  //   function (err, row) {
  //     console.log(row);
  //   },
  // );
}

async function initOrder() {
  await run(
    'CREATE TABLE product_order(userId INTEGER, productId INTEGER, zipCode TEXT, address TEXT, quantity INTEGER, totalPrice INTEGER, createdAt DATE, updatedAt DATE)',
  );

  const stmt = db.prepare(
    'INSERT INTO product_order(userId, productId, zipCode, address, quantity, totalPrice, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  for (let i = 1; i < 10; i++) {
    const response = await get('SELECT price FROM product WHERE rowid = $id', {
      $id: i,
    });

    const userId = 1;
    const productId = i;
    const zipCode = faker.address.zipCode();
    const address = faker.address.streetAddress();
    const quantity = i;
    const totalPrice = response.price * quantity;
    const createdAt = new Date().toISOString();
    const updatedAt = null;

    stmt.run([
      userId,
      productId,
      zipCode,
      address,
      quantity,
      totalPrice,
      createdAt,
      updatedAt,
    ]);
  }

  stmt.finalize();

  db.each(
    'SELECT userId, productId, zipCode, address, quantity, totalPrice, createdAt, updatedAt FROM product_order',
    function (err, row) {
      console.log(row);
    },
  );
}

export function init() {
  db.serialize(async function () {
    try {
      await initUser(100);
      await initProduct(10000);
      await initOrder();
    } catch (e) {}
  });

  // db.close();
}

export function get(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

export function all(sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, row) {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

export function run(sql, params = undefined) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, async function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(this.lastID);
    });
  });
}

export function del(sql, params = undefined) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, async function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}
