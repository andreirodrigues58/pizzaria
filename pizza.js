window.onload = function () {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const openingHour = 15;
    const closingHour = 23;
    const namento = document.querySelector('.namento');

    if (currentHour >= openingHour && currentHour < closingHour) {
        namento.style.backgroundColor = 'green';
        namento.innerText = 'Estamos abertos! \nTer á Dom - 15:00 as 23:00';
    } else {
        namento.classList.add('closed');
        namento.innerText = 'Estamos fechados no momento. \nTer á Dom - 15:00 as 23:00';
    }
};

const carrinho = [];
let frete = 0;

document.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('.btn[data-item]');
    const carrinhoDiv = document.getElementById('carrinho');
    const itensCarrinho = document.getElementById('itens-carrinho');

    // Abrir o carrinho
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
            const preco = parseFloat(botao.dataset.price);

            const existente = carrinho.find(produto => produto.item === item);
            if (existente) {
                existente.quantidade += 1;
            } else {
                carrinho.push({ item, preco, quantidade: 1 });
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
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('calcular-frete')) {
            const cep = document.getElementById('cep').value;
            if (cep.startsWith('40')) {
                frete = 5.00;
            } else {
                frete = 10.00;
            }
            atualizarCarrinho();
        }
    });

    // Finalizar pedido
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('finalizar-pedido')) {
            const texto = carrinho.map(produto =>
                `${produto.quantidade}x ${produto.item} (R$${produto.preco.toFixed(2)})`
            ).join('\n');

            const total = carrinho.reduce((acc, produto) => acc + produto.preco * produto.quantidade, 0);
            const observacao = document.getElementById('observacao')?.value || '';
            const mensagem = `Olá! Gostaria de fazer um pedido:\n${texto}\n\nFrete: R$${frete.toFixed(2)}\nTotal: R$${(total + frete).toFixed(2)}\n\nObservações: ${observacao}`;
            const url = `https://wa.me/5571982564207?text=${encodeURIComponent(mensagem)}`;
            window.open(url, '_blank');
        }
    });

    function atualizarCarrinho() {
        itensCarrinho.innerHTML = ''; // limpa antes de atualizar
    
        carrinho.forEach((produto, index) => {
            itensCarrinho.innerHTML += `
            <div class="item">
                <div class="info-produto">
                    <p>${produto.item}</p>
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
                <input type="text" id="cep" placeholder="Digite seu CEP">
                <button class="calcular-frete">Calcular Frete</button>
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
            </div>
        `;
    }
    
    // Aumentar/diminuir quantidade de produtos no carrinho
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
                carrinho.splice(index, 1); // Remove o item
            }
            atualizarCarrinho();
        }
    });
});
