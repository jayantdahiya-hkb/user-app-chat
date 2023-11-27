const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize Pusher with your Pusher credentials
const pusher = new Pusher({
  appId: 'app-id',
  key: 'app-key',
  secret: 'app-secret',
  cluster: 'mt1',
  useTLS: true,
});

// Define a route for Pusher authentication
app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channelName = req.body.channel_name;

  const presenceData = {
    user_id: 'unique_user_id', // Replace with the user's unique identifier
    user_info: {
      name: 'John Doe', // Replace with the user's name
    },
  };

  const auth = pusher.authenticate(socketId, channelName, presenceData);

  res.send(auth);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});