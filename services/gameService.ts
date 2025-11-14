import { multipleChoiceQuestions } from '../data';
import { Room, Player, UserAnswers, MultipleChoiceQuestion } from '../types';

/**
 * NOTE TO USER:
 * This is a MOCK game service that simulates a real-time backend like Firebase.
 * It uses localStorage and timeouts to mimic real-time updates.
 * For a real production app, you would replace the functions here with
 * calls to your backend service (e.g., Firebase Realtime Database, Firestore, or your own server with WebSockets).
 */

// A simple in-memory store for rooms, simulating a database.
const rooms: { [id: string]: Room } = {};
let localPlayerId: string | null = null;
let roomUpdateInterval: any = null;

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

const generatePlayerId = () => {
    return 'player_' + Math.random().toString(36).substring(2, 9);
}

const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- Public API ---

export const createRoom = async (playerName: string, numQuestions: number): Promise<{ room: Room, player: Player }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const roomId = generateRoomCode();
            const hostId = generatePlayerId();
            localPlayerId = hostId;
            
            const shuffledQuestions = shuffleArray(multipleChoiceQuestions).slice(0, numQuestions);

            const host: Player = { id: hostId, name: playerName, isHost: true };
            const room: Room = {
                id: roomId,
                status: 'waiting',
                players: { [hostId]: host },
                questions: shuffledQuestions,
                answers: {}
            };
            rooms[roomId] = room;
            resolve({ room, player: host });
        }, 500);
    });
};

export const joinRoom = async (roomId: string, playerName: string): Promise<{ room: Room, player: Player }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!rooms[roomId]) {
                return reject(new Error("Room not found."));
            }
            if (Object.values(rooms[roomId].players).length >= 8) {
                return reject(new Error("Room is full."));
            }
            const playerId = generatePlayerId();
            localPlayerId = playerId;
            const player: Player = { id: playerId, name: playerName, isHost: false };
            rooms[roomId].players[playerId] = player;
            resolve({ room: rooms[roomId], player });
        }, 500);
    });
};

export const startGame = async (roomId: string): Promise<void> => {
     return new Promise(resolve => {
        if(rooms[roomId]) {
            rooms[roomId].status = 'in_progress';
        }
        resolve();
     });
};


export const submitAnswers = async (roomId: string, playerId: string, answers: UserAnswers): Promise<void> => {
    return new Promise(resolve => {
        if(rooms[roomId]) {
            rooms[roomId].answers[playerId] = answers;
            
            // Check if all players have submitted
            const allPlayersSubmitted = Object.keys(rooms[roomId].players).every(
                pId => rooms[roomId].answers[pId]
            );

            if(allPlayersSubmitted) {
                // Calculate scores
                Object.keys(rooms[roomId].players).forEach(pId => {
                    const playerAnswers = rooms[roomId].answers[pId];
                    const score = rooms[roomId].questions.reduce((acc, q) => {
                        return playerAnswers[q.id] === q.correctAnswer ? acc + 1 : acc;
                    }, 0);
                    rooms[roomId].players[pId].score = score;
                });
                rooms[roomId].status = 'finished';
            }
        }
        resolve();
    });
};

export const leaveRoom = (roomId: string): void => {
    if(roomUpdateInterval) {
        clearInterval(roomUpdateInterval);
        roomUpdateInterval = null;
    }
    if(rooms[roomId] && localPlayerId) {
        delete rooms[roomId].players[localPlayerId];
        if(Object.keys(rooms[roomId].players).length === 0) {
            delete rooms[roomId];
        }
    }
    localPlayerId = null;
};

export const listenToRoom = (roomId: string, callback: (room: Room | null) => void): (() => void) => {
    if(roomUpdateInterval) clearInterval(roomUpdateInterval);

    roomUpdateInterval = setInterval(() => {
        const room = rooms[roomId] || null;
        callback(room);
    }, 1000); // Poll for updates every second

    // Return an unsubscribe function
    return () => {
        if(roomUpdateInterval) clearInterval(roomUpdateInterval);
        leaveRoom(roomId);
    };
};
