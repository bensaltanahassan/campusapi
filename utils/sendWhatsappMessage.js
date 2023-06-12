var qs = require("querystring");
var http = require("https");

const sendWhatsappMessage = (name, verifyCode, phone) => {
  var options = {
    method: "POST",
    hostname: "api.ultramsg.com",
    port: null,
    path: "/instance50589/messages/chat",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  };

  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });

  const phoneToSend = phone.substring(1);

  var postData = qs.stringify({
    token: "x69hfdlg8b8r71ux",
    to: `+212${phoneToSend}`,
    body: `Bonjour ${name}, votre code de vérification est ${verifyCode}`,
  });
  req.write(postData);
  req.end();
};

module.exports = sendWhatsappMessage;
