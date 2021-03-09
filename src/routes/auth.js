import jwt from 'express-jwt';
import express from 'express';
import { encPassword, sign } from '../libs/auth';
import secret from '../secret';
import { all, get } from '../libs/db';
const router = express.Router();

router.post('/login', async function (req, res, next) {
  const { email, password } = req.body;

  const encrypted = encPassword(password);

  const response = await get(
    'SELECT rowid AS id, name, email, password, avatar, lastestLoginAt, createdAt, updatedAt FROM user WHERE email = $email AND password = $password',
    {
      $email: 'hgd_test@gmail.com',
      $password: encrypted,
    },
  );

  if (!response) {
    res.json({
      success: false,
    });
    return;
  }

  const { id, name, email: userEmail } = response;

  const token = sign({ id, name, email: userEmail });

  res.json({
    success: true,
    token,
  });
});

router.post('/logout', function (req, res, next) {
  res.send('respond with a resource');
});

router.get(
  '/me',
  jwt({ secret, algorithms: ['HS256'] }),
  async function (req, res, next) {
    if (!req.user.id) {
      return res.sendStatus(401);
    }

    const response = await get(
      'SELECT rowid AS id, name, email, password, avatar, lastestLoginAt, createdAt, updatedAt FROM user WHERE id = $id',
      {
        $id: req.user.id,
      },
    );

    res.json(response);
  },
);

export default router;
