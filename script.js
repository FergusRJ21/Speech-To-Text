// Aguarda o carregamento completo do HTML antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURAÇÃO INICIAL E VARIÁVEIS ---

    // Tenta obter a API de reconhecimento de voz do navegador (padrão ou webkit para Chrome/Edge)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Se o navegador não suportar reconhecimento de voz, avisa o utilizador e para o código
    if (!SpeechRecognition) {
        alert("O seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.");
        return; 
    }

    // Cria uma nova instância do reconhecimento de voz
    const recognition = new SpeechRecognition();

    // Seleciona os elementos do HTML que vamos manipular
    const languageSelect = document.getElementById('language'); // O menu de idiomas
    const resultContainer = document.querySelector('.result p.resultText'); // Onde o texto aparece
    const startListeningButton = document.querySelector('.btn.record'); // Botão de gravar
    const recordButtonText = document.querySelector('.btn.record p'); // Texto do botão de gravar
    const clearButton = document.querySelector('.btn.clear'); // Botão de limpar
    const downloadButton = document.querySelector('.btn.download'); // Botão de download

    // Variável de controle para saber se está a gravar ou não
    let recognizing = false;

    // --- 2. POPULAR O MENU DE IDIOMAS ---

    // Percorre a lista de idiomas (vinda do arquivo languages.js)
    languages.forEach(language => {
        const option = document.createElement('option'); // Cria um item de lista <option>
        option.value = language.code; // Define o valor interno (ex: 'en', 'pt')
        option.text = language.name;  // Define o texto visível (ex: 'English', 'Portuguese')
        languageSelect.add(option);   // Adiciona ao menu
    });

    // --- 3. CONFIGURAÇÕES DO RECONHECIMENTO ---

    recognition.continuous = true; // Permite que continue a ouvir mesmo após pausas longas
    recognition.interimResults = true; // Mostra os resultados enquanto ainda estás a falar (em tempo real)
    recognition.lang = languageSelect.value; // Define o idioma inicial com base no menu

    // --- 4. EVENTOS (CLIQUES E MUDANÇAS) ---

    // Quando o utilizador muda o idioma no menu
    languageSelect.addEventListener('change', () => {
        recognition.lang = languageSelect.value; // Atualiza o idioma do reconhecimento
    });

    // Quando clica no botão de começar/parar
    startListeningButton.addEventListener('click', toggleSpeechRecognition);

    // Quando clica no botão de limpar
    clearButton.addEventListener('click', clearResults);

    // Começa com o botão de download desativado
    downloadButton.disabled = true;

    // --- 5. FUNÇÕES PRINCIPAIS DO RECONHECIMENTO ---

    // Evento disparado sempre que o navegador deteta fala
    recognition.onresult = (event) => {
        // Transforma a lista de resultados num Array e junta tudo numa única string de texto
        // Isso garante que frases anteriores não sejam apagadas enquanto falas novas frases
        const result = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        resultContainer.textContent = result; // Mostra o texto no ecrã
        downloadButton.disabled = false; // Ativa o botão de download pois já existe texto
    };

    // Evento disparado se houver um erro (ex: microfone não permitido)
    recognition.onerror = (event) => {
        console.error("Erro no reconhecimento de fala:", event.error);
        stopRecordingUI(); // Para a animação do botão se der erro
    };

    // Evento disparado quando o reconhecimento para sozinho (ou é parado)
    recognition.onend = () => {
        stopRecordingUI(); // Atualiza a interface gráfica
    };

    // Evento para descarregar o ficheiro
    downloadButton.addEventListener('click', downloadResult);

    // --- 6. FUNÇÕES AUXILIARES ---

    // Função que alterna entre começar e parar a gravação
    function toggleSpeechRecognition() {
        if (recognizing) {
            recognition.stop(); // Se estava a gravar, para.
        } else {
            recognition.start(); // Se estava parado, começa.
        }

        recognizing = !recognizing; // Inverte o estado da variável (true vira false e vice-versa)
        
        // Alterna a classe visual do botão (para mostrar a animação de carregamento)
        startListeningButton.classList.toggle('recording', recognizing);
        
        // Muda o texto do botão
        recordButtonText.textContent = recognizing ? 'Stop Listening' : 'Start Listening';
    }

    // Função apenas para resetar a interface visual do botão
    function stopRecordingUI() {
        recognizing = false;
        startListeningButton.classList.remove('recording');
        recordButtonText.textContent = 'Start Listening';
    }

    // Função para limpar o texto
    function clearResults() {
        resultContainer.textContent = '';
        downloadButton.disabled = true;
    }

    // Função para criar e baixar o arquivo de texto
    function downloadResult() {
        const resultText = resultContainer.textContent;

        // Cria um "blob" (objeto tipo ficheiro) com o conteúdo de texto
        const blob = new Blob([resultText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob); // Cria uma URL temporária para esse blob

        const a = document.createElement('a'); // Cria um link invisível <a>
        a.href = url;
        a.download = 'Your-Text.txt'; // Nome do ficheiro a ser baixado
        a.style.display = 'none';

        document.body.appendChild(a); // Adiciona o link ao corpo da página
        a.click(); // Simula um clique no link para iniciar o download

        document.body.removeChild(a); // Remove o link
        URL.revokeObjectURL(url); // Limpa a memória da URL temporária
    }

});