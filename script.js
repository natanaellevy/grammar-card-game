const allCards = Array.from(document.querySelectorAll(".card"));
const slots = document.querySelectorAll(".slot");
const mesa = document.getElementById("mesa");
const statusText = document.getElementById("status-text");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");

// 1. Banco de Frases (O "gabarito")
const frasesDesafio = [
    { 
        texto: "I EAT APPLE", 
        sujeito: { palavra: "I", trans: "Eu" }, 
        verbo: { palavra: "EAT", trans: "Como" }, 
        objeto: { palavra: "APPLE", trans: "Maçã" } 
    },
    { 
        texto: "I LIKE MILK", 
        sujeito: { palavra: "I", trans: "Eu" }, 
        verbo: { palavra: "LIKE", trans: "Gosto de" }, 
        objeto: { palavra: "MILK", trans: "Leite" } 
    },
    { 
        texto: "YOU EAT APPLE", 
        sujeito: { palavra: "YOU", trans: "Você" }, 
        verbo: { palavra: "EAT", trans: "Come" }, 
        objeto: { palavra: "APPLE", trans: "Maçã" } 
    },
    { 
        texto: "YOU LIKE MILK", 
        sujeito: { palavra: "YOU", trans: "Você" }, 
        verbo: { palavra: "LIKE", trans: "Gosta de" }, 
        objeto: { palavra: "MILK", trans: "Leite" } 
    },
    { 
        texto: "HE EATS APPLE",
        sujeito: { palavra: "HE", trans: "Ele" }, 
        verbo: { palavra: "EATS", trans: "Come" }, 
        objeto: { palavra: "APPLE", trans: "Maçã" } 
    },
    { 
        texto: "HE LIKES MILK",
        sujeito: { palavra: "HE", trans: "Ele" }, 
        verbo: { palavra: "LIKES", trans: "Gosta de" }, 
        objeto: { palavra: "MILK", trans: "Leite" } 
    },
    { 
        texto: "SHE EATS APPLE",
        sujeito: { palavra: "SHE", trans: "Ela" }, 
        verbo: { palavra: "EATS", trans: "Come" }, 
        objeto: { palavra: "APPLE", trans: "Maçã" } 
    },
    { 
        texto: "SHE LIKES MILK",
        sujeito: { palavra: "SHE", trans: "Ela" }, 
        verbo: { palavra: "LIKES", trans: "Gosta de" }, 
        objeto: { palavra: "MILK", trans: "Leite" } 
    }
];

let fraseAtual = {};
let cartasRodada = [];

// Função para iniciar um novo desafio
function novoDesafio() {
    // Escolhe uma frase aleatória
    const indice = Math.floor(Math.random() * frasesDesafio.length);
    fraseAtual = frasesDesafio[indice];

    // Atualiza a barra de status
    statusText.innerText = `Monte a frase: ${fraseAtual.texto}`;
    statusText.style.color = "#333";

    // Mostra só o botão de verificar, esconde o de nova frase
    checkBtn.style.display = "inline-block";
    resetBtn.style.display = "none";

    // Determina as palavras corretas da rodada
    const corretas = [fraseAtual.sujeito.palavra, fraseAtual.verbo.palavra, fraseAtual.objeto.palavra];
    // Filtra as cartas corretas
    const cartasCorretas = allCards.filter(card => corretas.includes(card.dataset.word));
    // Filtra as cartas erradas
    const cartasErradas = allCards.filter(card => !corretas.includes(card.dataset.word));
    // Escolhe uma carta errada aleatória
    let cartaErrada = null;
    if (cartasErradas.length > 0) {
        cartaErrada = cartasErradas[Math.floor(Math.random() * cartasErradas.length)];
    }
    // Junta as cartas da rodada
    cartasRodada = [...cartasCorretas];
    if (cartaErrada) cartasRodada.push(cartaErrada);

    // Embaralha as cartas da rodada
    cartasRodada = cartasRodada.sort(() => Math.random() - 0.5);

    // Esconde todas as cartas e reseta o verso
    allCards.forEach(card => {
        card.style.display = "none";
        card.classList.remove("is-flipped");
        // Limpa feedback do verso
        const back = card.querySelector('.card-back');
        if (back) {
            back.innerHTML = "";
            back.className = "card-back";
        }
    });
    // Mostra e reseta apenas as cartas da rodada
    cartasRodada.forEach(card => {
        card.style.display = "block";
        card.classList.remove("is-flipped");
        mesa.appendChild(card);
    });

    // Garante que os slots estejam vazios e placeholders visíveis
    slots.forEach(slot => {
        const card = slot.querySelector('.card');
        if (card) mesa.appendChild(card);
        // Mostra o placeholder
        const placeholder = slot.querySelector('.placeholder');
        if (placeholder) placeholder.style.display = "inline";
    });
}

// Inicia o primeiro desafio ao carregar a página
window.onload = novoDesafio;

// --- FUNÇÕES DE ÁUDIO E DRAG/DROP (Mantêm-se as mesmas do código anterior) ---
function falar(texto) {
    const msg = new SpeechSynthesisUtterance();
    msg.text = texto;
    msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
}


