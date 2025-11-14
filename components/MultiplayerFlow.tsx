import React, { useState, useEffect, useCallback } from 'react';
import { Player, Room, UserAnswers, MultipleChoiceQuestion } from '../types';
import * as gameService from '../services/gameService';
import { CheckCircleIcon, UsersIcon } from './Icons';
import MultipleChoiceQuiz from './MultipleChoiceQuiz';
import Results from './Results';

type GameState = 'lobby' | 'waiting' | 'in_progress' | 'results';

const Lobby: React.FC<{ onJoin: (name: string, roomCode: string) => void; onCreate: (name: string, numQuestions: number) => void; }> = ({ onJoin, onCreate }) => {
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [numQuestions, setNumQuestions] = useState(10);
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!playerName.trim()) {
            setError('Please enter your name.');
            return;
        }
        onCreate(playerName.trim(), numQuestions);
    };

    const handleJoin = () => {
        if (!playerName.trim() || !roomCode.trim()) {
            setError('Please enter your name and a room code.');
            return;
        }
        onJoin(playerName.trim(), roomCode.trim().toUpperCase());
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="text-center mb-8">
                <UsersIcon className="mx-auto h-12 w-12 text-sky-600" />
                <h2 className="text-2xl font-bold text-sky-800 mt-2">Play with Friends</h2>
                <p className="text-slate-600">Create a room or join one to start.</p>
            </div>
            
            <div className="max-w-md mx-auto">
                 <div className="mb-4">
                    <label htmlFor="playerName" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                    <input 
                        id="playerName"
                        type="text" 
                        value={playerName} 
                        onChange={e => {
                            setError('');
                            setPlayerName(e.target.value)
                        }} 
                        placeholder="Enter your name"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                    />
                </div>
                
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                    {/* Join Room */}
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Join a Room</h3>
                         <input 
                            type="text" 
                            value={roomCode} 
                            onChange={e => setRoomCode(e.target.value)} 
                            placeholder="Enter Room Code"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 mb-3"
                        />
                        <button onClick={handleJoin} className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-all">Join</button>
                    </div>
                    {/* Create Room */}
                     <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Create a Room</h3>
                        <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-slate-300 mb-3 bg-white">
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                            <option value={25}>25 Questions</option>
                        </select>
                        <button onClick={handleCreate} className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all">Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WaitingRoom: React.FC<{ room: Room; player: Player; onStart: () => void; }> = ({ room, player, onStart }) => {
    // FIX: Cast Object.values result to Player[] to ensure proper type inference for players.
    const players = Object.values(room.players) as Player[];
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 text-center">
            <h2 className="text-2xl font-bold text-sky-800">Waiting Room</h2>
            <p className="text-slate-600 mb-6">Share this code with your friends!</p>
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-4 max-w-xs mx-auto mb-6">
                <p className="text-4xl font-mono tracking-widest text-slate-800">{room.id}</p>
            </div>

            <h3 className="font-bold text-lg text-slate-800 mb-4">Players ({players.length})</h3>
            <div className="space-y-3 max-w-xs mx-auto">
                {players.map(p => (
                    <div key={p.id} className="flex items-center justify-center bg-slate-50 p-3 rounded-lg border">
                        <CheckCircleIcon className="text-green-500 mr-3" />
                        <p className="font-semibold text-slate-700">{p.name} {p.isHost && '(Host)'}</p>
                    </div>
                ))}
            </div>

            {player.isHost && (
                <button 
                    onClick={onStart} 
                    className="mt-8 px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                    disabled={players.length < 1} // Can be changed to 2 for a real game
                >
                    Start Quiz
                </button>
            )}
            {!player.isHost && <p className="mt-8 text-slate-500 animate-pulse">Waiting for the host to start the game...</p>}
        </div>
    );
};


const MultiplayerFlow: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('lobby');
    const [room, setRoom] = useState<Room | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRoomUpdate = useCallback((updatedRoom: Room | null) => {
        if(updatedRoom) {
            setRoom(updatedRoom);
            if(updatedRoom.status === 'in_progress') setGameState('in_progress');
            if(updatedRoom.status === 'finished') setGameState('results');
        } else {
            // Room was deleted or doesn't exist
            setError("The room you were in no longer exists.");
            setGameState('lobby');
            setRoom(null);
            setPlayer(null);
        }
    }, []);

    const handleCreateRoom = async (playerName: string, numQuestions: number) => {
        try {
            setError(null);
            const { room, player } = await gameService.createRoom(playerName, numQuestions);
            setRoom(room);
            setPlayer(player);
            gameService.listenToRoom(room.id, handleRoomUpdate);
            setGameState('waiting');
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleJoinRoom = async (playerName: string, roomCode: string) => {
        try {
            setError(null);
            const { room, player } = await gameService.joinRoom(roomCode, playerName);
            if(room.status !== 'waiting') {
                setError("This game has already started or is finished.");
                return;
            }
            setRoom(room);
            setPlayer(player);
            gameService.listenToRoom(room.id, handleRoomUpdate);
            setGameState('waiting');
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleStartGame = async () => {
        if(room?.id) {
            await gameService.startGame(room.id);
        }
    };

    const handleSubmitAnswers = async (answers: UserAnswers) => {
        if(room?.id && player?.id) {
            await gameService.submitAnswers(room.id, player.id, answers);
        }
    }
    
    const handleReset = () => {
        if(room?.id) gameService.leaveRoom(room.id);
        setGameState('lobby');
        setRoom(null);
        setPlayer(null);
        setError(null);
    }
    
    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
                <button onClick={handleReset} className="mt-2 text-sm font-semibold underline">Back to Lobby</button>
            </div>
        )
    }

    if (gameState === 'lobby') {
        return <Lobby onCreate={handleCreateRoom} onJoin={handleJoinRoom} />;
    }

    if (gameState === 'waiting' && room && player) {
        return <WaitingRoom room={room} player={player} onStart={handleStartGame} />;
    }

    if (gameState === 'in_progress' && room && player) {
        return (
             <MultipleChoiceQuiz
                isMultiplayer={true}
                questions={room.questions}
                onMultiplayerSubmit={handleSubmitAnswers}
            />
        )
    }
    
     if (gameState === 'results' && room) {
        // FIX: Cast Object.values result to Player[] to ensure proper type inference for sorting and mapping.
        const players = (Object.values(room.players) as Player[]).sort((a,b) => (b.score ?? 0) - (a.score ?? 0));
        const finalScore = room.players[player?.id || '']?.score ?? 0;

        return <Results score={finalScore} total={room.questions.length} onReset={handleReset}>
            <div>
                 <h3 className="text-xl font-bold text-sky-800 mb-4">Leaderboard</h3>
                 <div className="space-y-2">
                    {players.map((p, index) => (
                         <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                            <div className="flex items-center">
                                <span className={`font-bold text-lg w-8 text-center ${index === 0 ? 'text-amber-500' : 'text-slate-500'}`}>{index + 1}</span>
                                <p className="font-semibold text-slate-800">{p.name}</p>
                            </div>
                            <p className="font-bold text-sky-700">{p.score} / {room.questions.length}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </Results>;
    }


    return <div>Loading...</div>;
};

export default MultiplayerFlow;