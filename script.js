// Importar o Firebase e o Firestore direto dos CDNs oficiais
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Sua nova configuração correta do Firebase (urban-burger-oficial)
const firebaseConfig = {
  apiKey: "AIzaSyAPcL9Zyw69MMdH7tVpQWl8cgpHMmEIZ40",
  authDomain: "urban-burger-oficial.firebaseapp.com",
  projectId: "urban-burger-oficial",
  storageBucket: "urban-burger-oficial.firebasestorage.app",
  messagingSenderId: "68399583725",
  appId: "1:68399583725:web:d271f512225c00a87117e4"
};

// Inicializar o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrinho = [];
const TAXA_ENTREGA = 5.00;
let produtoSelecionadoTemp = null;

let contagemExtras = {
    bacon: 0,
    cheddar: 0,
    cebola: 0,
    ovo: 0,
    carne: 0
};

const precosExtras = {
    bacon: 5.00,
    cheddar: 4.00,
    cebola: 3.00,
    ovo: 3.00,
    carne: 10.00
};

const nomesExtras = {
    bacon: 'Bacon Crocante',
    cheddar: 'Cheddar Extra',
    cebola: 'Cebola Caramelizada',
    ovo: 'Ovo',
    carne: 'Carne 160g Extra'
};

// GESTÃO DE CONTAS E AUTENTICAÇÃO
const abrirLoginBtn = document.getElementById('abrirLoginBtn');
const modalLogin = document.getElementById('modalLogin');
const overlayLogin = document.getElementById('overlayLogin');
const fecharLoginBtn = document.getElementById('fecharLoginBtn');
const linkCadastrar = document.getElementById('linkCadastrar');
const tituloModalLogin = document.getElementById('tituloModalLogin');
const formLogin = document.getElementById('formLogin');
const mensagemErroLogin = document.getElementById('mensagemErroLogin');
const abrirHistoricoBtn = document.getElementById('abrirHistoricoBtn');
const gavetaHistorico = document.getElementById('gavetaHistorico');
const fecharHistoricoBtn = document.getElementById('fecharHistoricoBtn');
let modoCadastro = false;

function obterContasCadastradas() {
    return JSON.parse(localStorage.getItem('urban_burger_contas')) || [];
}

function salvarContasCadastradas(contas) {
    localStorage.setItem('urban_burger_contas', JSON.stringify(contas));
}

document.addEventListener('DOMContentLoaded', () => {
    verificarEstadoLogin();
});

function verificarEstadoLogin() {
    const usuarioLogado = localStorage.getItem('urban_burger_logado');
    if (usuarioLogado) {
        abrirLoginBtn.innerText = `Olá, ${usuarioLogado.split('@')[0]}`;
        abrirHistoricoBtn.style.display = 'inline-block';
        carregarHistoricoLateral(usuarioLogado);
    } else {
        abrirLoginBtn.innerText = 'Entrar / Cadastrar';
        abrirHistoricoBtn.style.display = 'none';
        fecharHistorico();
    }
}

abrirHistoricoBtn.addEventListener('click', () => {
    gavetaHistorico.classList.add('aberto');
    overlayCarrinho.classList.add('ativo');
});

function fecharHistorico() {
    gavetaHistorico.classList.remove('aberto');
    if (!gavetaCarrinho.classList.contains('aberto')) {
        overlayCarrinho.classList.remove('ativo');
    }
}

fecharHistoricoBtn.addEventListener('click', fecharHistorico);

// Se já estiver logado, pergunta se deseja sair. Se não estiver, abre o modal de login.
abrirLoginBtn.addEventListener('click', () => {
    const usuarioLogado = localStorage.getItem('urban_burger_logado');
    
    if (usuarioLogado) {
        const desejaSair = confirm(`Você está conectado como ${usuarioLogado}. Deseja sair da sua conta?`);
        if (desejaSair) {
            localStorage.removeItem('urban_burger_logado');
            verificarEstadoLogin();
            alert('Você saiu da sua conta com sucesso.');
        }
    } else {
        mensagemErroLogin.style.display = 'none';
        modalLogin.classList.add('ativo');
        overlayLogin.classList.add('ativo');
    }
});

