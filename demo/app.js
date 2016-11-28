const socket = io();

const textForm = document.getElementById('text-input-form');
const textInput = document.getElementById('text-input-field')
const textDisplay = document.getElementById('text-display');

textForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const contents = textInput.value;
    const eventOut = 'sent';
    const channel = 'channel-name';

    socket.emit('event', { contents, eventOut, channel });
    textInput.value = '';
});


socket.on('sent', (msg) => {
    textDisplay.innerHTML = msg;
});


