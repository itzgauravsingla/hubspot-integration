import  { Client } from '@hubspot/api-client'
import express from "express";
import bodyParser from 'body-parser';
import { MsbPrivateClient, MsbPublicClient } from './msbclient.js';
import { DynamoDB } from './dynamo.js';

const app = express();
const PORT = 3000;
const HUBSPOT = {
  API_KEY: '35c76975-b1ad-44e2-aa25-01e4cf01c0b0',
  CLIENT_ID: 'd2568baa-756a-4b25-a288-54c79bde74bc',
  CLIENT_SECRET: '204f91e4-8f1d-4a03-80b4-2b0df5c20fed',
  GRANT_TYPE: 'authorization_code'
}

const MSB = {
  CLIENT_ID: 'MSB APP',
  CLIENT_SECRET: 'password',
  GRANT_TYPE: 'authorization_code'
}

const baseUri = 'https://grumpy-lapel.cyclic.app';
const redirectUri = `${baseUri}/auth`;
const msbAuthUrl = 'https://ui.msbdocs.com/mysignaturebook/app/login';

let hubspotClient = new Client({ developerApiKey: HUBSPOT.API_KEY });
const userDataMap = {};
app.use(bodyParser.json());

const msbPublicClient = new MsbPublicClient('https://ui.msbdocs.com');
const msbPrivateClient = new MsbPrivateClient('https://ui.msbdocs.com','v1');
console.log(msbPublicClient.baseUrl);

const dynamoDB = new DynamoDB();

app.get('/auth', async(req, res) => {
  console.log(req.query);
  const token = await hubspotClient.oauth.tokensApi.create(
    HUBSPOT.GRANT_TYPE,
    req.query.code,
    redirectUri,
    HUBSPOT.CLIENT_ID,
    HUBSPOT.CLIENT_SECRET
  );
  hubspotClient.setAccessToken(token.accessToken);
  const details = await hubspotClient.oauth.accessTokensApi.get(token.accessToken);
  const updated = await dynamoDB.setUserDetails(details.hubId);
  const hubspotUserUpdateResponse = await dynamoDB.setHubspotDetails(details.hubId,{...details, ...token});
  //redirect to msb
  const msb = new URL(msbAuthUrl);
    msb.searchParams.append("redirect_uri",`${baseUri}/hubredirect`);
    msb.searchParams.append("state", details.hubId);
    res.redirect(msb.href);
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

app.post('/doctemplates', async(req,res) => {
  console.log(req.query, req.body, 'doctemplates');
  const dynamoUserDetail = await dynamoDB.getUserDetails(req.body.portalId);
  const msbClient = new MsbPrivateClient('https://ui.msbdocs.com','v1');
  msbClient.setAccessToken(dynamoUserDetail.Item.msb.msb_token);
  msbClient.setTenantId(dynamoUserDetail.Item.msb.defaultTenantUuid);
  const docTemplates = await msbClient.documentTemplates();
  const result = docTemplates.data.data.docTemplateDTOList.docTemplateDTO.map(dt => {
    return {
      label: dt.templateName,
      description: dt.signingPolicy,
      value: dt.id
    }
  });
  res.send({options: result});
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
      {
        objectId: 988,
        title: "API-54: Question about bulk APIs",
        link: "http://example.com/2",
        created: "2016-08-04",
        priority: "HIGH",
        project: "API",
        reported_by: "ksmith@hubspot.com",
        description: "Customer is not able to find documentation about our bulk Contacts APIs.",
        reporter_type: "Support Rep",
        status: "Resolved",
        ticket_type: "Bug",
        updated: "2016-09-23",
        properties: [
          {
            label: "Resolved by",
            dataType: "EMAIL",
            value: "ijones@hubspot.com"
          },
          {
            label: "Resolution type",
            dataType: "STRING",
            value: "Referred to documentation"
          },
          {
            label: "Resolution impact",
            dataType: "CURRENCY",
            value: "94.34",
            currencyCode: "GBP"
          }
        ]
      }
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

app.post('/trigger', async(req, res) => {
  console.log(req.query, 'trigger');
  console.log(req.body, 'trigger body');
  const easyCompose = new MsbPrivateClient('https://ui.msbdocs.com','v3');
  const dynamoUserDetail = await dynamoDB.getUserDetails(req.body.portalId);
  easyCompose.setAccessToken(dynamoUserDetail.Item.msb.msb_token);
  easyCompose.setTenantId(dynamoUserDetail.Item.msb.defaultTenantUuid);
  easyCompose.compose();
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

app.get('/hubredirect', async(req, res) => {
  console.log(req.query, req.body);
  const token = await msbPublicClient.token(MSB.CLIENT_ID,MSB.CLIENT_SECRET,MSB.GRANT_TYPE,req.query.code);
  msbPrivateClient.setAccessToken(token.data.msb_token);
  const userDetails = await msbPrivateClient.valid();
  const msbUserUpdateResponse = await dynamoDB.setMsbDetails(parseInt(req.query.state), {...token.data,...userDetails.data.data});
  res.redirect('https://msbdocs.com')
});

app.get('/dynamo-get', async(req,res) => {
  const rowData = await dynamoDB.getUserDetails(123);
  if(!rowData.Item) {
    const updated = await dynamoDB.setUserDetails(123);
    res.send(updated);
  }
  res.send(rowData);
})

app.get('/dynamo-update', async(req,res) => {
  const rowData = await dynamoDB.setMsbDetails(63535540,msbData);
  // const hubRowData = await dynamoDB.setHubspotDetails(123, hubData);
  res.send(rowData);
})

app.listen(PORT, (error) => {
  if(!error) {
    console.log('server running on port: ',PORT);
  } else {
    console.log('error occured can\'t start', error);
  }
})



