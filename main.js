document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".scrollable-tabs-container a");
    const platosSections = document.querySelectorAll(".platos > div");

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

    // Ocultar todas las secciones de platos al inicio
    hideAllPlatosSections();

    // Mostrar la sección de platos fríos por defecto
    platosSections[0].style.display = "block";

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", (event) => {
            event.preventDefault(); // Evitar el comportamiento predeterminado del enlace
            removeAllActiveClasses();
            hideAllPlatosSections();

            tab.classList.add("active");
            platosSections[index].style.display = "block";
        });
    });
});
