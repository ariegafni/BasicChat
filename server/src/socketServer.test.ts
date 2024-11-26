import { Server } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';
import { AddressInfo } from 'net';
import { initializeSocketServer } from './socketServer'; // adjust the import path


describe('Socket.io Server', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: any;
  let httpServer: any;
  let heartbeatInterval: NodeJS.Timeout;
  let connection: any;

  beforeAll((done) => {
    httpServer = createServer();
    io = initializeSocketServer(httpServer);
    connection = httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
    heartbeatInterval = setInterval(() => {
      io.emit('heartbeat', { time: new Date() });
    }, 1000);
  });

  afterAll((done) => {
    console.log('Cleaning up...');
    clearInterval(heartbeatInterval);
    clientSocket.close();
    io.close();
    connection.close(() => {
      httpServer.close(() => {
        console.log('Cleanup done, exiting...');
        done();
        
      });
    });
  });

  test('should join and leave a room', (done) => {
    const room = 'test-room';
    
    const joinRoom = () => new Promise<void>((resolve) => {
      clientSocket.emit('join', room);
      setTimeout(() => {
        console.log('After join:', serverSocket.rooms);
        expect(serverSocket.rooms.has(room)).toBeTruthy();
        resolve();
      }, 100);
    });

    const leaveRoom = () => new Promise<void>((resolve) => {
      clientSocket.emit('leave', room);
      setTimeout(() => {
        console.log('After leave:', serverSocket.rooms);
        expect(serverSocket.rooms.has(room)).toBeFalsy();
        expect(serverSocket.rooms.size).toBe(1); // Only contains the socket ID
        expect(serverSocket.rooms.has(serverSocket.id)).toBeTruthy(); // Contains the socket ID
        resolve();
      }, 100);
    });

    joinRoom()
      .then(() => leaveRoom())
      .then(() => done())
      .catch((error) => done(error));
  }, 10000); // Increase timeout to 10 seconds

  test('should broadcast message to a room', (done) => {
    const room = 'test-room';
    const message = 'Hello, room!';

    clientSocket.emit('join', room);

    clientSocket.on('room-message', (msg: string) => {
      expect(msg).toBe(message);
      done();
    });

    setTimeout(() => {
      clientSocket.emit('message-to-room', room, message);
    }, 50);
  });

  test('should broadcast to all except sender', (done) => {
    const message = 'Broadcast message';
    const port = (httpServer.address() as AddressInfo).port;
    const secondClientSocket = Client(`http://localhost:${port}`);

    secondClientSocket.on('connect', () => {
      secondClientSocket.on('broadcast-message', (msg: string) => {
        expect(msg).toBe(message);
        secondClientSocket.close();
        done();
      });

      clientSocket.emit('broadcast', message);
    });
  });

  test('should acknowledge requests', (done) => {
    clientSocket.emit('request', { data: 'test' }, (response: any) => {
      expect(response).toEqual({ status: 'OK' });
      done();
    });
  });

  test('should receive volatile events (heartbeat)', (done) => {
    clientSocket.on('heartbeat', (data: any) => {
      expect(data).toHaveProperty('time');
      done();
    });
  });
});



