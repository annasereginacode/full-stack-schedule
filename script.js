"use strict";

const headers = [
    "Time",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];

let current_user = {
    email: '',
    name: '',
    isAdmin: false,
};

let client_schedule = [];
let saved_schedule = [];

function hasUnsavedChanges() {
    const changed = JSON.stringify(client_schedule) !== JSON.stringify(saved_schedule);
    return changed;
}

function create_table_header(table) {
    headers.forEach(textCell => {
        const div = document.createElement('div')
        div.className = 'header'
        div.textContent = textCell
        table.appendChild(div)
    });
}

function create_button(textContent, className, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = textContent;
    button.className = className;
    button.disabled = disabled;
    return button;
}

function add_schedule_button_listener(button, scheduleObject, day) {
    button.addEventListener("click", function() {
        if (!current_user.email) {
            alert("Enter your email to edit the schedule.");
            return;
        }
        let schedule_value;
        if (button.textContent === "Available") {
            button.textContent =  (current_user.isAdmin) ? "Busy" : current_user.name;
            button.className = "booked";
            schedule_value = current_user.email;
        } else {
            button.textContent = "Available";
            button.className = "available";
            schedule_value = "Available";
        }
        scheduleObject[day] = schedule_value;
    });
}

function schedule_cell_state(schedule_cell_data, row_nums, day) {
    //current_user: email, name, isAdmin
    let button;
    let isAdmin = current_user.isAdmin;
    let email = current_user.email;
    let cell_owner = email.localeCompare(schedule_cell_data) === 0;
    
    if (isAdmin) {
        if (schedule_cell_data === "Available") {
            // Available -> Action: can switch
            button = create_button("Available", "available"); // create a new <button>
            add_schedule_button_listener(button, client_schedule[row_nums], day);

        } else if (cell_owner) {
            // button is Busy -> Action: can switch
            button = create_button("Busy", "booked");
            add_schedule_button_listener(button, client_schedule[row_nums], day);  
        } else {
            // student booked
            const student_name = schedule_cell_data.split('@')[0].split('.')[0]; // s-jane
            button = create_button(student_name, "student_booked");
            button.title = schedule_cell_data; // title with a student email
            button.addEventListener("click", function() {
                alert(schedule_cell_data);
            });
        }
    } else {
        if (schedule_cell_data === "Available") {
            // Available -> Action: can switch
            button = create_button("Available", "available");
            add_schedule_button_listener(button, client_schedule[row_nums], day);
        } else if (cell_owner) {
            // Student Name -> Action: can switch
            button = create_button(current_user.name, "booked");
            add_schedule_button_listener(button, client_schedule[row_nums], day);
        } else {
            // Available -> Action: can switch; Busy -> Action: disabled
            button = create_button("Busy", "booked_disabled", true);
        }
    }
    return button;
}

function build_saved_schedule(client_schedule, times, days, table) {
    let row_nums = 0; // 22
    while (row_nums < times.length) {
        const div = document.createElement("div"); // create a new <div> to put a time slot in it; a new row starts here
        div.textContent = times[row_nums];
        table.appendChild(div);
    
        let col_nums = 0; // 5
        while (col_nums < days.length) {
            const day = days[col_nums];
            const schedule_cell_data = client_schedule[row_nums][day];// building a list of new properties one by one (Mon, Tue, Wed...) and value for each (Available or Booked)
            const button = schedule_cell_state(schedule_cell_data, row_nums, day); // create a new <button>
            
            const div = document.createElement("div"); // create a new <div> to put a button in it
            div.appendChild(button);
            table.appendChild(div);
            col_nums += 1;
        }
        row_nums += 1;
    }
}

function build_empty_schedule(client_schedule, times, days, table) {
    let row_nums = 0; // 22
    while (row_nums < times.length) {
        const div = document.createElement("div"); // create a new <div> to put a time slot in it; a new row starts here
        div.textContent = times[row_nums];
        table.appendChild(div);
        
        let scheduleRow = { "Time": times[row_nums], }; // create an object for the schedule row
        let col_nums = 0; // 5
        while (col_nums < days.length) {
            const day = days[col_nums];
            scheduleRow[day] = "Available";// building a list of new properties one by one (Mon, Tue, Wed...) and value for each (Available or Booked)
    
            const button = create_button("Available", "available"); // create a new <button>
            add_schedule_button_listener(button, scheduleRow, day);

            const div = document.createElement("div"); // create a new <div> to put a button in it
            div.appendChild(button);
            table.appendChild(div);
            col_nums += 1;
        }
        client_schedule.push(scheduleRow); // adding a new object (a row) to the schedule array
        row_nums += 1;
    }
}

function data_feed(data) {
    client_schedule = data.schedule;

    const table = document.getElementById("table");
    table.innerHTML = ''; // clear the table
    create_table_header(table); // the first row (table header)

    const times = data.times;
    const days = data.days;
    if (client_schedule.length === 0) {
        build_empty_schedule(client_schedule, times, days, table); // the schedule wasn't saved yet; it's empty
    } else {
        build_saved_schedule(client_schedule, times, days, table);
    }
    saved_schedule = structuredClone(client_schedule);
}

function sendDataToServer(client_schedule) {
    //console.log("Start sending data to server...");
    fetch('/schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({client_schedule})
    })
    .then(response => {
        if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
        return response.json();
    })
    .then(data => {
        //console.log("... Successs!")
        current_user.email = "";
        current_user.name = "";
        current_user.isAdmin = false;

        emailInput.value = "";
        subTitle.textContent = "Enter your email to edit the schedule.";
        information.textContent = "Schedule saved";
        setTimeout(() => { information.textContent = "" }, 3000);

        data_feed(data);
    })
    .catch(err => {
        console.log(`Error happened: ${err}`);
    });
}

const emailForm = document.querySelector('#emailForm');
const scheduleForm = document.querySelector('#scheduleForm');
const emailInput = document.querySelector('#email');
const information = document.querySelector("#information");
const subTitle = document.querySelector('h3');

emailForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (current_user.email) {
        let changed = hasUnsavedChanges();
        if (changed) {
            const answer = confirm("You forgot to save changes. Continue?");
            if (!answer) {
                return;
            } 
        }                    
    }
    
    const email = emailInput.value;
    fetch('/email-authorization', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email})
    })
    .then(response => {
        if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
        return response.json();
    })
    .then(data => {
        current_user = data.user;
        subTitle.textContent = (current_user.email) ? `Logged in as: ${current_user.name}` : `Enter your email to edit the schedule.`;
        
        data_feed(data); // after I submit email, I created a user on server side and gave back a schedule to download
    })
    .catch(err => {
        console.log("error happened: ", err);
    });
});

scheduleForm.addEventListener("submit", function(event) {
    event.preventDefault();
    if (!current_user.email) {
        alert("Enter your email to edit the schedule.");
        return;
    }
    sendDataToServer(client_schedule);
});


fetch('/schedule')
.then(response => {
    if (!response.ok) throw new Error(`Server error: ${response.status} ${response.statusText}`);
    return response.json();
})
.then(data => {
    data_feed(data);
})
.catch(err => {
    console.log(`Error happened: ${err}`);
});