// Drag & Drop: permite tirar carta do slot e voltar para a mesa
allCards.forEach(card => {
    card.addEventListener("dragstart", e => {
        card.classList.remove("is-flipped");
        e.dataTransfer.setData("text", card.id);
        // Marca origem
        e.dataTransfer.setData("from-slot", card.parentElement.classList.contains("slot") ? "1" : "0");
    });
});

// Permite soltar carta nos slots
slots.forEach(slot => {
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("drop", e => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text");
        const card = document.getElementById(cardId);
        if (card) {
            // Se já tem carta, devolve para a mesa desvirada e mostra placeholder
            const existente = slot.querySelector(".card");
            if (existente) {
                existente.classList.remove("is-flipped"); // <--- GARANTE QUE DESVIRE
                mesa.appendChild(existente);
                const placeholderOrigem = slot.querySelector('.placeholder');
                if (placeholderOrigem) placeholderOrigem.style.display = "inline";
            }
            
            const parent = card.parentElement;
            if (parent.classList.contains("slot")) {
                const placeholderOrigem = parent.querySelector('.placeholder');
                if (placeholderOrigem) placeholderOrigem.style.display = "inline";
            }
            slot.appendChild(card);
            const placeholder = slot.querySelector('.placeholder');
            if (placeholder) placeholder.style.display = "none";
            falar(card.querySelector("p").innerText);
        }
    });
});

// Permite soltar carta de volta na mesa
mesa.addEventListener("dragover", e => e.preventDefault());
mesa.addEventListener("drop", e => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text");
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.remove("is-flipped"); // <--- GARANTE QUE DESVIRE AO CAIR NA MESA
        
        const parent = card.parentElement;
        if (parent.classList.contains("slot")) {
            const placeholder = parent.querySelector('.placeholder');
            if (placeholder) placeholder.style.display = "inline";
        }
        mesa.appendChild(card);
    }
});

resetBtn.addEventListener("click", novoDesafio);

// Função para mostrar a dica do personagem
function mostrarDica(mensagem) {
    const hintArea = document.getElementById("hint-character");
    const bubble = document.getElementById("speech-bubble");
    
    bubble.innerText = mensagem;
    hintArea.style.display = "flex";

    // Esconde a dica automaticamente após 4 segundos
    setTimeout(() => {
        hintArea.style.display = "none";
    }, 4000);
}

// ÚNICO event listener correto para o botão VERIFICAR
checkBtn.addEventListener("click", () => {
    let acertos = 0;
    let preenchidos = 0;

    // Primeiro, verifica se todos os slots têm cartas
    slots.forEach(slot => {
        if (slot.querySelector(".card")) preenchidos++;
    });

    if (preenchidos < 3) {
        mostrarDica("Opa! Você precisa preencher todos os espaços antes de verificar!");
        return;
    }

    // Se estiver tudo preenchido, segue a lógica normal de conferir
    slots.forEach(slot => {
        const card = slot.querySelector(".card");
        const tipo = slot.dataset.expected;
        const palavraNaCarta = card.querySelector("p").innerText;
        const back = card.querySelector(".card-back");
        const gabarito = fraseAtual[tipo];

        if (palavraNaCarta === gabarito.palavra) {
            // ACERTO
            back.innerHTML = `${gabarito.trans}`;
            back.className = "card-back back-correct";
            card.classList.add("is-flipped");
            acertos++;
        } else {
            // ERRO
            back.innerHTML = `<b>Try Again!</b>`;
            back.className = "card-back back-wrong";
            card.classList.add("is-flipped");

            // NOVA LÓGICA: Espera 2 segundos, desvira e volta pra mesa
            setTimeout(() => {
                // Verifica se a carta ainda está no slot (o usuário pode ter puxado antes do tempo acabar)
                if (slot.contains(card)) {
                    card.classList.remove("is-flipped"); // Desvira
                    mesa.appendChild(card); // Joga de volta pra mesa
                    
                    // Mostra o placeholder do slot novamente
                    const placeholder = slot.querySelector('.placeholder');
                    if (placeholder) placeholder.style.display = "inline";
                }
            }, 2000); // 2000 milissegundos = 2 segundos
        }
    });

    if (acertos === 3) {
        statusText.innerText = "Parabéns! Você completou a frase!";
        statusText.style.color = "#2ecc71";
        checkBtn.style.display = "none";
        resetBtn.style.display = "inline-block";
    } else {
        setTimeout(() => {
            mostrarDica("Quase lá! Olhe bem para o significado das cartas que você errou.");
        }, 1000);
    }
});

// Exemplo de como o navegador salvaria o progresso
let progressoUsuario = {
    faseAtual: 1,
    estrelas: {
        fase1: 3,
        fase2: 0,
        fase3: 0
    }
};

// Para salvar:
localStorage.setItem('grammarCardsProgresso', JSON.stringify(progressoUsuario));

// Para ler quando o jogo abrir:
const salvo = JSON.parse(localStorage.getItem('grammarCardsProgresso'));