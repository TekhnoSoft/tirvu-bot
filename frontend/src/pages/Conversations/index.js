import React, { useState, useEffect, useRef } from 'react';
import AuthLayout from '../../components/AuthLayout';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { toast } from 'react-toastify';
import Api from '../../Api';
import './style.css';

const Conversations = () => {
    // Estados
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [contactDetails, setContactDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messageEndRef = useRef(null);
    const selectedConversationRef = useRef(null);

    // Constante para o intervalo de atualização (em milissegundos)
    const UPDATE_INTERVAL = 10000; // 10 segundos

    // Função para buscar conversas
    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const response = await Api.getConversations();

            if (response.success) {
                // Guardar a referência da conversa selecionada
                const currentSelectedId = selectedConversation?.id;
                const currentSelectedPhone = selectedConversation?.phoneNumber;
                
                // Atualizar a lista de conversas
                setConversations(response.data);
                
                // Se havia uma conversa selecionada, encontre-a na nova lista
                if (currentSelectedId || currentSelectedPhone) {
                    const updatedConversation = response.data.find(
                        conv => (currentSelectedId && conv.id === currentSelectedId) || 
                               (currentSelectedPhone && conv.phoneNumber === currentSelectedPhone)
                    );

                    // Se encontrou, atualize a conversa selecionada mantendo a seleção
                    if (updatedConversation) {
                        // Atualizar a referência primeiro
                        selectedConversationRef.current = updatedConversation.id;
                        
                        // Atualizar o estado com a conversa atualizada
                        setSelectedConversation(updatedConversation);
                        
                        // Buscar mensagens atualizadas para a conversa selecionada
                        fetchMessages(updatedConversation.instanceName, updatedConversation.phoneNumber);
                    }
                }
            } else {
                console.error('Erro ao carregar conversas:', response.error);
                toast.error('Não foi possível carregar as conversas');
            }
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
            toast.error('Erro ao carregar conversas');
        } finally {
            setIsLoading(false);
        }
    };

    // Buscar conversas ao carregar a página
    useEffect(() => {
        fetchConversations();

        // Configurar intervalo para atualização automática
        const intervalId = setInterval(() => {
            fetchConversations();
        }, UPDATE_INTERVAL);

        // Limpar intervalo ao desmontar o componente
        return () => clearInterval(intervalId);
    }, []);

    // Filtrar conversas quando o termo de busca muda
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredConversations(conversations);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = conversations.filter(
                conversation =>
                    (conversation.name && conversation.name.toLowerCase().includes(term)) ||
                    (conversation.phoneNumber && conversation.phoneNumber.includes(term))
            );
            setFilteredConversations(filtered);
        }
    }, [conversations, searchTerm]);

    // Buscar mensagens quando uma conversa é selecionada
    useEffect(() => {
        if (selectedConversation && selectedConversationRef.current === selectedConversation.id) {
            fetchMessages(selectedConversation.instanceName, selectedConversation.phoneNumber);
            fetchContactDetails(selectedConversation.phoneNumber);
        }
    }, [selectedConversation]);

    // Atualizar mensagens periodicamente se houver uma conversa selecionada
    useEffect(() => {
        if (!selectedConversation) return;
        
        // Configurar intervalo para atualização automática das mensagens
        const messageIntervalId = setInterval(() => {
            if (selectedConversation && selectedConversationRef.current === selectedConversation.id) {
                fetchMessages(selectedConversation.instanceName, selectedConversation.phoneNumber);
            }
        }, UPDATE_INTERVAL);
        
        // Limpar intervalo ao desmontar o componente ou mudar de conversa
        return () => clearInterval(messageIntervalId);
    }, [selectedConversation]);

    // Rolar para o final da conversa quando novas mensagens são carregadas
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Função para buscar mensagens
    const fetchMessages = async (instanceName, phoneNumber) => {
        try {
            const currentSelectedId = selectedConversationRef.current;
            
            const response = await Api.getConversationMessages(instanceName, phoneNumber);

            if (response.success && selectedConversationRef.current === currentSelectedId) {
                setMessages(response.data);
            } else if (!response.success) {
                console.error('Erro ao carregar mensagens:', response.error);
                toast.error('Não foi possível carregar as mensagens');
            }
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            toast.error('Erro ao carregar mensagens');
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // Função para buscar detalhes do contato
    const fetchContactDetails = async (phoneNumber) => {
        try {
            const currentSelectedId = selectedConversationRef.current;
            
            const response = await Api.getContactDetails(phoneNumber);

            if (response.success && selectedConversationRef.current === currentSelectedId) {
                setContactDetails(response.data);
            } else if (!response.success) {
                console.error('Erro ao carregar detalhes do contato:', response.error);
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes do contato:', error);
        }
    };

    // Função para enviar mensagem
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            setIsSending(true);

            const response = await Api.sendMessage(
                selectedConversation.instanceName,
                selectedConversation.phoneNumber,
                newMessage,
                selectedConversation.campaignId,
                selectedConversation.leadId
            );

            if (response.success) {
                // Adicionar a nova mensagem à lista
                setMessages(prev => [...prev, response.data]);
                setNewMessage('');

                // Atualizar a última mensagem na lista de conversas
                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === selectedConversation.id
                            ? {
                                ...conv,
                                lastMessage: newMessage,
                                timestamp: new Date().toISOString()
                            }
                            : conv
                    )
                );

                // Buscar conversas novamente para atualizar a ordem
                fetchConversations();
            } else {
                console.error('Erro ao enviar mensagem:', response.error);
                toast.error('Não foi possível enviar a mensagem');
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            toast.error('Erro ao enviar mensagem');
        } finally {
            setIsSending(false);
        }
    };

    // Formatar data para exibição
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatConversationTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ontem';
        } else if (diffDays < 7) {
            const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            return days[date.getDay()];
        } else {
            return date.toLocaleDateString();
        }
    };

    // Formatar número de telefone
    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return '';

        // Remover caracteres não numéricos
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');

        // Verificar se é um número brasileiro (formato +55)
        if (cleaned.length >= 12 && cleaned.startsWith('55')) {
            const countryCode = cleaned.slice(0, 2);
            const areaCode = cleaned.slice(2, 4);
            const firstPart = cleaned.slice(4, 9);
            const secondPart = cleaned.slice(9, 13);

            return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
        }

        // Formato genérico para outros números
        return phoneNumber;
    };

    // Manipular tecla Enter para enviar mensagem
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Gerar avatar baseado no nome
    const generateAvatar = (name) => {
        // Usar a primeira letra do nome ou um caractere padrão
        const initial = name && name.length > 0 ? name[0].toUpperCase() : '?';
        // Gerar uma cor baseada no nome
        const colors = [
            '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
            '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
            '#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6',
            '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
        ];

        // Hash simples do nome para escolher uma cor
        let hash = 0;
        if (name) {
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
        }

        const color = colors[Math.abs(hash) % colors.length];

        return { initial, color };
    };

    return (
        <AuthLayout>
            <div className="conversations-container">
                <div className="conversations-header">
                    <div className="conversations-title">
                        <h1>Conversas</h1>
                        <p>Gerencie suas conversas do WhatsApp</p>
                    </div>
                </div>

                <div className="chat-interface">
                    {/* Lista de Conversas */}
                    <div className="conversations-list-container">
                        <div className="conversations-search">
                            <Input
                                type="text"
                                placeholder="Buscar conversas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon="fas fa-search"
                                className="search-input"
                            />
                        </div>

                        <div className="conversations-list">
                            {filteredConversations.length === 0 ? (
                                <div className="conversations-empty">
                                    <i className="fab fa-whatsapp conversations-empty-icon"></i>
                                    <h3>Nenhuma conversa encontrada</h3>
                                    <p>Não há conversas disponíveis ou que correspondam à busca.</p>
                                </div>
                            ) : (
                                filteredConversations.map(conversation => {
                                    const avatar = generateAvatar(conversation.name);

                                    return (
                                        <div
                                            key={conversation.id}
                                            className={`conversation-item ${selectedConversationRef.current === conversation.id ? 'selected' : ''}`}
                                            onClick={() => { 
                                                setIsLoadingMessages(true);
                                                // Atualizar a referência quando selecionar uma conversa
                                                selectedConversationRef.current = conversation.id;
                                                setSelectedConversation(conversation);
                                                fetchMessages(conversation.instanceName, conversation.phoneNumber);
                                                fetchContactDetails(conversation.phoneNumber);
                                            }}
                                        >

                                            <div className="conversation-avatar" style={{ backgroundColor: avatar.color }}>
                                                <span className="avatar-text">{avatar.initial}</span>
                                                <span className={`status-indicator ${'online'}`}></span>
                                            </div>

                                            <div className="conversation-info">

                                                <b className="avatar-text" style={{fontSize: '7pt', color: 'gray'}}>{conversation?.instanceName}</b>

                                                <div className="conversation-header">
                                                    <h3 className="conversation-name">{conversation.name || formatPhoneNumber(conversation.phoneNumber)}</h3>
                                                    <span className="conversation-time">{formatConversationTime(conversation.timestamp)}</span>
                                                </div>

                                                <div className="conversation-preview">
                                                    <p className="conversation-last-message">{conversation.lastMessage}</p>
                                                    {conversation.unreadCount > 0 && (
                                                        <span className="unread-badge">{conversation.unreadCount}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="chat-area">
                        {selectedConversation ? (
                            <>
                                <div className="chat-header">
                                    <div className="chat-contact-info">
                                        <div
                                            className="chat-avatar"
                                            style={{ backgroundColor: generateAvatar(selectedConversation.name).color }}
                                        >
                                            <span className="avatar-text">{generateAvatar(selectedConversation.name).initial}</span>
                                            <span className={`status-indicator ${'online'}`}></span>
                                        </div>
                                        <div className="chat-contact-details">
                                            <h3 className="chat-contact-name">
                                                {selectedConversation.name || formatPhoneNumber(selectedConversation.phoneNumber)}
                                            </h3>
                                            <p className="chat-contact-status">
                                                {formatPhoneNumber(selectedConversation.phoneNumber)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="chat-actions">
                                        <button className="chat-action-btn" title="Buscar na conversa">
                                            <i className="fas fa-search"></i>
                                        </button>
                                        <button className="chat-action-btn" title="Anexar arquivo">
                                            <i className="fas fa-paperclip"></i>
                                        </button>
                                        <button 
                                            className="chat-action-btn" 
                                            title="Atualizar conversa"
                                            onClick={() => {
                                                if (selectedConversation) {
                                                    setIsLoadingMessages(true);
                                                    fetchMessages(selectedConversation.instanceName, selectedConversation.phoneNumber);
                                                }
                                            }}
                                        >
                                            <i className="fas fa-sync-alt"></i>
                                        </button>
                                        <button className="chat-action-btn" title="Mais opções">
                                            <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="chat-messages">
                                    {isLoadingMessages ? (
                                        <div className="messages-loading">
                                            <div className="loading-spinner"></div>
                                            <p>Carregando mensagens...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="messages-empty">
                                            <i className="fas fa-comments messages-empty-icon"></i>
                                            <h3>Nenhuma mensagem</h3>
                                            <p>Envie uma mensagem para iniciar a conversa</p>
                                        </div>
                                    ) : (
                                        messages.map(message => (
                                            <div
                                                key={message.id}
                                                className={`message ${message.sender === 'user' ? 'outgoing' : 'incoming'}`}
                                            >
                                                <div className="message-content">
                                                    <p>{message.text}</p>
                                                    <div className="message-meta">
                                                        <span className="message-time">{formatMessageTime(message.timestamp) || ""}</span>
                                                        {message.sender === 'user' && (
                                                            <span className="message-status">
                                                                {message.status === 'delivered' && <i className="fas fa-check-double"></i>}
                                                                {message.status === 'read' && <i className="fas fa-check-double read"></i>}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messageEndRef} />
                                </div>

                                <div className="chat-input-area">
                                    <button className="chat-emoji-btn" title="Inserir emoji">
                                        <i className="far fa-smile"></i>
                                    </button>

                                    <div className="chat-input-container">
                                        <input
                                            className="chat-input" 
                                            placeholder="Digite uma mensagem"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={/*isSending*/ true}
                                        />
                                    </div>

                                    <button
                                        className="chat-send-btn"
                                        onClick={sendMessage}
                                        disabled={/*!newMessage.trim() || isSending*/ true}
                                        title="Enviar mensagem"
                                    >
                                        {isSending ? (
                                            <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fas fa-paper-plane"></i>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="chat-empty-state">
                                <div className="chat-empty-icon">
                                    <i className="fab fa-whatsapp"></i>
                                </div>
                                <h3>Selecione uma conversa</h3>
                                <p>Escolha uma conversa da lista para começar a interagir</p>
                            </div>
                        )}
                    </div>

                    {/* Painel de Detalhes do Contato (opcional) */}
                    {selectedConversation && contactDetails && (
                        <div className="contact-details-panel">
                            <div className="contact-details-header">
                                <h3>Detalhes do Contato</h3>
                                <button className="close-details-btn">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="contact-details-content">
                                <div
                                    className="contact-avatar-large"
                                    style={{ backgroundColor: generateAvatar(contactDetails.name).color }}
                                >
                                    <span className="avatar-text-large">{generateAvatar(contactDetails.name).initial}</span>
                                </div>

                                <h3 className="contact-name">{contactDetails.name}</h3>
                                <p className="contact-phone">{formatPhoneNumber(contactDetails.phoneNumber)}</p>

                                {contactDetails.email && (
                                    <div className="contact-info-item">
                                        <i className="fas fa-envelope"></i>
                                        <span>{contactDetails.email}</span>
                                    </div>
                                )}

                                <div className="contact-info-item">
                                    <i className="fas fa-tag"></i>
                                    <span>Status: {contactDetails.status}</span>
                                </div>

                                {contactDetails.campaignName && (
                                    <div className="contact-info-item">
                                        <i className="fas fa-bullhorn"></i>
                                        <span>Campanha: {contactDetails.campaignName}</span>
                                    </div>
                                )}

                                {selectedConversation && (
                                    <div className="contact-info-item">
                                        <i className="fas fa-server"></i>
                                        <span>Instância: {selectedConversation.instanceName}</span>
                                    </div>
                                )}

                                <div className="contact-stats">
                                    <div className="stat-item">
                                        <span className="stat-value">{contactDetails.messageCount}</span>
                                        <span className="stat-label">Mensagens</span>
                                    </div>

                                    {contactDetails.firstContact && (
                                        <div className="stat-item">
                                            <span className="stat-value">{new Date(contactDetails.firstContact).toLocaleDateString()}</span>
                                            <span className="stat-label">Primeiro Contato</span>
                                        </div>
                                    )}

                                    {contactDetails.lastContact && (
                                        <div className="stat-item">
                                            <span className="stat-value">{new Date(contactDetails.lastContact).toLocaleDateString()}</span>
                                            <span className="stat-label">Último Contato</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
};

export default Conversations;