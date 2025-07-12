// ==================== VARIÁVEIS GLOBAIS ====================
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
let currentTheme = localStorage.getItem('theme') || 'light';
let currentCategory = 'macarrao-750g';

// Variáveis globais
let cartItems = [];
let cartTotal = 0;

// Função para trocar de categoria
function changeCategory(category) {
    // Remove active de todas as categorias
    document.querySelectorAll('.menu-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Remove active de todos os botões
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adiciona active na categoria selecionada
    const selectedSection = document.getElementById(category);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.style.display = 'block';
    }
    
    // Adiciona active no botão selecionado
    const selectedButton = document.querySelector(`[data-category="${category}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Atualiza categoria atual
    currentCategory = category;
}

// Função de pesquisa melhorada
function searchMenu(query) {
    query = query.toLowerCase().trim();
    
    if (query === '') {
        // Restaura a visualização normal das categorias
        document.querySelectorAll('.menu-section').forEach(section => {
            section.style.display = section.classList.contains('active') ? 'block' : 'none';
        });
        document.querySelectorAll('.menu-item').forEach(item => {
            item.style.display = 'block';
        });
        return;
    }
    
    let encontrouAlgum = false;
    
    // Procura em todos os itens
    document.querySelectorAll('.menu-item').forEach(item => {
        const title = item.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = item.querySelector('.description')?.textContent.toLowerCase() || '';
        const price = item.querySelector('.price')?.textContent.toLowerCase() || '';
        
        const shouldShow = title.includes(query) || 
                          description.includes(query) || 
                          price.includes(query);
        
        item.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) encontrouAlgum = true;
    });
    
    // Mostra/esconde seções baseado nos resultados
    document.querySelectorAll('.menu-section').forEach(section => {
        const hasVisibleItems = Array.from(section.querySelectorAll('.menu-item'))
            .some(item => item.style.display === 'block');
        section.style.display = hasVisibleItems ? 'block' : 'none';
    });
    
    // Mostra mensagem quando não encontra resultados
    const searchResults = document.getElementById('search-results') || 
        createSearchResults();
    
    searchResults.style.display = !encontrouAlgum ? 'block' : 'none';
    if (!encontrouAlgum) {
        searchResults.innerHTML = `
            <div class="no-results">
                <p>Nenhum item encontrado para "${query}"</p>
            </div>
        `;
    }
}

function createSearchResults() {
    const results = document.createElement('div');
    results.id = 'search-results';
    document.querySelector('.search-bar').appendChild(results);
    return results;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Listener para a barra de pesquisa com debounce
    const searchInput = document.querySelector('.search-bar input');
    let timeoutId;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            searchMenu(e.target.value);
        }, 300); // Espera 300ms após o usuário parar de digitar
    });
    
    // Limpa a pesquisa quando clicar no X
    searchInput.addEventListener('search', () => {
        searchMenu('');
    });
    
    // Listeners para os botões de categoria
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            searchInput.value = ''; // Limpa a pesquisa ao trocar de categoria
            changeCategory(btn.dataset.category);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const categoriesContainer = document.querySelector('.categories');
    let isDown = false;
    let startX;
    let scrollLeft;

    // Mouse Events
    categoriesContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        categoriesContainer.style.cursor = 'grabbing';
        startX = e.pageX - categoriesContainer.offsetLeft;
        scrollLeft = categoriesContainer.scrollLeft;
    });

    categoriesContainer.addEventListener('mouseleave', () => {
        isDown = false;
        categoriesContainer.style.cursor = 'grab';
    });

    categoriesContainer.addEventListener('mouseup', () => {
        isDown = false;
        categoriesContainer.style.cursor = 'grab';
    });

    categoriesContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - categoriesContainer.offsetLeft;
        const walk = (x - startX) * 2; // Velocidade da rolagem
        categoriesContainer.scrollLeft = scrollLeft - walk;
    });

    // Touch Events para melhor suporte mobile
    categoriesContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - categoriesContainer.offsetLeft;
        scrollLeft = categoriesContainer.scrollLeft;
    });

    categoriesContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        const x = e.touches[0].pageX - categoriesContainer.offsetLeft;
        const walk = (startX - x) * 2;
        categoriesContainer.scrollLeft = scrollLeft + walk;
    });
});

// Funções de quantidade
function decreaseQuantity(btn) {
    const quantitySpan = btn.nextElementSibling;
    let quantity = parseInt(quantitySpan.textContent);
    if (quantity > 1) {
        quantity--;
        quantitySpan.textContent = quantity;
    }
}

function increaseQuantity(btn) {
    const quantitySpan = btn.previousElementSibling;
    let quantity = parseInt(quantitySpan.textContent);
    quantity++;
    quantitySpan.textContent = quantity;
}

// Função para adicionar ao carrinho
function addToCart(btn, name, price) {
    const quantitySpan = btn.parentElement.querySelector('.quantity');
    const quantity = parseInt(quantitySpan.textContent);
    
    // Procura o item no carrinho
    const existingItem = cartItems.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.price * existingItem.quantity;
    } else {
        cartItems.push({
            name,
            price,
            quantity,
            total: quantity * price
        });
    }
    
    // Atualiza o total
    updateCartTotal();
    // Atualiza a exibição do carrinho
    updateCartDisplay();
    // Feedback visual
    showAddedFeedback(btn);
    // Mostra o banner de notificação
    showItemAddedBanner(name, quantity);
}

// Atualiza o total do carrinho
function updateCartTotal() {
    cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    document.querySelector('.total-price').textContent = `R$ ${cartTotal.toFixed(2)}`;
    document.querySelector('.cart-count').textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

// Atualiza a exibição do carrinho
function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-details">
                    <span class="cart-item-price">R$ ${(typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0).toFixed(2)}</span>
                    <div class="cart-item-quantity">
                        <span>Qtd: ${item.quantity}</span>
                        <button onclick="decreaseCartItem('${item.name}')" class="cart-btn remove">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button onclick="removeFromCart('${item.name}')" class="cart-btn delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="editarAdicionaisCarrinho('${item.name}')" class="cart-btn edit">
                            <i class="fas fa-edit"></i> Adicionais
                        </button>
                    </div>
                </div>
            </div>
            <div class="cart-item-total">
                R$ ${(typeof item.total === 'number' && !isNaN(item.total) ? item.total : 0).toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Função para diminuir quantidade no carrinho
function decreaseCartItem(name) {
    const item = cartItems.find(item => item.name === name);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
            item.total = item.price * item.quantity;
        } else {
            removeFromCart(name);
        }
        updateCartTotal();
        updateCartDisplay();
    }
}

// Remove item do carrinho
function removeFromCart(name) {
    cartItems = cartItems.filter(item => item.name !== name);
    updateCartTotal();
    updateCartDisplay();
}

// Toggle do carrinho
function toggleCart() {
    const cartPanel = document.querySelector('.cart-panel');
    cartPanel.classList.toggle('open');
}

// Banner de notificação de item adicionado
function showItemAddedBanner(itemName, quantity = 1) {
    const banner = document.getElementById('item-added-banner');
    const itemNameElement = document.getElementById('banner-item-name');
    
    // Atualiza o texto do banner
    if (quantity > 1) {
        itemNameElement.textContent = `${quantity}x ${itemName} adicionado ao carrinho`;
    } else {
        itemNameElement.textContent = `${itemName} adicionado ao carrinho`;
    }
    
    // Mostra o banner
    banner.classList.remove('hide');
    banner.classList.add('show');
    
    // Auto-hide após 3 segundos
    setTimeout(() => {
        closeItemBanner();
    }, 3000);
}

// Fecha o banner de notificação
function closeItemBanner() {
    const banner = document.getElementById('item-added-banner');
    banner.classList.remove('show');
    banner.classList.add('hide');
    
    // Remove a classe hide após a animação
    setTimeout(() => {
        banner.classList.remove('hide');
    }, 300);
}

// Feedback visual ao adicionar
function showAddedFeedback(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Adicionado';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1000);
}

// Função para abrir o modal de checkout
function checkout() {
    if (cartItems.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Verifica o status de funcionamento
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge && statusBadge.classList.contains('closed')) {
        // Exibe a modal de horário fechado
        $('#closedModal').modal('show');
        return; // Interrompe a execução da função
    }
    
    // Atualiza o resumo do pedido
    updateOrderSummary();
    
    // Mostra o modal
    $('#checkoutModal').modal('show');
}

// Atualiza o resumo do pedido
function updateOrderSummary() {
    const total = document.getElementById('total');
    const deliveryType = document.getElementById('deliveryType').value;
    const deliveryFee = deliveryType === 'delivery' ? 5 : 0; // Taxa de entrega apenas para delivery

    // Calcula o total incluindo a taxa
    const subtotalValue = cartItems.reduce((sum, item) => sum + item.total, 0);
    const totalValue = subtotalValue + deliveryFee;
    total.textContent = `R$ ${totalValue.toFixed(2)}`;
}

// Atualizar o evento de mudança do tipo de entrega
document.getElementById('deliveryType')?.addEventListener('change', function() {
    updateOrderSummary(); // Atualiza o total quando mudar o tipo de entrega
});

// Função para pegar localização
function getLocation() {
    if (navigator.geolocation) {
        const locationBtn = document.querySelector('.btn-location');
        
        // Adiciona classe de loading e animação
        locationBtn.classList.add('loading');
        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        locationBtn.title = 'Buscando localização...';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Atualiza os campos
                document.getElementById('latitude').value = latitude;
                document.getElementById('longitude').value = longitude;
                
                // Mostra os campos de localização
                document.querySelector('.location-fields').style.display = 'block';
                
                // Adiciona link do Google Maps ao endereço
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                const locationInfo = `📍 Localização exata: ${mapsLink}`;
                
                // Adiciona ao campo de endereço
                const addressField = document.getElementById('clientAddress');
                if (!addressField.value.includes('maps')) {
                    addressField.value += `\n${locationInfo}`;
                }
                
                // Feedback de sucesso
                locationBtn.classList.remove('loading');
                locationBtn.classList.add('success');
                locationBtn.innerHTML = '<i class="fas fa-check"></i>';
                locationBtn.title = 'Localização obtida com sucesso!';
                
                // Restaura o ícone após 2 segundos
                setTimeout(() => {
                    locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                    locationBtn.title = 'Usar minha localização atual';
                    locationBtn.classList.remove('success');
                }, 2000);
                
            },
            (error) => {
                let message = 'Erro ao obter localização';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Permissão negada para acessar localização';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Localização indisponível';
                        break;
                    case error.TIMEOUT:
                        message = 'Tempo esgotado ao buscar localização';
                        break;
                }
                
                // Feedback de erro
                locationBtn.classList.remove('loading');
                locationBtn.classList.add('error');
                locationBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                locationBtn.title = message;
                
                // Mostra alerta
                alert(message);
                
                // Restaura o ícone após 3 segundos
                setTimeout(() => {
                    locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                    locationBtn.title = 'Usar minha localização atual';
                    locationBtn.classList.remove('error');
                }, 3000);
            }
        );
    } else {
        alert('Seu navegador não suporta geolocalização');
    }
}

// Gerenciar campos de pagamento
document.getElementById('paymentMethod')?.addEventListener('change', function(e) {
    // Esconde todos os campos específicos primeiro
    document.querySelectorAll('.payment-fields').forEach(field => {
        field.style.display = 'none';
    });

    // Mostra os campos específicos baseado na seleção
    switch(e.target.value) {
        case 'pix':
            document.getElementById('pixFields').style.display = 'block';
            break;
        case 'credit':
        case 'debit':
            document.getElementById('cardFields').style.display = 'block';
            break;
        case 'money':
            document.getElementById('changeGroup').style.display = 'block';
            break;
    }
});

// Função para copiar chave PIX
function copyPixKey() {
    const pixKey = '12.345.678/0001-90'; // Substitua pela chave PIX real
    navigator.clipboard.writeText(pixKey).then(() => {
        const copyBtn = document.querySelector('.btn-copy');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    });
}

// Função para enviar o pedido
function submitOrder() {
    // Verifica o status de funcionamento
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge.classList.contains('closed')) {
        // Exibe a modal de horário fechado
        $('#closedModal').modal('show');
        return; // Interrompe a execução da função
    }

    // Validação do formulário
    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Coleta os dados do formulário
    const name = document.getElementById('clientName').value;
    const address = document.getElementById('clientAddress').value;
    const reference = document.getElementById('reference').value;
    const phone = document.getElementById('clientPhone').value;
    const deliveryType = document.getElementById('deliveryType').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const changeAmount = document.getElementById('changeAmount').value;
    const notes = document.getElementById('orderNotes').value;

    // Monta a mensagem do pedido com formatação
    let message = `🛍️ *NOVO PEDIDO*\n\n`;
    message += `👤 *Cliente:* ${name}\n`;
    message += `📞 *Telefone:* ${phone}\n`;
    message += `📍 *${deliveryType === 'delivery' ? 'Endereço' : 'Retirada'}:* ${address}\n`;
    if (reference) message += `🏠 *Referência:* ${reference}\n`;

    let paymentDetails = '';

    switch(paymentMethod) {
        case 'pix':
            paymentDetails = `💳 *Pagamento:* PIX\n📱 *Chave PIX:* 12.345.678/0001-90`;
            break;
        case 'credit':
            paymentDetails = '💳 *Pagamento:* Cartão de Crédito';
            break;
        case 'debit':
            paymentDetails = '💳 *Pagamento:* Cartão de Débito';
            break;
        case 'money':
            paymentDetails = `💰 *Pagamento:* Dinheiro\n💰 *Troco para:* R$ ${changeAmount}`;
            break;
    }

    message += paymentDetails + `\n\n`;

    message += `📋 *ITENS DO PEDIDO:*\n`;
    cartItems.forEach(item => {
        const total = typeof item.total === 'number' && !isNaN(item.total) ? item.total : (item.price * item.quantity);
        message += `${item.quantity}x *${item.name}* - R$ ${total.toFixed(2)}\n`;
    });

    if (notes.trim() !== '') {
        message += `\n📝 *Observações:* ${notes}\n`;
    }

    const subtotal = cartItems.reduce((sum, item) => {
        const itemTotal = typeof item.total === 'number' && !isNaN(item.total) ? item.total : (item.price * item.quantity);
        return sum + itemTotal;
    }, 0);
    const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
    const totalFinal = subtotal + deliveryFee;

    message += `\n💰 *Total dos itens:* R$ ${subtotal.toFixed(2)}`;
    if (deliveryType === 'delivery') {
        message += `\n🛵 *Taxa de entrega:* R$ ${deliveryFee.toFixed(2)}`;
    }
    message += `\n*TOTAL A PAGAR:* R$ ${totalFinal.toFixed(2)}\n`;
    message += `🙌 *Por favor confirme o pedido solicitado*`;

    // Número do WhatsApp do estabelecimento
    const phoneNumber = '556194481911'; // Número corrigido
    
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Cria o link do WhatsApp
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Limpa o carrinho
    cartItems = [];
    updateCartTotal();
    updateCartDisplay();
    
    // Fecha o modal de checkout
    $('#checkoutModal').modal('hide');
    
    // Abre o WhatsApp
    window.open(whatsappLink, '_blank');
}

// Função para atualizar o status do funcionamento
function updateStatusBadge() {
    const statusBadge = document.querySelector('.status-badge');
    if (!statusBadge) return; // Se o elemento não existir, sai da função
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    // Define o horário de funcionamento por dia da semana
    let openingHour, closingHour;
    
    switch(currentDay) {
        case 0: // Domingo
            openingHour = 11;
            closingHour = 22;
            break;
        case 6: // Sábado
            openingHour = 11;
            closingHour = 24; // 00h do dia seguinte
            break;
        default: // Segunda a Sexta
            openingHour = 11;
            closingHour = 23;
            break;
    }
    
    // Inicia a transição
    statusBadge.classList.add('transitioning');

    setTimeout(() => {
        let isOpen = false;
        
        if (currentDay === 6) { // Sábado - horário especial até 00h
            isOpen = currentHour >= openingHour || currentHour < 1; // 0h = meia-noite
        } else {
            isOpen = currentHour >= openingHour && currentHour < closingHour;
        }
        
        if (isOpen) {
            statusBadge.classList.add('open');
            statusBadge.classList.remove('closed');
            statusBadge.innerHTML = '<i class="fas fa-clock"></i> ⏰ Estamos funcionando';
        } else {
            statusBadge.classList.add('closed');
            statusBadge.classList.remove('open');
            statusBadge.innerHTML = '<i class="fas fa-clock"></i> ⏰ Estamos fechados';
        }
        statusBadge.classList.remove('transitioning');
    }, 500); // Tempo igual à duração da transição no CSS
}

// Atualiza o status ao carregar a página
window.onload = updateStatusBadge;

// Atualiza o status a cada minuto
setInterval(updateStatusBadge, 60000);

// Função para abrir WhatsApp
function abrirWhatsApp() {
    const phoneNumber = '556194481911';
    const message = encodeURIComponent('Olá! Gostaria de fazer um pedido do Espaguete da Casa 🍝');
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappLink, '_blank');
} 

// ==================== MODAL DE ADICIONAIS ====================
// Adicionais disponíveis para cada item
const adicionaisPorItem = {
    "Espaguete Clássico": [
        { nome: "Calabresa", preco: 4.00 },
        { nome: "Bacon", preco: 4.00 },
        { nome: "Carne sol desfiada", preco: 4.00 },
        { nome: "Salsicha", preco: 3.00 },
        { nome: "Filé frango em cubos", preco: 4.00 },
        { nome: "Filé de frango desfiado", preco: 4.00 },
        { nome: "Almôndegas", preco: 4.00 },
        { nome: "Carne moída", preco: 4.00 },
        { nome: "Milho", preco: 2.50 },
        { nome: "Ervilha", preco: 2.50 },
        { nome: "Palmito", preco: 2.50 },
        { nome: "Cenoura", preco: 1.00 },
        { nome: "Brócolis", preco: 1.00 }
    ],
    "Espaguete Duetos de Molhos": [
        { nome: "Calabresa", preco: 4.00 },
        { nome: "Bacon", preco: 4.00 },
        { nome: "Carne sol desfiada", preco: 4.00 },
        { nome: "Salsicha", preco: 3.00 },
        { nome: "Filé frango em cubos", preco: 4.00 },
        { nome: "Filé de frango desfiado", preco: 4.00 },
        { nome: "Almôndegas", preco: 4.00 },
        { nome: "Carne moída", preco: 4.00 },
        { nome: "Milho", preco: 2.50 },
        { nome: "Ervilha", preco: 2.50 },
        { nome: "Palmito", preco: 2.50 },
        { nome: "Cenoura", preco: 1.00 },
        { nome: "Brócolis", preco: 1.00 }
    ],
    "Espaguete ao Molho Hot Dog": [
        { nome: "Calabresa", preco: 4.00 },
        { nome: "Bacon", preco: 4.00 },
        { nome: "Carne sol desfiada", preco: 4.00 },
        { nome: "Salsicha", preco: 3.00 },
        { nome: "Filé frango em cubos", preco: 4.00 },
        { nome: "Filé de frango desfiado", preco: 4.00 },
        { nome: "Almôndegas", preco: 4.00 },
        { nome: "Carne moída", preco: 4.00 },
        { nome: "Milho", preco: 2.50 },
        { nome: "Ervilha", preco: 2.50 },
        { nome: "Palmito", preco: 2.50 },
        { nome: "Cenoura", preco: 1.00 },
        { nome: "Brócolis", preco: 1.00 }
    ],
    "Espaguete do Chefe": [
        { nome: "Calabresa", preco: 4.00 },
        { nome: "Bacon", preco: 4.00 },
        { nome: "Carne sol desfiada", preco: 4.00 },
        { nome: "Salsicha", preco: 3.00 },
        { nome: "Filé frango em cubos", preco: 4.00 },
        { nome: "Filé de frango desfiado", preco: 4.00 },
        { nome: "Almôndegas", preco: 4.00 },
        { nome: "Carne moída", preco: 4.00 },
        { nome: "Milho", preco: 2.50 },
        { nome: "Ervilha", preco: 2.50 },
        { nome: "Palmito", preco: 2.50 },
        { nome: "Cenoura", preco: 1.00 },
        { nome: "Brócolis", preco: 1.00 }
    ],
    "Espaguete ao Molho Strogonoff": [
        { nome: "Calabresa", preco: 4.00 },
        { nome: "Bacon", preco: 4.00 },
        { nome: "Carne sol desfiada", preco: 4.00 },
        { nome: "Salsicha", preco: 3.00 },
        { nome: "Filé frango em cubos", preco: 4.00 },
        { nome: "Filé de frango desfiado", preco: 4.00 },
        { nome: "Almôndegas", preco: 4.00 },
        { nome: "Carne moída", preco: 4.00 },
        { nome: "Milho", preco: 2.50 },
        { nome: "Ervilha", preco: 2.50 },
        { nome: "Palmito", preco: 2.50 },
        { nome: "Cenoura", preco: 1.00 },
        { nome: "Brócolis", preco: 1.00 }
    ],
    "Espaguete a Primavera": [
        { nome: "Calabresa", preco: 4.00 },
        { nome: "Bacon", preco: 4.00 },
        { nome: "Carne sol desfiada", preco: 4.00 },
        { nome: "Salsicha", preco: 3.00 },
        { nome: "Filé frango em cubos", preco: 4.00 },
        { nome: "Filé de frango desfiado", preco: 4.00 },
        { nome: "Almôndegas", preco: 4.00 },
        { nome: "Carne moída", preco: 4.00 },
        { nome: "Milho", preco: 2.50 },
        { nome: "Ervilha", preco: 2.50 },
        { nome: "Palmito", preco: 2.50 },
        { nome: "Cenoura", preco: 1.00 },
        { nome: "Brócolis", preco: 1.00 }
    ]
}

let itemSelecionado = null;
let precoSelecionado = 0;

function abrirModalAdicionais(nomeItem, precoItem) {
    itemSelecionado = nomeItem;
    precoSelecionado = precoItem;
    document.getElementById('adicionaisItemName').innerText = nomeItem;

    const adicionais = adicionaisPorItem[nomeItem] || [];
    const form = document.getElementById('adicionaisForm');
    form.innerHTML = '';
    adicionais.forEach((adicional, idx) => {
        const id = `adicional_${idx}`;
        form.innerHTML += `
          <div class="adicionais-checkbox">
            <input class="adicional-checkbox" type="checkbox" value="${adicional.nome}" data-preco="${adicional.preco}" id="${id}">
            <label for="${id}">
              ${adicional.nome}
            </label>
            <span class="preco">+R$ ${adicional.preco.toFixed(2)}</span>
          </div>
        `;
    });
    // Abre o modal (Bootstrap)
    $('#adicionaisModal').modal('show');
}

document.addEventListener('DOMContentLoaded', function() {
    // Evento do botão Adicionar ao Carrinho (mantém como está)
    const btnConfirmar = document.getElementById('confirmarAdicionaisBtn');
    if (btnConfirmar) {
        btnConfirmar.onclick = function() {
            let selecionados = [];
            let adicionaisTotal = 0;
            document.querySelectorAll('#adicionaisForm .adicional-checkbox:checked').forEach(cb => {
                selecionados.push({ nome: cb.value, preco: parseFloat(cb.dataset.preco) });
                adicionaisTotal += parseFloat(cb.dataset.preco);
            });
            addToCartComAdicionais(itemSelecionado, precoSelecionado, selecionados, adicionaisTotal);
            $('#adicionaisModal').modal('hide');
        };
    }
    // Delegação para o botão Adicionar sem adicionais
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'adicionarSemAdicionaisBtn') {
            addToCartComAdicionais(itemSelecionado, precoSelecionado, [], 0);
            $('#adicionaisModal').modal('hide');
        }
    });
});

function addToCartComAdicionais(nome, preco, adicionais, adicionaisTotal) {
    // Garante que preco e adicionaisTotal são números válidos
    preco = Number(preco);
    adicionaisTotal = Number(adicionaisTotal);
    if (isNaN(preco)) preco = 0;
    if (isNaN(adicionaisTotal)) adicionaisTotal = 0;
    // Busca o botão do item para pegar a quantidade
    let btn = null;
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        if (button.getAttribute('onclick') && button.getAttribute('onclick').includes(nome)) {
            btn = button;
        }
    });

    // Tenta pegar a quantidade do modal de adicionais
    let quantity = 1;
    const modal = document.getElementById('adicionaisModal');
    if (modal) {
        const quantitySpan = modal.querySelector('.quantity');
        if (quantitySpan) {
            quantity = parseInt(quantitySpan.textContent);
        }
    }
    // Se não achar no modal, tenta pelo botão
    if ((!quantity || isNaN(quantity)) && btn) {
        const quantitySpan = btn.parentElement.querySelector('.quantity');
        if (quantitySpan) {
            quantity = parseInt(quantitySpan.textContent);
        }
    }

    // Monta o nome do item com adicionais
    let nomeComAdicionais = nome;
    if (adicionais.length > 0) {
        nomeComAdicionais += ' (Adicionais: ' + adicionais.map(a => a.nome).join(', ') + ')';
    }
    // Chama a função original de adicionar ao carrinho, somando o preço dos adicionais
    addToCartCustom(btn || {}, nomeComAdicionais, preco + adicionaisTotal, quantity);
}

// Função auxiliar para adicionar ao carrinho com quantidade customizada
function addToCartCustom(btn, name, price, quantity) {
    // Procura o item no carrinho
    const existingItem = cartItems.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.total = existingItem.price * existingItem.quantity;
    } else {
        cartItems.push({ 
            name, 
            price, 
            quantity, 
            total: price * quantity 
        });
    }
    updateCartDisplay();
    updateCartTotal();
    showAddedFeedback(btn);
    // Mostra o banner de notificação
    showItemAddedBanner(name, quantity);
}

// Expor função no escopo global para o HTML acessar
window.abrirModalAdicionais = abrirModalAdicionais; 

// Função para editar adicionais de itens no carrinho
function editarAdicionaisCarrinho(itemName) {
    // Extrai o nome base do item (remove os adicionais se existirem)
    let nomeBase = itemName;
    if (itemName.includes(' (Adicionais:')) {
        nomeBase = itemName.split(' (Adicionais:')[0];
    }
    
    // Encontra o item no carrinho para pegar o preço base
    const item = cartItems.find(item => item.name === itemName);
    if (!item) return;
    
    // Calcula o preço base (remove o valor dos adicionais atuais)
    let precoBase = item.price;
    if (itemName.includes(' (Adicionais:')) {
        // Remove o valor dos adicionais atuais para obter o preço base
        const adicionaisAtuais = itemName.match(/\(Adicionais: ([^)]+)\)/);
        if (adicionaisAtuais) {
            const adicionaisList = adicionaisAtuais[1].split(', ');
            const valorAdicionais = adicionaisList.length * 4.00; // Cada adicional custa R$ 4,00
            precoBase = item.price - valorAdicionais;
        }
    }
    
    // Remove o item atual do carrinho
    removeFromCart(itemName);
    
    // Abre o modal de adicionais com o nome base e preço base
    abrirModalAdicionais(nomeBase, precoBase);
}

// Expor função no escopo global
window.editarAdicionaisCarrinho = editarAdicionaisCarrinho; 

// ==================== MONTE SEU MACARRÃO ====================
let adicionaisSelecionados = [];
let quantidadeCustom = 1;

// Função para selecionar adicional
function selecionarAdicional(adicionalElement) {
    const checkbox = adicionalElement.querySelector('input[type="checkbox"]');
    const nome = adicionalElement.dataset.nome;
    const preco = parseFloat(adicionalElement.dataset.preco);
    
    // Verifica se está tentando adicionar um adicional
    if (checkbox.checked) {
        // Pega o tamanho selecionado
        const selectedSize = document.querySelector('input[name="pasta-size"]:checked');
        if (!selectedSize) {
            showSizeBanner();
            checkbox.checked = false;
            return;
        }
        
        // Verifica se o elemento sizeOption existe
        const sizeOption = selectedSize.closest('.size-option');
        if (!sizeOption) {
            alert('Erro: Tamanho não encontrado. Por favor, selecione novamente.');
            checkbox.checked = false;
            return;
        }
        
        const maxAdicionais = parseInt(sizeOption.dataset.maxAdicionais);
        
        // Verifica se já atingiu o limite
        if (adicionaisSelecionados.length >= maxAdicionais) {
            checkbox.checked = false;
            showLimitBanner(maxAdicionais);
            return;
        }
        
        adicionaisSelecionados.push({ nome, preco });
    } else {
        adicionaisSelecionados = adicionaisSelecionados.filter(item => item.nome !== nome);
    }
    
    atualizarAdicionaisSelecionados();
    calcularTotalCustom();
}

// Função para atualizar display dos adicionais selecionados
function atualizarAdicionaisSelecionados() {
    const lista = document.getElementById('adicionais-selecionados');
    const quantidadeAdicionais = adicionaisSelecionados.length;
    
    lista.innerHTML = adicionaisSelecionados.map(item => 
        `<li>${item.nome}</li>`
    ).join('');
    
    document.getElementById('total-adicionais').textContent = `${quantidadeAdicionais} adicionais selecionados`;
}

// Função para calcular total (sem exibir na interface)
function calcularTotalCustom() {
    // Pega o tamanho selecionado
    const selectedSize = document.querySelector('input[name="pasta-size"]:checked');
    let precoBase = 0;
    let tamanhoSelecionado = '';
    
    if (selectedSize) {
        const sizeOption = selectedSize.closest('.size-option');
        precoBase = parseFloat(sizeOption.dataset.price);
        tamanhoSelecionado = sizeOption.dataset.size;
    }
    
    const totalAdicionais = adicionaisSelecionados.reduce((sum, item) => sum + item.preco, 0);
    const total = (precoBase + totalAdicionais) * quantidadeCustom;
    
    // Não exibe mais o total na interface, mas mantém o cálculo para o carrinho
}

// Funções para quantidade
function increaseCustomQuantity() {
    quantidadeCustom++;
    document.getElementById('custom-quantity').textContent = quantidadeCustom;
    calcularTotalCustom();
}

function decreaseCustomQuantity() {
    if (quantidadeCustom > 1) {
        quantidadeCustom--;
        document.getElementById('custom-quantity').textContent = quantidadeCustom;
        calcularTotalCustom();
    }
}

// Função para adicionar macarrão customizado ao carrinho
function adicionarMacarraoCustom() {
    // Verifica se um tamanho foi selecionado
    const selectedSize = document.querySelector('input[name="pasta-size"]:checked');
    if (!selectedSize) {
        alert('Por favor, selecione um tamanho de macarrão!');
        return;
    }
    
    if (adicionaisSelecionados.length === 0) {
        alert('Por favor, selecione pelo menos um adicional!');
        return;
    }
    
    const sizeOption = selectedSize.closest('.size-option');
    const precoBase = parseFloat(sizeOption.dataset.price);
    const tamanhoSelecionado = sizeOption.dataset.size;
    const totalAdicionais = adicionaisSelecionados.reduce((sum, item) => sum + item.preco, 0);
    const precoTotal = precoBase + totalAdicionais;
    
    let nomeItem = `Macarrão Customizado ${tamanhoSelecionado}g`;
    if (adicionaisSelecionados.length > 0) {
        nomeItem += ` (Adicionais: ${adicionaisSelecionados.map(a => a.nome).join(', ')})`;
    }
    
    // Adiciona ao carrinho
    const existingItem = cartItems.find(item => item.name === nomeItem);
    if (existingItem) {
        existingItem.quantity += quantidadeCustom;
        existingItem.total = existingItem.price * existingItem.quantity;
    } else {
        cartItems.push({
            name: nomeItem,
            price: precoTotal,
            quantity: quantidadeCustom,
            total: precoTotal * quantidadeCustom
        });
    }
    
    updateCartDisplay();
    updateCartTotal();
    
    // Feedback visual
    const btn = document.querySelector('.add-to-cart-btn.custom');
    showAddedFeedback(btn);
    
    // Mostra o banner de notificação
    showItemAddedBanner(nomeItem, quantidadeCustom);
    
    // Limpa seleções
    limparSelecoesCustom();
}

// Função para limpar apenas adicionais (mantém o tamanho selecionado)
function limparApenasAdicionais() {
    // Desmarca todos os adicionais
    document.querySelectorAll('.adicional-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reseta variáveis
    adicionaisSelecionados = [];
    
    // Atualiza display
    document.getElementById('adicionais-selecionados').innerHTML = '';
    document.getElementById('total-adicionais').textContent = '0 adicionais selecionados';
    calcularTotalCustom(); // Recalcula o total com o preço base
}

// Função para limpar seleções (inclui tamanho)
function limparSelecoesCustom() {
    // Desmarca todos os adicionais
    document.querySelectorAll('.adicional-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Desmarca seleção de tamanho
    document.querySelectorAll('input[name="pasta-size"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Reseta variáveis
    adicionaisSelecionados = [];
    quantidadeCustom = 1;
    
    // Atualiza display
    document.getElementById('adicionais-selecionados').innerHTML = '';
    document.getElementById('total-adicionais').textContent = '0 adicionais selecionados';
    document.getElementById('custom-quantity').textContent = '1';
}

// Event listeners para Monte Seu Macarrão
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para seleção de adicionais
    document.querySelectorAll('.adicional-item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => selecionarAdicional(item));
    });
    
    // Event listeners para seleção de tamanho
    document.querySelectorAll('input[name="pasta-size"]').forEach(radio => {
        radio.addEventListener('change', () => {
            // Limpa apenas os adicionais, não o tamanho selecionado
            limparApenasAdicionais();
            calcularTotalCustom();
        });
    });
});

// Função para mostrar banner de limite
function showLimitBanner(maxAdicionais) {
    const banner = document.getElementById('limit-banner');
    const message = document.getElementById('limit-message');
    message.textContent = `Você atingiu o limite máximo de ${maxAdicionais} adicionais para este tamanho.`;
    
    banner.style.display = 'block';
    banner.classList.add('show');
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        closeLimitBanner();
    }, 5000);
}

function closeLimitBanner() {
    const banner = document.getElementById('limit-banner');
    banner.classList.remove('show');
    banner.style.display = 'none';
}

// Função para mostrar banner de seleção de tamanho
function showSizeBanner() {
    const banner = document.getElementById('size-banner');
    
    banner.style.display = 'block';
    banner.classList.add('show');
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        closeSizeBanner();
    }, 5000);
}

function closeSizeBanner() {
    const banner = document.getElementById('size-banner');
    banner.classList.remove('show');
    banner.style.display = 'none';
}

// Expor funções no escopo global
window.increaseCustomQuantity = increaseCustomQuantity;
window.decreaseCustomQuantity = decreaseCustomQuantity;
window.adicionarMacarraoCustom = adicionarMacarraoCustom;
window.closeItemBanner = closeItemBanner;
window.closeLimitBanner = closeLimitBanner;
window.closeSizeBanner = closeSizeBanner; 