function fecharLoginModal() {
    modalLogin.classList.remove('ativo');
    overlayLogin.classList.remove('ativo');
    mensagemErroLogin.style.display = 'none';
}

fecharLoginBtn.addEventListener('click', fecharLoginModal);
overlayLogin.addEventListener('click', () => {
    fecharLoginModal();
    fecharCarrinho();
    fecharHistorico();
    fecharModal();
});

linkCadastrar.addEventListener('click', (e) => {
    e.preventDefault();
    modoCadastro = !modoCadastro;
    const botaoSubmit = formLogin.querySelector('button[type="submit"]');
    mensagemErroLogin.style.display = 'none';
    
    if (modoCadastro) {
        tituloModalLogin.innerText = "Criar Nova Conta";
        linkCadastrar.innerText = "Já tem conta? Faça login";
        botaoSubmit.innerText = "Cadastrar";
    } else {
        tituloModalLogin.innerText = "Entrar na sua Conta";
        linkCadastrar.innerText = "Cadastre-se";
        botaoSubmit.innerText = "Entrar";
    }
});

formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail').value.trim();
    const senhaInput = document.getElementById('loginSenha').value.trim();
    let contas = obterContasCadastradas();

    mensagemErroLogin.style.display = 'none';

    if (modoCadastro) {
        const contaExistente = contas.find(c => c.email === emailInput);
        if (contaExistente) {
            mensagemErroLogin.innerText = "Este e-mail já está cadastrado!";
            mensagemErroLogin.style.display = 'block';
            return;
        }

        contas.push({ email: emailInput, senha: senhaInput });
        salvarContasCadastradas(contas);
        alert(`Conta criada com sucesso para ${emailInput}! Faça seu login.`);
        
        modoCadastro = false;
        tituloModalLogin.innerText = "Entrar na sua Conta";
        linkCadastrar.innerText = "Cadastre-se";
        formLogin.querySelector('button[type="submit"]').innerText = "Entrar";
        formLogin.reset();
    } else {
        const contaEncontrada = contas.find(c => c.email === emailInput);

        if (!contaEncontrada) {
            mensagemErroLogin.innerText = "E-mail não cadastrado!";
            mensagemErroLogin.style.display = 'block';
            return;
        }

        if (contaEncontrada.senha !== senhaInput) {
            mensagemErroLogin.innerText = "Senha incorreta!";
            mensagemErroLogin.style.display = 'block';
            return;
        }

        localStorage.setItem('urban_burger_logado', emailInput);
        verificarEstadoLogin();
        fecharLoginModal();
        formLogin.reset();
    }
});

// CARRINHO E CUSTOMIZAÇÃO
const gavetaCarrinho = document.getElementById('gavetaCarrinho');
const overlayCarrinho = document.getElementById('overlayCarrinho');
const abrirCarrinhoBtn = document.getElementById('abrirCarrinhoBtn');
const fecharCarrinhoBtn = document.getElementById('fecharCarrinhoBtn');
const listaItensCarrinho = document.getElementById('listaItensCarrinho');
const contadorCarrinho = document.getElementById('contadorCarrinho');
const subtotalValor = document.getElementById('subtotalValor');
const totalValor = document.getElementById('totalValor');

const modalIngredientes = document.getElementById('modalIngredientes');
const overlayIngredientes = document.getElementById('overlayIngredientes');
const fecharModalIngredientes = document.getElementById('fecharModalIngredientes');
const modalProdutoNome = document.getElementById('modalProdutoNome');
const confirmarAdicaoBtn = document.getElementById('confirmarAdicaoBtn');

function abrirCarrinho() {
    gavetaCarrinho.classList.add('aberto');
    overlayCarrinho.classList.add('ativo');
}

