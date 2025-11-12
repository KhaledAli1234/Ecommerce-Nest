import { Socket } from 'Socket.io';

export const getSocketAuth = (client: Socket): string => {
  const authorization =
    client.handshake.auth.authorization ??
    client.handshake.headers.authorization;
  if (!authorization) {
    client.emit('exception', 'missing authorization');
  }
  return authorization;
};
