const hubspot = require('@hubspot/api-client')
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const API_KEY = '35c76975-b1ad-44e2-aa25-01e4cf01c0b0';
const clientId = 'd2568baa-756a-4b25-a288-54c79bde74bc';
const redirectUri = 'https://grumpy-lapel.cyclic.app/auth';
const scope = 'crm.objects.contacts.read crm.objects.contacts.write crm.schemas.contacts.read crm.schemas.contacts.write';
const clientSecret ='204f91e4-8f1d-4a03-80b4-2b0df5c20fed';
let hubspotClient = new hubspot.Client({ developerApiKey: API_KEY })
const userDataMap = {};
app.use(bodyParser.json());

app.get('/auth', async(req, res) => {
  console.log(req.query);
  const token = await hubspotClient.oauth.tokensApi.create(
    'authorization_code',
    req.query.code,
    redirectUri,
    clientId,
    clientSecret
  );
  hubspotClient.setAccessToken(token.accessToken);
  const details = await hubspotClient.oauth.accessTokensApi.get(token.accessToken);
  userDataMap[details.userId] = {...details, ...token}
    res.send(userDataMap[details.userId]);
});

app.get('/accounts', (req, res) => {
  const accountsRespose = {
    actionType: "ACCOUNTS_FETCH",
    response: {
        accounts: [
            {
                accountId: "shailesh.rai.1260@gmail.com",
                accountName: "Shailesh Rai",
                accountLogoUrl: "https://www.hubspot.com/hubfs/assets/hubspot.com/style-guide/brand-guidelines/guidelines_condemned-sprocket-2.svg",
                appId: 2813065
            }
        ]
    },
    message: null
  }

  res.send(accountsRespose);
})

app.post('/doctemplates', (req,res) => {
  console.log(req.query, req.body, 'doctemplates');
  const obj = {
      options: [
        {
          label: "Template-1",
          description: "Mumbai template",
          value: "template-1-mumbai"
        },
        {
          label: "Template-2",
          description: "Dubai template",
          value: "template-2-dubai"
        }
      ],
  }
  res.send(obj);
})

app.get('/templates', (req, res) => {
  console.log(req.query);
  const templatesResponse = {
    actionType: "DROPDOWN_FETCH",
    message: null,
    response: {
      options: [
        {
          text: "Document Template 1",
          value: "doc-template-id-1"
        },
        {
          text: "Document Template 2",
          value: "doc-template-id-2"
        }
      ],
      selectedOption: "doc-template-id-2",
      placeholder: "Choose Template"
    }
  }
  res.send(templatesResponse);
})

app.get('/cards', (req,res) => {
  console.log(req.query, 'cards');
  const cardRes = {
    results: [
      // {
      //   objectId: 245,
      //   title: "Create an ePak",
      //   // link: "http://esign-ui.msbdocs.com"
      // }
    ],
    primaryAction: {
      type: "IFRAME",
      width: 890,
      height: 748,
      uri: `https://grumpy-lapel.cyclic.app/template-list`,
      label: "create ePak"
    }
  }
  res.send(cardRes);
});

app.post('/trigger', (req, res) => {
  console.log(req.query, 'trigger');
  console.log(req.body, 'trigger body');
  res.send();
})

app.get('/template-list', (req, res) => {
  console.log(req.query, 'listttt');
  // const queries = Object.keys(req.query);
  // keys.map(key => console.log(encodeURIComponent(key) + '=' + encodeURIComponent(req.query[key])))
  res.sendFile('views/templates.html', {root: __dirname})
})

app.get('/users', (req, res) => {
  res.send(userDataMap);
})

app.listen(PORT, (error) => {
  if(!error) {
    console.log('server running on port: ',PORT);
  } else {
    console.log('error occured can\'t start', error);
  }
})