function fecharCarrinho() {
    gavetaCarrinho.classList.remove('aberto');
    if (!gavetaHistorico.classList.contains('aberto')) {
        overlayCarrinho.classList.remove('ativo');
    }
}

abrirCarrinhoBtn.addEventListener('click', abrirCarrinho);
fecharCarrinhoBtn.addEventListener('click', fecharCarrinho);

document.querySelectorAll('.botao-produto').forEach(botao => {
    botao.addEventListener('click', function() {
        const nome = this.getAttribute('data-nome');
        const preco = parseFloat(this.getAttribute('data-preco'));

        produtoSelecionadoTemp = { nome, preco };
        modalProdutoNome.innerText = `Customizar: ${nome}`;

        for (let chave in contagemExtras) {
            contagemExtras[chave] = 0;
            document.getElementById(`qtd-${chave}`).innerText = 0;
        }

        modalIngredientes.classList.add('ativo');
        overlayIngredientes.classList.add('ativo');
    });
});

function fecharModal() {
    modalIngredientes.classList.remove('ativo');
    overlayIngredientes.classList.remove('ativo');
}

fecharModalIngredientes.addEventListener('click', fecharModal);

window.mudarExtra = function(tipo, delta) {
    let atual = contagemExtras[tipo] + delta;
    if (atual >= 0 && atual <= 10) {
        contagemExtras[tipo] = atual;
        document.getElementById(`qtd-${tipo}`).innerText = atual;
    }
}

confirmarAdicaoBtn.addEventListener('click', function() {
    if (!produtoSelecionadoTemp) return;

    let descricoesExtras = [];
    let precoTotalItem = produtoSelecionadoTemp.preco;

    for (let chave in contagemExtras) {
        let qtd = contagemExtras[chave];
        if (qtd > 0) {
            descricoesExtras.push(`${qtd}x ${nomesExtras[chave]}`);
            precoTotalItem += precosExtras[chave] * qtd;
        }
    }

    const chaveExtras = descricoesExtras.join(', ');
    const itemExistente = carrinho.find(item => item.nome === produtoSelecionadoTemp.nome && item.extras === chaveExtras);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            nome: produtoSelecionadoTemp.nome,
            preco: precoTotalItem,
            extras: chaveExtras,
            quantidade: 1
        });
    }

    fecharModal();
    atualizarCarrinho();
    abrirCarrinho();
});

window.alterarQuantidade = function(index, delta) {
    carrinho[index].quantidade += delta;
    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }
    atualizarCarrinho();
}

function atualizarCarrinho() {
    listaItensCarrinho.innerHTML = '';
    let subtotal = 0;
    let totalItens = 0;

    if (carrinho.length === 0) {
        listaItensCarrinho.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
    } else {
        carrinho.forEach((item, index) => {
            subtotal += item.preco * item.quantidade;
            totalItens += item.quantidade;

            const textoExtras = item.extras ? `<p>+ ${item.extras}</p>` : '';

            const div = document.createElement('div');
            div.className = 'item-carrinho';
            div.innerHTML = `
                <div class="item-carrinho-info">
                    <h4>${item.nome}</h4>
                    ${textoExtras}
                    <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="controles-qtd">
                    <button onclick="alterarQuantidade(${index}, -1)">-</button>
                    <span>${item.quantidade}</span>
                    <button onclick="alterarQuantidade(${index}, 1)">+</button>
                </div>
            `;
            listaItensCarrinho.appendChild(div);
        });
    }

    const totalFinal = carrinho.length > 0 ? subtotal + TAXA_ENTREGA : 0;

    contadorCarrinho.innerText = totalItens;
    subtotalValor.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    totalValor.innerText = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;
}

// CHECKOUT, SALVAMENTO NO FIRESTORE E INTEGRAÇÃO WHATSAPP
const clientePagamento = document.getElementById('clientePagamento');
const containerPix = document.getElementById('containerPix');
const containerCartao = document.getElementById('containerCartao');
const btnCopiarPix = document.getElementById('btnCopiarPix');

