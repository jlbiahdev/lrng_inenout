
const workers = './data/workers.json';

let workersData = []; // Move to global scope

$(document).ready(() => {

    console.log('Document is ready');
    console.log('Workers JSON path:', workers);

    fetch(workers)
    .then(response => response.json())
    .then(data => {
        console.log('Workers data loaded:', data);
        if (!Array.isArray(data)) {
            throw new Error('Workers data is not an array');
        }
        data.forEach(worker => {
            if (!worker.firstname || !worker.lastname || !worker.photo || !worker.code) {
                throw new Error('Worker data is missing required fields: firstname, lastname, photo, or code');
            }
            if (typeof worker.present !== 'boolean') {
                worker.present = false; // Default to false if not provided
            }
            if (typeof worker.firstname !== 'string' || typeof worker.lastname !== 'string' || typeof worker.photo !== 'string' || typeof worker.code !== 'string') {
                throw new Error('Worker data fields must be strings or boolean for present');
            }
            worker.name = `${worker.firstname} ${worker.lastname}`;
        });
        console.log('All worker data is valid');
        return data;
    })
    .then(data => {
        workersData = data;
        init_workers(workersData);
        init_letters();
    })
    .catch(error => {
        console.error('Error loading workers.json:', error);
    });

});
function init_letters() {
    console.log('Initializing letters');
    const $lettersSection = $('#letters');

    const $links = $lettersSection.find('a'); 
    $links.each(function() {
        $(this).on('click', handleLetterClick);
    });
    
}

function init_workers(workersData) {
    console.log('Initializing workers');
    const $workersSection = $('#workers');

    workersData.forEach(worker => {
        const $workerDiv = $('<div>');
            $workerDiv.addClass('worker');

        // Left: Photo
        const $photo = $('<img>')
            .attr('src', `/assets/images/${worker.photo}`)
            .attr('alt', `${worker.firstname} ${worker.lastname}`);

        // Right: Info
        const $infoCol = $('<div>');
        $infoCol.addClass('info');

        const $firstname = $('<div>').text(worker.firstname);
        const $lastname = $('<div>').text(worker.lastname);

        $firstname.addClass('first-name');
        $lastname.addClass('last-name');
        const $button = $('<button>')
            .text(worker.present ? 'Check-out' : 'Check-in')
            .css({ background: worker.present ? '#e57373' : '#81c784' });

        $infoCol.append($firstname, $lastname, $button);
        $workerDiv.append($photo, $infoCol);
        $workersSection.append($workerDiv);
        $button.on('click', function() {
            const $popup = $(`
                <div class="popup-overlay">
                    <div class="popup">
                        <label>Entrez votre code : ${worker.name}</label>
                        <input type="password" class="worker-code-input" autofocus />
                        <div class="popup-error" style="color:red;display:none;"></div>
                        <div class="popup-buttons">
                            <button class="popup-ok">OK</button>
                            <button class="popup-cancel">Annuler</button>
                        </div>
                    </div>
                </div>
            `);
            $('body').append($popup);

            $popup.find('.popup-cancel').on('click', function() {
                $popup.remove();
            });

            $popup.find('.popup-ok').on('click', () => {
                const inputCode = $popup.find('.worker-code-input').val();
                if (inputCode === worker.code) {
                    $popup.remove();
                    worker.present = !worker.present;
                    $(this)
                        .text(worker.present ? 'Check-out' : 'Check-in')
                        .css({ background: worker.present ? '#e57373' : '#81c784' });
                    // La suite de la mise à jour se fait après la popup
                } else {
                    $popup.find('.popup-error').text('Code incorrect.').show();
                }
            });

            // Empêche la suite de la mise à jour tant que le code n'est pas correct
            return false;
        });
    });
}

export function handleLetterClick(event) {
    event.preventDefault();
    const letter = $(event.target).text();
    const filteredWorkers = letter === '*' ? workersData : workersData.filter(worker => worker.lastname.charAt(0).toUpperCase() === letter);

    $('#workers').empty();
    console.log(`Filtering workers by letter: ${letter}`);
    console.log('Filtered workers:', filteredWorkers);
    init_workers(filteredWorkers);
}