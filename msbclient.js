import url from 'url';
import axios from 'axios';
import { encodedPdf } from './pdfData.js';

export class MsbPublicClient {
  appPrefix = '/mysignaturebook';
  apiPublicPath = '/msbapi/public';
  constructor(origin) {
    this.origin = origin;
    this.baseUrl = url.resolve(origin,this.appPrefix + this.apiPublicPath);
  }

  token(client_id, client_secret, grant_type, code) {
    const authUrl = new URL(`${this.baseUrl}/token`);
    authUrl.searchParams.append("client_id", client_id);
    authUrl.searchParams.append("client_secret", client_secret);
    authUrl.searchParams.append("grant_type", grant_type);
    authUrl.searchParams.append("code", code);
    return axios.post(authUrl);
  }

}

export class MsbPrivateClient {
  appPrefix = '/mysignaturebook';
  apiPath = '/msbapi/';

  constructor(origin,version,accessToken,tenantId) {
    this.origin = origin;
    this.baseUrl = url.resolve(origin,this.appPrefix + this.apiPath + version);
    this.accessToken = accessToken;
    this.tenantId = tenantId;
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  setTenantId(tenantId) {
    this.tenantId = tenantId;
  }

  valid() {
    const validUrl = new URL(`${this.baseUrl}/users/valid`);
    return axios.get(validUrl,{
      headers: {
        access_token: this.accessToken,
        Accept: 'application/json'
      }
    });
  }

  documentTemplates() {
    const templateUrl = new URL(`${this.baseUrl}/documenttemplates`);
    templateUrl.searchParams.append("type", "Owner");
    return axios.get(templateUrl,{
      headers: {
        access_token: this.accessToken,
        tenant_id: this.tenantId,
        Accept: 'application/json'
      }
    });
  }

  compose() {
    const composeUrl =  new URL(`${this.baseUrl}/compose/epak`);
    const data = {
      documentList: [
        {
          docName: "basic.pdf",
          base64EncodedData: encodedPdf
        }
      ],
      workflowData: [
        {
          wfStateOrder: 1,
          action: "SIGN",
          signingPolicy: "QUICKSIGN",
          docTagsData: [
            {
              docName: "basic.pdf",
              signer_info: [
                {
                  email: "shailesh.rai.1260@gmail.com",
                  tagLocationData: [
                    {
                      pageNumber: "1",
                      x: "300",
                      y: "30",
                      height: "7.1",
                      width: "130.9"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      useAutoAppend: false
    }
    return axios.post(composeUrl,data, {
      headers: {
        access_token: this.accessToken,
        tenant_id: this.tenantId,
        Accept: 'application/json'
      }
    })
  }



}