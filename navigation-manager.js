// src/assets/js/navigation-manager.js

import { playSound } from './utils.js'; // Importa a função playSound para feedback sonoro

/**
 * Mapeia os IDs das seções para facilitar o gerenciamento de visibilidade.
 * Adicione todos os IDs de seções principais do seu HTML aqui.
 * Exemplo: 'capa-section', 'menu-principal-section', 'manual-pitstop-detalhes-section', etc.
 * Certifique-se de que cada seção tenha um ID único no HTML.
 */
const sectionIds = [
    'capa-section',
    'menu-principal-section',
    'manual-pitstop-detalhes-section',
    'placeholder-content-section', // Esta é a seção genérica para exibir conteúdo de módulos
    'jornada-cliente-aa-content-section',
    'inbound30-content-main', // Jornadas específicas
    'outbound30-content-main',
    'inbound60-content-main',
    'outbound60-content-main',
    'inbound90-content-main',
    'outbound90-content-main',
    'playbook-sec-1-content-main', // MODULO_1_PISTA_DECOLAGEM
    'playbook-sec-arremaq-content-main', // MODULO_3_FORCA_BRUTA
    'playbook-sec-2-content-main', // MODULO_4_CAMPEOES (ICP/Personas)
    'playbook-sec-7-content-main', // MODULO_7_COMUNICACAO
    'playbook-sec-8-content-main', // MODULO_8_GLOSSARIO
    'playbook-sec-9-content-main', // MODULO_9_EVOLUCAO_CONTINUA
    'playbook-sec-10-content-main', // MODULO_10_CENTRAL_COMANDO
    'playbook-sec-11-content-main', // MODULO_11_DESAFIO_CAMPEOES
    'box-identidade-content-section', // MODULO_12_BOX_IDENTIDADE
    'academia-repassadores-content-section', // MODULO_13_ACADEMIA_REPASSADORES
    'training-center-content-section', // Sub-seção de IA
    'ai-tool-interaction-section', // Sub-seção de ferramenta IA
    // Adicione aqui IDs para as seções de ferramentas de IA específicas (ex: gemini-tools-section)
    'gemini-tools-section',
    'openai-tools-section',
    'jira-tools-section',
    'slack-tools-section',
    'google-tools-section',
    'hubspot-tools-section',
    'apollo-tools-section',
    // ... e qualquer outra seção principal que precise ser gerenciada
];

/**
 * Oculta todas as seções conhecidas e exibe apenas a seção desejada.
 * Rola a página para o topo e refresca o AOS para novas animações.
 * @param {string} sectionId O ID da seção HTML a ser exibida.
 * @param {object} [params={}] Parâmetros opcionais para passar para a seção (ainda não implementado, mas para futuras expansões).
 */
export function showSection(sectionId, params = {}) {
    playSound('transition'); // Feedback sonoro de transição

    // Oculta todas as seções listadas
    sectionIds.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.classList.add('hidden');
        }
    });

    // Exibe a seção alvo
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Rolagem suave para o topo
        
        // Se a biblioteca AOS estiver disponível, refresque-a para garantir novas animações
        if (window.AOS) {
            window.AOS.refreshHard();
        }
        console.log(`Navegando para a seção: ${sectionId}`, params);

        // Dispara um evento personalizado para a seção recém-exibida, se necessário
        const event = new CustomEvent('sectionShown', { detail: { sectionId, params } });
        document.dispatchEvent(event);
    } else {
        console.error(`Seção com ID '${sectionId}' não encontrada.`);
        // Feedback visual ou sonoro de erro, se desejar
        // playSound('error');
    }
}

/**
 * Inicializa os event listeners para os botões de navegação.
 * Os botões devem ter a classe 'navigate-to-section' e um atributo 'data-target-id'.
 * Opcionalmente, 'data-params' para JSON de parâmetros.
 */
export function initializeNavigation() {
    // Botões que navegam para uma seção específica via data-target-id
    document.querySelectorAll('.navigate-to-section').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-target-id');
            const paramsAttr = e.currentTarget.getAttribute('data-params');
            let params = {};
            if (paramsAttr) {
                try {
                    params = JSON.parse(paramsAttr);
                } catch (error) {
                    console.error('Erro ao parsear parâmetros do botão de navegação:', error);
                }
            }
            if (targetId) {
                showSection(targetId, params);
            }
        });
    });

    // Botões "Voltar ao Menu Principal" (pode ter classe específica)
    document.querySelectorAll('.back-to-menu-principal').forEach(button => {
        button.addEventListener('click', () => {
            showSection('menu-principal-section'); // Assumindo 'menu-principal-section' é o ID
        });
    });

    // Botões "Voltar aos Módulos" ou "Voltar ao Índice da Trilha"
    document.querySelectorAll('.back-to-manual-pitstop-detalhes').forEach(button => {
        button.addEventListener('click', () => {
            showSection('manual-pitstop-detalhes-section'); // Assumindo 'manual-pitstop-detalhes-section' é o ID
        });
    });

    // Botões de navegação sequencial (prev/next) dentro de módulos
    // Requer que os botões tenham classes como 'btn-nav-playbook-prev' e 'btn-nav-playbook-next'
    // e que a lógica de qual é a "próxima" ou "anterior" seção seja definida
    // por um script no próprio módulo ou em uma lógica centralizada.
    // Por enquanto, apenas logs de clique para prev/next. A lógica de transição
    // entre módulos será adicionada ao final.
    document.querySelectorAll('.btn-nav-playbook-prev').forEach(button => {
        button.addEventListener('click', () => {
            playSound('transition');
            console.log('Botão Anterior clicado. Lógica de navegação sequencial a ser implementada.');
        });
    });

    document.querySelectorAll('.btn-nav-playbook-next').forEach(button => {
        button.addEventListener('click', () => {
            playSound('transition');
            console.log('Botão Próximo clicado. Lógica de navegação sequencial a ser implementada.');
        });
    });
}