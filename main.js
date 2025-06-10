
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'ja-JP';
  recognition.start();
  recognition.onresult = async function (event) {
    const text = event.results[0][0].transcript;
    appendMessage("あなた", text);
    const reply = await getChatGPTResponse(text);
    appendMessage("ユイ", reply);
    speak(reply);
  };
}

function sendTextMessage() {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;
  appendMessage("あなた", input);
  getChatGPTResponse(input).then(reply => {
    appendMessage("ユイ", reply);
    speak(reply);
  });
  document.getElementById("userInput").value = "";
}

async function getChatGPTResponse(userInput) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + window.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userInput }]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      appendMessage("エラー", "API応答に失敗しました：" + errText);
      return "申し訳ありません、現在応答できません。";
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    appendMessage("エラー", "接続エラー：" + error.message);
    return "申し訳ありません、接続に失敗しました。";
  }
}

function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  synth.speak(utterance);
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById("response");
  const message = document.createElement("div");
  message.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}
