import jwt from 'express-jwt';
import express from 'express';
const router = express.Router();
import secret from '../secret';
import { all, get, run, del } from '../libs/db';
import APIError from '../libs/error';

/* GET users listing. */
router.get('/products', async function (req, res, next) {
  const { limit, offset, isNew = false } = req.query;

  console.log(offset);
  const query = `
    SELECT 
      rowid AS id, color, imageUrl, productName, price, productMaterial, product, productDescription, createdAt, updatedAt 
    FROM product ${
      offset ? (isNew ? 'WHERE id > $offset' : 'WHERE id < $offset') : ''
    } ORDER BY id DESC LIMIT $limit
  `;
  console.log(query);
  try {
    const response = await all(query, {
      $limit: limit,
      $offset: offset,
    });
    res.json({
      success: true,
      rows: response,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/product/:id', async function (req, res, next) {
  const { id } = req.params;

  try {
    const response = await get(
      'SELECT rowid AS id, color, imageUrl, productName, price, productMaterial, product, productDescription, createdAt, updatedAt FROM product WHERE rowid = $id',
      {
        $id: id,
      },
    );
    res.json({
      success: true,
      row: response,
    });
  } catch (e) {
    next(e);
  }
});

router.post(
  '/order',
  jwt({ secret, algorithms: ['HS256'] }),
  async function (req, res, next) {
    const { id: userId } = req.user;
    const { productId, zipCode, address, quantity, price } = req.body;

    try {
      const lastID = await run(
        'INSERT INTO product_order(userId, productId, zipCode, address, quantity, totalPrice, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          productId,
          zipCode,
          address,
          quantity,
          price * quantity,
          new Date().toUTCString(),
        ],
      );

      const row = await get(
        'SELECT rowid as id, * FROM product_order WHERE rowid = ?',
        [lastID],
      );

      res.json({
        success: true,
        row,
      });
    } catch (e) {
      next(e);
    }
  },
);

router.delete(
  '/order/:id',
  jwt({ secret, algorithms: ['HS256'] }),
  async function (req, res, next) {
    const { id } = req.params;

    try {
      await del('DELETE FROM product_order WHERE rowid = ?', [id]);

      res.json({
        success: true,
      });
    } catch (e) {
      next(e);
    }
  },
);

router.get(
  '/order/:id',
  jwt({ secret, algorithms: ['HS256'] }),
  async function (req, res, next) {
    const { id } = req.params;

    try {
      const row = await get(
        'SELECT rowid as id, * FROM product_order WHERE rowid = ?',
        [id],
      );

      if (!row) {
        throw new APIError(0, 'no item', 200);
      }

      res.json({
        success: true,
        row,
      });
    } catch (e) {
      next(e);
    }
  },
);

export default router;
