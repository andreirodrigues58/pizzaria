window.onload = function () {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentDay = currentTime.getDay(); // 0 = domingo, 1 = segunda, etc.
    const openingHour = 15;
    const closingHour = 23;
    const namento = document.querySelector('.namento');

    if (currentDay === 1 || currentHour < openingHour || currentHour >= closingHour) {
        lojaAberta = false;
        namento.classList.add('closed');
        namento.style.backgroundColor = 'red';
        namento.innerText = 'Estamos fechados no momento.\nTerça a Domingo - 15:00 às 23:00';
    } else {
        lojaAberta = true;
        namento.style.backgroundColor = 'green';
        namento.innerText = 'Estamos abertos!\nTerça a Domingo - 15:00 às 23:00';
    }
};

const carrinho = [];
let frete = 0;
let enderecoFormatado = '';
let lojaAberta = false; // Começa como false

document.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('.btn[data-item]');
    const carrinhoDiv = document.getElementById('carrinho');
    const itensCarrinho = document.getElementById('itens-carrinho');

    // Abrir carrinho
    document.querySelectorAll('.button, .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            carrinhoDiv.style.display = 'block';
            atualizarCarrinho();
        });
    });

    // Adicionar item ao carrinho
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const item = botao.dataset.item;
            const select = botao.parentElement.querySelector('.tamanho-select');
            let tamanho = 'Único';
            let preco = parseFloat(botao.dataset.price);

            if (select) {
                const selectedOption = select.options[select.selectedIndex];
                tamanho = selectedOption.value;
                preco = parseFloat(selectedOption.dataset.price);
            }

            const existente = carrinho.find(produto => produto.item === item && produto.tamanho === tamanho);
            if (existente) {
                existente.quantidade += 1;
            } else {
                carrinho.push({ item, preco, tamanho, quantidade: 1 });
            }

            atualizarCarrinho();
        });
    });

    // Voltar para o menu
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('voltar-btn')) {
            carrinhoDiv.style.display = 'none';
        }
    });

    // Calcular frete
    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('calcular-frete')) {
            const cepInput = document.getElementById('cep');
            const numeroCasaInput = document.getElementById('numero-casa');
            const localizacaoCep = document.getElementById('localizacao-cep');
            const cep = cepInput.value.trim();
            const numeroCasa = numeroCasaInput.value.trim(); // Obtém o número da casa
        
            if (!/^\d{8}$/.test(cep)) {
                alert('INSIRA UM CEP VÁLIDO (8 números, sem traços ou pontos).');
                localizacaoCep.textContent = '';
                frete = 0;
                atualizarCarrinho();
                return;
            }
    
            if (numeroCasa === '') {  // Verifica se o número da casa foi preenchido
                alert('Por favor, insira o número da casa.');
                return;
            }
    
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
    
                if (data.erro) {
                    alert('INSIRA UM CEP VÁLIDO');
                    localizacaoCep.textContent = '';
                    frete = 0;
                    atualizarCarrinho();
                    return;
                }
    
                // Exibe o endereço completo com o número da casa
                localizacaoCep.textContent = `${data.logradouro || ''}, ${numeroCasa} - ${data.bairro}, ${data.localidade} - ${data.uf}`;
                enderecoFormatado = `${data.logradouro || ''}, ${numeroCasa} - ${data.bairro}, ${data.localidade} - ${data.uf}`;
    
                if (data.localidade.toLowerCase() === 'salvador') {
                    frete = 5.00;
                } else {
                    alert('Somente entregamos na região de Salvador.');
                    localizacaoCep.textContent = '';
                    frete = 0;
                }
    
            } catch (err) {
                alert('Erro ao consultar o CEP. Tente novamente.');
                localizacaoCep.textContent = '';
                frete = 0;
            }
    
            atualizarCarrinho();
        }
    });

    // Botão de Finalizar Pedido
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('finalizar-pedido')) {
            if (lojaAberta === false) {
                alert('Estamos fechados.\nFuncionamos de Terça a Domingo - 15:00 às 23:00');
                return; // Impede a finalização do pedido se a loja estiver fechada
            }
    
            if (carrinho.length === 0) {
                alert('Adicione pelo menos um item ao carrinho antes de finalizar o pedido.');
                return;
            }
    
            const cep = document.getElementById('cep').value.trim();
            const numeroCasa = document.getElementById('numero-casa').value.trim();  // Leitura do valor do campo de número
    
            // Verificação do CEP
            if (!/^\d{8}$/.test(cep)) {
                alert('INSIRA UM CEP VÁLIDO (8 números, sem traços ou pontos).');
                return;
            }
    
            // Verificar se o número da casa está presente no enderecoFormatado
            const enderecoCompleto = document.getElementById('localizacao-cep').textContent.trim(); // Endereço formatado
    
            if (!enderecoCompleto.includes(numeroCasa) && numeroCasa === '') {  // Se o número de casa estiver vazio, verifica o enderecoFormatado
                alert('Por favor, insira o número da casa para finalizar o pedido.');
                return;
            }
    
            // Verificação se o CEP está dentro da área de entrega
            if (!cep.startsWith('40')) {
                alert('Somente entregamos na região de Salvador (CEPs iniciando com "40").');
                return;
            }
    
            // Verificação do cálculo do frete
            if (frete === 0) {
                alert('Você precisa calcular o frete antes de finalizar o pedido.');
                return;
            }
    
            // Verificação se o endereço foi preenchido
            if (!enderecoCompleto) {
                alert('Você precisa calcular o frete e preencher o endereço antes de finalizar o pedido.');
                return;
            }
    
            // Verificar se o endereço formatado foi mostrado
            if (!document.getElementById('localizacao-cep').textContent.trim()) {
                alert('Endereço não formatado corretamente. Por favor, calcule o frete novamente.');
                return;
            }
    
            // Preparar a mensagem para enviar via WhatsApp
            const texto = carrinho.map(produto =>
                `${produto.quantidade}x ${produto.item} (${produto.tamanho}) - (R$${produto.preco.toFixed(2)})`
            ).join('\n');
    
            const total = carrinho.reduce((acc, produto) => acc + produto.preco * produto.quantidade, 0);
            const observacao = document.getElementById('observacao')?.value || '';
            const mensagem = `Olá! Gostaria de fazer um pedido:\n${texto}\n\nFrete: R$${frete.toFixed(2)}\nTotal: R$${(total + frete).toFixed(2)}\n\nEndereço de entrega: ${enderecoCompleto}\nObservações: ${observacao}`;
            const url = `https://wa.me/5571982564207?text=${encodeURIComponent(mensagem)}`;
            
            window.open(url, '_blank');  // Envia para o WhatsApp
        }
    });

    // Atualizar carrinho
    function atualizarCarrinho() {
        const cepAtual = document.getElementById('cep')?.value || '';

        itensCarrinho.innerHTML = '';

        carrinho.forEach((produto, index) => {
            itensCarrinho.innerHTML += `
            <div class="item">
                <div class="info-produto">
                    <p>${produto.item} (${produto.tamanho})</p>
                </div>
                <div class="quantidade-preco">
                    <div class="quantidade-controle">
                        <button class="diminuir" data-index="${index}">−</button>
                        <span class="quantidade">${produto.quantidade}</span>
                        <button class="aumentar" data-index="${index}">+</button>
                    </div>
                    <div class="preco-produto">
                        R$ ${(produto.preco * produto.quantidade).toFixed(2)}
                    </div>
                </div>
            </div>`;
        });

        const total = carrinho.reduce((acc, produto) => acc + produto.preco * produto.quantidade, 0);

        itensCarrinho.innerHTML += `
        <div class="frete">
    <input type="text" id="cep" placeholder="Digite seu CEP" value="${cepAtual}">
    <input type="text" id="numero-casa" placeholder="Nº">
    <button class="calcular-frete">Calcular Frete</button>
    <p id="localizacao-cep">${enderecoFormatado}</p>
    <p>Frete: R$${frete.toFixed(2)}</p>
</div>
        <div class="observacao">
            <textarea id="observacao" placeholder="Observações do pedido (ex: tirar cebola, borda recheada...)"></textarea>
        </div>
        <div class="total">
            <p><strong>Total com Frete: R$ ${(total + frete).toFixed(2)}</strong></p>
        </div>
        <div class="botoes-carrinho">
            <button class="voltar-btn">Continuar comprando</button>
            <button class="finalizar-pedido">Finalizar Pedido</button>
        </div>`;

        // Atualiza o contador de itens do carrinho
        const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
        const contador = document.querySelector('.cart-count');
// Alterado de getElementById para querySelector

        if (contador) {
            contador.innerText = totalItens; // Atualiza o texto do contador
            contador.style.display = totalItens > 0 ? 'inline-block' : 'none'; // Exibe/oculta o contador
        }
    }

    // Controle de quantidade
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('aumentar')) {
            const index = e.target.dataset.index;
            carrinho[index].quantidade += 1;
            atualizarCarrinho();
        }

        if (e.target.classList.contains('diminuir')) {
            const index = e.target.dataset.index;
            if (carrinho[index].quantidade > 1) {
                carrinho[index].quantidade -= 1;
            } else {
                carrinho.splice(index, 1);
            }
            atualizarCarrinho();
        }
    });
});
