import express from 'express';
import { encPassword, sign } from '../libs/auth';
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

export default router;
