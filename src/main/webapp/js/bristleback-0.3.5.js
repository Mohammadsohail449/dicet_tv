var BB=BB||{},Bristleback=BB;BB.controller={};BB.serialization={};BB.template={};BB.auth={};BB.LOCAL_HOSTNAME="ws://"+(self.location.hostname?self.location.hostname:"127.0.0.1")+":8765/websocket";BB.USER_CONTEXT="uc";BB.utils={};BB.utils.deepCopy=function(a,b){b=b||{};for(var c in a)if(typeof a[c]==="object"){b[c]=a[c].constructor===Array?[]:{};BB.utils.deepCopy(a[c],b[c])}else if(typeof a[c]!=="function")b[c]=a[c];return b};
BB.utils.objectToString=function(a){var b="",c="",d="{",e="}",f;for(f in a)if(typeof a[f]==="object"){if(a[f]instanceof Array){d="[";e="]"}c=BB.utils.objectToString(a[f]);if(c!=""){b+=f+" "+d+"\n";b+=c;b+=e+"\n"}}else a[f]instanceof Function||(b+=f+": "+a[f]+"\n");return b};BB.utils.escapeHTML=function(a){var b=document.createElement("div");a=document.createTextNode(a);b.appendChild(a);return b.innerHTML};BB.template.TemplateController=function(){this.parsedTemplates={};this.renderingModes=BB.template.builtInRenderingModes};BB.template.TemplateController.prototype.constructTemplateInformation=function(a,b,c,d){b=b?b:"#"+a+"-div";d=d?d:"replace";if(!this.renderingModes[d])throw Error("Cannot find rendering mode with name: "+d);var e={};e.rootObjectName=c;e.containerId=b;e.templateName=a;e.displayTemplate=this.renderingModes[d];return e};
BB.template.TemplateController.prototype.containsTemplate=function(a){return this.parsedTemplates[a]!=undefined};BB.template.TemplateController.prototype.getTemplate=function(a){this.containsTemplate(a)||(this.parsedTemplates[a]=this.templateFramework.parseTemplate(a));return this.parsedTemplates[a]};
BB.template.TemplateController.prototype.render=function(a,b){if(a.rootObjectName){var c={};c[a.rootObjectName]=b}else c=b;c=this.templateFramework.processTemplate(this.getTemplate(a.templateName),c);a.displayTemplate(c,a)};BB.template.TemplateController.prototype.registerTemplateFramework=function(a){this.templateFramework=a};
BB.template.builtInRenderingModes={replace:function(a,b){var c=b.containerId.substring(1);document.getElementById(c).innerHTML=a},append:function(a,b){var c=b.containerId.substring(1);document.getElementById(c).innerHTML+=a},prepend:function(a,b){var c=b.containerId.substring(1);c=document.getElementById(c);c.innerHTML=a+c.innerHTML}};
BB.templateFrameworks={trimpath:{parseTemplate:function(a){if(!document.getElementById(a))throw Error("Cannot find template with id: "+a);return TrimPath.parseDOMTemplate(a)},processTemplate:function(a,b){return a.process(b)}},handlebars:{parseTemplate:function(a){var b=document.getElementById(a);if(!b)throw Error("Cannot find template with id: "+a);return Handlebars.compile(b.innerHTML)},processTemplate:function(a,b){return a(b)}}};BB.templateController=new BB.template.TemplateController;BB.USER_DETAILS="ud";
BB.auth.SystemAuthentication=function(a){this.setAsDefaultAuthenticationAction(a.getActionClass("BristleSystemUserAuthentication").defineAction("authenticate"));this.setAsDefaultLogoutAction(a.getActionClass("BristleSystemUserLogout").defineAction("logout"));var b=this;a.registerClientActionClass("SystemAuth",{authenticationSuccess:function(c){b.authenticationSuccessCallback?b.authenticationSuccessCallback(c):console.log("User '%s' has been successfully authenticated.",c)},logout:function(c){b.logoutCallback?b.logoutCallback(c):
  console.log("User '%s' has been logged out (logout reason: %s).",c.username,c.logoutReason)}});a.exceptionHandler.setExceptionHandler("BristleSecurityException",this.defaultSecurityExceptionHandler);a.exceptionHandler.setExceptionHandler("IncorrectUsernameOrPasswordException",this.defaultIncorrectPasswordHandler);a.exceptionHandler.setExceptionHandler("InactiveUserException",this.defaultSecurityExceptionHandler);a.exceptionHandler.setExceptionHandler("UserAlreadyAuthenticatedException",this.defaultSecurityExceptionHandler);
  a.exceptionHandler.setExceptionHandler("UserNotAuthenticatedException",this.defaultSecurityExceptionHandler);a.exceptionHandler.setExceptionHandler("AuthorizationException",this.defaultAuthorizationExceptionHandler)};BB.auth.SystemAuthentication.prototype.defaultSecurityExceptionHandler=function(a){throw Error("Unexpected "+a.exceptionType+" security exception occurred"+(a.content.username?" for user '"+a.content.username+"'.":"."));};
