// frontend.js
$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $("#content");
    var input = $("#input");
    var status = $("#status");
	
	var inputtest = $("#inputtest");
	var inputtest1 = $("#inputtest1");
	var inputtest2 = $("#inputtest2");
	var inputtest3 = $("#inputtest3");
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://testmessenger.herokuapp.com');
	//var connection = new WebSocket('ws://192.168.1.28:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled').val('').focus();
        status.text('Choose name:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.</p>' } ));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        if (json.type === 'color') { // first response from the server with user's color
            myColor = json.data;
            status.text(myName + ': ').css('color', myColor);
            input.removeAttr('disabled').focus();
            // from now user can start sending messages
        } else if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                           json.data[i].color, new Date(json.data[i].time), json.data[i].image);
            }
            slideScrollbar();
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled'); // let the user write another message
            addMessage(json.data.author, json.data.text,
                       json.data.color, new Date(json.data.time), json.data.image);
            slideScrollbar();
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });
	inputtest.click(function() {
		var msg = $(input).val();
		connection.send(msg+' #img~test.jpg!# ');
		$(this).val('');
		if (myName === false) {
			myName = msg;
		}
    });
	inputtest1.click(function() {
		var msg = $(input).val();
		connection.send(msg+' #img~test1.jpg!# ');
		$(this).val('');
		if (myName === false) {
			myName = msg;
		}
    });
	inputtest2.click(function() {
		var msg = $(input).val();
		connection.send(msg+' #img~test2.jpg!# ');
		$(this).val('');
		if (myName === false) {
			myName = msg;
		}
    });
	inputtest3.click(function() {
		var msg = $(input).val();
		connection.send(msg+' #img~test3.jpg!# ');
		$(this).val('');
		if (myName === false) {
			myName = msg;
		}
    });
    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 5000);

    /**
     * Add message to the chat window
     */
	var result =0;
	var date="";
    function addMessage(author, message, color, datetime, image) {
		date=datetime.getHours()+'-'+datetime.getMinutes()+'-'+datetime.getSeconds();
		if(author=="merchant"){
			var contentstr='<p><table id="'+date+'" class="blocka" >'
			+'	<tr>'
			+'  <td class="left">'
			+'         <img src="img/testleft.png">'
			+'  </td>'
			+'  <td class="right">'
			+'  <div class="title">'
			+date+":"
			+'<span style="color:' + color + '">' + author + '</span> @ '+":<br>"
			+message
			+'	</div>'
			+'	<div class="content">   ';
			
			if(image!="none")contentstr+="<img src=\"img/"+image+"\">";			
			contentstr+='	</div>'    
			+'	</td>' 
			+'	</tr>'
			+'</table>'
			+'</p>';
			content.append(contentstr);
			
		}else if(author=="user"){
			content.append('<p><table id="'+date+'" class="blockb">'
			+'	<tr>'
			+'    <td class="left">'
			+date+":"
			+'<span style="color:' + color + '">' + author + '</span> @ '+":<br>"
			+message
			+'    </td>'
			+'	<td class="right"><img src="img/testleft.png"></td>'    
			+'	</td>' 
			+'	</tr>'
			+'	</table></p>');
		}else{
       		content.append('<p><div id="'+date+'" <span style="color:' + color + '">' + author + '</span> @ ' +
                      + (datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) + ':'
                      + (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes())
                      + ': ' + message + '</div></p>');
		}
		result = $("#"+date).height();
		input.focus();
    }
    
    /**
     *  Make it a little more user friendly
     */
    var scrollbar = $('body > section:first').tinyscrollbar();
    
    function slideScrollbar() {
		window.scrollTo(0,document.body.scrollHeight);
        scrollbar.update();
        scrollbar.move(Math.max(0, content.find('> p').length) * (result));
    }
    
});




