var socket = io();

function scrollToBottom() {
    var messages = jQuery('#msgs');
    var newMsg = messages.children('li:last-child');
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMsgHeight = newMsg.innerHeight();
    var lastMsgHeight = newMsg.prev().innerHeight();

    if (clientHeight + scrollTop + newMsgHeight + lastMsgHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function() {
    console.log('Connected to server');
    var params = jQuery.deparam(window.location.search);

    socket.emit('join', params, function(err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log("No error");
        }
    });
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('updateUserList', function(users){
	var ol= jQuery('<ol></ol>');
	
	users.forEach(function(user){
		ol.append(jQuery('<li></li>').text(user));
	});
	
	jQuery('#users').html(ol);
});

socket.on('newMessage', function(msg) {
    var formattedTime = moment(msg.createdAt).format('h:mm:ss a');
    var template = jQuery('#msg-template').html();
    var html = Mustache.render(template, {
        text: msg.text,
        from: msg.from,
        createdAt: formattedTime
    });
    jQuery('#msgs').append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function(msg) {
    var template = jQuery('#loc-msg-template').html();
    var formattedTime = moment(msg.createdAt).format('h:mm:ss a');
    var html = Mustache.render(template, {
        url: msg.url,
        from: msg.from,
        createdAt: formattedTime
    });
    jQuery('#msgs').append(html);
    scrollToBottom();
});

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();

    var msgTextBox = jQuery('[name=msg]');

    socket.emit('createMessage', {
        text: msgTextBox.val()
    }, function() {
        msgTextBox.val('');
    });
});

var locationButton = jQuery('#send-location');

locationButton.on('click', function() {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser!');
    }
    locationButton.attr('disabled', 'disabled').text('Sending location...');
    navigator.geolocation.getCurrentPosition(function(position) {
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function() {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location.')
    });
});