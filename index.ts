import WebSocket from 'ws'
import {jsonToQueryString, processTimeAndSalesEvent } from './util'

console.log('NEED TO IMPLEMENT USER PRINCIPALS RESPONSE OR MANUALLY FILL IT IN')
var userPrincipalsResponse = {}

//Converts ISO-8601 response in snapshot to ms since epoch accepted by Streamer
var tokenTimeStampAsDateObj = new Date(userPrincipalsResponse.streamerInfo.tokenTimestamp)
var tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime()

var credentials = {
    userid: userPrincipalsResponse.accounts[0].accountId,
    token: userPrincipalsResponse.streamerInfo.token,
    company: userPrincipalsResponse.accounts[0].company,
    segment: userPrincipalsResponse.accounts[0].segment,
    cddomain: userPrincipalsResponse.accounts[0].accountCdDomainId,
    usergroup: userPrincipalsResponse.streamerInfo.userGroup,
    accesslevel: userPrincipalsResponse.streamerInfo.accessLevel,
    authorized: 'Y',
    timestamp: tokenTimeStampAsMs,
    appid: userPrincipalsResponse.streamerInfo.appId,
    acl: userPrincipalsResponse.streamerInfo.acl
}

var loginRequest = {
    requests: [
        {
            service: 'ADMIN',
            command: 'LOGIN',
            requestid: 0,
            account: userPrincipalsResponse.accounts[0].accountId,
            source: userPrincipalsResponse.streamerInfo.appId,
            parameters: {
                credential: jsonToQueryString(credentials),
                token: userPrincipalsResponse.streamerInfo.token,
                version: '1.0'
            }
        }
    ]
}

var mySock = new WebSocket('wss://' + userPrincipalsResponse.streamerInfo.streamerSocketUrl + '/ws')

mySock.onopen = () => {
    try {
        mySock.send(JSON.stringify(loginRequest), () => {})
    } catch (e) {
        console.log('Error', e)
    }
}

mySock.onmessage = function (evt) {
    const message = JSON.parse(evt.data.toString())
    if (message.response) {
        console.log('Content', message.response[0].content)
        if (message.response[0].command === 'LOGIN') {
            mySock.send(
                JSON.stringify({
                    requests: [
                        {
                            service: 'TIMESALE_EQUITY',
                            command: 'SUBS',
                            requestid: 1,
                            account: userPrincipalsResponse.accounts[0].accountId,
                            source: userPrincipalsResponse.streamerInfo.appId,
                            parameters: {
                                keys: 'INDP',
                                fields: '0,1,2,3,4'
                            }
                        }
                    ]
                })
            )
        }
    }

    if (message.notify) {
        console.log('Content', message.notify[0].content)
    }

    if (message.data) {
        if (message.data[0].service === 'TIMESALE_EQUITY') {
            processTimeAndSalesEvent(message.data[0].content)
        }
    }
}
mySock.onclose = function () {
    console.log('CLOSED')
}

mySock.onerror = function (e) {
    console.log('error', e)
}
