const WebSocket = require('ws');
const logger = require('../utils/logger');

class QuizWebSocket {
  constructor(server) {
    this.wss = new WebSocket.Server({ server, path: '/api/quiz/ws' });
    this.clients = new Map(); // userId -> WebSocket
    this.quizRooms = new Map(); // quizId -> Set(userId)
    
    this._setupEventHandlers();
    logger.info('WebSocket server started');
  }

  _setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      // Extract user ID from query params (in a real app, use proper auth)
      const userId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('userId');
      const quizId = new URL(req.url, `http://${req.headers.host}`).searchParams.get('quizId');

      if (!userId || !quizId) {
        ws.close(1008, 'Missing userId or quizId');
        return;
      }

      // Store the connection
      this.clients.set(userId, ws);
      this._joinQuizRoom(userId, quizId);

      // Set up message handler
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this._handleMessage(userId, quizId, data);
        } catch (error) {
          logger.error('Error processing WebSocket message:', error);
        }
      });

      // Set up close handler
      ws.on('close', () => {
        this._leaveQuizRoom(userId, quizId);
        this.clients.delete(userId);
      });

      // Send welcome message
      this._sendToUser(userId, {
        type: 'connection_established',
        message: 'Successfully connected to quiz updates',
        timestamp: new Date().toISOString()
      });
    });
  }

  _joinQuizRoom(userId, quizId) {
    if (!this.quizRooms.has(quizId)) {
      this.quizRooms.set(quizId, new Set());
    }
    this.quizRooms.get(quizId).add(userId);
    logger.info(`User ${userId} joined quiz ${quizId}`);
  }

  _leaveQuizRoom(userId, quizId) {
    if (this.quizRooms.has(quizId)) {
      this.quizRooms.get(quizId).delete(userId);
      if (this.quizRooms.get(quizId).size === 0) {
        this.quizRooms.delete(quizId);
      }
      logger.info(`User ${userId} left quiz ${quizId}`);
    }
  }

  _handleMessage(userId, quizId, data) {
    switch (data.type) {
      case 'answer':
        this._broadcastToQuiz(quizId, userId, {
          type: 'answer_submitted',
          userId,
          questionId: data.questionId,
          timestamp: new Date().toISOString()
        });
        break;
      
      case 'typing':
        this._broadcastToQuiz(quizId, userId, {
          type: 'user_typing',
          userId,
          isTyping: data.isTyping,
          timestamp: new Date().toISOString()
        });
        break;
      
      default:
        logger.warn(`Unknown message type: ${data.type}`);
    }
  }

  _sendToUser(userId, message) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  _broadcastToQuiz(quizId, excludeUserId, message) {
    if (!this.quizRooms.has(quizId)) return;

    const usersInRoom = this.quizRooms.get(quizId);
    usersInRoom.forEach(userId => {
      if (userId !== excludeUserId) {
        this._sendToUser(userId, message);
      }
    });
  }

  // Public API
  notifyQuizStarted(quizId, quizData) {
    this._broadcastToQuiz(quizId, null, {
      type: 'quiz_started',
      quizId,
      quizData,
      timestamp: new Date().toISOString()
    });
  }

  notifyQuestionChanged(quizId, questionData) {
    this._broadcastToQuiz(quizId, null, {
      type: 'question_changed',
      quizId,
      question: questionData,
      timestamp: new Date().toISOString()
    });
  }

  notifyQuizEnded(quizId, results) {
    this._broadcastToQuiz(quizId, null, {
      type: 'quiz_ended',
      quizId,
      results,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = QuizWebSocket;