BB.auth.SystemAuthentication.prototype.defaultIncorrectPasswordHandler=function(a){throw Error("Incorrect username or password, username provided: '"+a.content.username+"'.");};BB.auth.SystemAuthentication.prototype.defaultAuthorizationExceptionHandler=function(a){throw Error("User '"+a.content.username+"' tried to invoke action without required authority: '"+a.content.authority+"'.");};
BB.auth.SystemAuthentication.prototype.authenticate=function(){this.invokeAction(this.defaultAuthenticationAction,arguments)};BB.auth.SystemAuthentication.prototype.logout=function(){this.invokeAction(this.defaultLogoutAction,arguments)};BB.auth.SystemAuthentication.prototype.invokeAction=function(a,b){for(var c=[],d=b.length,e=0;e<d;e++)c[e]=b[e];a.actionClass[a.name].apply(a.actionClass,c)};
BB.auth.SystemAuthentication.prototype.setAsDefaultAuthenticationAction=function(a){this.defaultAuthenticationAction=a};BB.auth.SystemAuthentication.prototype.setAsDefaultLogoutAction=function(a){this.defaultLogoutAction=a};BB.auth.SystemAuthentication.prototype.setAuthenticationSuccessCallback=function(a){this.authenticationSuccessCallback=a};BB.auth.SystemAuthentication.prototype.setLogoutCallback=function(a){this.logoutCallback=a};BB.controller.controllers={};
BB.controller.ActionMessage=function(a,b){var c=b.name.split(":"),d=c[0].split("."),e=d[0];d=d[1]?d[1]:"";if(b.id){this.actionClass=a.actionClasses[e];this.content=b.payload[0]}else{this.actionClass=a.clientActionClasses[e];this.content=b.payload}if(this.actionClass==undefined)throw Error('[ERROR] Cannot find a client action class "'+e+'"');this.action=this.actionClass.actions[d];if(this.action==undefined)throw Error("[ERROR] Cannot find action "+(d?'"'+d+'"':"default action ")+' in action class "'+
  e+'"');this.callback=a.callbacks[b.id];this.exceptionType=c.length>1?this.content.type:undefined};BB.controller.ActionExceptionHandler=function(){this.defaultRenderingHandler=this.defaultExceptionHandler=undefined;this.exceptionHandlers={};this.renderingHandlers={}};BB.controller.ActionExceptionHandler.prototype.setDefaultExceptionHandler=function(a){this.defaultExceptionHandler=a;return this};
