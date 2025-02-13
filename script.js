// Replace with your actual Google Gemini API key
const API_KEY = 'AIzaSyAxa2ql8U9oEUAuTher3EWpYJ4UFc_Sy18';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// DOM Elements
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generate-btn');
const storyContent = document.getElementById('story-content');
const loadingSpinner = document.querySelector('.loading-spinner');
const genreButtons = document.querySelectorAll('.genre-btn');
const toneButtons = document.querySelectorAll('.tone-btn');
const storyStats = document.querySelector('.story-stats');
const wordCountElement = document.getElementById('word-count');
const saveStoryBtn = document.getElementById('save-story');
const copyStoryBtn = document.getElementById('copy-story');
const backgroundMusic = document.getElementById('background-music');
const clickSound = document.getElementById('click-sound');
const successSound = document.getElementById('success-sound');
const toggleMusicBtn = document.getElementById('toggle-music');
const toggleSfxBtn = document.getElementById('toggle-sfx');
const readStoryBtn = document.getElementById('read-story');
const themeToggle = document.getElementById('theme-toggle');
const themePanel = document.querySelector('.theme-panel');
const colorInputs = {
    bgColor: document.getElementById('bgColor'),
    textColor: document.getElementById('textColor'),
    accentColor: document.getElementById('accentColor'),
    dialogueColor: document.getElementById('dialogueColor')
};
const languageSelect = document.getElementById('language-select');

let selectedGenre = '';
let selectedTone = '';
let isMusicEnabled = localStorage.getItem('isMusicEnabled') === 'true';
let isSfxEnabled = localStorage.getItem('isSfxEnabled') === 'true';
let isReading = false;

// Event Listeners
genreButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        genreButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGenre = btn.dataset.genre;
    });
});

toneButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        toneButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTone = btn.dataset.tone;
    });
});

generateBtn.addEventListener('click', generateStory);

