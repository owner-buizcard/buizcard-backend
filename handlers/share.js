
const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require('body-parser');

const open_origin = require("../core/open_origin");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(open_origin());

app.get('/app/p', (req, res)=>{

    const { userId }= req.query;

    const imageUrl = `https://bizcard-dev-v1.s3.amazonaws.com/${userId}/previewImage.jpg`;
    const redirectUrl = `${process.env.DOMAIN}/app/p?userId=${userId}`;

    const metadataHtml = `
        <html>
        <head>
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:title" content="Your Web App Title" />
            <meta property="og:description" content="Description of your web app" />
            <meta property="og:url" content="https://bizcard-web.web.app/app/cards" />
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