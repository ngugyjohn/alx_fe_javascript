// Mock server URL for demonstration purposes
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Replace with actual API endpoint

// Array to store quotes, loaded from local storage if available
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Get busy living or get busy dying.", category: "Motivation" }
];

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - <em>${quote.category}</em>`;

    // Optionally store the last viewed quote using session storage
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Function to add a new quote to the quotes array and update the DOM
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes(); // Save to local storage
        populateCategories(); // Update categories in dropdown
        document.getElementById('newQuoteText').value = ''; // Clear the input field
        document.getElementById('newQuoteCategory').value = ''; // Clear the input field
        alert("Quote added successfully!");
        syncQuotes(); // Sync with server after adding a new quote
    } else {
        alert("Please enter both a quote and a category.");
    }
}

// Function to populate the category filter dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const uniqueCategories = [...new Set(quotes.map(q => q.category))];

    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore the last selected filter
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        categoryFilter.value = savedCategory;
    }
}

// Function to filter quotes based on the selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory);
    if (selectedCategory === 'all') {
        showRandomQuote();
    } else {
        const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const quote = filteredQuotes[randomIndex];
        document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - <em>${quote.category}</em>`;
    }
}

// Async function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();
        // Assuming serverQuotes is an array of quotes from the server
        const serverQuotesArray = serverQuotes.map(quote => ({
            text: quote.body, // Adjust according to the actual server data structure
            category: quote.title // Adjust according to the actual server data structure
        }));
        quotes = serverQuotesArray; // Server data takes precedence
        saveQuotes();
        populateCategories(); // Update categories in dropdown
        alert('Quotes have been synchronized with the server.');
    } catch (error) {
        console.error('Failed to fetch quotes from server:', error);
    }
}

// Async function to post new quotes to the server
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quote)
        });

        if (response.ok) {
            alert('Quote successfully posted to the server.');
        } else {
            console.error('Failed to post quote to server:', response.statusText);
        }
    } catch (error) {
        console.error('Error posting quote to server:', error);
    }
}

// Function to synchronize quotes with the server
async function syncQuotes() {
    try {
        await fetchQuotesFromServer(); // Fetch the latest quotes from the server
        for (const quote of quotes) {
            await postQuoteToServer(quote); // Post each quote to the server
        }
    } catch (error) {
        console.error('Error syncing quotes:', error);
    }
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories(); // Update categories in dropdown
        alert('Quotes imported successfully!');
        syncQuotes(); // Sync with server after importing new quotes
    };
    fileReader.readAsText(event.target.files[0]);
}

// Attach the event listener to the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initial display of a quote
showRandomQuote();

// Populate categories in dropdown
populateCategories();

// Create the form for adding new quotes
createAddQuoteForm();

// Fetch quotes from the server on load
fetchQuotesFromServer();

// Periodic syncing with the server
setInterval(syncQuotes, 300000); // Sync every 5 minutes
