// src/assets/js/utils.js

import * as Tone from 'tone'; // Importa a biblioteca Tone.js

// Instância única do sintetizador Tone.js
let synth = null;
let audioContextStarted = false;

/**
 * Inicializa o contexto de áudio do Tone.js e o sintetizador.
 * Deve ser chamado após a primeira interação do usuário para compatibilidade com navegadores.
 */
async function initializeAudio() {
    if (!audioContextStarted) {
        try {
            await Tone.start();
            synth = new Tone.Synth({
                oscillator: { type: "sine" },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.05,
                    release: 0.5
                }
            }).toDestination();
            audioContextStarted = true;
            console.log("Tone.js audio context started and synth initialized.");
        } catch (error) {
            console.error("Failed to start Tone.js audio context:", error);
        }
    }
}

/**
 * Reproduz um efeito sonoro específico.
 * Garante que o contexto de áudio seja iniciado.
 * @param {string} type O tipo de som a ser reproduzido ('click', 'success', 'error', 'transition', etc.).
 */
export async function playSound(type) {
    if (!audioContextStarted) {
        await initializeAudio(); // Tenta inicializar se ainda não o fez
        if (!audioContextStarted) { // Se falhou em inicializar, não pode tocar som
            console.warn("Audio context not started, cannot play sound.");
            return;
        }
    }

    if (synth) {
        switch (type) {
            case 'click':
                synth.triggerAttackRelease("C5", "64n"); // Som de clique curto e agudo
                break;
            case 'success':
                synth.triggerAttackRelease("G4", "8n"); // Som de sucesso
                break;
            case 'error':
                synth.triggerAttackRelease("C#3", "8n"); // Som de erro
                break;
            case 'transition':
                synth.triggerAttackRelease("E4", "16n"); // Som de transição suave
                break;
            case 'hover':
                synth.triggerAttackRelease("C4", "128n"); // Som sutil para hover
                break;
            case 'vibration-soft':
                synth.triggerAttackRelease("C2", "64n"); // Vibração sutil
                break;
            case 'vibration-medium':
                synth.triggerAttackRelease("C1", "32n"); // Vibração média
                break;
            default:
                synth.triggerAttackRelease("C4", "32n"); // Som padrão
        }
    }
}

/**
 * Manipula dados no localStorage.
 * @param {string} key A chave do item no localStorage.
 * @param {any} value O valor a ser salvo (se houver). Se for null, o item é removido.
 * @returns {any|null} O valor lido, ou null se não encontrado ou erro.
 */
export function localStorageManager(key, value = undefined) {
    try {
        if (value === undefined) {
            // Ler item
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } else if (value === null) {
            // Remover item
            localStorage.removeItem(key);
            console.log(`Item '${key}' removido do localStorage.`);
            return null;
        } else {
            // Salvar item
            localStorage.setItem(key, JSON.stringify(value));
            console.log(`Item '${key}' salvo no localStorage.`);
            return value;
        }
    } catch (e) {
        console.error(`Erro ao acessar localStorage para a chave '${key}':`, e);
        return null;
    }
}

/**
 * Obtém um emoji único de um pool, reciclando se necessário.
 * Garante que emojis não se repitam imediatamente.
 * @param {Array<string>} emojiPool O array de emojis disponíveis.
 * @param {Array<string>} usedEmojis O array de emojis usados recentemente (para evitar repetição).
 * @returns {string} Um emoji único.
 */
export function getUniqueEmoji(emojiPool, usedEmojis) {
    if (!emojiPool || emojiPool.length === 0) return '✨'; // Fallback
    
    if (emojiPool.length === usedEmojis.length) {
        usedEmojis.length = 0; // Resetar se todos os emojis foram usados
    }

    let emoji;
    do {
        emoji = emojiPool[Math.floor(Math.random() * emojiPool.length)];
    } while (usedEmojis.includes(emoji));

    usedEmojis.push(emoji);
    // Manter o array de usados com um tamanho razoável para evitar esgotamento em pools pequenos
    if (usedEmojis.length > emojiPool.length / 2 && emojiPool.length > 5) {
        usedEmojis.shift(); // Remove o mais antigo
    }
    return emoji;
}

// Inicializa a escuta para o clique em qualquer lugar para ativar o áudio
document.documentElement.addEventListener('click', () => {
    initializeAudio();
}, { once: true }); // Executa apenas uma vez