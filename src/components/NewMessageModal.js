// src/components/NewMessageModal.js
'use client';
import { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';

export default function NewMessageModal({ onClose, onSelectUser }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/users/search');
                
                if (!res.ok) {
                    throw new Error('Failed to fetch users');
                }
                
                const data = await res.json();
                setUsers(data.users || []);
                setFilteredUsers(data.users || []);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Could not load users');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, []);
    
    // Filter users based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
            return;
        }
        
        const query = searchQuery.toLowerCase();
        const filtered = users.filter(
            user => user.name.toLowerCase().includes(query) || 
                    user.email.toLowerCase().includes(query)
        );
        
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-md rounded-2xl flex flex-col overflow-hidden border border-purple-500/20">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">New Message</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-800">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
                
                <div className="overflow-y-auto max-h-96">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-400">
                            {error}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                            No users found
                        </div>
                    ) : (
                        <div>
                            {filteredUsers.map((user) => (
                                <button
                                    key={user._id}
                                    className="w-full flex items-center p-4 hover:bg-gray-800 transition-colors text-left"
                                    onClick={() => onSelectUser(user)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="ml-3 overflow-hidden">
                                        <p className="text-white font-medium truncate">{user.name}</p>
                                        <p className="text-gray-400 text-sm truncate">{user.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}