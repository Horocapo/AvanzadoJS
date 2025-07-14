
        class ProductManager {
            constructor() {
                this.products = [];
                this.loadFromStorage();
                this.initializeEvents();
                this.renderProducts();
                this.updateStats();
            }

            // Inicializar eventos del DOM
            initializeEvents() {
                const form = document.getElementById('productForm');
                form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }

            // Manejar envío del formulario
            handleFormSubmit(e) {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const productData = {
                    name: formData.get('productName').trim(),
                    price: parseFloat(formData.get('productPrice')),
                    category: formData.get('productCategory'),
                    quantity: parseInt(formData.get('productQuantity')),
                    description: formData.get('productDescription').trim()
                };

                if (this.validateProduct(productData)) {
                    this.addProduct(productData);
                    this.clearForm();
                    this.showMessage('Producto agregado exitosamente', 'success');
                }
            }

            // Validar datos del producto
            validateProduct(product) {
                if (!product.name || product.name.length < 2) {
                    this.showMessage('El nombre del producto debe tener al menos 2 caracteres', 'error');
                    return false;
                }

                if (product.price <= 0) {
                    this.showMessage('El precio debe ser mayor a 0', 'error');
                    return false;
                }

                if (!product.category) {
                    this.showMessage('Debe seleccionar una categoría', 'error');
                    return false;
                }

                if (product.quantity < 0) {
                    this.showMessage('La cantidad no puede ser negativa', 'error');
                    return false;
                }

                // Verificar si el producto ya existe
                if (this.products.some(p => p.name.toLowerCase() === product.name.toLowerCase())) {
                    this.showMessage('Ya existe un producto con ese nombre', 'error');
                    return false;
                }

                return true;
            }

            // Agregar producto
            addProduct(productData) {
                const product = {
                    id: Date.now(),
                    ...productData,
                    createdAt: new Date().toLocaleDateString()
                };

                this.products.push(product);
                this.saveToStorage();
                this.renderProducts();
                this.updateStats();
            }

            // Eliminar producto
            deleteProduct(id) {
                this.products = this.products.filter(product => product.id !== id);
                this.saveToStorage();
                this.renderProducts();
                this.updateStats();
                this.showMessage('Producto eliminado correctamente', 'success');
            }

            // Actualizar cantidad del producto
            updateQuantity(id, change) {
                const product = this.products.find(p => p.id === id);
                if (product) {
                    const newQuantity = product.quantity + change;
                    if (newQuantity >= 0) {
                        product.quantity = newQuantity;
                        this.saveToStorage();
                        this.renderProducts();
                        this.updateStats();
                    }
                }
            }

            // Renderizar productos
            renderProducts() {
                const container = document.getElementById('productsContainer');
                
                if (this.products.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <h3>No hay productos agregados</h3>
                            <p>Agrega tu primer producto usando el formulario de arriba</p>
                        </div>
                    `;
                    return;
                }

                const productsHTML = this.products.map(product => `
                    <div class="product-card">
                        <div class="product-header">
                            <div class="product-name">${this.escapeHtml(product.name)}</div>
                            <div class="product-price">$${product.price.toFixed(2)}</div>
                        </div>
                        <div class="product-category">${product.category}</div>
                        ${product.description ? `<div class="product-description">${this.escapeHtml(product.description)}</div>` : ''}
                        <div class="product-actions">
                            <div class="quantity-controls">
                                <button class="btn-quantity" onclick="productManager.updateQuantity(${product.id}, -1)">-</button>
                                <span class="quantity-display">${product.quantity}</span>
                                <button class="btn-quantity" onclick="productManager.updateQuantity(${product.id}, 1)">+</button>
                            </div>
                            <button class="btn-delete" onclick="productManager.deleteProduct(${product.id})">Eliminar</button>
                        </div>
                    </div>
                `).join('');

                container.innerHTML = `<div class="products-grid">${productsHTML}</div>`;
            }

            // Actualizar estadísticas
            updateStats() {
                const totalProducts = this.products.length;
                const totalQuantity = this.products.reduce((sum, product) => sum + product.quantity, 0);
                const totalValue = this.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

                document.getElementById('totalProducts').textContent = totalProducts;
                document.getElementById('totalQuantity').textContent = totalQuantity;
                document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
            }

            // Mostrar mensajes
            showMessage(message, type) {
                const messagesContainer = document.getElementById('messages');
                const messageClass = type === 'success' ? 'success-message' : 'error-message';
                
                messagesContainer.innerHTML = `
                    <div class="${messageClass}">
                        ${message}
                    </div>
                `;

                // Limpiar mensaje después de 5 segundos
                setTimeout(() => {
                    messagesContainer.innerHTML = '';
                }, 5000);
            }

            // Limpiar formulario
            clearForm() {
                document.getElementById('productForm').reset();
            }

            // Guardar en localStorage
            saveToStorage() {
                localStorage.setItem('products', JSON.stringify(this.products));
            }

            // Cargar desde localStorage
            loadFromStorage() {
                const saved = localStorage.getItem('products');
                if (saved) {
                    try {
                        this.products = JSON.parse(saved);
                    } catch (e) {
                        console.error('Error al cargar datos:', e);
                        this.products = [];
                    }
                }
            }

            // Escapar HTML para prevenir XSS
            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }
