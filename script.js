function HasCookie(pKey) { return false; }
function SetCookie(pKey, pValue) { return null; }
function GetCookie(pKey) { return null; }

const TEST = false;

// asks user to download a file with specified filename and contents
function Download(pFilename, pText) {
    // create anchor element
    let element = document.createElement('a');
    // set its destination so browser treats is as download prompt with given text
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(pText));
    // set default name for downloaded file
    element.setAttribute('download', pFilename);

    // do not show this element
    element.style.display = 'none';
    // when it is added to document
    document.body.appendChild(element);

    // because we need it to be appended in order to click on it and activate download
    element.click();

    // but then after we have no further use, we get rid of this element
    document.body.removeChild(element);
}

// toggles value whether checklist item is checked or not in entries array
function ChecklistItemCheckboxToggleHandler(event) {
    entries[event.target.dataset.id].checked = Boolean(1 - (+entries[event.target.dataset.id].checked));
    event.target.parentElement.parentElement.classList.toggle('checked');
}

// creates item to display in checklist
function CreateItem(pIdx, pValue, pChecked = false) {
    let item = document.createElement('div');
    item.classList.add('item');

    let itemSelection = document.createElement('label');
    itemSelection.classList.add('item-selection');

    let itemSelectionCheckbox = document.createElement('input');
    itemSelectionCheckbox.classList.add('item-selection-checkbox');
    itemSelectionCheckbox.setAttribute('type', 'checkbox')

    itemSelection.appendChild(itemSelectionCheckbox);

    let itemBody = document.createElement('label');
    itemBody.classList.add('item-body');

    let itemBodyCheckbox = document.createElement('input');
    itemBodyCheckbox.classList.add('item-body-checkbox');
    itemBodyCheckbox.setAttribute('type', 'checkbox');
    itemBodyCheckbox.dataset.id = pIdx;
    itemBodyCheckbox.addEventListener('change', ChecklistItemCheckboxToggleHandler);
    if (pChecked) {
        item.classList.add('checked');
        itemBodyCheckbox.setAttribute('checked', 'checked');
    }

    let itemBodyDescription = document.createElement('span');
    itemBodyDescription.classList.add('item-body-description');
    itemBodyDescription.innerHTML = pValue;

    itemBody.appendChild(itemBodyCheckbox);
    itemBody.appendChild(itemBodyDescription);

    item.appendChild(itemSelection);
    item.appendChild(itemBody);

    return item;
}

function UpdateChecklist() {
    // get 'checklist' element reference
    let checklist = document.getElementById('checklist');
    // and empty it
    checklist.textContent = '';

    for (let i = 0; i < entries.length; i++) {
        const element = entries[i];

        checklist.appendChild(CreateItem(i, element.value, element.checked));
    }
}

// initiate entires array
let entries = [];
// if entires were saved to cookies then load them back
if (HasCookie('entries')) entries = JSON.parse(GetCookie('entries'));

window.addEventListener('load', function () {
    if (TEST) {
        for (let i = 0; i < 20; i++) {
            entries.push({
                value: "asd",
                checked: false,
            });
        }

        UpdateChecklist();
    }

    this.document.getElementById('clear').addEventListener('click', function (event) {
        document.getElementById('source').value = '';
    });

    // CONVERT
    this.document.getElementById('convert').addEventListener('click', function (event) {
        // get 'source' textarea element
        let source = document.getElementById('source');
        // split entered value by break line
        let sourceList = source.value.split('\n');

        // initiate filtered checklist array
        let sourceListFiltered = [];
        // iterate through every checklist item and add
        // add it to filtered array if it is not empty string
        sourceList.forEach(function (element) {
            if (element.trim().length !== 0) sourceListFiltered.push(element.trim());
        });

        // for every non-empty checklist item
        for (let i = 0; i < sourceListFiltered.length; i++) {
            const sourceListFilteredElement = sourceListFiltered[i];

            // add its information to entries
            entries.push({
                value: sourceListFilteredElement,
                checked: false,
            });
        }

        // and add to checklist so to display it
        UpdateChecklist();
    });

    // SAVE
    this.document.getElementById('save').addEventListener('click', function (event) {
        // encode into JSON entries array and ask user to download its dump file
        Download('dump', JSON.stringify(entries));
    });

    // LOAD
    this.document.getElementById('load').addEventListener('click', function (event) {
        // get input type file element
        let loader = document.getElementById('saves-loader');

        // if accessed without problems
        if (loader) {
            // empty entries array after last use
            entries = [];

            // get 'checklist' element reference
            let checklist = document.getElementById('checklist');
            // and empty it
            checklist.textContent = '';

            // remove all previously loaded files from loader
            loader.value = '';

            // ask for a file
            loader.click();
        }
    });

    // 
    function ReadFileAsTextProcessHadler(event) {
        // decode JSON representation of entires array
        let readEntries = JSON.parse(event.target.result);

        // get 'checklist' element reference
        let checklist = document.getElementById('checklist');

        // for every element of read entries 
        for (let i = 0; i < readEntries.length; i++) {
            const readEntry = readEntries[i];

            // add its information to entries
            entries.push({
                value: readEntry.value,
                checked: readEntry.checked,
            });
        }

        // and add to checklist so to display it
        UpdateChecklist();
    }

    // loader
    this.document.getElementById('saves-loader').addEventListener('change', function (event) {
        // get all passed files
        let files = event.target.files;

        // for every file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // initiate file reader
            const reader = new FileReader();

            // set async function to execute when file reader has read file contents
            reader.addEventListener('load', ReadFileAsTextProcessHadler);
            // try to read file contents
            reader.readAsText(file);
        }
    });

    let selectAll = true;
    let text = [
        'Select all',
        'Deselect all',
    ];

    function ToggleSelectionText() {
        document.getElementById('select-all').innerHTML = text[+selectAll];
    }

    this.document.getElementById('select-all').addEventListener('click', function (event) {
        ToggleSelectionText();

        document.querySelectorAll('.item-selection-checkbox').forEach(function (element) {
            element.checked = selectAll;
        });

        selectAll = !selectAll;
    });

    this.document.getElementById('remove').addEventListener('click', function (event) {
        let response = confirm('Are you sure?');

        if (response === true) {
            let list = Array.from(document.querySelectorAll('.item-selection-checkbox')).filter((el) => el.checked);

            let idsToRemove = list.map((el) => parseInt(el.parentElement.parentElement.children[1].children[0].dataset.id));

            let entriesFiltered = []
            for (let i = 0; i < entries.length; i++) {
                const element = entries[i];

                if (!idsToRemove.includes(i)) entriesFiltered.push(element);
            }

            entries = entriesFiltered;

            UpdateChecklist();

            if (!selectAll) {
                ToggleSelectionText();

                selectAll = true;
            }
        }
    });

    this.document.getElementById('to-list').addEventListener('click', function (event) {
        let strings = entries.map((el) => el.value);
        let joined = strings.join('\n');
        document.getElementById('source').value = joined;
    });
});