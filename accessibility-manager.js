// src/assets/js/accessibility-manager.js

import { localStorageManager } from './utils.js'; // Importa a função de gerenciamento de localStorage
import { playSound } from './utils.js'; // Importa a função playSound para feedback sonoro

// Referência ao elemento HTML raiz para controle de fonte
const htmlElement = document.documentElement;

// Configurações de tamanho de fonte
const FONT_STEP_PERCENT = 10;
const MIN_HTML_FONT_PERCENT = 60;
const MAX_HTML_FONT_PERCENT = 140;

// Variáveis para a síntese de voz
const synth = window.speechSynthesis;
let currentUtterance = null; // Para controlar a fala atual
let isSpeaking = false;

/**
 * Obtém o tamanho atual da fonte do elemento HTML raiz em porcentagem.
 * @returns {number} O tamanho da fonte atual em porcentagem.
 */
function getCurrentHtmlFontSizePercent() {
    const currentSizePx = parseFloat(window.getComputedStyle(htmlElement).fontSize);
    // Assumimos que o tamanho de fonte padrão do navegador é 16px
    const browserBaseSizePx = 16;
    return (currentSizePx / browserBaseSizePx) * 100;
}

/**
 * Ajusta o tamanho da fonte do documento.
 * @param {number} change Valor de mudança (positivo para aumentar, negativo para diminuir).
 */
export function adjustFontSize(change) {
    playSound('click'); // Feedback sonoro
    let currentPercent = getCurrentHtmlFontSizePercent();
    let newPercent = currentPercent + change;

    newPercent = Math.max(MIN_HTML_FONT_PERCENT, Math.min(newPercent, MAX_HTML_FONT_PERCENT));

    htmlElement.style.fontSize = `${newPercent}%`;
    localStorageManager('fontSize', newPercent); // Salva a preferência de fonte
}

/**
 * Lê o conteúdo visível da página em voz alta.
 * @param {HTMLElement} contentContainer O elemento que contém o conteúdo principal a ser lido.
 * @param {HTMLElement} readButton O botão de leitura para atualizar seu ícone.
 */
export function readPageContent(contentContainer, readButton) {
    if (!synth) {
        console.warn("Web Speech API (SpeechSynthesis) não é suportada neste navegador.");
        alert("A leitura em voz alta não é suportada no seu navegador.");
        readButton.style.display = 'none'; // Oculta o botão se a API não for suportada
        return;
    }

    if (isSpeaking) {
        synth.cancel(); // Para a fala atual
        return;
    }

    if (!contentContainer) {
        console.error("Container de conteúdo para leitura não encontrado.");
        return;
    }

    let textToRead = "";
    // Seletores de elementos que devem ser lidos, excluindo scripts, estilos e elementos ocultos
    const selectorsToRead = 'h1, h2, h3, h4, h5, h6, p, li, strong, span.sentence-emoji + span, .card-base-title, .card-base-description, .highlight-box-base p, .interactive-summary strong, .interactive-content p';

    // Coleta o texto de todos os elementos visíveis e relevantes dentro do container
    Array.from(contentContainer.querySelectorAll(selectorsToRead)).forEach(el => {
        // Verifica se o elemento ou seu pai imediato não está oculto por `display: none` ou `visibility: hidden`
        const style = window.getComputedStyle(el);
        const parentStyle = el.parentElement ? window.getComputedStyle(el.parentElement) : null;

        if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' &&
            style.display !== 'none' && style.visibility !== 'hidden' &&
            (!parentStyle || (parentStyle.display !== 'none' && parentStyle.visibility !== 'hidden'))) {
            
            // Substitui <br> por espaço para leitura contínua e remove espaços extras
            textToRead += el.textContent.replace(/<br\s*\/?>/gi, ' ').trim() + ". ";
        }
    });

    if (textToRead.trim() === "") {
        console.warn("Nenhum texto principal encontrado para leitura na seção atual.");
        alert("Nenhum texto principal encontrado para ler nesta seção.");
        return;
    }

    currentUtterance = new SpeechSynthesisUtterance(textToRead.replace(/\s+/g, ' ').trim());
    currentUtterance.lang = 'pt-BR'; // Define o idioma para português do Brasil

    currentUtterance.onstart = () => {
        isSpeaking = true;
        readButton.innerHTML = '<i class="fas fa-stop-circle"></i>'; // Ícone de parar
        readButton.setAttribute('aria-label', 'Parar leitura');
        readButton.title = 'Parar Leitura';
        playSound('transition'); // Feedback sonoro de início de leitura
    };

    currentUtterance.onend = () => {
        isSpeaking = false;
        readButton.innerHTML = '<i class="fas fa-volume-up"></i>'; // Ícone de ler
        readButton.setAttribute('aria-label', 'Ler página em voz alta');
        readButton.title = 'Ler Página';
        currentUtterance = null;
    };

    currentUtterance.onerror = (event) => {
        console.error('Erro na síntese de voz:', event.error);
        isSpeaking = false;
        readButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        readButton.setAttribute('aria-label', 'Ler página em voz alta');
        readButton.title = 'Ler Página';
        alert("Ocorreu um erro ao tentar ler a página. Por favor, tente novamente.");
        currentUtterance = null;
    };

    synth.speak(currentUtterance);
}

/**
 * Inicializa os controles de acessibilidade.
 * @param {string} increaseFontBtnId ID do botão para aumentar a fonte.
 * @param {string} decreaseFontBtnId ID do botão para diminuir a fonte.
 * @param {string} readPageBtnId ID do botão para ler a página.
 * @param {string} contentToReadContainerId ID do contêiner principal de onde o texto será lido.
 */
export function initializeAccessibilityControls(increaseFontBtnId, decreaseFontBtnId, readPageBtnId, contentToReadContainerId) {
    const increaseFontBtn = document.getElementById(increaseFontBtnId);
    const decreaseFontBtn = document.getElementById(decreaseFontBtnId);
    const readPageBtn = document.getElementById(readPageBtnId);
    const contentToReadContainer = document.getElementById(contentToReadContainerId);

    // Carrega o tamanho da fonte salvo
    const savedFontSize = localStorageManager('fontSize');
    if (savedFontSize) {
        htmlElement.style.fontSize = `${savedFontSize}%`;
    }

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => adjustFontSize(FONT_STEP_PERCENT));
    }
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => adjustFontSize(-FONT_STEP_PERCENT));
    }

    if (readPageBtn) {
        if (!synth) {
            readPageBtn.style.display = 'none'; // Oculta se a API não for suportada
        } else {
            readPageBtn.addEventListener('click', () => {
                readPageContent(contentToReadContainer, readPageBtn);
            });
        }
    }
}