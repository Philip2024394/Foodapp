import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Page } from '../../types';
import { PaperclipIcon, SendIcon } from '../common/Icon';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useAuthContext } from '../../hooks/useAuthContext';

const INDOSTREET_MESSAGES = [
    { text: "Hot Deal! Many food vendors on Jl. Malioboro are offering a 10% discount. Check them out on the {link}.", page: Page.FOOD, linkText: "Food page" },
    { text: "Tip: Long-press on a vendor's image to get a full-screen preview before you order!", page: null, linkText: null },
    { text: "New vendors added! Check out the latest street food options on our {link}.", page: Page.FOOD_DIRECTORY, linkText: "Food Directory" },
];

const Chat: React.FC = () => {
    const { navigateTo, showNotification } = useNavigationContext();
    const { language, user } = useAuthContext();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const systemMessagesAdded = useRef(false);
    const [showOriginal, setShowOriginal] = useState<Record<number, boolean>>({});

    const [isCancelled, setIsCancelled] = useState(currentBooking?.status === 'CANCELLED');
    const [cancellationReason, setCancellationReason] = useState<string | null>(null);
    
    const currentPageRef = useRef(Page.CHAT);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // Initialize Gemini API
    useEffect(() => {
        if (process.env.API_KEY && process.env.API_KEY !== 'YOUR_API_KEY') {
            ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } else {
            console.warn("Gemini API key is not set. Translation feature will be disabled.");
        }
    }, []);

    // Real-time messaging - TODO: Implement with Appwrite Realtime
    useEffect(() => {
        if (!currentBooking || isMockMode) {
            return;
        }

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('booking_id', currentBooking.id)
                .order('timestamp', { ascending: true });

            if (error) {
                console.error("Error fetching chat messages:", error);
            } else {
                const newMessages: ChatMessage[] = data.map((msg: any) => ({
                    ...msg,
                    id: msg.id, // Supabase ID is a number
                    timestamp: msg.timestamp || new Date(msg.created_at).toISOString(),
                }));
                setMessages(newMessages);

                if (newMessages.length > 0 && currentPageRef.current !== Page.CHAT) {
                    const latestMessage = newMessages[newMessages.length - 1];
                    if (latestMessage.sender === 'driver') {
                        showNotification({
                            message: latestMessage.content,
                            sender: currentBooking.driver.driver,
                            avatar: currentBooking.driver.driverImage
                        });
                    }
                }
            }
        };
        fetchMessages();

        // Set up real-time subscription
        const subscription = supabase.channel(`chat_messages:${currentBooking.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `booking_id=eq.${currentBooking.id}`
            }, (payload) => {
                const newMessage: ChatMessage = {
                    ...(payload.new as Omit<ChatMessage, 'id' | 'timestamp'>),
                    id: payload.new.id,
                    timestamp: payload.new.timestamp || new Date(payload.new.created_at).toISOString(),
                };

                setMessages(prevMessages => [...prevMessages, newMessage]);
                if (currentPageRef.current !== Page.CHAT && newMessage.sender === 'driver') {
                    showNotification({
                        message: newMessage.content,
                        sender: currentBooking.driver.driver,
                        avatar: currentBooking.driver.driverImage
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [currentBooking, isMockMode, setMessages, showNotification]);

    useEffect(() => {
        if (currentBooking?.status === 'CANCELLED') {
            setIsCancelled(true);
            if (!cancellationReason) {
                setCancellationReason('This booking has been cancelled.');
            }
        } else {
            setIsCancelled(false);
            setCancellationReason(null);
        }
    }, [currentBooking]);


    // Effect for handling translations of incoming driver messages
    useEffect(() => {
        // Only run translation if user's language is English and AI is available
        if (isMockMode || !ai.current || language !== 'en') return;
        
        const untranslatedMessages = messages.filter(
            m => m.sender === 'driver' && m.type === 'text' && !m.translation && m.isTranslating === undefined
        );

        if (untranslatedMessages.length > 0) {
            setMessages(currentMessages => currentMessages.map(msg => 
                untranslatedMessages.some(um => um.id === msg.id) ? { ...msg, isTranslating: true } : msg
            ));

            const translateMessage = async (message: ChatMessage) => {
                try {
                    if (!ai.current) throw new Error("AI not initialized");
                    const response = await ai.current.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: `Translate the following from Indonesian to English: "${message.content}"`,
                    });
                    return response.text;
                } catch (error) {
                    console.error("Error translating message:", error);
                    return "Translation failed.";
                }
            };
            
            untranslatedMessages.forEach(async (msgToTranslate) => {
                const translatedText = await translateMessage(msgToTranslate);
                setMessages(currentMessages => currentMessages.map(msg => 
                    msg.id === msgToTranslate.id ? { ...msg, translation: translatedText, isTranslating: false } : msg
                ));
            });
        }
    }, [messages, isMockMode, language, setMessages]);
    
    useEffect(() => {
        if (messages.some(m => m.sender === 'user' && typeof m.id === 'string')) {
            userManuallyMessaged.current = true;
        }

        if (!systemMessagesAdded.current && messages.length > 0) {
            const INDASTREET_THANKS_IDENTIFIER = "Thank you for being part of the IndaStreet community.";
            const alreadyExists = messages.some(m => m.content.includes(INDASTREET_THANKS_IDENTIFIER));

            if (alreadyExists) {
                systemMessagesAdded.current = true;
                return;
            }

            systemMessagesAdded.current = true;

            const userHasSentMessage = messages.some(msg => msg.sender === 'user');
            if (!userHasSentMessage) {
                 const autoMessageContent = "Hi! Thanks for accepting my booking. My name is Alex Chandra. I'm ready and waiting for your arrival. Safe journey!";
                handleSendMessage(autoMessageContent, 'text', true);
            }

            setTimeout(() => {
                const randomInfo = INDOSTREET_MESSAGES[Math.floor(Math.random() * INDOSTREET_MESSAGES.length)];
                
                const indoStreetInfo: ChatMessage = {
                    id: Date.now() + 1,
                    sender: 'system',
                    type: 'text',
                    content: randomInfo.text,
                    timestamp: new Date().toISOString(),
                    systemMeta: { page: randomInfo.page || undefined, linkText: randomInfo.linkText || undefined }
                };
                
                const indoStreetThanks: ChatMessage = {
                    id: Date.now() + 2,
                    sender: 'system',
                    type: 'text',
                    content: "Thank you for being part of the IndaStreet community. Your support empowers local drivers and vendors across Indonesia.",
                    timestamp: new Date().toISOString()
                };
                
                setMessages(prev => [...prev, indoStreetInfo, indoStreetThanks]);
            }, 2000);
        }
    }, [messages, setMessages]);
    
    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (content: string, type: 'text' | 'image', isAuto: boolean = false) => {
        if (content.trim() === '' || !currentBooking) return;

        if (!isAuto && !userManuallyMessaged.current) {
            console.log(`ADMIN LOG: User initiated a manual chat for booking ID ${currentBooking.id}. Recording conversation.`);
            userManuallyMessaged.current = true;
        }
        
        if (type === 'text') setNewMessage('');

        let contentToSend = content;
        if (ai.current && language === 'en' && type === 'text') {
            try {
                const response = await ai.current.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Translate the following to Indonesian: "${content}"`,
                });
                contentToSend = response.text;
            } catch (error) {
                console.error("Error translating user message:", error);
            }
        }
        
        const baseMessage = {
            sender: 'user' as const,
            type: type,
            content: contentToSend,
            booking_id: currentBooking.id,
        };

        const messageToInsert = user
            ? { ...baseMessage, user_id: user.id }
            : { ...baseMessage, demo_write_token_text: DEMO_WRITE_TOKEN };


        if (isMockMode) {
             setMessages(prev => [...prev, { ...messageToInsert, id: Date.now(), timestamp: new Date().toISOString() } as ChatMessage]);
             return;
        }

        try {
            const { error } = await supabase.from('chat_messages').insert(messageToInsert);
            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target?.result as string;
                handleSendMessage(base64Image, 'image');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancelBooking = async () => {
        if (currentBooking && !isCancelled && window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await cancelBooking(currentBooking.id);
                setCancellationReason("You cancelled this booking.");
            } catch (error) {
                alert("Failed to cancel booking.");
            }
        }
    };
    
    const toggleShowOriginal = (id: number) => {
        setShowOriginal(prev => ({...prev, [id]: !prev[id]}));
    };

    return (
        <div className="relative w-full h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] flex items-center justify-center p-0 md:p-4">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1533134486753-c833f0ed4866?q=80&w=2670&auto=format&fit=crop"
                    alt="Chat background texture"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Chat container */}
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col w-full h-full bg-black/50 border border-white/10 rounded-none md:rounded-2xl shadow-xl">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={currentBooking?.driver.driverImage || `https://picsum.photos/seed/driver/100/100`} alt="Driver" className="w-10 h-10 rounded-full mr-3 object-cover cursor-pointer" onClick={() => currentBooking?.driver && selectDriverForProfile(currentBooking.driver)} />
                        <div>
                            <h2 className="font-bold text-lg text-stone-100">{currentBooking?.driver.driver || 'Driver'}</h2>
                            <p className="text-sm text-green-400">Online</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleCancelBooking} disabled={isCancelled} className="text-xs bg-red-800/80 px-2 py-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isCancelled ? 'Cancelled' : 'Cancel Booking'}
                        </button>
                        <button onClick={() => navigateTo(Page.BOOKING_CONFIRMATION)} className="text-stone-300 hover:text-white" aria-label="Close Chat">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {messages.map((msg, index) => {
                        if (msg.sender === 'system') {
                            const parts = msg.content.split('{link}');
                            return (
                                <div key={msg.id || index} className="my-3 text-center animate-fade-in-scale">
                                    <div className="inline-block p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl max-w-sm">
                                        <p className="text-sm font-bold text-orange-400 mb-1">
                                            Inda<span className="animate-float-s">S</span>treet Info
                                        </p>
                                        <p className="text-amber-300 font-semibold">
                                            {msg.systemMeta?.page && msg.systemMeta?.linkText && parts.length > 1 ? (
                                                <>
                                                    {parts[0]}
                                                    <button onClick={() => navigateTo(msg.systemMeta!.page!)} className="text-orange-400 font-semibold hover:underline">
                                                        {msg.systemMeta.linkText}
                                                    </button>
                                                    {parts[1]}
                                                </>
                                            ) : (
                                                msg.content
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div key={msg.id || index} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-2xl p-3 max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-white/10 text-stone-200 rounded-bl-none'}`}>
                                    {msg.type === 'text' ? (
                                        <div className="whitespace-pre-wrap">
                                            {msg.sender === 'driver' && msg.translation ? (
                                                <>
                                                  <p>{showOriginal[msg.id] ? msg.content : msg.translation}</p>
                                                  <button onClick={() => toggleShowOriginal(msg.id)} className="text-xs text-stone-400 hover:underline mt-1">
                                                      {showOriginal[msg.id] ? 'Hide Original' : 'See Original'}
                                                  </button>
                                                </>
                                            ) : msg.isTranslating ? (
                                                <p className="italic text-stone-400">Translating...</p>
                                            ) : (
                                                <p>{msg.content}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <img src={msg.content} alt="Uploaded content" className="rounded-lg max-h-48" />
                                    )}
                                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-orange-100' : 'text-stone-400'} text-right`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {isCancelled && (
                        <div className="text-center my-4 p-4 bg-red-900/60 border border-red-500/50 rounded-xl space-y-2 animate-fade-in-scale">
                            <p className="font-bold text-red-400 text-lg">Booking Cancelled</p>
                            <p className="text-stone-300">{cancellationReason || 'This booking has been cancelled.'}</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center">
                            <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isCancelled}
                        />
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-stone-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isCancelled}>
                            <PaperclipIcon />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(newMessage, 'text')}
                            placeholder={isCancelled ? "Chat disabled" : "Type a message..."}
                            disabled={isCancelled}
                            className="flex-1 px-4 py-2 bg-black/20 text-white border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                        />
                        <button onClick={() => handleSendMessage(newMessage, 'text')} className="ml-3 p-2 text-white bg-orange-600 rounded-full hover:bg-orange-700 disabled:bg-stone-600" disabled={isCancelled}>
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;