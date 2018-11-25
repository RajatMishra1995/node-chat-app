 var socket = io(); 
 socket.on('connect', () => {
 	var params = $.deparam(window.location.search);
    socket.emit('join', params, function(err) {
        if(err) {
            alert(err);
            window.location.href = '/';
        } else {
            
        }
    });
 });
 socket.on('disconnect', () => {
    console.log('disconnected');
 });

 socket.on('newMessage', (message) => {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#message-template').html();
    var html = Mustache.render(template, {
        text : message.text,
        from : message.from,
        createdAt : formattedTime
    });
    $('#messages').append(html);
 });

socket.on('newLocationMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#location-message-template').html();
    var html = Mustache.render(template, {
        text : message.text,
        from : message.from,
        createdAt : formattedTime
    });
    $('#messages').append(html);
});

socket.on('updateUserList', function(users) {
     var ol = $('<ol></ol>');
     users.forEach(function(user) {
         ol.append($('<li></li>').text(user));
     });
     $('#users').html(ol);
});
 

 $(document).ready(function() {
     $('form').submit(function(e) {
        e.preventDefault();
        socket.emit('createMessage', {
            text : $('[name=message]').val()
        }, function() {
            $('[name=message]').val('');
        });
     });
     $('#send-location').on('click', function() {
        if(!navigator.geolocation) {
            return;
        }
        $('#send-location').attr('disabled', 'disabled').text('Sending location');;
        navigator.geolocation.getCurrentPosition(function(position) {
           $('#send-location').removeAttr('disabled').text('Send location');
           socket.emit('createLocationMessage', {
               latitude : position.coords.latitude,
               longitude : position.coords.longitude
           });
        }, function() {
            $('#send-location').removeAttr('disabled').text('Send location');
            alert('unable to fetch location');
        })
    });
 });