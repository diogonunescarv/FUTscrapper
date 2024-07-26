function showNotificationField() {
    const method = document.getElementById("notification-method").value;
    const emailField = document.getElementById("email-field");
    const phoneField = document.getElementById("phone-field");

    emailField.style.display = "none";
    phoneField.style.display = "none";

    if (method === "Email") {
        emailField.style.display = "block";
    } else if (method === "Telegram" || method === "SMS") {
        phoneField.style.display = "block";
    }
}

document.querySelectorAll('.star-rating').forEach(rating => {
    rating.addEventListener('click', event => {
        if (event.target.classList.contains('star')) {
            let value = event.target.getAttribute('data-value');
            rating.setAttribute('data-stars', value);
            updateStars(rating);
        }
    });
});

function updateStars(rating) {
    let value = rating.getAttribute('data-stars');
    let stars = rating.querySelectorAll('.star');
    stars.forEach(star => {
        star.classList.remove('selected');
        if (star.getAttribute('data-value') <= value) {
            star.classList.add('selected');
        }
    });
}

// Aplicar máscaras
function applyMasks() {
    const phoneInput = document.getElementById('phone');
    const countryCodeSelect = document.getElementById('country-code');
    const phoneError = document.getElementById('phone-error');

    phoneInput.removeEventListener('input', handlePhoneInput);
    phoneInput.addEventListener('input', handlePhoneInput);

    function handlePhoneInput() {
        let value = phoneInput.value;
        value = value.replace(/\D/g, ''); // Remove caracteres não numéricos

        const countryCode = countryCodeSelect.value;

        let formattedValue;
        switch (countryCode) {
            case '+55': // Brasil
                if (value.length <= 11) {
                    formattedValue = value.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
                }
                break;
            case '+1': // EUA
                if (value.length <= 10) {
                    formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                }
                break;
            case '+44': // Reino Unido
                if (value.length <= 11) {
                    formattedValue = value.replace(/(\d{5})(\d{6})/, '$1 $2');
                }
                break;
            default:
                formattedValue = value; // Caso padrão para códigos não suportados
        }
        phoneInput.value = formattedValue;
    }

    // Validar comprimento do número de telefone
    phoneInput.addEventListener('blur', function() {
        const value = phoneInput.value.replace(/\D/g, '');
        const countryCode = countryCodeSelect.value;

        switch (countryCode) {
            case '+55': // Brasil
                if (value.length !== 11) {
                    phoneError.style.display = 'block';
                } else {
                    phoneError.style.display = 'none';
                }
                break;
            case '+1': // EUA
                if (value.length !== 10) {
                    phoneError.style.display = 'block';
                } else {
                    phoneError.style.display = 'none';
                }
                break;
            case '+44': // Reino Unido
                if (value.length !== 11) {
                    phoneError.style.display = 'block';
                } else {
                    phoneError.style.display = 'none';
                }
                break;
            default:
                phoneError.style.display = 'none';
        }
    });
}

// Aplicar máscara ao carregar a página
document.addEventListener('DOMContentLoaded', applyMasks);

document.getElementById('player-search-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Validar comprimento do número de telefone
    const phoneInput = document.getElementById('phone');
    const countryCodeSelect = document.getElementById('country-code');
    const phoneError = document.getElementById('phone-error');
    const value = phoneInput.value.replace(/\D/g, '');
    const countryCode = countryCodeSelect.value;

    let isValid = true;
    if (countryCode === '+55' && value.length !== 11) {
        isValid = false;
    } else if (countryCode === '+1' && value.length !== 10) {
        isValid = false;
    } else if (countryCode === '+44' && value.length !== 11) {
        isValid = false;
    }

    if (!isValid) {
        phoneError.style.display = 'block';
        return;
    }

    phoneError.style.display = 'none';

    const position = document.getElementById('position').value;
    const price = document.getElementById('price').value;
    const overall = document.getElementById('overall').value;
    const weakFoot = document.getElementById('weak-foot').getAttribute('data-stars');
    const skillMoves = document.getElementById('skill-moves').getAttribute('data-stars');
    const name = document.getElementById('name').value;
    const notificationMethod = document.getElementById('notification-method').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Verificar se as estrelas foram preenchidas
    if (weakFoot === "0" || skillMoves === "0") {
        alert("Por favor, preencha a classificação com estrelas para 'Weak Foot' e 'Skill Moves'.");
        return;
    }

    const message = `
        Posição: ${position}
        Preço: ${price}
        Overall: ${overall}
        Pé Fraco: ${weakFoot} 
        Habilidades: ${skillMoves} 
        Nome: ${name}
        Método de Notificação: ${notificationMethod}
        ${notificationMethod && notificationMethod === "Email" ? "Email: " + email : "Telefone: " + phone}
    `;

    alert(message);
});
