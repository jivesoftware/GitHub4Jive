/*
 * Copyright 2014 Jive Software
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

function AccordionItemLengthError(){
    return "Accordion can only display 15 items";
}

function ListItemLengthError(){
    return "List can only display 10 items";
}


exports.AccordionItemLengthError = AccordionItemLengthError();
exports.ListItemLengthError = ListItemLengthError();

function chop(str, maxLength, chopBeginning){
    if(chopBeginning){
        return str.length > maxLength ? str.substr(0, maxLength-3) + "..." : str;
    }else{
        return str.length > maxLength ? "..." + str.slice(-1 * (maxLength -3)) : str;
    }
}


function formatAccordionEntry(item, keys){
    if(!keys){
        keys = {};
    }
    var textKey = keys["text"] || "text";
    var actionKey = keys["action"] || "action";
    var iconClass = keys["jiveIconClasses"] || "jiveIconClasses";
    var avatarKey = keys["avatar"] || "avatar";
    var byLineKey = keys["byline"] || "byline";
    return {
        text: chop(item[textKey] || item, 35, true),
        action: item[actionKey],
        jiveIconClasses: item[iconClass],
        avatar: item[avatarKey],
        byline: item[byLineKey]
    };
}

function formatListEntry(item, keys){
    if(!keys){
        keys = {};
    }
    var textKey = keys["text"] || "text";
    var actionKey = keys["action"] || "action";
    var iconKey = keys["icon"] || "icon";
    var avatarKey = keys["avatar"] || "avatar";
    var byLineKey = keys["byline"] || "byline";
    var userIDKey = keys["userID"] || "userID";
    var userIsPartnerKey = keys["userIsPartner"] || "userIsPartner";
    var containerIDKey = keys["containerID"] || "containerID";
    var containerTypeKey = keys["containerType"] || "containerType";
    var linkDescriptionKey = keys["linkDescription"] || "linkDescription";
    var linkMoreDescriptionKey = keys["linkMoreDescription"] || "linkMoreDescription";

    return {
        text: chop(item[textKey] || item, 35, true),
        action: item[actionKey],
        icon: item[iconKey],
        avatar: item[avatarKey],
        byline: item[byLineKey],
        userID: item[userIDKey],
        userIsPartner: item[userIsPartnerKey],
        containerID: item[containerIDKey],
        containerType: item[containerTypeKey],
        linkDescription: item[linkDescriptionKey],
        linkMoreDescription: item[linkMoreDescriptionKey]

    };
}

exports.formatAccordionData = function(title,items, keys){


    if(items.length > 15){
        throw Error(AccordionItemLengthError());
    }

    var formattedItems = items.map(function(item){return formatAccordionEntry(item, keys);});

    return  {
        title: chop(title, 50),
        items: formattedItems
    };
};



exports.formatListData = function(title, items, keys){
    items = items ? items : [];
    if(items.length > 10){
        throw Error(ListItemLengthError());
    }

    var formattedItems = items.map(function(item){ return formatListEntry(item, keys);});

    return {
        title: chop(title, 50),
        contents: formattedItems,
        action: {
            text: 'Github' ,
            'url': 'https://www.github.com'
        }
    };
}

exports.formatActivityData = function (headLine, description, displayName, email, url) {
    return {
        "activity": {
            "action": {
                "name": "posted",
                "description": description
            },
            "actor": {
                "name": displayName,
                "email": email
            },
            "object": {
                "type": "website",
                "url": url,
                "image": "http://placehold.it/102x102",
                "title": headLine ,
                "description": description
            },
            "externalID": '' + new Date().getTime()
        }
    };
};