clientePagamento.addEventListener('change', function() {
    const valor = this.value;
    containerPix.style.display = 'none';
    containerCartao.style.display = 'none';

    if (valor === 'Pix (Online)') {
        containerPix.style.display = 'block';
    } else if (valor === 'Cartão de Crédito (Online)') {
        containerCartao.style.display = 'block';
    }
});

if (btnCopiarPix) {
    btnCopiarPix.addEventListener('click', function() {
        const chaveInput = document.getElementById('chavePixTexto');
        chaveInput.select();
        navigator.clipboard.writeText(chaveInput.value);
        this.innerText = 'Chave Pix Copiada! ✓';
        setTimeout(() => {
            this.innerText = 'Copiar Chave Pix';
        }, 2000);
    });
}

const formPedido = document.getElementById('formPedido');
const modalChat = document.getElementById('modalChat');
const fecharChatBtn = document.getElementById('fecharChatBtn');
const chatMensagens = document.getElementById('chatMensagens');
const numeroPedidoChat = document.getElementById('numeroPedidoChat');
const inputChatCliente = document.getElementById('inputChatCliente');
const enviarMsgChatBtn = document.getElementById('enviarMsgChatBtn');
const btnFlutuanteChat = document.getElementById('btnFlutuanteChat');

function adicionarMensagemChat(texto, remetente) {
    const div = document.createElement('div');
    div.className = `msg ${remetente}`;
    div.innerHTML = texto;
    chatMensagens.appendChild(div);
    chatMensagens.scrollTop = chatMensagens.scrollHeight;
}

