"use strict";

const express = require('express');
const app = express();

app.use(express.static(__dirname));
app.use(express.json());

let schedule = [];

const times = [
    "10:00 - 10:30",
    "10:30 - 11:00",
    "11:00 - 11:30",
    "11:30 - 12:00",
    "12:00 - 12:30",
    "12:30 - 1:00",
    "1:00 - 1:30",
    "1:30 - 2:00",
    "2:00 - 2:30",
    "2:30 - 3:00",
    "3:00 - 3:30",
    "3:30 - 4:00",
    "4:00 - 4:30",
    "4:30 - 5:00",
    "5:00 - 5:30",
    "5:30 - 6:00",
    "6:00 - 6:30",
    "6:30 - 7:00",
    "7:00 - 7:30",
    "7:30 - 8:00",
    "8:00 - 8:30",
    "8:30 - 9:00"
];

const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
];


app.get('/schedule-data', (req, res) => {
    res.json({schedule: schedule, times: times, days: days});
});

app.post('/schedule-data', (req, res) => {
    const {client_schedule} = req.body; // the same as client_schedule = req.body.client_schedule
    schedule = client_schedule;
    console.log("Schedule is saved!");
    //res.json({message: "Your schedule saved successfully!"})
    res.json({schedule: schedule, times: times, days: days});
});

app.post('/email-authorization', (req, res) => {
    const {email} = req.body

    let user = {
        email: '',
        name: '',
        isAdmin: false,
    }

    if (email.trim() !== '') {
        user.email = email;
        user.name = email.split('@')[0].split('.')[0]; // s-jane
        user.isAdmin = email.toLowerCase().indexOf("s-") !== 0;
    }
    
    res.json({user: user, schedule: schedule, times: times, days: days});
    //console.log(`Your email is ${email}  Admin? ${user.isAdmin}`)
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.listen(3000, () => {
    console.log('The server is running!!!');
});