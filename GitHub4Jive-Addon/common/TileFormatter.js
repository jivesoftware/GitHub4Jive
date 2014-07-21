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

function AccordionItemLengthEror(){
    return "Accordion can only display 15 items";
}

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
        text: item[textKey] || item,
        action: item[actionKey],
        jiveIconClasses: item[iconClass],
        avatar: item[avatarKey],
        byline: item[byLineKey]
    };

}

exports.formatAccordionData = function(title,items, keys){


    if(items.length > 15){
        throw new Error(AccordionItemLengthEror());
    }

    var formattedItems = items.map(function(item){return formatAccordionEntry(item, keys)});

    return  {
        title: chop(title),
        items: formattedItems
    };
};

exports.AccordionItemLengthEror = AccordionItemLengthEror();