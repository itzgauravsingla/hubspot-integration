const hubspot = require('@hubspot/api-client')
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const API_KEY = '35c76975-b1ad-44e2-aa25-01e4cf01c0b0';
const clientId = 'd2568baa-756a-4b25-a288-54c79bde74bc';
const redirectUri = 'http://localhost:3000/auth';
const scope = 'crm.objects.contacts.read crm.objects.contacts.write crm.schemas.contacts.read crm.schemas.contacts.write';
const clientSecret ='204f91e4-8f1d-4a03-80b4-2b0df5c20fed';
let hubspotClient = new hubspot.Client({ developerApiKey: API_KEY })
let accessToken = null;
app.use(bodyParser.json());

app.get('/auth', (req, res) => {
  console.log(req.query.code);
    hubspotClient.oauth.tokensApi.create(
      'authorization_code',
      req.query.code,
      redirectUri,
      clientId,
      clientSecret
  ).then((tokenRes) =>{
    res.send(tokenRes);
  })

});

app.get('/templates', (req, res) => {
  const templates = {
    options: [
      {
        "text": "Document Template 1",
        "value": "doc-template-id-1"
      },
      {
        "text": "Document Template 2",
        "value": "doc-template-id-2"
      }
    ],
    // "selectedOption": "option2",
    "placeholder": "Choose Template"
  }
  res.send(templates);
})

app.listen(PORT, (error) => {
  if(!error) {
    console.log('server running on port: ',PORT);
  } else {
    console.log('error occured can\'t start', error);
  }
})

