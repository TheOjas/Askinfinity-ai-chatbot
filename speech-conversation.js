let recognition;
let userMessage = null;
const chatContainer = document.querySelector(".chat-container");
const micBtn = document.querySelector(".mic-btn");
let isSpeaking = false;  // Track if AI is currently speaking
let isListening = false;  // Track if AI is actively listening


if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
} else {
    alert("Speech Recognition API is not supported in your browser.");
}


function speakText(text) {
    if (isSpeaking) return; 

    isSpeaking = true;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.pitch = 1;
    speech.rate = 1.1;  
    speech.volume = 1;
    window.speechSynthesis.speak(speech);

    speech.onend = () => {
        isSpeaking = false;  
    };
}


function showAiTalkingStatus() {
    const aiStatusDiv = document.createElement("div");
    aiStatusDiv.classList.add("ai-status");

   
    aiStatusDiv.innerHTML = `
        <img src="ai-talking.svg" alt="AI Talking">
        <span>AI is talking...</span>
    `;

    chatContainer.appendChild(aiStatusDiv);
    scrollToBottom();
}


function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


async function fetchAiResponse() {
    try {
        showAiTalkingStatus();  

     
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBTtxQ_fJlfKavORiH56DuO4x8C9WOovP8', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userMessage }] }]
            })
        });

        
        if (!response.ok) {
            throw new Error('AI service error');
        }

        const data = await response.json();

       
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI couldn't respond.";

      
        speakText(apiResponse);
    } catch (error) {
        console.error("Error:", error);
        speakText("An error occurred. Try again.");
    }
}


micBtn.innerText = "🎤 Listening...";
recognition.start(); 

recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.trim();
    userMessage = transcript;

    if (userMessage) {
        isListening = false;  
        fetchAiResponse(); 
    }
});


recognition.addEventListener("end", () => {
    if (isListening) {
        recognition.start();  
    }
});


recognition.addEventListener("error", (event) => {
    console.error("Speech Recognition Error:", event.error);
    alert("Speech recognition failed. Please try again.");
});


recognition.addEventListener("start", () => {
    isListening = true;  
});
