function showNotificationField() {
    const method = document.getElementById("notification-method").value;
    const emailField = document.getElementById("email-field");
    const phoneField = document.getElementById("phone-field");
    const phoneInput = document.getElementById("phone");

    emailField.style.display = "none";
    phoneField.style.display = "none";

    if (method === "Email") {
        emailField.style.display = "block";
        phoneInput.removeAttribute('required'); 
    } else if (method === "SMS") {
        phoneField.style.display = "block";
        phoneInput.setAttribute('required', 'required'); 
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

function applyMasks() {
    const phoneInput = document.getElementById('phone');
    const countryCodeSelect = document.getElementById('country-code');
    const phoneError = document.getElementById('phone-error');

    phoneInput.removeEventListener('input', handlePhoneInput);
    phoneInput.addEventListener('input', handlePhoneInput);

    function handlePhoneInput() {
        let value = phoneInput.value;
        value = value.replace(/\D/g, ''); // Remove non-numeric characters

        const countryCode = countryCodeSelect.value;

        let formattedValue;
        switch (countryCode) {
            case '+55': // Brazil
                if (value.length <= 11) {
                    formattedValue = value.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
                }
                break;
            case '+1': // USA
                if (value.length <= 10) {
                    formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                }
                break;
            default:
                formattedValue = value; 
        }
        phoneInput.value = formattedValue; // Display formatted value for user
    }

    phoneInput.addEventListener('blur', function() {
        const value = phoneInput.value.replace(/\D/g, '');
        const countryCode = countryCodeSelect.value;

        switch (countryCode) {
            case '+55': // Brazil
                if (value.length !== 11) {
                    phoneError.style.display = 'block';
                } else {
                    phoneError.style.display = 'none';
                }
                break;
            case '+1': // USA
                if (value.length !== 10) {
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

document.addEventListener('DOMContentLoaded', applyMasks);

document.getElementById('player-search-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const phoneField = document.getElementById('phone-field');
    const phoneInput = document.getElementById('phone');
    const countryCodeSelect = document.getElementById('country-code');
    const phoneError = document.getElementById('phone-error');
    let isValid = true;

    if (phoneField.style.display === 'block') {
        const value = phoneInput.value.replace(/\D/g, ''); // Unformat the phone number
        const countryCode = countryCodeSelect.value;

        switch (countryCode) {
            case '+55': // Brazil
                if (value.length !== 11) {
                    isValid = false;
                    phoneError.style.display = 'block';
                } else {
                    phoneError.style.display = 'none';
                }
                break;
            case '+1': // USA
                if (value.length !== 10) {
                    isValid = false;
                    phoneError.style.display = 'block';
                } else {
                    phoneError.style.display = 'none';
                }
                break;
            default:
                phoneError.style.display = 'none';
        }
    } else {
        phoneError.style.display = 'none'; 
    }

    const weakFoot = document.getElementById('weak-foot').getAttribute('data-stars');
    const skillMoves = document.getElementById('skill-moves').getAttribute('data-stars');

    if (weakFoot === "0" || skillMoves === "0") {
        isValid = false;
        alert("Please complete the star rating for 'Weak Foot' and 'Skill Moves'.");
    }

    if (isValid) {
        const position = document.getElementById('position').value;
        const price = document.getElementById('price').value;
        const overall = document.getElementById('overall').value;
        const name = document.getElementById('name').value;
        const notificationMethod = document.getElementById('notification-method').value;
        const email = document.getElementById('email').value;
        const countryCode = countryCodeSelect.value;
        const phone = countryCode + phoneInput.value.replace(/\D/g, ''); // Concatenate country code and unformatted phone number
        
        const formData = {
            position: position,
            price: price,
            overall: overall,
            name: name,
            notificationMethod: notificationMethod,
            email: email,
            phone: phone,
            weakFoot: weakFoot,
            skillMoves: skillMoves
        };

        console.log(formData);

        fetch('/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error submitting form');
            }
            return response.json(); 
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Error processing data');
            }
            console.log('Server response:', data);
            alert('Form submitted successfully!');
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('Error submitting form. Please try again later.');
        });        
    }
});
