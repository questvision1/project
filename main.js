
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'ja-JP';
  recognition.start();
  recognition.onresult = async function (event) {
    const text = event.results[0][0].transcript;
    document.getElementById("response").innerText = "あなた: " + text;
    const reply = await getChatGPTResponse(text);
    document.getElementById("response").innerText += "\nユイ: " + reply;
    speak(reply);
  };
}

function sendTextMessage() {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;
  document.getElementById("response").innerText = "あなた: " + input;
  getChatGPTResponse(input).then(reply => {
    document.getElementById("response").innerText += "\nユイ: " + reply;
    speak(reply);
  });
  document.getElementById("userInput").value = "";
}

async function getChatGPTResponse(userInput) {
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
  const data = await res.json();
  return data.choices[0].message.content;
}

function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  synth.speak(utterance);
}
