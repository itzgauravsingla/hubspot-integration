import url from 'url';
import axios from 'axios';

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



}