saveStoryBtn.addEventListener('click', () => {
    const story = storyContent.innerText;
    const blob = new Blob([story], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

copyStoryBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(storyContent.innerText);
        const originalText = copyStoryBtn.innerText;
        copyStoryBtn.innerText = 'Copied!';
        setTimeout(() => {
            copyStoryBtn.innerText = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
});

// Audio Elements and Controls
if (isMusicEnabled) {
    toggleMusicBtn.classList.add('active');
    backgroundMusic.volume = 0.3; // Lower background music volume
} else {
    backgroundMusic.volume = 0;
}

if (isSfxEnabled) {
    toggleSfxBtn.classList.add('active');
    clickSound.volume = 0.5;
    successSound.volume = 0.5;
} else {
    clickSound.volume = 0;
    successSound.volume = 0;
}

// Background Music Toggle
toggleMusicBtn.addEventListener('click', () => {
    isMusicEnabled = !isMusicEnabled;
    localStorage.setItem('isMusicEnabled', isMusicEnabled);
    
    if (isMusicEnabled) {
        backgroundMusic.volume = 0.3;
        toggleMusicBtn.classList.add('active');
        backgroundMusic.play().catch(error => {
            console.log('Auto-play prevented:', error);
        });
    } else {
        backgroundMusic.volume = 0;
        toggleMusicBtn.classList.remove('active');
    }
});

// Sound Effects Toggle
toggleSfxBtn.addEventListener('click', () => {
    isSfxEnabled = !isSfxEnabled;
    localStorage.setItem('isSfxEnabled', isSfxEnabled);
    
    if (isSfxEnabled) {
        clickSound.volume = 0.5;
        successSound.volume = 0.5;
        toggleSfxBtn.classList.add('active');
        playClickSound(); // Play a test sound
    } else {
        clickSound.volume = 0;
        successSound.volume = 0;
        toggleSfxBtn.classList.remove('active');
    }
});

// Play click sound on buttons
function playClickSound() {
    if (isSfxEnabled) {
        clickSound.currentTime = 0;
        clickSound.play().catch(error => {
            console.log('Click sound play prevented:', error);
        });
    }
}

// Play success sound when story is generated
function playSuccessSound() {
    if (isSfxEnabled) {
        successSound.currentTime = 0;
        successSound.play().catch(error => {
            console.log('Success sound play prevented:', error);
        });
    }
}

// Add click sound to all buttons
document.querySelectorAll('button').forEach(button => {
    if (button !== toggleMusicBtn && button !== toggleSfxBtn) {
        button.addEventListener('click', playClickSound);
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (backgroundMusic.volume > 0) {
            backgroundMusic.pause();
        }
    } else {
        if (isMusicEnabled) {
            backgroundMusic.play().catch(error => {
                console.log('Auto-play prevented:', error);
            });
        }
    }
});

// Language names mapping
const languageNames = {
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
};

// Translations
const translations = {
    en: {
        title: 'AI Story Generator',
        customize: 'Customize Theme',
        generate: 'Generate Story',
        promptPlaceholder: 'Enter your story prompt here...',
        genreLabel: 'Select Genre',
        toneLabel: 'Select Tone',
        enterPrompt: 'Please enter a story prompt!',
        selectGenreTone: 'Please select both a genre and tone for your story!',
        httpError: 'HTTP error! status: ',
        invalidResponse: 'Invalid or empty response from API',
        noContent: 'No story content in API response',
        generateError: 'Sorry, there was an error generating your story. Error:',
        noStoryToRead: 'Please generate a story first!',
        readStory: 'Read Story',
        stopReading: 'Stop Reading'
    },
    hi: {
        title: 'एआई कहानी जनरेटर',
        customize: 'थीम कस्टमाइज़ करें',
        generate: 'कहानी बनाएं',
        promptPlaceholder: 'अपनी कहानी का विवरण यहां लिखें...',
        genreLabel: 'शैली चुनें',
        toneLabel: 'स्वर चुनें',
        enterPrompt: 'कृपया एक कहानी प्रॉम्प्ट दर्ज करें!',
        selectGenreTone: 'कृपया अपनी कहानी के लिए एक शैली और स्वर दोनों चुनें!',
        httpError: 'HTTP त्रुटि! स्थिति: ',
        invalidResponse: 'अमान्य या खाली API प्रतिक्रिया',
        noContent: 'API प्रतिक्रिया में कोई कहानी सामग्री नहीं',
        generateError: 'माफ़ कीजिये, आपकी कहानी बनाने में एक त्रुटि हुई। त्रुटि:',
        noStoryToRead: 'कृपया पहले एक कहानी बनाएं!',
        readStory: 'कहानी सुनें',
        stopReading: 'पढ़ना बंद करें'
    },
    es: {
        title: 'Generador de Historias IA',
        customize: 'Personalizar Tema',
        generate: 'Generar Historia',
        promptPlaceholder: 'Ingrese su prompt aquí...',
        genreLabel: 'Seleccionar Género',
        toneLabel: 'Seleccionar Tono',
        enterPrompt: 'Por favor, ingrese un prompt de historia!',
        selectGenreTone: 'Por favor, seleccione tanto un género como un tono para su historia!',
        httpError: 'Error HTTP! estado: ',
        invalidResponse: 'Respuesta de API inválida o vacía',
        noContent: 'No hay contenido de historia en la respuesta de la API',
        generateError: 'Lo siento, hubo un error al generar su historia. Error:',
        noStoryToRead: 'Por favor, genere una historia primero!',
        readStory: 'Leer Historia',
        stopReading: 'Dejar de Leer'
    },
    fr: {
        title: 'Générateur d\'Histoires IA',
        customize: 'Personnaliser le Thème',
        generate: 'Générer une Histoire',
        promptPlaceholder: 'Entrez votre prompt ici...',
        genreLabel: 'Sélectionner le Genre',
        toneLabel: 'Sélectionner le Ton',
        enterPrompt: 'Veuillez entrer un prompt de histoire!',
        selectGenreTone: 'Veuillez sélectionner à la fois un genre et un ton pour votre histoire!',
        httpError: 'Erreur HTTP! état: ',
        invalidResponse: 'Réponse API invalide ou vide',
        noContent: 'Pas de contenu d\'histoire dans la réponse de l\'API',
        generateError: 'Désolé, une erreur est survenue lors de la génération de votre histoire. Erreur:',
        noStoryToRead: 'Veuillez générer une histoire d\'abord!',
        readStory: 'Lire l\'Histoire',
        stopReading: 'Arrêter la Lecture'
    },
    de: {
        title: 'KI-Geschichtengenerator',
        customize: 'Theme Anpassen',
        generate: 'Geschichte Generieren',
        promptPlaceholder: 'Geben Sie Ihren Prompt hier ein...',
        genreLabel: 'Genre Auswählen',
        toneLabel: 'Ton Auswählen',
        enterPrompt: 'Bitte geben Sie einen Geschichten-Prompt ein!',
        selectGenreTone: 'Bitte wählen Sie sowohl ein Genre als auch einen Ton für Ihre Geschichte!',
        httpError: 'HTTP-Fehler! Status: ',
        invalidResponse: 'Ungültige oder leere API-Antwort',
        noContent: 'Kein Geschichteninhalt in der API-Antwort',
        generateError: 'Entschuldigung, es gab einen Fehler bei der Erstellung Ihrer Geschichte. Fehler:',
        noStoryToRead: 'Bitte erstellen Sie zuerst eine Geschichte!',
        readStory: 'Geschichte Vorlesen',
        stopReading: 'Vorlesen Beenden'
    }
};

// Language and voice mapping
const languageVoiceMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE'
};

// Initialize speech synthesis
let synth = window.speechSynthesis;
let voices = [];

// Wait for voices to be loaded
function initVoices() {
    return new Promise((resolve) => {
        voices = synth.getVoices();
        if (voices.length > 0) {
            resolve(voices);
        } else {
            synth.onvoiceschanged = () => {
                voices = synth.getVoices();
                resolve(voices);
            };
        }
    });
}

// Initialize voices when page loads
window.onload = async () => {
    try {
        await initVoices();
        console.log('Voices loaded:', voices.length);
    } catch (error) {
        console.error('Error loading voices:', error);
    }
};

// Text-to-Speech functionality
async function startSpeaking(text, language) {
    try {
        if (isReading) {
            stopSpeaking();
            return;
        }

        // Clean the text before reading
        text = text.replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, ' ') // Replace newlines with space
            .trim();
        
        if (!text) {
            alert(translations[currentLanguage].noStoryToRead);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = languageVoiceMap[language] || 'en-US';
        utterance.volume = 1;
        utterance.rate = 0.9;
        utterance.pitch = 1;

        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(utterance.lang)) || 
                     voices.find(v => v.lang.startsWith('en')) || 
                     voices[0];
        
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => {
            isReading = true;
            readStoryBtn.innerHTML = `<span class="icon">⏹️</span> ${translations[currentLanguage].stopReading}`;
            readStoryBtn.classList.add('active');
        };

        utterance.onend = () => {
            isReading = false;
            readStoryBtn.innerHTML = `<span class="icon">🔊</span> ${translations[currentLanguage].readStory}`;
            readStoryBtn.classList.remove('active');
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            stopSpeaking();
        };

        isReading = true;
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Text-to-speech error:', error);
        stopSpeaking();
    }
}

function stopSpeaking() {
    window.speechSynthesis.cancel();
    isReading = false;
    readStoryBtn.innerHTML = `<span class="icon">🔊</span> ${translations[currentLanguage].readStory}`;
    readStoryBtn.classList.remove('active');
}

// Format and display the story with proper spacing
function displayStory(content) {
    const storyContent = document.getElementById('story-content');
    if (storyContent) {
        // Clean up extra spaces and format the content
        let formattedContent = content
            // Remove multiple blank lines and spaces
            .replace(/\n{2,}/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/\s*\n\s*/g, '\n')
            // Clean up dialogue spacing
            .replace(/<\/div>\s*<div class="dialogue">/g, '</div>\n<div class="dialogue">')
            // Ensure proper spacing between paragraphs
            .replace(/<\/p>\s*<p>/g, '</p>\n<p>')
            .trim();

        storyContent.innerHTML = formattedContent;
        
        // Update word count
        const wordCount = formattedContent
            .replace(/<[^>]*>/g, '')
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0)
            .length;
        
        document.getElementById('word-count').textContent = `Words: ${wordCount}`;
        document.querySelector('.story-stats').classList.remove('hidden');
    }
}

