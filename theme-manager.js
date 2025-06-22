// src/assets/js/theme-manager.js

import { localStorageManager } from './utils.js'; // Importa a função de gerenciamento de localStorage

// Referência ao elemento HTML raiz
const htmlElement = document.documentElement;

// Ícones para o botão de alternância de tema
const moonIcon = '<i class="fas fa-moon"></i>';
const sunIcon = '<i class="fas fa-sun"></i>';

/**
 * Aplica o tema (claro ou escuro) ao documento HTML.
 * Atualiza o atributo 'data-theme' do html e o ícone do botão de alternância.
 * @param {string} theme O tema a ser aplicado ('light' ou 'dark').
 * @param {HTMLElement} [toggleButton=null] Opcional: o botão de alternância de tema para atualizar o ícone.
 */
export function applyTheme(theme, toggleButton = null) {
    htmlElement.setAttribute('data-theme', theme);

    if (toggleButton) {
        toggleButton.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    }
    // Adiciona uma classe para transições visuais suaves do body no tema
    document.body.classList.add('theme-transition-active');
    setTimeout(() => {
        document.body.classList.remove('theme-transition-active');
    }, 500); // Remove a classe após a duração da transição CSS
}

/**
 * Inicializa o gerenciador de temas.
 * Carrega o tema salvo no localStorage ou detecta a preferência do sistema.
 * Configura o event listener para o botão de alternância de tema.
 * @param {string} toggleButtonId O ID do botão HTML que alternará o tema.
 */
export function initializeThemeManager(toggleButtonId) {
    const themeToggleBtn = document.getElementById(toggleButtonId);

    // Carrega o tema salvo no localStorage
    let savedTheme = localStorageManager('theme');

    // Se não houver tema salvo, detecta a preferência do sistema
    if (!savedTheme) {
        savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Aplica o tema inicial
    applyTheme(savedTheme, themeToggleBtn);

    // Adiciona o event listener ao botão de alternância
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            applyTheme(newTheme, themeToggleBtn);
            localStorageManager('theme', newTheme); // Salva a nova preferência no localStorage
        });
    }
}