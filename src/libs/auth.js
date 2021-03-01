import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import secret from '../secret';

export function encPassword(password) {
  const encrypted = crypto
    .createHmac('sha1', secret)
    .update(password)
    .digest('base64');
  return encrypted;
}

export function sign({ id, name, email }) {
  return jwt.sign({ id, name, email }, secret);
}
