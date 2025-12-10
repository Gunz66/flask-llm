// Скрипт для работы чата
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Функция для автоматической прокрутки к последнему сообщению
function scrollToBottom() {
    setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);
}

// Функция для экранирования HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Обработка отправки формы
chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Добавляем сообщение пользователя
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <span class="message-author">Вы</span>
            <p>${escapeHtml(userMessage)}</p>
        </div>
    `;
    
    messageGroup.appendChild(userMessageDiv);
    
    // Удаляем пустое состояние если есть
    const emptyChat = chatBox.querySelector('.empty-chat');
    if (emptyChat) {
        emptyChat.remove();
    }
    
    chatBox.appendChild(messageGroup);
    userInput.value = '';
    userInput.focus();
    scrollToBottom();

    // Отправляем сообщение на сервер
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: userMessage})
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Добавляем ответ AI
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <span class="message-author">AI Помощник</span>
                <p>${escapeHtml(data.reply)}</p>
            </div>
        `;
        
        messageGroup.appendChild(aiMessageDiv);
        scrollToBottom();
        
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        
        // Добавляем сообщение об ошибке
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message ai-message';
        errorDiv.innerHTML = `
            <div class="message-avatar">⚠️</div>
            <div class="message-content">
                <span class="message-author">Система</span>
                <p>Извините, произошла ошибка при отправке сообщения. Попробуйте еще раз.</p>
            </div>
        `;
        
        messageGroup.appendChild(errorDiv);
        scrollToBottom();
    }
});

// Прокрутка вниз при загрузке страницы
window.addEventListener('load', scrollToBottom);

// Обработка Enter для отправки
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});