BB.controller.ActionExceptionHandler.prototype.setExceptionHandler=function(a,b){this.exceptionHandlers[a]=b;return this};BB.controller.ActionExceptionHandler.prototype.renderOnException=function(a,b,c,d){var e=BB.templateController.constructTemplateInformation(b,c,"exception",d);this.renderingHandlers[a]=function(f){BB.templateController.render(e,f)};return this};
BB.controller.ActionExceptionHandler.prototype.renderOnDefaultException=function(a,b,c){var d=BB.templateController.constructTemplateInformation(a,b,"exception",c);this.defaultRenderingHandler=function(e){BB.templateController.render(d,e)};return this};BB.controller.ActionExceptionHandler.prototype.handleException=function(a){var b=this.exceptionHandlers[a.exceptionType],c=this.renderingHandlers[a.exceptionType],d=false;if(b)d=b(a);if(c){d=true;c(a)}return d||this.handleDefault(a)};
BB.controller.ActionExceptionHandler.prototype.handleDefault=function(a){var b=false;if(this.defaultExceptionHandler)b=this.defaultExceptionHandler(a);if(this.defaultRenderingHandler){b=true;this.defaultRenderingHandler(a)}return b};BB.controller.ActionCallback=function(a){this.responseHandler=a;this.exceptionHandler=new BB.controller.ActionExceptionHandler};BB.controller.ActionCallback.prototype.handleResponse=function(a){return this.responseHandler(a)};
BB.controller.ActionCallback.prototype.canHandleResponse=function(){return this.responseHandler!=undefined};BB.controller.ActionController=function(){this.client=undefined;this.lastId=1;this.actionClasses={};this.clientActionClasses={};this.callbacks={};this.exceptionHandler=new BB.controller.ActionExceptionHandler;this.exceptionHandler.setDefaultExceptionHandler(this.defaultHandlerFunction);this.authentication=new BB.auth.SystemAuthentication(this)};
BB.controller.ActionController.prototype.onMessage=function(a){a=new BB.controller.ActionMessage(this,a);a.exceptionType?this.onExceptionMessage(a):a.actionClass.onMessage(a)};BB.controller.ActionController.prototype.sendMessage=function(a,b,c){var d=this.lastId++;this.client.sendMessage({name:b?a+"."+b:a,payload:c,id:d});return d};
BB.controller.ActionController.prototype.getActionClass=function(a){var b=this.actionClasses[a];if(b===undefined){b=new BB.controller.ActionClass(a,this);this.actionClasses[a]=b}return b};BB.controller.ActionController.prototype.onExceptionMessage=function(a){return a.callback&&a.callback.exceptionHandler.handleException(a)||a.action.exceptionHandler.handleException(a)||a.actionClass.exceptionHandler.handleException(a)||this.exceptionHandler.handleException(a)};
BB.controller.ActionController.prototype.defaultHandlerFunction=function(a){throw Error("["+(a.action.name?"Action "+a.actionClass.name+"."+a.action.name+"()":"Default action of class "+a.actionClass.name)+'] returned with exception of type "'+a.exceptionType+'" and detail message "'+BB.utils.objectToString(a.content)+'"');};BB.controller.ActionController.prototype.registerClientActionClass=function(a,b){this.clientActionClasses[a]=new BB.controller.ClientActionClass(a,b)};
BB.controller.ActionClass=function(a,b){this.actionController=b;this.name=a;this.actions={};this.exceptionHandler=new BB.controller.ActionExceptionHandler;this.exceptionHandler.setExceptionHandler("BrokenActionProtocolException",this.defaultProtocolExceptionHandlerFunction)};BB.controller.ActionClass.prototype.defineDefaultAction=function(){return this.defineAction("")};
BB.controller.ActionClass.prototype.defineAction=function(a){if(this[a]!=undefined)throw Error("Action "+a+" already defined for action class "+this.name);this.actions[a]=new BB.controller.Action(a,this);this[a]=function(){this.doSendMessage(this.actions[a],arguments)};return this.actions[a]};BB.controller.ActionClass.prototype.executeDefault=function(){this.doSendMessage(this.actions[""],arguments)};BB.controller.ActionClass.prototype.getAction=function(a){return this.actions[a]};
BB.controller.ActionClass.prototype.getDefaultAction=function(){return this.actions[""]};BB.controller.ActionClass.prototype.doSendMessage=function(a,b){for(var c=[],d=b.length,e=0;e<d;e++)c[e]=b[e];d=c.length==0?undefined:c[c.length-1];if(d!=undefined)if(d instanceof Function){c.pop();var f=new BB.controller.ActionCallback(d)}else if(d instanceof BB.controller.ActionCallback)f=c.pop();c=this.actionController.sendMessage(this.name,a.name,c);if(f!=undefined)this.actionController.callbacks[c]=f};
BB.controller.ActionClass.prototype.onMessage=function(a){if(a.callback!=undefined){this.actionController.callbacks[a.id]=undefined;if(a.callback.canHandleResponse()){a.callback.handleResponse(a.content);return}}this.runHandlers(a)};
BB.controller.ActionClass.prototype.runHandlers=function(a){var b=a.action;if(b.responseHandler==undefined)throw Error("["+(b.name?"Action "+this.name+"."+b.name+"()":"Default action of "+this.name)+"] Cannot find response handler for incoming action");else b.responseHandler(a.content);b.renderingHandler&&b.renderingHandler(a.content)};
BB.controller.ActionClass.prototype.defaultProtocolExceptionHandlerFunction=function(a){if(a.content=="NO_ACTION_CLASS_FOUND")throw Error('Cannot find action class with name "'+a.actionClass.name+'"');else return false};BB.controller.Action=function(a,b){this.name=a;this.actionClass=b;this.exceptionHandler=new BB.controller.ActionExceptionHandler;this.exceptionHandler.setExceptionHandler("BrokenActionProtocolException",this.defaultProtocolExceptionHandlerFunction)};
BB.controller.Action.prototype.setResponseHandler=function(a){this.responseHandler=a;return this};BB.controller.Action.prototype.renderOnResponse=function(a,b,c,d){var e=BB.templateController.constructTemplateInformation(a,b,c,d);this.renderingHandler=function(f){BB.templateController.render(e,f)};return this};
BB.controller.Action.prototype.defaultProtocolExceptionHandlerFunction=function(a){var b=a.content;if(b=="NO_DEFAULT_ACTION_FOUND")a='Cannot find default action in action class with name "'+a.actionClass.name+'"';else if(b=="NO_ACTION_FOUND")a='Cannot find action "'+a.action.name+'" in action class with name "'+a.actionClass.name+'"';else return false;throw Error(a);};BB.controller.ClientActionClass=function(a,b){this.name=a;this.actions=b};
BB.controller.ClientActionClass.prototype.onMessage=function(a){a.action.apply(a.actionClass,a.content)};BB.controller.controllers["system.controller.action"]=BB.controller.ActionController;BB.serialization.serializationEngines={};BB.serialization.setSerializationEngine=function(a,b){BB.serialization.serializationEngines[a]=b};BB.serialization.JsonEngine=function(){};BB.serialization.JsonEngine.prototype.serialize=function(a){return JSON.stringify(a)};BB.serialization.JsonEngine.prototype.deserialize=function(a){return JSON.parse(a)};BB.serialization.serializationEngines.json=BB.serialization.JsonEngine;BB.Client=function(a){this.connection=undefined;a=a||{};a.serverUrl=a.serverUrl||BB.LOCAL_HOSTNAME;a.serializationEngine=a.serializationEngine||"json";a.dataController=a.dataController||"system.controller.action";a.timeout=a.timeout||36E4;a.developmentConsole=a.developmentConsole||false;this.dataController=new BB.controller.controllers[a.dataController];this.dataController.client=this;this.serializationEngine=new BB.serialization.serializationEngines[a.serializationEngine];a.onOpen=a.onOpen||function(){console.log("connected");
  alert("connected")};a.onClose=a.onClose||function(){console.log("disconnected");alert("disconnected")};var b=this;a.onMessage=a.onMessage||function(c){c=b.serializationEngine.deserialize(c.data);b.dataController.onMessage(c)};this.configuration=a};BB.Client.prototype.getConnectionState=function(){if(!this.connection)return WebSocket.CLOSED;return this.connection.readyState};BB.Client.prototype.isConnected=function(){return this.getConnectionState()==WebSocket.OPEN};
BB.Client.prototype.isDisconnected=function(){return this.getConnectionState()==WebSocket.CLOSED};BB.Client.prototype.connect=function(){if(!this.isDisconnected())throw Error("Connection is not closed, cannot establish another connection.");this.connection=new WebSocket(this.configuration.serverUrl,this.configuration.dataController);this.connection.onopen=this.configuration.onOpen;this.connection.onmessage=this.configuration.onMessage;this.connection.onclose=this.configuration.onClose};
BB.Client.prototype.sendMessage=function(a){if(!this.isConnected())throw Error("Cannot send a message, connection is not open.");this.connection.send(this.serializationEngine.serialize(a))};BB.Client.prototype.disconnect=function(){if(!this.isConnected())throw Error("Connection is not open, it may be already closed or in closing state. Actual state: "+this.getConnectionState());this.connection.close()};BB.newClient=function(a){return new BB.Client(a)};