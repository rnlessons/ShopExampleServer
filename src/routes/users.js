import jwt from 'express-jwt';
import express from 'express';
const router = express.Router();
import secret from '../secret';
import { all } from '../libs/db';

/* GET users listing. */
router.get(
  '/',
  jwt({ secret, algorithms: ['HS256'] }),
  async function (req, res, next) {
    const { limit, offset } = req.query;

    const response = await all(
      'SELECT rowid AS id, name, email, password, avatar, lastestLoginAt, createdAt, updatedAt FROM user ORDER BY id DESC LIMIT $limit OFFSET $offset',
      {
        $limit: limit,
        $offset: offset,
      },
    );
    res.json({
      success: true,
      rows: response,
    });
  },
);

export default router;
