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
        texto: "YOU LIKE MILK", 
        sujeito: { palavra: "YOU", trans: "Você" }, 
        verbo: { palavra: "LIKE", trans: "Gosta de" }, 
        objeto: { palavra: "MILK", trans: "Leite" } 
    },
    { 
        texto: "HE EAT APPLE", // Exemplo de mudança gramatical
        sujeito: { palavra: "HE", trans: "Ele" }, 
        verbo: { palavra: "EAT", trans: "Come" }, 
        objeto: { palavra: "APPLE", trans: "Maçã" } 
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

    // Esconde todas as cartas
    allCards.forEach(card => {
        card.style.display = "none";
        card.classList.remove("is-flipped");
    });
    // Mostra e reseta apenas as cartas da rodada
    cartasRodada.forEach(card => {
        card.style.display = "block";
        card.classList.remove("is-flipped");
        mesa.appendChild(card);
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

allCards.forEach(card => {
    card.addEventListener("dragstart", e => {
        card.classList.remove("is-flipped");
        e.dataTransfer.setData("text", card.id);
    });
});

slots.forEach(slot => {
    slot.addEventListener("dragover", e => e.preventDefault());
    slot.addEventListener("drop", e => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text");
        const card = document.getElementById(cardId);
        if (card) {
            const existente = slot.querySelector(".card");
            if (existente) mesa.appendChild(existente);
            slot.appendChild(card);
            falar(card.querySelector("p").innerText);
        }
    });
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
            back.innerHTML = `<b>Very Good!</b><br>${gabarito.trans}`;
            back.className = "card-back back-correct";
            acertos++;
        } else {
            back.innerHTML = `<b>Try Again!</b>`;
            back.className = "card-back back-wrong";
        }
        card.classList.add("is-flipped");
    });

    if (acertos === 3) {
        statusText.innerText = "Parabéns! Você completou a frase!";
        statusText.style.color = "#2ecc71";
        // Esconde o botão de verificar e mostra o de nova frase
        checkBtn.style.display = "none";
        resetBtn.style.display = "inline-block";
    } else {
        setTimeout(() => {
            mostrarDica("Quase lá! Olhe bem para o significado das cartas que você errou.");
        }, 1000);
    }
});