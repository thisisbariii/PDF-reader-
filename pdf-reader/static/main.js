// Initialize the SpeechRecognition object
const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
recognition.continuous = true;

// Declare synth globally
const synth = window.speechSynthesis;

let paragraphs; // Declare paragraphs globally
let currentParagraph = 0; // Declare currentParagraph globally
let isReading = false; // Declare isReading globally

document.getElementById('file-upload').addEventListener('change', function (event) {
    const fileInput = event.target;

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];

        if (file.type === 'application/pdf') {
            const formData = new FormData();
            formData.append('pdf_file', file);

            fetch('http://127.0.0.1:5000/read_pdf', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Display the PDF content and start reading
                    displayPdfAndRead(data.text_content);
                } else {
                    alert('Error reading PDF: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            alert('Please choose a PDF file.');
        }
    }
});

function displayPdfAndRead(textContent) {
    const pdfContainer = document.getElementById('pdf-content');
    pdfContainer.innerHTML = ''; // Clear existing content

    // Split the text into paragraphs
    paragraphs = textContent.split('\n');

    // Create a span for each paragraph and append it to the container
    paragraphs.forEach(paragraph => {
        const span = document.createElement('span');
        span.textContent = paragraph;
        pdfContainer.appendChild(span);
    });

    // Read the PDF text content aloud
    readTextAloud();
}

function speakParagraph(paragraph) {
    const span = document.querySelector(`#pdf-content span:nth-child(${currentParagraph + 1})`);
    span.classList.add('highlight'); // Apply the highlight class

    const utterance = new SpeechSynthesisUtterance(paragraph);
    utterance.onend = function () {
        // Remove highlight after the current paragraph is read
        span.classList.remove('highlight');

        // Continue with the next paragraph after the current one finishes
        currentParagraph++;

        if (isReading && currentParagraph < paragraphs.length) {
            speakParagraph(paragraphs[currentParagraph]);
        }
    };

    synth.speak(utterance);
}

function readTextAloud() {
    // Start reading when the user clicks the "Read PDF" button
    document.getElementById('read-button').addEventListener('click', function () {
        isReading = true;
        // Reset the current paragraph index and start reading
        currentParagraph = 0;
        speakParagraph(paragraphs[currentParagraph]);
    });

    // Stop reading when the user clicks the "Stop Reading" button
    document.getElementById('stop-button').addEventListener('click', function () {
        isReading = false;
        synth.cancel(); // Stop the speech synthesis
    });

    // Start listening for voice commands when the user clicks the "Start Voice Recognition" button
    document.getElementById('start-voice-button').addEventListener('click', startVoiceRecognition);

    // Stop listening for voice commands when the user clicks the "Stop Voice Recognition" button
    document.getElementById('stop-voice-button').addEventListener('click', stopVoiceRecognition);
}

function startVoiceRecognition() {
    recognition.onresult = function (event) {
        const results = event.results;

        let finalTranscript = '';
        for (let i = 0; i < results.length; i++) {
            finalTranscript += results[i][0].transcript;
        }

        if (event.results[0].isFinal) {
            if (finalTranscript.includes('start') || finalTranscript.includes('read')) {
                // Start reading when the voice command includes "start" or "read"
                currentParagraph = 0;
                speakParagraph(paragraphs[currentParagraph]);
            } else if (finalTranscript.includes('stop') || finalTranscript.includes('cancel')) {
                // Stop reading when the voice command includes "stop" or "cancel"
                synth.cancel();
            }
        }
    };

    recognition.start();
}

function stopVoiceRecognition() {
    recognition.stop();
}
