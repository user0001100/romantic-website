
import {
  loadState,
  saveState,
  clearSavedState
} from "./storage.js";

const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messagesContainer = document.getElementById("messages");
const clearButton = document.getElementById("clear-chat");

let state = loadState();

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString(36) +
    Math.random().toString(36).slice(2);
}

function addMessage(role, content) {
  const message = {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString()
  };

  state.messages.push(message);

  // Keep the newest 500 messages in this first version.
  if (state.messages.length > 500) {
    state.messages = state.messages.slice(-500);
  }

  renderMessage(message);

  const saved = saveState(state);

  if (!saved) {
    console.warn("This message may not survive a refresh.");
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderMessage(message) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${message.role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  // textContent prevents user input from being treated as HTML.
  bubble.textContent = message.content;

  const time = document.createElement("span");
  time.className = "message-time";

  const date = new Date(message.createdAt);
  time.textContent = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

  wrapper.append(bubble, time);
  messagesContainer.appendChild(wrapper);
}

function renderHistory() {
  messagesContainer.replaceChildren();

  if (state.messages.length === 0) {
    const welcome = {
      id: "welcome",
      role: "assistant",
      content: "Heyy you! 💗 I'm happy you're here. Tell me, how was your day?",
      createdAt: new Date().toISOString()
    };

    renderMessage(welcome);
    return;
  }

  state.messages.forEach(renderMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getReply(message) {
  const text = message.toLowerCase().trim();

  if (/\b(hi|hello|hey|hii|heyy)\b/.test(text)) {
    return "Heyyy! 💗 You just made this little corner sweeter. How are you?";
  }

  if (text.includes("miss you") || text.includes("miss u")) {
    return "Awww 🥹 Sending you a big virtual hug. What made you miss me today? 💗";
  }

  if (text.includes("love you") || text.includes("i love u")) {
    return "That's such a sweet thing to say! ❤️ Tell me what is on your heart.";
  }

  if (text.includes("sad") || text.includes("upset") || text.includes("low")) {
    return "Oh no 🫂 Want to tell me what happened? I'm here to listen without judging.";
  }

  if (text.includes("happy") || text.includes("excited")) {
    return "Yayyy! 🥰 I want to hear all about it. What made you so happy?";
  }

  if (text.includes("good night") || text.includes("goodnight")) {
    return "Good night, sunshine 🌙 Rest well and be kind to yourself. Sweet dreams! 💗";
  }

  if (text.includes("good morning")) {
    return "Good morning, sunshine! ☀️ May your day bring little reasons to smile. 💕";
  }

  if (text.includes("thank")) {
    return "Awww, you're welcome! 💗 Now tell me, what else is on your mind?";
  }

  if (text.includes("bored")) {
    return "Let's fix that! 😋 Want a cute question, a silly joke, or a little heart-to-heart?";
  }

  if (text.includes("remember this")) {
    return "I can save a memory when you use a dedicated Remember This action. 💗 That feature is coming in the next step.";
  }

  const replies = [
    "Tell me more, I'm listening. 💗",
    "Hmm, I want to understand that better. What happened next? 🥰",
    "That's interesting! How did that make you feel? 💌",
    "I'm listening, no rush. You can tell me in your own words. 🫶",
    "A little question for you: what's the most important part of this for you? 💕"
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = input.value.trim();

  if (!message) return;

  addMessage("user", message);
  input.value = "";
  input.focus();

  // Simple local rule-based reply; no AI API is used.
  const reply = getReply(message);
  addMessage("assistant", reply);
});

clearButton.addEventListener("click", () => {
  if (state.messages.length === 0) {
    alert("Your chat is already empty. 💗");
    return;
  }

  const confirmed = confirm(
    "Clear all saved messages from this browser? This cannot be undone."
  );

  if (!confirmed) return;

  const cleared = clearSavedState();

  if (!cleared) {
    alert("Couldn't clear saved messages. Please try again.");
    return;
  }

  state = { version: 1, messages: [] };
  renderHistory();
});

renderHistory();
