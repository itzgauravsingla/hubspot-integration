import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export class DynamoDB {
  TABLE_NAME = 'hubspot_msb_user';
  ACCESS_KEY = 'AKIAZJI4OSDBMQU4KMFT';
  SECRET_ACCESS_KEY = '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';

  constructor() {
    const dbClient = new DynamoDBClient({
      region: 'ap-south-1',
      credentials: {
        accessKeyId: this.ACCESS_KEY,
        secretAccessKey: this.SECRET_ACCESS_KEY
      }
    })
   this.docClient = DynamoDBDocumentClient.from(dbClient,);
  }

  getUserDetails(userId) {
    const command = new GetCommand({
      TableName: this.TABLE_NAME,
      Key: {
        hubspotUserId: userId
      }
    });
    return this.docClient.send(command);
  }

  setMsbDetails(userId, msb) {
    Object.entries(msb).forEach(([key,value]) => {
      console.log(key,value);
    })
    const command = new UpdateCommand({
      TableName: this.TABLE_NAME,
      Key: {
        hubspotUserId: userId
      },
      UpdateExpression: "set msb = :msb",
      ExpressionAttributeValues: {
        ":msb": {
            access_token: msb.access_token,
            defaultTenantId: msb.defaultTenantId,
            jwt_expires_in: msb.jwt_expires_in,
            msb_token: msb.msb_token,
            refresh_token: msb.refresh_token,
            scope: msb.scope,
            token_type: msb.token_type,
            defaultTenantUuid:msb.userInfo?.defaultTenantUuid,
            role: msb.userInfo.role,
            email: msb.userInfo.email,
            firstName: msb.userInfo.firstName,
            lastName:  msb.userInfo.lastName,
            id:  msb.userInfo.id,
        }
      }
    })
    return this.docClient.send(command);
  }

  setHubspotDetails(userId, hubspot) {
    const command = new UpdateCommand({
      TableName: this.TABLE_NAME,
      Key: {
        hubspotUserId: userId
      },
      UpdateExpression: "set hubspot = :hubspot",
      ExpressionAttributeValues: {
        ":hubspot": {
          accessToken: hubspot.accessToken,
          appId: hubspot.appId,
          expiresIn: hubspot.expiresIn,
          hubDomain: hubspot.hubDomain,
          hubId: hubspot.hubId,
          refreshToken: hubspot.refreshToken,
          scopes: hubspot.scopes,
          tokenType: hubspot.tokenType,
          user: hubspot.user,
          userId: hubspot.userId,
        }
      }
    })
    return this.docClient.send(command);
  }

  setUserDetails(userId) {
    const command = new PutItemCommand({
      TableName: this.TABLE_NAME,
      Key: {
        hubspotUserId: {N: userId.toString()}
      },
      Item: {
        hubspotUserId: {N: userId.toString()},
         msb: {
          M: { }
        },
        hubspot:{
          M: { }
        }
      }
    });

    return this.docClient.send(command);
  }


}