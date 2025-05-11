document.addEventListener('DOMContentLoaded', async function () {
  const sidebar = document.querySelector('.switch-field');
  const subSectionSwitcher = document.querySelector('.switch-field2');
  const content = document.querySelector('.menu-content');

  // Configuración de Supabase (usa variables de entorno en producción)
  const SUPABASE_URL = 'https://gutkmqzszforlhgesrei.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dGttcXpzemZvcmxoZ2VzcmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODI3MTMsImV4cCI6MjA2MjU1ODcxM30.kKl4deZplQMq_vPBVsMIRuPLkhQ177TNT-ahMXS-jyQ';
  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  let menuData;

  try {
    // Obtener datos de Supabase y transformar a tu estructura
    const { data: sections, error } = await supabase
      .from('menu_sections')
      .select(`
        id,
        name,
        order,
        menu_sub_sections (
          id,
          name,
          order,
          menu_products (
            id,
            name,
            description,
            price,
            category
          )
        )
      `)
      .order('order', { ascending: true });

    if (error) throw error;

    // Transformar datos a tu estructura JSON original
    menuData = {
      menu: {
        secciones: {}
      }
    };

    sections.forEach(section => {
      menuData.menu.secciones[section.name] = {
        productos: [],
        subsecciones: {}
      };

      if (section.menu_sub_sections && section.menu_sub_sections.length > 0) {
        section.menu_sub_sections.forEach(subSection => {
          menuData.menu.secciones[section.name].subsecciones[subSection.name] = {
            nombre: subSection.name,
            productos: subSection.menu_products.map(product => ({
              nombre: product.name,
              descripcion: product.description,
              precio: product.price
            }))
          };

          // Agrupar por categorías si existen
          const productsByCategory = {};
          subSection.menu_products.forEach(product => {
            if (product.category) {
              if (!productsByCategory[product.category]) {
                productsByCategory[product.category] = [];
              }
              productsByCategory[product.category].push({
                nombre: product.name,
                descripcion: product.description,
                precio: product.price
              });
            }
          });

          // Añadir categorías como propiedades
          Object.entries(productsByCategory).forEach(([category, products]) => {
            menuData.menu.secciones[section.name].subsecciones[subSection.name][category] = products;
          });
        });
      } else {
        // Procesar productos directos de la sección
        menuData.menu.secciones[section.name].productos = section.menu_products?.map(product => ({
          nombre: product.name,
          descripcion: product.description,
          precio: product.price
        })) || [];
      }
    });

  } catch (error) {
    console.error('Error cargando el menú:', error);
    content.innerHTML = '<p>Error cargando el menú.</p>';
    return;
  }

  // Resto del código de renderizado del menú (sin cambios)
  renderSidebar();
  
  // Renderizar la barra lateral principal
  function renderSidebar() {
    sidebar.innerHTML = '';
    for (const [sectionKey, sectionData] of Object.entries(menuData.menu.secciones)) {
      const inputId = `section-${sectionKey}`;
      
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'section';
      input.id = inputId;
      input.value = sectionKey;
      input.dataset.section = sectionKey;
      
      const label = document.createElement('label');
      label.htmlFor = inputId;
      label.textContent = sectionKey;

      sidebar.appendChild(input);
      sidebar.appendChild(label);

      input.addEventListener('change', () => {
        if (sectionData.subsecciones) {
          renderSubSectionSwitch(sectionKey, sectionData.subsecciones);
        } else {
          subSectionSwitcher.classList.add('hidden');
          renderProductsContent(sectionKey, sectionData.productos);
        }
      });
    }

    // Activar la primera sección por defecto
    const firstInput = sidebar.querySelector('input');
    if (firstInput) {
      firstInput.checked = true;
      const event = new Event('change');
      firstInput.dispatchEvent(event);
    }
  }

  // Renderizar subsecciones
  function renderSubSectionSwitch(sectionKey, subSections) {
    subSectionSwitcher.innerHTML = '';
    subSectionSwitcher.classList.remove('hidden');

    for (const [subKey, subData] of Object.entries(subSections)) {
      const subId = `sub-${sectionKey}-${subKey}`;

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'subsection';
      input.id = subId;
      input.value = subKey;
      input.dataset.section = sectionKey;
      input.dataset.subsection = subKey;

      const label = document.createElement('label');
      label.htmlFor = subId;
      label.textContent = subData.nombre;

      input.addEventListener('change', () => {
        renderSectionContent(sectionKey, subKey);
      });

      subSectionSwitcher.appendChild(input);
      subSectionSwitcher.appendChild(label);
    }

    // Activar la primera subsección por defecto
    const firstSubInput = subSectionSwitcher.querySelector('input');
    if (firstSubInput) {
      firstSubInput.checked = true;
      const event = new Event('change');
      firstSubInput.dispatchEvent(event);
    }

    // Desplazar al inicio en móviles
    if (window.innerWidth <= 480) {
      subSectionSwitcher.scrollLeft = 0;
    }
  }

  // Renderizar contenido de una sección con subsecciones
  function renderSectionContent(sectionKey, subSectionKey) {
    const sectionData = menuData.menu.secciones[sectionKey].subsecciones[subSectionKey];
    content.innerHTML = '';

    // Primero renderizamos los productos principales si existen
    if (sectionData.productos && sectionData.productos.length > 0) {
      renderProducts(sectionData.productos);
    }
    
    // Luego renderizamos cada categoría especial
    for (const [categoryKey, categoryData] of Object.entries(sectionData)) {
      if (categoryKey !== 'nombre' && categoryKey !== 'productos' && Array.isArray(categoryData)) {
        // Creamos un título para la categoría
        const categoryTitle = document.createElement('h1');
        categoryTitle.className = 'category-title';
        // Formateamos el título (reemplazamos _ y capitalizamos)
        categoryTitle.textContent = formatCategoryName(categoryKey);
        content.appendChild(categoryTitle);
        
        renderProducts(categoryData);
      }
    }
  }
  
  // Formatear nombres de categoría
  function formatCategoryName(name) {
    return name.replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Renderizar lista de productos
  function renderProducts(products, categoryName = null) {
    const productList = document.createElement('ul');
    productList.className = 'product-list';
    
    products.forEach(product => {
      const listItem = document.createElement('li');
      listItem.className = 'product-item';
      
      const productTitle = document.createElement('h2');
      productTitle.className = 'product-title';
      productTitle.textContent = product.nombre;
      
      listItem.appendChild(productTitle);
      
      // Añadir el separador debajo del nombre
      const separator = document.createElement('hr');
      separator.className = 'menu-separator';
      listItem.appendChild(separator);
      
      if (product.descripcion && product.descripcion.trim() !== '') {
        const productDesc = document.createElement('p');
        productDesc.className = 'product-desc';
        productDesc.textContent = product.descripcion;
        listItem.appendChild(productDesc);
      }
      
      const productPrice = document.createElement('p');
      productPrice.className = 'product-price';
      
      const priceSpan = document.createElement('span');
      priceSpan.style.color = 'var(--primary-color)';
      priceSpan.textContent = '$';
      
      productPrice.appendChild(priceSpan);
      productPrice.appendChild(document.createTextNode(` ${product.precio?.toLocaleString() || 'Consultar'}`));
      
      listItem.appendChild(productPrice);
      
      productList.appendChild(listItem);
    });
    
    content.appendChild(productList);
  }
  
  // Renderizar contenido directo de productos
  function renderProductsContent(sectionKey, products) {
    content.innerHTML = '';
    
    if (Array.isArray(products)) {
      renderProducts(products);
    } else {
      // Si no es un array, asumimos que es un objeto con categorías
      for (const [categoryKey, categoryData] of Object.entries(products)) {
        if (Array.isArray(categoryData)) {
          const categoryTitle = document.createElement('h2');
          categoryTitle.className = 'category-title';
          categoryTitle.textContent = formatCategoryName(categoryKey);
          content.appendChild(categoryTitle);
          
          renderProducts(categoryData);
        }
      }
    }
  }
  
  // Inicializar la aplicación
  renderSidebar();
});