// Event listener for read story button
document.getElementById('read-story').addEventListener('click', () => {
    const storyText = document.getElementById('story-content').textContent;
    if (isReading) {
        stopSpeaking();
    } else {
        startSpeaking(storyText, currentLanguage);
    }
});

// Story generation with better formatting
async function generateStory() {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        alert(translations[currentLanguage].enterPrompt);
        return;
    }

    if (!selectedGenre || !selectedTone) {
        alert(translations[currentLanguage].selectGenreTone);
        return;
    }

    showLoading();
    const targetLanguage = languageNames[currentLanguage];
    
    const fullPrompt = `Write a creative story in ${targetLanguage} based on this prompt: "${prompt}". Genre: ${selectedGenre}, Tone: ${selectedTone}.

Follow these rules:
1. Write 500-700 words
2. Start with a title in [square brackets]
3. Write in clear paragraphs
4. For dialogue, use this format: Name: "What they say"
5. Use natural language and flow
6. Include character descriptions
7. Make it engaging and descriptive

DO NOT use asterisks (*) anywhere in the story.
Write naturally in ${targetLanguage}.`;

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // For debugging

        if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid API response structure');
        }

        const generatedText = data.candidates[0].content.parts[0].text;
        if (!generatedText) {
            throw new Error('No story content in response');
        }

        // Format the story with proper spacing
        let story = generatedText
            // Remove extra spaces and newlines
            .replace(/\s*\n\s*/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
            // Format title
            .replace(/\[([^\]]+)\]/g, '<h1>$1</h1>')
            // Format character dialogue
            .replace(/([^:]+):\s*"([^"]+)"/g, '<div class="dialogue"><strong>$1:</strong> "$2"</div>')
            // Format paragraphs with proper spacing
            .split('\n')
            .map(para => {
                para = para.trim();
                if (!para) return '';
                if (para.startsWith('<h1>')) return para;
                if (para.startsWith('<div class="dialogue">')) return para;
                return `<p>${para}</p>`;
            })
            .filter(para => para)
            .join('\n');

        // Add default title if none is found
        if (!story.includes('<h1>')) {
            story = `<h1>${selectedGenre} Story</h1>\n` + story;
        }

        displayStory(story);
        playSuccessSound();

    } catch (error) {
        console.error('Story generation error:', error);
        displayStory(`<p class="error-message">${translations[currentLanguage].generateError} ${error.message}</p>`);
    } finally {
        hideLoading();
    }
}

// Theme handling
themeToggle.addEventListener('click', () => {
    themePanel.classList.toggle('hidden');
});

// Color picker functionality
Object.entries(colorInputs).forEach(([key, input]) => {
    input.addEventListener('input', (e) => {
        const root = document.documentElement;
        root.style.setProperty(`--${key.replace('Color', '-color')}`, e.target.value);
        localStorage.setItem(key, e.target.value);
    });

    // Load saved colors
    const savedColor = localStorage.getItem(key);
    if (savedColor) {
        input.value = savedColor;
        document.documentElement.style.setProperty(`--${key.replace('Color', '-color')}`, savedColor);
    }
});

// Theme presets
const themes = {
    default: {
        bgColor: '#1a1c2c',
        textColor: '#ffffff',
        accentColor: '#4ecdc4',
        dialogueColor: '#ff6b6b'
    },
    dark: {
        bgColor: '#000000',
        textColor: '#ffffff',
        accentColor: '#7289da',
        dialogueColor: '#ff4757'
    },
    light: {
        bgColor: '#ffffff',
        textColor: '#333333',
        accentColor: '#2ecc71',
        dialogueColor: '#e74c3c'
    },
    forest: {
        bgColor: '#2d3436',
        textColor: '#dfe6e9',
        accentColor: '#55efc4',
        dialogueColor: '#fab1a0'
    }
};

const presetButtons = document.querySelectorAll('.preset-btn');
presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = themes[btn.dataset.theme];
        if (theme) {
            Object.entries(theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(`--${key.replace('Color', '-color')}`, value);
                colorInputs[key].value = value;
                localStorage.setItem(key, value);
            });
            
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
});

// Language handling
let currentLanguage = localStorage.getItem('language') || 'en';

languageSelect.value = currentLanguage;

// Update the language change handler
languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    localStorage.setItem('language', currentLanguage);
    updateUILanguage(currentLanguage);
    updateReadButtonText(currentLanguage);
    
    // If currently reading, restart with new language
    if (isReading) {
        const story = storyContent.innerText;
        stopSpeaking();
        startSpeaking(story, currentLanguage);
    }
});

function updateUILanguage(lang) {
    // Add translations for your UI elements here
    const t = translations[lang] || translations.en;
    
    // Update UI elements with translations
    document.querySelector('h1').textContent = t.title;
    themeToggle.querySelector('.icon').nextSibling.textContent = t.customize;
    generateBtn.textContent = t.generate;
    promptInput.placeholder = t.promptPlaceholder;
    
    // Update genre and tone labels if they exist
    const genreLabel = document.querySelector('.genre-label');
    const toneLabel = document.querySelector('.tone-label');
    if (genreLabel) genreLabel.textContent = t.genreLabel;
    if (toneLabel) toneLabel.textContent = t.toneLabel;
}

// Initialize language
updateUILanguage(currentLanguage);

function updateReadButtonText(lang) {
    const readButtonText = {
        'en': 'Read Story',
        'hi': 'कहानी सुनें',
        'es': 'Leer Historia',
        'fr': 'Lire l\'Histoire',
        'de': 'Geschichte Vorlesen'
    };
    
    readStoryBtn.querySelector('.icon').nextSibling.textContent = ` ${readButtonText[lang] || readButtonText.en}`;
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    storyStats.classList.add('hidden');
    storyContent.innerHTML = '';
    generateBtn.disabled = true;
    generateBtn.innerHTML = 'Generating...';
    generateBtn.classList.add('loading');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtn.innerHTML = 'Generate Story';
    generateBtn.classList.remove('loading');
}