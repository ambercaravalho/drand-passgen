// wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {

    // set references from HTML elements to variables
    const lengthInput = document.getElementById('length');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const generateButton = document.getElementById('generate');
    const passwordDisplay = document.getElementById('password');

    // set default character sets for each option
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    // function to generate the password
    function generatePassword() {
        // pull checkbox values and length from the HTML form
        const length = parseInt(lengthInput.value);
        const includeLowercase = lowercaseCheckbox.checked;
        const includeUppercase = uppercaseCheckbox.checked;
        const includeNumbers = numbersCheckbox.checked;
        const includeSymbols = symbolsCheckbox.checked;

        // validate that at least one checkbox is selected
        if (!includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols) {
            alert('Please select at least one character type.');
            return;
        }

        // build the character pool based on options
        let charPool = '';
        if (includeLowercase) charPool += lowercaseChars;
        if (includeUppercase) charPool += uppercaseChars;
        if (includeNumbers) charPool += numberChars;
        if (includeSymbols) charPool += symbolChars;

        // convert built character pool to an array
        const charArray = charPool.split('');

        // create another array to hold the generated password characters
        let passwordArray = [];

        // generate secure random numbers using the Web Crypto API
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);

        // build the password based on randomeValues and charArray
        for (let i = 0; i < length; i++) {
            // use the random value to pick a character from the pool
            const randomIndex = randomValues[i] % charArray.length;
            passwordArray.push(charArray[randomIndex]);
        }

        // display the generated password
        passwordDisplay.textContent = passwordArray.join('');
    }

    // run script when the generate button is clicked
    generateButton.addEventListener('click', generatePassword);

});