formPedido.addEventListener('submit', async function(e) {
    e.preventDefault();

    const usuarioLogado = localStorage.getItem('urban_burger_logado');
    if (!usuarioLogado) {
        alert('Você precisa estar logado para finalizar o pedido!');
        modalLogin.classList.add('ativo');
        overlayLogin.classList.add('ativo');
        return;
    }

    if (carrinho.length === 0) {
        alert('Adicione pelo menos um item ao carrinho antes de finalizar!');
        return;
    }

    const nome = document.getElementById('clienteNome').value;
    const telefone = document.getElementById('clienteTelefone').value;
    const rua = document.getElementById('clienteRua').value;
    const numero = document.getElementById('clienteNumero').value;
    const bairro = document.getElementById('clienteBairro').value;
    const pagamento = document.getElementById('clientePagamento').value;
    const obs = document.getElementById('clienteObs').value || 'Nenhuma observação';

    let itensDoPedido = [...carrinho];
    let subtotal = 0;
    let resumoItens = '';
    let resumoItensTextoZap = '';
    
    carrinho.forEach(item => {
        const descExtras = item.extras ? ` (${item.extras})` : '';
        resumoItens += `• ${item.quantidade}x ${item.nome}${descExtras}<br>`;
        resumoItensTextoZap += `• ${item.quantidade}x ${item.nome}${descExtras}\n`;
        subtotal += item.preco * item.quantidade;
    });
    const total = subtotal + TAXA_ENTREGA;
    const numPedido = Math.floor(1000 + Math.random() * 9000);

    const dadosDoPedido = {
        id: numPedido,
        clienteEmail: usuarioLogado,
        nomeCliente: nome,
        telefone: telefone,
        endereco: `${rua}, Nº ${numero} - ${bairro}`,
        itens: itensDoPedido,
        subtotal: subtotal,
        taxaEntrega: TAXA_ENTREGA,
        total: total,
        pagamento: pagamento,
        observacao: obs,
        data: new Date().toISOString(),
        dataFormatada: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
    };

    // 1. Salvar no Firebase Firestore em nuvem
    try {
        await addDoc(collection(db, "pedidos"), dadosDoPedido);
        console.log("Pedido salvo no Firestore com sucesso!");
    } catch (erro) {
        console.error("Erro ao salvar pedido no Firebase: ", erro);
    }

    // 2. Salvar também localmente para o histórico rápido do usuário
    salvarPedidoNoHistorico(usuarioLogado, {
        id: numPedido,
        data: dadosDoPedido.dataFormatada,
        itens: itensDoPedido,
        total: total,
        pagamento: pagamento
    });

    numeroPedidoChat.innerText = numPedido;

    fecharCarrinho();
    chatMensagens.innerHTML = '';
    modalChat.classList.add('ativo');

    adicionarMensagemChat(`Olá, <strong>${nome}</strong>! Recebemos o seu pedido <strong>#${numPedido}</strong> aqui na chapa da URBAN BURGER! 🍔🔥`, 'atendente');

    setTimeout(() => {
        adicionarMensagemChat(
            `<strong>Resumo do Pedido:</strong><br>${resumoItens}<br>` +
            `<strong>Entrega:</strong> ${rua}, Nº ${numero} - ${bairro}<br>` +
            `<strong>Contato:</strong> ${telefone}<br>` +
            `<strong>Pagamento:</strong> ${pagamento} (Total: R$ ${total.toFixed(2).replace('.', ',')})<br>` +
            `<strong>Obs:</strong> ${obs}`,
            'atendente'
        );
    }, 1000);

    // 3. Montar link do WhatsApp para a loja com o número oficial (+55 64 99330-1938)
    const numeroWhatsAppDaLoja = "5564993301938"; 
    const textoWhatsApp = `*NOVO PEDIDO #${numPedido}* 🍔🔥\n\n` +
        `*Cliente:* ${nome}\n` +
        `*Telefone:* ${telefone}\n\n` +
        `*Itens:*\n${resumoItensTextoZap}\n` +
        `*Endereço:* ${rua}, Nº ${numero} - ${bairro}\n` +
        `*Pagamento:* ${pagamento}\n` +
        `*Taxa de Entrega:* R$ 5,00\n` +
        `*VALOR TOTAL:* *R$ ${total.toFixed(2).replace('.', ',')}*\n` +
        `*Observações:* ${obs}`;

    const urlWhatsApp = `https://wa.me/${numeroWhatsAppDaLoja}?text=${encodeURIComponent(textoWhatsApp)}`;

    setTimeout(() => {
        adicionarMensagemChat(
            `Seu pedido já entrou em preparo! O tempo estimado de entrega é de <strong>35 a 45 minutos</strong>.<br><br>` +
            `<a href="${urlWhatsApp}" target="_blank" style="display: inline-block; padding: 10px 15px; background-color: #25D366; color: #fff; border-radius: 5px; text-decoration: none; font-weight: bold;">📱 Falar sobre o pedido no WhatsApp</a>`,
            'atendente'
        );
    }, 2200);

    carrinho = [];
    atualizarCarrinho();
    formPedido.reset();
    containerPix.style.display = 'none';
    containerCartao.style.display = 'none';
    carregarHistoricoLateral(usuarioLogado);
});

function salvarPedidoNoHistorico(email, novoPedido) {
    let historicosGerais = JSON.parse(localStorage.getItem('urban_burger_historico')) || {};
    if (!historicosGerais[email]) {
        historicosGerais[email] = [];
    }
    historicosGerais[email].unshift(novoPedido);
    localStorage.setItem('urban_burger_historico', JSON.stringify(historicosGerais));
}

function carregarHistoricoLateral(email) {
    const container = document.getElementById('listaHistoricoLateral');
    if (!container) return;

    let historicosGerais = JSON.parse(localStorage.getItem('urban_burger_historico')) || {};
    let pedidosDoUsuario = historicosGerais[email] || [];

    if (pedidosDoUsuario.length === 0) {
        container.innerHTML = '<p class="carrinho-vazio">Você ainda não realizou nenhum pedido.</p>';
        return;
    }

    container.innerHTML = '';
    pedidosDoUsuario.forEach((pedido, index) => {
        let descItensHtml = '';
        pedido.itens.forEach(item => {
            const extraTxt = item.extras ? ` (${item.extras})` : '';
            descItensHtml += `• ${item.quantidade}x ${item.nome}${extraTxt}<br>`;
        });

        const div = document.createElement('div');
        div.className = 'item-historico-gaveta';
        div.innerHTML = `
            <h4>Pedido #${pedido.id}</h4>
            <p>${descItensHtml}</p>
            <p style="color: #aaa; font-size: 11px;">${pedido.data}</p>
            <span>Total: R$ ${pedido.total.toFixed(2).replace('.', ',')}</span>
            <button class="botao-pedir-novo-gaveta" onclick="repetirPedido(${index})">Pedir de novo</button>
        `;
        container.appendChild(div);
    });
}

