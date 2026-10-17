
const STORAGE_KEY = "ourLoveStory.chatbot.v1";

const DEFAULT_STATE = {
  version: 1,
  messages: []
};

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.messages)
    ) {
      return structuredClone(DEFAULT_STATE);
    }

    return {
      version: 1,
      messages: parsed.messages.filter((message) =>
        message &&
        typeof message.id === "string" &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        typeof message.createdAt === "string"
      )
    };
  } catch (error) {
    console.error("Could not load saved chat:", error);
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Could not save chat:", error);
    return false;
  }
}

export function clearSavedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Could not clear saved chat:", error);
    return false;
  }
}
