
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const corsOrigin = require("../core/cors_origin");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(corsOrigin());

app.get('/app/p', (req, res)=>{

    const imageUrl = "https://firebasestorage.googleapis.com/v0/b/bizcard-web.appspot.com/o/constants%2Ferol-ahmed-IHL-Jbawvvo-unsplash.jpg?alt=media&token=b17ffa0f-11d9-48b3-a282-7788b05f80cc";
    const redirectUrl = "https://bizcard-web.web.app/app/cards";

    const metadataHtml = `
        <html>
        <head>
            <meta property="og:image" content="${imageUrl}" />
            <!-- Add other necessary meta tags -->
        </head>
        <body>
            Your dynamic content
            <script>
            // Redirect to the web app after a delay
            setTimeout(function() {
                window.location.href = "${redirectUrl}";
            }, 2000); // 2 seconds delay (adjust as needed)
            </script>
        </body>
        </html>
    `;
    res.send(metadataHtml);
})

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});