window.repetirPedido = function(indexPedido) {
    const usuarioLogado = localStorage.getItem('urban_burger_logado');
    let historicosGerais = JSON.parse(localStorage.getItem('urban_burger_historico')) || {};
    let pedidosDoUsuario = historicosGerais[usuarioLogado] || [];
    const pedidoAlvo = pedidosDoUsuario[indexPedido];

    if (!pedidoAlvo) return;

    pedidoAlvo.itens.forEach(itemAntigo => {
        const itemExistente = carrinho.find(i => i.nome === itemAntigo.nome && i.extras === itemAntigo.extras);
        if (itemExistente) {
            itemExistente.quantidade += itemAntigo.quantidade;
        } else {
            carrinho.push({ ...itemAntigo });
        }
    });

    fecharHistorico();
    atualizarCarrinho();
    abrirCarrinho();
}

// ATENDENTE VIRTUAL NO CHAT
function enviarMensagemCliente() {
    const texto = inputChatCliente.value.trim();
    if (!texto) return;

    adicionarMensagemChat(texto, 'cliente');
    inputChatCliente.value = '';

    const numeroWhatsAppDaLoja = "5564993301938"; 
    const linkWhatsApp = `https://wa.me/${numeroWhatsAppDaLoja}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre a Urban Burger.')}`;

    setTimeout(() => {
        adicionarMensagemChat(
            `Anotado! Já repassei a sua mensagem para a nossa equipe. 👍<br><br>` +
            `Se preferir tirar dúvidas rapidamente ou conversar em tempo real com a nossa equipe, clique no botão abaixo:` +
            `<br><br><a href="${linkWhatsApp}" target="_blank" style="display: inline-block; padding: 10px 15px; background-color: #25D366; color: #fff; border-radius: 6px; text-decoration: none; font-weight: bold; text-align: center;">📱 Tirar dúvidas no WhatsApp</a>`,
            'atendente'
        );
    }, 1000);
}

enviarMsgChatBtn.addEventListener('click', enviarMensagemCliente);
inputChatCliente.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') enviarMensagemCliente();
});

fecharChatBtn.addEventListener('click', () => {
    modalChat.classList.remove('ativo');
});

// ABRIR O CHAT AO CLICAR NO BOTÃO FLUTUANTE
if (btnFlutuanteChat) {
    btnFlutuanteChat.addEventListener('click', () => {
        if (chatMensagens.children.length === 0) {
            adicionarMensagemChat(`Olá! Seja bem-vindo à <strong>URBAN BURGER</strong> 🍔🔥. Como podemos te ajudar hoje?`, 'atendente');
        }
        modalChat.classList.add('ativo');
    });
}

// ZOOM NAS IMAGENS
const overlayZoom = document.getElementById('overlayZoom');
const imagemZoom = document.getElementById('imagemZoom');
const fecharZoom = document.getElementById('fecharZoom');

document.querySelectorAll('.produto-imagem img').forEach(img => {
    img.addEventListener('click', function() {
        imagemZoom.src = this.src;
        overlayZoom.classList.add('ativo');
    });
});

fecharZoom.addEventListener('click', () => {
    overlayZoom.classList.remove('ativo');
});

overlayZoom.addEventListener('click', (e) => {
    if (e.target === overlayZoom) {
        overlayZoom.classList.remove('ativo');
    }
});