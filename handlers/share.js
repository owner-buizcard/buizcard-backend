
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const open_origin = require("../core/open_origin");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(open_origin());

app.get('/app/p/card/:cardId', (req, res)=>{

    const { cardId } = req.params;

    const imageUrl = `https://bizcard-dev-v1.s3.amazonaws.com/${cardId}/previewImage.jpg`;
    const redirectUrl = `${process.env.DOMAIN}/app/p/card/${cardId}`;

    const metadataHtml = `
        <html>
        <head>
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:title" content="Bizcard" />
            <meta property="og:description" content="Your personalized digital visiting card" />
            <meta property="og:url" content="${redirectUrl}" />
            <meta property="og:type" content="website" />
        </head>
        <body>
            <script>
            // Redirect to the web app after a delay
            setTimeout(function() {
                window.location.href = "${redirectUrl}";
            }, 10);
            </script>
        </body>
        </html>
    `;
    res.send(metadataHtml);
})

module.exports.handler = serverless(app, {
    callbackWaitsForEmptyEventLoop: false
});