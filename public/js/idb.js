let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_test', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorcode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_test'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_test');
    budgetObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_test'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_test');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_test'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_test');
                budgetObjectStore.clear();
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadTransaction);