class ALTMacros {
    copy() {
        let advancedLightingOptions;
        if (canvas.lighting.controlled.length === 1) {
            advancedLightingOptions = canvas.lighting.controlled[0].data.flags.AdvancedLightingToolkit;
            ui.notifications.notify("Ambient Light settings copied");
        } else if (canvas.tokens.controlled.length === 1) {
            ui.notifications.notify("Token Light settings copied");
            advancedLightingOptions = canvas.tokens.controlled[0].data.flags.AdvancedLightingToolkit;
        } else {
            ui.notifications.warn("Please select a single light or token");
            return;
        }
        game.settings.set(ALTConstants.moduleName, "savedLightSettings", advancedLightingOptions);
    };
    paste() {
        let advancedLightingOptions;
        advancedLightingOptions = game.settings.get(ALTConstants.moduleName, "savedLightSettings");
        if (!advancedLightingOptions) {
            ui.notifications.warn("No settings copied. Please use the Copy macro first.");
        }
        if(advancedLightingOptions.enabled == undefined){
        // if(Object.keys(advancedLightingOptions).length == 0){
            advancedLightingOptions.enabled = false;
        }
        if (canvas.lighting.controlled.length > 0) {
            let lightsArray = []
            for (let light of canvas.lighting.controlled) {
                if(!light.data.flags.AdvancedLightingToolkit){
                    light.data.flags.AdvancedLightingToolkit = {};
                }
                light.data.flags.AdvancedLightingToolkit = mergeObject(light.data.flags.AdvancedLightingToolkit, advancedLightingOptions);
                lightsArray.push(light.data);
            }
            canvas.lighting.updateMany(lightsArray, {
                diff: false
            });
        } else if (canvas.tokens.controlled.length > 0) {
            let tokensArray = [];
            for (let token of canvas.tokens.controlled) {
                if(!token.data.flags.AdvancedLightingToolkit){
                    token.data.flags.AdvancedLightingToolkit = {};
                }
                token.data.flags.AdvancedLightingToolkit = mergeObject(token.data.flags.AdvancedLightingToolkit, advancedLightingOptions);
                tokensArray.push(token.data);
            }
            canvas.tokens.updateMany(tokensArray, {
                diff: false
            });
        } else {
            ui.notifications.warn("Please select 1 or more lights or tokens");
            return;
        }
        game.settings.set(ALTConstants.moduleName, "savedLightSettings", advancedLightingOptions);
    
    };
    on() {
        let lightsArray = []
        let tokensArray = []
        for (let light of canvas.lighting.controlled) {
            light.data.flags.AdvancedLightingToolkit.hidden = false;
            lightsArray.push(light.data);
        }
        
        for (let token of canvas.tokens.controlled) {
            token.data.flags.AdvancedLightingToolkit.hidden = false;
            tokensArray.push(token.data);
        }
        
        if(lightsArray.length > 0){
            canvas.lighting.updateMany(lightsArray, {
                diff: false
            });
        } else if (tokensArray.length > 0){
            canvas.tokens.updateMany(tokensArray, {
                diff: false
            });
        } else {
            ui.notifications.warn("No lights or tokens selected");
        }
    };
    off() {
        let lightsArray = []
        let tokensArray = []
        for (let light of canvas.lighting.controlled) {
            light.data.flags.AdvancedLightingToolkit.hidden = true;
            lightsArray.push(light.data);
        }
        
        for (let token of canvas.tokens.controlled) {
            token.data.flags.AdvancedLightingToolkit.hidden = true;
            tokensArray.push(token.data);
        }
        
        if(lightsArray.length > 0){
            canvas.lighting.updateMany(lightsArray, {
                diff: false
            });
        } else if (tokensArray.length > 0){
            canvas.tokens.updateMany(tokensArray, {
                diff: false
            });
        } else {
            ui.notifications.warn("No lights or tokens selected");
        }
    };
    toggle() {
        let lightsArray = [];
        let tokensArray = [];
        for (let light of canvas.lighting.controlled) {
            let hide = light.data.flags.AdvancedLightingToolkit.hidden ?? false;
            light.data.flags.AdvancedLightingToolkit.hidden = !hide;
            lightsArray.push(light.data);
        }

        for (let token of canvas.tokens.controlled) {
            let hide = token.getFlag(ALTConstants.moduleName, "hidden") ?? false;
            token.data.flags.AdvancedLightingToolkit.hidden = !hide;
            tokensArray.push(token.data);
        }

        if(lightsArray.length > 0){
            canvas.lighting.updateMany(lightsArray, {
                diff: false
            });
        } else if (tokensArray.length > 0){
            canvas.tokens.updateMany(tokensArray, {
                diff: false
            });
        } else {
            ui.notifications.warn("No lights or tokens selected");
        }
    };
    danceOn() {
        let lightsArray = []
        let tokensArray = []
        for (let light of canvas.lighting.controlled) {
            light.data.flags.AdvancedLightingToolkit.enabled = true;
            lightsArray.push(light.data);
        }
        
        for (let token of canvas.tokens.controlled) {
            token.data.flags.AdvancedLightingToolkit.enabled = true;
            tokensArray.push(token.data);
        }
        
        if(lightsArray.length > 0){
            canvas.lighting.updateMany(lightsArray, {
                diff: false
            });
        } else if (tokensArray.length > 0){
            canvas.tokens.updateMany(tokensArray, {
                diff: false
            });
        } else {
            ui.notifications.warn("No lights or tokens selected");
        }
    };
    danceOff() {
        let lightsArray = []
        let tokensArray = []
        for (let light of canvas.lighting.controlled) {
            light.data.flags.AdvancedLightingToolkit.enabled = false;
            lightsArray.push(light.data);
        }
        
        for (let token of canvas.tokens.controlled) {
            token.data.flags.AdvancedLightingToolkit.enabled = false;
            tokensArray.push(token.data);
        }
        
        if(lightsArray.length > 0){
            canvas.lighting.updateMany(lightsArray, {
                diff: false
            });
        } else if (tokensArray.length > 0){
            canvas.tokens.updateMany(tokensArray, {
                diff: false
            });
        } else {
            ui.notifications.warn("No lights or tokens selected");
        }
    };
    danceToggle() {
        let lightsArray = [];
        let tokensArray = [];
        for (let light of canvas.lighting.controlled) {
            let enabled = light.data.flags.AdvancedLightingToolkit.enabled ?? false;
            light.data.flags.AdvancedLightingToolkit.enabled = !enabled;
            lightsArray.push(light.data);
        }

        for (let token of canvas.tokens.controlled) {
            let enabled = token.getFlag(ALTConstants.moduleName, "enabled") ?? false;
            token.data.flags.AdvancedLightingToolkit.enabled = !enabled;
            tokensArray.push(token.data);
        }

        if(lightsArray.length > 0){
            canvas.lighting.updateMany(lightsArray, {
                diff: false
            });
        } else if (tokensArray.length > 0){
            canvas.tokens.updateMany(tokensArray, {
                diff: false
            });
        } else {
            ui.notifications.warn("No lights or tokens selected");
        }
    };
    debugInfo(json) {
        
        if(navigator.userAgent.includes('FoundryVirtualTabletop')){
            ui.notifications.notify(`Cannot generate debug page in the Foundry app. Press F12 or fn+F12 to view the debug info in the console.`);
            console.log("Cannot create tab for debug info, pasting to console");
            console.log(json || JSON.stringify(canvas.scene.data, undefined, 2));
           
        } else {
            if(json){
                ALTDebugGenerator.generateDebugPage(JSON.parse(json));
            } else {
                ALTDebugGenerator.generateDebugPage(canvas.scene.data);
                    // TODO Add references for: Object.keys(canvas.tokens._controlled), Object.keys(canvas.lighting._controlled));
            }
        }
    };
}