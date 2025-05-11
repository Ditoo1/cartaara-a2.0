document.addEventListener('DOMContentLoaded', async function () {
  const sidebar = document.querySelector('.switch-field');
  const subSectionSwitcher = document.querySelector('.switch-field2');
  const content = document.querySelector('.menu-content');

  const supabaseUrl = 'https://gutkmqzszforlhgesrei.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1dGttcXpzemZvcmxoZ2VzcmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5ODI3MTMsImV4cCI6MjA2MjU1ODcxM30.kKl4deZplQMq_vPBVsMIRuPLkhQ177TNT-ahMXS-jyQ';

  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  let menuData;

  try {
    const { data, error } = await supabase
      .from('menu_data')
      .select('menu_json')
      .order('last_updated', { ascending: false })
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No hay datos disponibles');

    menuData = data[0].menu_json;

  } catch (error) {
    console.error('Error:', error);
    content.innerHTML = '<p>Error cargando el menú. Recargue la página.</p>';
    return;
  }

  // renderizado del menú
  renderSidebar();
  
  // barra lateral p
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

    // primera secciopn por defecot
    const firstInput = sidebar.querySelector('input');
    if (firstInput) {
      firstInput.checked = true;
      const event = new Event('change');
      firstInput.dispatchEvent(event);
    }
  }

  // render subsecciones
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

    // primera subseccion default
    const firstSubInput = subSectionSwitcher.querySelector('input');
    if (firstSubInput) {
      firstSubInput.checked = true;
      const event = new Event('change');
      firstSubInput.dispatchEvent(event);
    }


    if (window.innerWidth <= 480) {
      subSectionSwitcher.scrollLeft = 0;
    }
  }


  function renderSectionContent(sectionKey, subSectionKey) {
    const sectionData = menuData.menu.secciones[sectionKey].subsecciones[subSectionKey];
    content.innerHTML = '';


    if (sectionData.productos && sectionData.productos.length > 0) {
      renderProducts(sectionData.productos);
    }
    
    for (const [categoryKey, categoryData] of Object.entries(sectionData)) {
      if (categoryKey !== 'nombre' && categoryKey !== 'productos' && Array.isArray(categoryData)) {
        const categoryTitle = document.createElement('h1');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = formatCategoryName(categoryKey);
        content.appendChild(categoryTitle);
        
        renderProducts(categoryData);
      }
    }
  }
  
  function formatCategoryName(name) {
    return name.replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
  }

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
  

  function renderProductsContent(sectionKey, products) {
    content.innerHTML = '';
    
    if (Array.isArray(products)) {
      renderProducts(products);
    } else {

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
  

  renderSidebar();
});
