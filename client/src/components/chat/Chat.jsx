import React, { useRef, useState, useEffect } from 'react';
import './Chat.css';

export default function Chat({ socket }) {
  const msgRef = useRef();
  const messageEndRef = useRef(null);
  const [messageList, setMessageList] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((current) => [...current, data]);
    });

    return () => socket.off('receive_message');
  }, [socket]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageList]);

  const handleSubmit = () => {
    if (!messageText.trim()) return;

    const message = {
      author: 'Você',
      author_id: socket.id,
      text: messageText,
      type: 'text'
    };

    socket.emit('message', message);
    setMessageText('');
    if (msgRef.current) {
      msgRef.current.style.height = 'auto';
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessageText(prev => prev + emoji);
    setIsEmojiPickerVisible(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const isImage = file.type.startsWith('image/');
      const message = {
        author: 'Você',
        author_id: socket.id,
        text: reader.result,
        type: isImage ? 'image' : 'file',
        name: file.name
      };
      socket.emit('message', message);
    };
    reader.readAsDataURL(file);
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerVisible(!isEmojiPickerVisible);
  };

  const handleResize = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  const closeModal = () => setModalImage(null);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Web-chat</h1>
      </div>
      <div className="message-container">
        {messageList.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${message.author_id === socket.id ? 'sent' : 'received'}`}
          >
            {message.author_id !== socket.id && (
              <div
                className="avatar"
                style={{ backgroundColor: stringToColor(message.author || '') }}
              >
                {message.author?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="message-content">
              {message.author_id !== socket.id && (
                <span className="message-author">{message.author}</span>
              )}
              {message.type === 'image' ? (
                <img
                  src={message.text}
                  alt="imagem enviada"
                  className="message-image"
                  onClick={() => setModalImage(message.text)} // Show modal when clicked
                />
              ) : message.type === 'file' ? (
                <a href={message.text} download={message.name} className="download-link">📎 {message.name}</a>
              ) : (
                <span>{message.text}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="input-container">
        <button className="icon-button emoji-button" onClick={toggleEmojiPicker} title="Emoji">😊</button>
        <textarea
          ref={msgRef}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onInput={handleResize}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem"
          className="message-input"
          rows={1}
        />
        <label htmlFor="file-input" className="icon-button" title="Enviar anexo">📎</label>
        <input id="file-input" type="file" onChange={handleFileChange} className="file-input" />
        <button onClick={handleSubmit} className="icon-button send-button" title="Enviar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {isEmojiPickerVisible && (
        <div className="emoji-picker">
          {["😊", "😂", "❤️", "😎", "🥺", "🎉", "👍"].map((emoji, index) => (
            <button key={index} onClick={() => handleEmojiClick(emoji)} className="emoji">
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Modal para exibir a imagem clicada */}
      {modalImage && (
        <div className="image-modal" onClick={closeModal}>
          <img src={modalImage} alt="Visualização" className="modal-img" />
        </div>
      )}
    </div>
  );
}
