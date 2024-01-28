document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".scrollable-tabs-container a");
    const platosSections = document.querySelectorAll(".platos > div");
    const seccionComida = document.querySelector(".seccion-comida");
    const seccionBebidas = document.querySelector(".seccion-bebidas");
    const seccionTragos = document.querySelector(".seccion-tragos");

    const removeAllActiveClasses = () => {
        tabs.forEach((tab) => {
            tab.classList.remove("active");
        });
    };

    const hideAllPlatosSections = () => {
        platosSections.forEach((section) => {
            section.style.display = "none";
        });
    };

    const hideAllSecciones = () => {
        hideAllPlatosSections();
        seccionComida.style.display = "none";
        seccionBebidas.style.display = "none";
        seccionTragos.style.display = "none";
    };

    // Ocultar todas las secciones al inicio
    hideAllPlatosSections();
    hideAllSecciones();

    // Mostrar la sección de platos fríos por defecto
    platosSections[0].style.display = "block";

    // Simular clic en la pestaña de comida al cargar la página
    tabs[0].classList.add("active");
    seccionComida.style.display = "block";

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", (event) => {
            event.preventDefault(); // Evitar el comportamiento predeterminado del enlace
            removeAllActiveClasses();
            hideAllPlatosSections();

            tab.classList.add("active");
            platosSections[index].style.display = "block";
        });
    });

    // Agregar event listener para el cambio del switch
    const switchField = document.querySelector(".switch-field");
    switchField.addEventListener("change", (event) => {
        const selectedValue = event.target.value;
        hideAllSecciones();
        removeAllActiveClasses();

        switch (selectedValue) {
            case "platos":
                seccionComida.style.display = "block";
                tabs[0].classList.add("active");
                platosSections[0].style.display = "block";
                break;
            case "bebidas":
                seccionBebidas.style.display = "block";
                break;
            case "tragos":
                seccionTragos.style.display = "block";
                break;
            default:
                // Manejar cualquier otro caso según sea necesario
                break;
        }
    });
});
