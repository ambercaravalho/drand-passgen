document.addEventListener('DOMContentLoaded', function() {

    // pull element states from the HTML form
    const lengthInput = document.getElementById('length');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const generateButton = document.getElementById('generate');
    const passwordDisplay = document.getElementById('password');

    // set generator character pools
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    /**
     * Function to fetch randomness from Cloudflare's drand server.
     * @returns {Promise<string|null>} A promise that resolves to the randomness hex string or null if failed.
     */
    async function getDrandRandomness() {
        try {
            // fetch the latest randomness JSON from drand server
            const response = await fetch('https://drand.cloudflare.com/public/latest');
            const data = await response.json();
            // return randomness hex string from the JSON response
            return data.randomness;
        } catch (error) {
            console.error('Error fetching drand randomness from Cloudflare!', error);
            return null;
        }
    }

    /**
     * Function to convert a hex string to a byte array. 
     * This ensures remote and local randomness strings are in the same format.
     * @param {string} hexString - The hex string to convert.
     * @returns {Uint8Array|null} The byte array or null if invalid input.
     */
    function hexStringToByteArray(hexString) {
        // check if hex string length is even (is the drand response somewhat valid?)
        if (hexString.length % 2 !== 0) {
            console.error('Invalid drand randomness hex string! Expected string length is even.');
            return null;
        }
        // create a byte array of half the length of the hex string 
        const byteArray = new Uint8Array(hexString.length / 2);
        // convert each pair of hex characters to a byte
        for (let i = 0; i < byteArray.length; i++) {
            byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
        }
        return byteArray;
    }

    /**
     * Asynchronous function to generate the password.
     * Combines remote and local randomness values to ensure true randomness in generation.
     */
    async function generatePassword() {
        // pull element states from the HTML form
        const length = parseInt(lengthInput.value);
        const includeLowercase = lowercaseCheckbox.checked;
        const includeUppercase = uppercaseCheckbox.checked;
        const includeNumbers = numbersCheckbox.checked;
        const includeSymbols = symbolsCheckbox.checked;

        // validate that at least one character type is selected
        if (!includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols) {
            alert('Please select at least one character type.');
            return;
        }

        // build the final character pool based on selected options
        let charPool = '';
        if (includeLowercase) charPool += lowercaseChars;
        if (includeUppercase) charPool += uppercaseChars;
        if (includeNumbers) charPool += numberChars;
        if (includeSymbols) charPool += symbolChars;

        // convert the character pool to an array
        const charArray = charPool.split('');

        // REMOTE: fetch randomness from drand server API
        const drandRandomnessHex = await getDrandRandomness();
        if (!drandRandomnessHex) {
            alert('Failed to fetch randomness value from drand server.\nCheck the console for more details or open a GitHub issue.');
            return;
        }

        // convert the drand randomness hex string to a byte array
        const drandByteArray = hexStringToByteArray(drandRandomnessHex);
        if (!drandByteArray) {
            alert('Invalid randomness value received from drand server.\nCheck the console for more details or open a GitHub issue.');
            return;
        }

        // LOCAL: generate secure random bytes using the Web Crypto API
        const randomValues = new Uint8Array(length);
        window.crypto.getRandomValues(randomValues);

        // create an array to hold the combined random values
        const combinedRandomValues = new Uint8Array(length);

        // combine the random values from local Web Crypto API and remote drand server
        for (let i = 0; i < length; i++) {
            // XOR the local random byte with a byte from drand randomness
            combinedRandomValues[i] = randomValues[i] ^ drandByteArray[i % drandByteArray.length];
        }

        // create an array to hold the password characters
        let passwordArray = [];

        // build the password using the combined random values
        for (let i = 0; i < length; i++) {
            // use the combined random value to pick a character from the final pool
            const randomIndex = combinedRandomValues[i] % charArray.length;
            passwordArray.push(charArray[randomIndex]);
        }

        // display the generated password
        passwordDisplay.textContent = passwordArray.join('');

        // Remove the hint styling class
        passwordDisplay.classList.remove('hint');
    }

    /**
     * Function to copy the password to the clipboard.
     */
    function copyPassword() {
        const password = passwordDisplay.textContent;
        if (password && !passwordDisplay.classList.contains('hint')) {
            // create a temporary textarea element to select the text
            const textarea = document.createElement('textarea');
            textarea.value = password;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                alert('Password copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy password:', err);
                alert('Failed to copy password.');
            }
            document.body.removeChild(textarea);
        } else {
            alert('Nothing to copy. Please generate a password first.');
        }
    }
    
    // run the password generation function when the button is clicked
    generateButton.addEventListener('click', generatePassword);

    // Add event listener to the copy button
    copyButton.addEventListener('click', copyPassword);

});
