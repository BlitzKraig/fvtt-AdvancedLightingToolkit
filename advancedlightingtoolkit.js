/**
 * Advanced Lighting Toolkit by Blitz
 * The successor to Dancing Lights, for FVTT 0.7.1+
 */

//TODO: Improve class structure...
class AdvancedLighting {
    static Constants = new AdvancedLightingToolkitConstants();
    static Utilities = new ALTUtilities();
    // static Constants = {
    //     defaultFireColor: '#ffddbb',
    //     moduleName: "AdvancedLightingToolkit"
    // }
    // static Utilities = {
    //     arraysEqual: (arr1, arr2) => {
    //         if (arr1.length !== arr2.length)
    //             return false;
    //         for (var i = arr1.length; i--;) {
    //             if (arr1[i] !== arr2[i])
    //                 return false;
    //         }

    //         return true;
    //     },
    //     randRange: (min, max) => {
    //         return min + Math.ceil(Math.random() * (max - min));
    //     },
    //     scale: (num, in_min, in_max, out_min, out_max) => {
    //         return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    //     },
    //     fillArray: (length, fillValue) => {
    //         var arr = [];
    //         while (length--) {
    //             arr[length] = fillValue;
    //         }
    //         return arr;
    //     },
    //     /* beautify ignore:start */
    //     safeStringify: (obj, indent = 2) => {
    //         let cache = [];
    //         const retVal = JSON.stringify(
    //           obj,
    //           (key, value) =>
    //             typeof value === "object" && value !== null
    //               ? cache.includes(value)
    //                 ? undefined // Duplicate reference found, discard key
    //                 : cache.push(value) && value // Store value in our collection
    //               : value,
    //           indent
    //         );
    //         cache = null;
            
    //         return retVal;  
    //     }
    //     /* beautify ignore:end */
    // }

    static Macros = {
        /* beautify ignore:start */
        copy: ()=>{
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
            game.settings.set(AdvancedLighting.Constants.moduleName, "savedLightSettings", advancedLightingOptions);
        },
        paste: ()=>{
            let advancedLightingOptions;
            advancedLightingOptions = game.settings.get(AdvancedLighting.Constants.moduleName, "savedLightSettings");
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
            game.settings.set(AdvancedLighting.Constants.moduleName, "savedLightSettings", advancedLightingOptions);
        
        },
        on: ()=>{
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
        },
        off: ()=>{
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
        },
        toggle: () => {
            let lightsArray = [];
            let tokensArray = [];
            for (let light of canvas.lighting.controlled) {
                let hide = light.data.flags.AdvancedLightingToolkit.hidden ?? false;
                light.data.flags.AdvancedLightingToolkit.hidden = !hide;
                lightsArray.push(light.data);
            }

            for (let token of canvas.tokens.controlled) {
                let hide = token.getFlag(AdvancedLighting.Constants.moduleName, "hidden") ?? false;
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
        },
        danceOn: ()=>{
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
        },
        danceOff: ()=>{
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
        },
        danceToggle: ()=>{
            let lightsArray = [];
            let tokensArray = [];
            for (let light of canvas.lighting.controlled) {
                let enabled = light.data.flags.AdvancedLightingToolkit.enabled ?? false;
                light.data.flags.AdvancedLightingToolkit.enabled = !enabled;
                lightsArray.push(light.data);
            }

            for (let token of canvas.tokens.controlled) {
                let enabled = token.getFlag(AdvancedLighting.Constants.moduleName, "enabled") ?? false;
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
        },
        debugInfo: (json)=>{
            
            if(navigator.userAgent.includes('FoundryVirtualTabletop')){
                ui.notifications.notify(`Cannot generate debug page in the Foundry app. Press F12 or fn+F12 to view the debug info in the console.`);
                console.log("Cannot create tab for debug info, pasting to console");
                console.log(json || JSON.stringify(canvas.scene.data, undefined, 2));
               
            } else {
                if(json){
                    AdvancedLighting.generateDebugPage(JSON.parse(json));
                } else {
                    AdvancedLighting.generateDebugPage(canvas.scene.data);
                        // TODO Add references for: Object.keys(canvas.tokens._controlled), Object.keys(canvas.lighting._controlled));
                }
            }
        }
        /* beautify ignore:end */
    }

    static _HTMLTagHelpers = {
        addClass: (cssClass) => {
            if (cssClass) {
                return ` class=${cssClass}`;
            }
            return '';
        },
        colorBoolCheck: (content, desiredResult) => {
            if (content.split(': ')[1] == desiredResult) {
                return ` style="color:green;"`;
            } else {
                return ` style="color:red;"`;
            }
        }
    }
    static HTMLTag = {
        h1: (content, cssClass) => {
            return `<h1${this._HTMLTagHelpers.addClass(cssClass)}>${content}</h1>`;
        },
        h2: (content, cssClass) => {
            return `<h2${this._HTMLTagHelpers.addClass(cssClass)}>${content}</h2>`;
        },
        h3: (content, cssClass) => {
            return `<h3${this._HTMLTagHelpers.addClass(cssClass)}>${content}</h3>`;
        },
        p: (content, cssClass) => {
            return `<p${this._HTMLTagHelpers.addClass(cssClass)}>${content}</p>`;
        },
        div: (content, cssClass) => {
            return `<div${this._HTMLTagHelpers.addClass(cssClass)}>${content}</div>`;
        },
        boolCheckDiv: (content, cssClass, desiredResult) => {
            return `<div${this._HTMLTagHelpers.addClass(cssClass)}${this._HTMLTagHelpers.colorBoolCheck(content, desiredResult)}>${content}</div>`;
        },
        openRow: () => {
            return `<div class="row">`;
        },
        closeRow: () => {
            return `</div>`;
        },
        openHeading: (content) => {
            let html = this.HTMLTag.openRow();
            html += `<div class="col-12"> <h2>${content}</h2>`;
            html += this.HTMLTag.openRow();
            return html;
        },
        closeHeading: () => {
            let html = this.HTMLTag.closeRow();
            html += `</div>`;
            html += this.HTMLTag.closeRow();
            return html;
        }
    }

    static generateDebugPage = (sceneData) => {
        let tag = AdvancedLighting.HTMLTag;
        let data = `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="stylesheet" type="text/css" href="modules/AdvancedLightingToolkit/css/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="modules/AdvancedLightingToolkit/css/advancedlightingtoolkit.css">
        <script>
            function copyDLJson(){
                var copyText = document.getElementById("DLJsonContent");
                copyText.select();
                document.execCommand("copy");
                alert("ALToolkit JSON Copied to Clipboard. Please paste this to Blitz#6797 with details about your issue.");
            }
        </script>
        </head>
        <body>
        <div class="container" id="content">`;
        data += `<textarea name="DLJsonContent" id="DLJsonContent">${JSON.stringify(sceneData, undefined, 2)}</textarea>`;
        data += tag.h1("Advanced Lighting Debug");
        data += tag.p("Scene debug information", "lead");
        data += `<button onClick="copyDLJson()">Copy JSON</button>`

        // ENTITIES OVERVIEW
        data += tag.openHeading("Entities Overview");
        data += tag.div(`Number of lights: ${sceneData.lights.length}`, "col-4");
        data += tag.div(`Number of tokens: ${sceneData.tokens.length}`, "col-4");
        data += tag.div(`Number of walls: ${sceneData.walls.length}`, "col-4");
        data += tag.closeHeading();

        // SCENE SETTINGS
        data += tag.openHeading("Scene Settings");

        let sceneSettings = ['name', 'active', 'darkness', 'fogExploration', 'globalLight', 'tokenVision'];

        sceneSettings.forEach(setting => {
            let content = `${setting}: ${sceneData[setting]}`;
            if (['active', 'fogExploration', 'tokenVision'].includes(setting)) {
                data += tag.boolCheckDiv(content, "col-4", 'true');
            } else if (setting == "globalLight") {
                data += tag.boolCheckDiv(content, "col-4", 'false');
            } else {
                data += tag.div(content, "col-4");
            }
        });

        data += tag.closeHeading();

        // LIGHT SETTINGS
        data += tag.openHeading("Light Settings");
        sceneData.lights.forEach((light, index) => {
            let flatLightObj = flattenObject(light);
            data += tag.div(`<b>Light ${index+1}</b>`, "col-12");
            var lightingMap = Object.entries(flatLightObj);
            lightingMap.forEach((lightProperty) => {
                data += tag.div(`${lightProperty[0].replace('flags.AdvancedLightingToolkit', 'ALT')}: ${lightProperty[1]}`, "col-4");
            });

            data += tag.closeRow();
            data += tag.openRow();

        });
        data += tag.closeHeading();

        // TOKEN SETTINGS
        data += tag.openHeading("Token Settings");
        sceneData.tokens.forEach((token, index) => {
            let flatTokenObj = flattenObject(token);
            data += tag.div(`<b>Token ${index+1}</b>`, "col-12");
            var tokenMap = Object.entries(flatTokenObj);
            tokenMap.forEach((tokenProperty) => {
                data += tag.div(`${tokenProperty[0].replace('flags.AdvancedLightingToolkit', 'ALT')}: ${tokenProperty[1]}`, "col-4");
            });

            data += tag.closeRow();
            data += tag.openRow();

        });
        data += tag.closeHeading();

        // Advanced Lighting settings

        // sceneData.lights.forEach(light => {
        //     data += `<p>${JSON.stringify(light)}</p>`;
        // });

        data += `</div></body></html>`;
        let tab = window.open('about:blank', '_blank');
        tab.document.write(data);
        tab.document.close();
        console.log(JSON.stringify(sceneData.lights, undefined, 2));
    }

    static danceTimerTick = 80;
    static brightPairs = {};
    static lastAlpha = {};
    static timer;
    static animationFrame = {};
    static syncedFireFrame;

    //TODO
    static syncedFireData = {};

    static getSyncedFireFrame() {
        // Get fireframe between 0 and 1, map it to min&max
    }
    static calculateNewFireFrame(min, max, current, frameData, speed, ease = 0.2) {

        if (frameData.functionCounter == undefined) {
            frameData.functionCounter = 0;
        }
        frameData.functionCounter++;

        ease = ease / speed;
        if (Math.random() <= (0.02 / speed)) {
            // console.log("Flicker");
            ease = ease * 3;
        }

        let diff = max - min;
        let margin = diff * ease;
        let eMin;
        let eMax;

        if (current == min) {
            eMin = current;
            eMax = current + margin;
            frameData.increasing = true;
        } else if (current == max) {
            eMin = current - margin;
            eMax = current;
            frameData.increasing = false;
        } else {
            if (Math.random() * Math.min(frameData.functionCounter / (10 * speed), 1) > 0.95) {
                // console.log("Switched");
                frameData.increasing = !frameData.increasing;
                frameData.functionCounter = 0;
            }
            if (frameData.increasing) {
                eMin = current;
                eMax = current + margin;
            } else {
                eMin = current - margin;
                eMax = current;
            }
        }

        let newValue = AdvancedLighting.Utilities.randRange(eMin, eMax);

        newValue = Math.min(newValue, max);
        newValue = Math.max(newValue, min);

        return newValue
    }

    //DEPRECATED: Legacyfire will be removed at some point
    static fireAnim = [
        1.0, 0.763, 0.857, 0.925, 0.831, 0.698, 0.698, 0.698, 0.646, 0.658, 0.742, 0.765, 0.716, 0.699, 0.712, 0.657, 0.573, 0.537, 0.46, 0.442, 0.48, 0.469, 0.477,
        0.569, 0.602, 0.555, 0.523, 0.52, 0.518, 0.538, 0.54, 0.488, 0.429, 0.428, 0.438, 0.517, 0.634, 0.683, 0.673, 0.695, 0.655, 0.614, 0.676, 0.75, 0.741, 0.687,
        0.706, 0.724, 0.655, 0.651, 0.761, 0.829, 0.815, 0.798, 0.803, 0.813, 0.851, 0.907, 0.888, 0.812, 0.808, 0.814, 0.795, 0.813, 0.726, 0.608, 0.606, 0.582, 0.526,
        0.478, 0.455, 0.477, 0.495, 0.434, 0.338, 0.22, 0.219, 0.256, 0.248, 0.256, 0.254, 0.179, 0.139, 0.155, 0.204, 0.273, 0.36, 0.328, 0.217, 0.185, 0.254, 0.263,
        0.192, 0.181, 0.247, 0.308, 0.357, 0.449, 0.479, 0.492, 0.489, 0.451, 0.462, 0.514, 0.534, 0.62, 0.721, 0.727, 0.696, 0.719, 0.789, 0.74, 0.654, 0.669, 0.745,
        0.763, 0.796, 0.808, 0.814, 1.0
    ];

    /* Input form */
    //TODO: Improve settings for clarity
    static getFormElement(label, hint, inputType, name, value, dType, opt) {
        let element = `<div class="form-group">
        <label>${label}</label>
        <div class="form-fields">`;
        if (inputType === "range") {
            element += `<input type="range" name="flags.AdvancedLightingToolkit.${name}" value="${value}" min="${opt.min}" max="${opt.max}" step="${opt.step}" data-dtype="${dType}">
            <span class="range-value">${value}</span>`;
        } else if (inputType === "select") {
            element += `<select name="flags.AdvancedLightingToolkit.${name}" ${opt.onChange?`onChange='${opt.onChange}'`:''}>`;
            opt.values.forEach(sValue => {
                element += `<option value="${sValue}"${value===sValue?'selected="selected"':''}>${sValue}</option>`
            });
            element += `</select>`;

        } else if (inputType === "color") {
            let standardColor = () => {
                return `<input class="color" type="text" name="flags.AdvancedLightingToolkit.${name}" value="${value}" data-dtype="String"></input>
                <input type="color" value="${value}" data-edit="flags.AdvancedLightingToolkit.${name}">`
            }
            if (game.settings.get(AdvancedLighting.Constants.moduleName, "useLibColorSettings")) {
                try {
                    window.Ardittristan.ColorSetting.tester
                    element += `<input type="text" name="flags.AdvancedLightingToolkit.${name}" value=${value} is="colorpicker-input" data-permanent data-responsive-color>`
                } catch {
                    element += standardColor();
                }
            } else {
                element += standardColor();
            }

        } else if (inputType === "image") {
            element += `<button type="button" class="file-picker" data-type="imagevideo" data-target="flags.AdvancedLightingToolkit.${name}" title="Browse Files" tabindex="-1">
            <i class="fas fa-file-import fa-fw"></i>
            </button>
            <input class="image" type="text" name="flags.AdvancedLightingToolkit.${name}" placeholder="path/image.png" value="${value}">`
        } else {
            element += `<input type="${inputType}" name="flags.AdvancedLightingToolkit.${name}" value="${value}" data-dtype="${dType}" ${inputType=='checkbox' && value === true?'checked':''} ${inputType =='checkbox' && opt && opt.onClick?`onclick='${opt.onClick}'`:''} >`;
        }
        element += `</div>
        <p class="hint">${hint}</p>
    </div>`;

        return element;
    }

    static onRenderLightConfig(lightConfig, html, data) {
        AdvancedLighting.addConfig(lightConfig.element, lightConfig, false);
        lightConfig.activateListeners(lightConfig.element)

        //TODO: Improve style changes to attempt expansion on load.
        // $("#light-config").attr('style', function (i, style) {
        //     return style && style.replace(/height[^;]+;?/g, '');
        // });
        // $("#light-config").css('max-height', window.innerHeight - 200);
    }

    static onRenderTokenConfig(tokenConfig, html, data) {
        let element = tokenConfig.element.find(`[data-tab='vision']`)[1];
        $(tokenConfig.element).find('.window-content').css('overflow-y', 'scroll');
        AdvancedLighting.addConfig(element, tokenConfig, true);
        tokenConfig.activateListeners(tokenConfig.element);
    }

    static displayExtendedOptions(display, divId) {
        return display ? $(`#${divId}`).show() : $(`#${divId}`).hide();
    }

    static addConfig(element, objectConfig, isToken) {
        if (!objectConfig.object.data.flags.world) {
            objectConfig.object.data.flags.world = {};
        }
        if (!objectConfig.object.data.flags.AdvancedLightingToolkit) {
            objectConfig.object.data.flags.AdvancedLightingToolkit = {};
        }

        let advancedLightingHeader = `<h2>Advanced Lighting config</h2>`;
        let lightHidden = AdvancedLighting.getFormElement("Turn Light Off", "Turn off this light. 'Enable Advanced Lighting' does not need to be checked to use this. Check the compendiums for a macro.", "checkbox", "hidden", objectConfig.object.data.flags.AdvancedLightingToolkit.hidden || false, "Boolean");
        let advancedLightingEnabled = AdvancedLighting.getFormElement("Enable Advanced Lighting", "Enable/disable effects on this light", "checkbox", "enabled", objectConfig.object.data.flags.AdvancedLightingToolkit.enabled || false, "Boolean", {
            onClick: 'AdvancedLighting.displayExtendedOptions(this.checked, "advancedLightingOptions");'
        });
        let blurEnabled = AdvancedLighting.getFormElement("Enable Blur", "", "checkbox", "blurEnabled", objectConfig.object.data.flags.AdvancedLightingToolkit.blurEnabled || false, "Boolean", {
            onClick: 'AdvancedLighting.displayExtendedOptions(this.checked, "blurOptions");'
        });
        /* beautify ignore:start */
        let blurAmount = AdvancedLighting.getFormElement("Blur Amount", "Adds a blur to the bright radius", "range", "blurAmount", objectConfig.object.data.flags.AdvancedLightingToolkit.blurAmount ?? 10, "Number", {
            min: 0,
            max: 100,
            step: 1
        });
        /* beautify ignore:end */
        let dimBlurEnabled = AdvancedLighting.getFormElement("Enable Dim Blur", "Adds a blur to the dim radius", "checkbox", "dimBlurEnabled", objectConfig.object.data.flags.AdvancedLightingToolkit.dimBlurEnabled || false, "Boolean", {
            onClick: 'AdvancedLighting.displayExtendedOptions(this.checked, "dimBlurOptions");'
        });
        /* beautify ignore:start */
        let dimBlurAmount = AdvancedLighting.getFormElement("Dim Blur Amount", "", "range", "dimBlurAmount", objectConfig.object.data.flags.AdvancedLightingToolkit.dimBlurAmount ?? 10, "Number", {
            min: 0,
            max: 100,
            step: 1
        });
        /* beautify ignore:end */
        let danceType = AdvancedLighting.getFormElement("Advanced Lighting Type", "Select 'none' to disable the animations (if you just want the blur for example)", "select", "type", objectConfig.object.data.flags.AdvancedLightingToolkit.type || "none", "String", {
            values: ["fire", "legacyfire", "blink", "fade", "electricfault", "lightning", "none"],
            onChange: `AdvancedLighting.displayExtendedOptions(this.value !== "none", "typeOptions"); AdvancedLighting.displayExtendedOptions(this.value == "fire" || this.value == "legacyfire", "fireOptions"); AdvancedLighting.displayExtendedOptions(this.value == "blink" || this.value == "fade", "blinkFadeOptions"); AdvancedLighting.displayExtendedOptions(this.value == "blink", "blinkOptions");`
        });
        let minFade = AdvancedLighting.getFormElement("Minimum Fade", "The minimum opacity of the light. This should be lower than Maximum Fade, or will be reverted to 0.4. The default value is set to work well with Fire.", "range", "minFade", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.minFade !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.minFade : 0.4, "Number", {
            min: 0,
            max: 1,
            step: 0.05
        });
        let maxFade = AdvancedLighting.getFormElement("Maximum Fade", "The maximum opacity of the light. This should be higher than Minimum Fade, or will be reverted to 1. The default value is set to work well with Fire.", "range", "maxFade", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.maxFade !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.maxFade : 1, "Number", {
            min: 0,
            max: 1,
            step: 0.05
        });
        let dimFade = AdvancedLighting.getFormElement("Enable Dim Radius Fading", "The Dim light radius will fade with the bright. Note that 'Enable Dim/Color Animation' will also need to be enabled for a light to disappear when it reaches 0 opacity/fade", "checkbox", "dimFade", objectConfig.object.data.flags.AdvancedLightingToolkit.dimFade || false, "Boolean");
        let sync = AdvancedLighting.getFormElement("Enable Sync", "Synchronize animations. Lights with the same animation type & speed with this checked will animate together. Note that the new fire animation does not yet support this.", "checkbox", "sync", objectConfig.object.data.flags.AdvancedLightingToolkit.sync || false, "Boolean");
        let masterFire = AdvancedLighting.getFormElement("Set As Master Fire", "All 'fire' type lights with 'Enable Sync' will be synchronised to this light. Note that this checkbox will disable itself once the light has updated, but the fire will be set as master. Deleting this light, or changing its type, will lose the sync.", "checkbox", "masterFire", false, "Boolean");

        // Bad name, but keeping so as not to break previous lighting for users
        let animateDim = AdvancedLighting.getFormElement("Enable Dim/Color Animation", "Dim the lighting color along with the light. Particularly useful for having a blinking light 'turn off' when used with 'Enable Dim Radius Fading' and 'Minimum Fade' set to 0. This overrides the 'Light Opacity' in the default light settings. Disable this to keep the opacity as set.", "checkbox", "animateDimAlpha", objectConfig.object.data.flags.AdvancedLightingToolkit.animateDimAlpha || false, "Boolean"); //animateDimAlpha
        let startColor = AdvancedLighting.getFormElement("Fire Color Dim", "The light color when the fire is at its dimmest", "color", "startColor", objectConfig.object.data.flags.AdvancedLightingToolkit.startColor || AdvancedLighting.Constants.defaultFireColor, "String");
        let endColor = AdvancedLighting.getFormElement("Fire Color Bright", "The light color when the fire is at its brightest", "color", "endColor", objectConfig.object.data.flags.AdvancedLightingToolkit.endColor || AdvancedLighting.Constants.defaultFireColor, "String");
        let blinkColorOnly = AdvancedLighting.getFormElement("Blink Color Only", "Do not change the alpha of the Blink light, only switch between colors. Useful for 'disco lights'", "checkbox", "blinkColorOnly", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkColorOnly || false, "Boolean");
        let blinkFadeColorEnabled = AdvancedLighting.getFormElement("Enable Blink/Fade Colors", "'none' uses to normal Light Opacity, other values animate between colors", "select", "blinkFadeColorEnabled", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled || "none", "String", {
            values: ["none", "two", "three"],
            onChange: `AdvancedLighting.displayExtendedOptions(this.value !== "none", "blinkFadeColorOptions"); AdvancedLighting.displayExtendedOptions(this.value == "three", "blinkFadeColorOptionsExtended");`
        });
        let blinkFadeColor1 = AdvancedLighting.getFormElement("Color 1", "", "color", "blinkFadeColor1", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColor1 || "#ff0000", "String");
        let blinkFadeColor2 = AdvancedLighting.getFormElement("Color 2", "", "color", "blinkFadeColor2", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColor2 || "#00ff00", "String");
        let blinkFadeColor3 = AdvancedLighting.getFormElement("Color 3", "", "color", "blinkFadeColor3", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColor3 || "#0000ff", "String");
        let movementAmount = AdvancedLighting.getFormElement("Fire Movement Amount", "How much the fire position flickers", "range", "fireMovement", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.fireMovement !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.fireMovement : 5, "Number", {
            min: 1,
            max: 40,
            step: 1
        });
        let dimMovement = AdvancedLighting.getFormElement("Enable Dim Radius Movement", "The dim light radius will also move around based on 'Fire Movement Amount'", "checkbox", "dimMovement", objectConfig.object.data.flags.AdvancedLightingToolkit.dimMovement || false, "Boolean");
        let speed = AdvancedLighting.getFormElement("Speed", "The speed of the 'animations'. Lower is faster. Note that the movement of the 'fire' is not affected by this, only the alpha changes. The 'electricfault' and 'lightning' types trigger more often with higher numbers here.", "range", "speed", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.speed !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.speed : 1, "Number", {
            min: 1,
            max: 10,
            step: 1
        });
        let cookieEnabled = AdvancedLighting.getFormElement("Enable Light Image (EXPERIMENTAL)", "Apply an image to the light", "checkbox", "cookieEnabled", objectConfig.object.data.flags.AdvancedLightingToolkit.cookieEnabled || false, "Boolean", {
            onClick: 'AdvancedLighting.displayExtendedOptions(this.checked, "cookieOptions");'
        });
        let cookiePath = AdvancedLighting.getFormElement("Light Image", "The image to apply to the light. Note that white pixels will show the light color, colored pixels will show that color channel & transparent pixels will show as transparent (white light). PNG, JPG and WEBM supported (WEBMs will animate!)", "image", "cookiePath", objectConfig.object.data.flags.AdvancedLightingToolkit.cookiePath || "modules/AdvancedLightingToolkit/ColorTest.png", "String");
        /* beautify ignore:start */
        let scaleCookie = AdvancedLighting.getFormElement("Scale Light Image", "Stretch the image to fit the light", "checkbox", "scaleCookie", objectConfig.object.data.flags.AdvancedLightingToolkit.scaleCookie ?? true, "Boolean");
        /* beautify ignore:end */
        let cookieScaleValue = AdvancedLighting.getFormElement("Set Stretched Image Over/Underscale", "Increase/decrease the size of the stretched image. Useful if an image has too much whitespace surrounding it.", "range", "cookieScaleValue", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.cookieScaleValue !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.cookieScaleValue : 1, "Number", {
            min: 0.1,
            max: 3,
            step: 0.1
        });
        let makeDefault = AdvancedLighting.getFormElement("Set As Default", "Spawn all future lights with these Advanced Lighting settings. Tokens and Ambient Lights will have separate defaults. To revert the default to the normal light, uncheck 'Enable Advanced Lighting' and check this. Note that this will 'uncheck' itself after you save the light, and must be re-checked if you want to update the defaults.", "checkbox", "makeDefault", false, "Boolean");
        let updateAll = AdvancedLighting.getFormElement("Update All Lights", "IMPORTANT: This can take some time. Do not refresh your page until it is completed, or you risk losing data. Check this to automatically update all of the lights in the scene to match this one. This only updates the DancingLight options", "checkbox", "updateAll", false, "Boolean", {
            onClick: 'AdvancedLighting.displayExtendedOptions(this.checked, "updateExtendedOptions");'
        });
        let updateExtended = AdvancedLighting.getFormElement("Include Standard Config", "When checked along with 'Update All Lights', every light in the scene will also inherit this lights normal light properties. Disable the checkboxes that appear below to disable syncing specific properties. Note that X & Y position are disabled by default.", "checkbox", "updateExtended", false, "Boolean", {
            onClick: 'AdvancedLighting.displayExtendedOptions(this.checked, "granularExtendedOptions");'
        })

        let updateExtendedHeader = `<h2>Standard options to sync</h2>`;
        let t = AdvancedLighting.getFormElement("Light Type", "", "checkbox", "updateGranular.t", true, "Boolean");
        let x = AdvancedLighting.getFormElement("X-Position", "", "checkbox", "updateGranular.x", false, "Boolean");
        let y = AdvancedLighting.getFormElement("Y-Position", "", "checkbox", "updateGranular.y", false, "Boolean");
        let dim = AdvancedLighting.getFormElement("Dim Radius", "", "checkbox", "updateGranular.dim", true, "Boolean");
        let bright = AdvancedLighting.getFormElement("Bright Radius", "", "checkbox", "updateGranular.bright", true, "Boolean");
        let angle = AdvancedLighting.getFormElement("Emission Angle", "", "checkbox", "updateGranular.angle", true, "Boolean");
        let rotation = AdvancedLighting.getFormElement("Rotation", "", "checkbox", "updateGranular.rotation", true, "Boolean");
        let tintColor = AdvancedLighting.getFormElement("Light Color", "", "checkbox", "updateGranular.tintColor", true, "Boolean");
        let tintAlpha = AdvancedLighting.getFormElement("Light Opacity", "", "checkbox", "updateGranular.tintAlpha", true, "Boolean");
        let darknessThreshold = AdvancedLighting.getFormElement("Darkness Threshold", "", "checkbox", "updateGranular.darknessThreshold", true, "Boolean");

        let data = `${advancedLightingHeader}${lightHidden}${advancedLightingEnabled}<div id="advancedLightingOptions">
        ${blurEnabled}<div id="blurOptions">${blurAmount}</div>
        ${dimBlurEnabled}<div id="dimBlurOptions">${dimBlurAmount}</div>
        ${danceType}<div id="typeOptions"><div id="fireOptions">${startColor}${endColor}${movementAmount}${dimMovement}</div>
        <div id="blinkOptions">${blinkColorOnly}</div>
        <div id="blinkFadeOptions">${blinkFadeColorEnabled}<div id="blinkFadeColorOptions">${blinkFadeColor1}${blinkFadeColor2}<div id="blinkFadeColorOptionsExtended">${blinkFadeColor3}</div></div></div>
        ${minFade}${maxFade}${dimFade}${sync}`;
        // TODO: ${masterFire}
        data += `${animateDim}${speed}</div>
        ${cookieEnabled}<div id="cookieOptions">${cookiePath}${scaleCookie}${cookieScaleValue}</div></div>
        ${makeDefault}`;
        if (!isToken) {
            data += `${updateAll}<div id="updateExtendedOptions">${updateExtended}
        <div id="granularExtendedOptions">${updateExtendedHeader}${t}${x}${y}${rotation}${dim}${bright}${angle}${tintColor}${tintAlpha}${darknessThreshold}</div></div>`;
        }

        isToken ? $(element).append(data) : $(element).find('button[name ="submit"]').before(data);

        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.enabled || false, "advancedLightingOptions");
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.blurEnabled || false, "blurOptions");
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.dimBlurEnabled || false, "dimBlurOptions");
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.type && objectConfig.object.data.flags.AdvancedLightingToolkit.type !== 'none', 'typeOptions');
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'fire' || objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'legacyfire', 'fireOptions');
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'blink', "blinkOptions");
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'blink' || objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'fade', "blinkFadeOptions");
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled && objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled !== 'none', "blinkFadeColorOptions");
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled && objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled == 'three', "blinkFadeColorOptionsExtended");
        AdvancedLighting.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.cookieEnabled || false, "cookieOptions");
        AdvancedLighting.displayExtendedOptions(false, 'updateExtendedOptions');
        AdvancedLighting.displayExtendedOptions(false, 'granularExtendedOptions');
    }
    /* Input form end */

    /* Animation Helpers */
    static getAnimationFrame(id, type, minFade, maxFade, speed, sync, opt) {
        if (minFade == undefined || maxFade == undefined || maxFade <= minFade) {
            minFade = 0.4;
            maxFade = 1;
        }
        if (!AdvancedLighting.animationFrame[id]) {
            AdvancedLighting.animationFrame[id] = {
                frame: 0,
                timesShown: 0,
                alreadyPlaying: false,
                functionCounter: 0,
                increasing: 0
            };
        }
        switch (type) {
            case 'fire':
                // TODO Sync main fire animations
                // if (!AdvancedLighting.animationFrame[id].alreadyPlaying) {
                //     if (!sync) {
                //         AdvancedLighting.animationFrame[id].frame = Math.floor(Math.random() * AdvancedLighting.fireAnim.length);
                //     }
                //     AdvancedLighting.animationFrame[id].alreadyPlaying = true;
                // }
                // AdvancedLighting.animationFrame[id].timesShown++;
                // if (AdvancedLighting.animationFrame[id].timesShown >= speed) {
                //     AdvancedLighting.animationFrame[id].timesShown = 0;
                //     AdvancedLighting.animationFrame[id].frame++;
                // }
                // if (AdvancedLighting.animationFrame[id].frame >= AdvancedLighting.fireAnim.length) {
                //     AdvancedLighting.animationFrame[id].frame = 0;
                // }
                return AdvancedLighting.calculateNewFireFrame(minFade * 1000, maxFade * 1000, AdvancedLighting.lastAlpha[id] * 1000 || ((minFade + maxFade) / 2) * 1000, AdvancedLighting.animationFrame[id], speed) / 1000;

            case 'legacyfire':
                if (!AdvancedLighting.animationFrame[id].alreadyPlaying) {
                    if (!sync) {
                        AdvancedLighting.animationFrame[id].frame = Math.floor(Math.random() * AdvancedLighting.fireAnim.length);
                    }
                    AdvancedLighting.animationFrame[id].alreadyPlaying = true;
                }
                AdvancedLighting.animationFrame[id].timesShown++;
                if (AdvancedLighting.animationFrame[id].timesShown >= speed) {
                    AdvancedLighting.animationFrame[id].timesShown = 0;
                    AdvancedLighting.animationFrame[id].frame++;
                }
                if (AdvancedLighting.animationFrame[id].frame >= AdvancedLighting.fireAnim.length) {
                    AdvancedLighting.animationFrame[id].frame = 0;
                }
                return AdvancedLighting.fireAnim[AdvancedLighting.animationFrame[id].frame];

            case 'blink':
                if (!AdvancedLighting.animationFrame[id].alreadyPlaying) {
                    if (!sync) {
                        AdvancedLighting.animationFrame[id].frame = Math.round(Math.random() * 2);
                        AdvancedLighting.animationFrame[id].blinkColorIndex = Math.round(Math.random() * 2);
                    }
                    AdvancedLighting.animationFrame[id].alreadyPlaying = true;
                }

                AdvancedLighting.animationFrame[id].timesShown++;

                if (AdvancedLighting.animationFrame[id].timesShown >= speed) {
                    AdvancedLighting.animationFrame[id].timesShown = 0;
                    AdvancedLighting.animationFrame[id].frame++;
                    if (AdvancedLighting.animationFrame[id].blinkColorIndex == undefined) {
                        AdvancedLighting.animationFrame[id].blinkColorIndex = 0;
                    } else {
                        AdvancedLighting.animationFrame[id].blinkColorIndex++;
                    }
                }
                if (AdvancedLighting.animationFrame[id].frame >= 2) {
                    AdvancedLighting.animationFrame[id].frame = 0;
                }
                if (opt.blinkColorOnly) {
                    return 1
                }
                return AdvancedLighting.animationFrame[id].frame == 0 ? minFade : maxFade;
            case 'fade':
                if (!AdvancedLighting.animationFrame[id].alreadyPlaying) {
                    if (!sync) {
                        AdvancedLighting.animationFrame[id].frame = Math.floor(Math.random() * (20 * speed));
                    }
                    AdvancedLighting.animationFrame[id].alreadyPlaying = true;
                }
                // AdvancedLighting.animationFrame[id].timesShown++;

                // if (AdvancedLighting.animationFrame[id].timesShown >= speed) {
                //     AdvancedLighting.animationFrame[id].timesShown = 0;
                AdvancedLighting.animationFrame[id].frame++;
                // }
                if (AdvancedLighting.animationFrame[id].frame >= (20 * speed)) {
                    AdvancedLighting.animationFrame[id].frame = 0;
                }
                let alpha = 1 - AdvancedLighting.animationFrame[id].frame / 10 / speed;
                if (AdvancedLighting.animationFrame[id].frame >= (10 * speed)) {
                    alpha = 0 + (AdvancedLighting.animationFrame[id].frame - (10 * speed)) / 10 / speed;
                }

                return AdvancedLighting.Utilities.scale(alpha, 0, 1, minFade, maxFade);
                // return alpha;
            case 'electricfault': {
                let midFade = (maxFade + minFade) / 2
                return Math.random() < (.05 * speed) ? Math.random() < .5 ? minFade : midFade : maxFade;
            }
            case 'lightning': {
                let midFade = (maxFade + minFade) / 2
                return Math.random() < (.05 * speed) ? Math.random() < .5 ? maxFade : midFade : minFade;
            }
            case 'none':
                return 1;

            default:
                return 1;
        }


    }

    static getColorFromAlpha(id, colorsArray, minFade, maxFade) {
        if (minFade == undefined || maxFade == undefined || maxFade <= minFade) {
            minFade = 0.4;
            maxFade = 1;
        }
        let colorScale = chroma.scale(colorsArray).domain([minFade, maxFade]);
        return colorScale(AdvancedLighting.lastAlpha[id]).num();
    }

    // Used for three color blinking & no-alpha blinking
    static getBlinkColor(id, colorsArray) {
        if (!AdvancedLighting.animationFrame[id]) {
            return;
        }
        if (AdvancedLighting.animationFrame[id].blinkColorIndex == undefined || AdvancedLighting.animationFrame[id].blinkColorIndex >= colorsArray.length) {
            AdvancedLighting.animationFrame[id].blinkColorIndex = 0

        }
        if (!canvas.sight.visible) {
            return;
        }
        return chroma(colorsArray[AdvancedLighting.animationFrame[id].blinkColorIndex]).num();

    }
    /* Animation Helpers End */

    /* Timer Management */
    static forceReinit() {
        AdvancedLighting.destroyAllTimers();
        AdvancedLighting.createTimers();
    }

    static destroyAllTimers() {
        AdvancedLighting.animationFrame = {};
        AdvancedLighting.brightPairs = {};
        AdvancedLighting.lastAlpha = {};
        if (AdvancedLighting.timer) {
            clearInterval(AdvancedLighting.timer);
            AdvancedLighting.timer = undefined;
        }
    }

    static forceLayersUpdate() {
        canvas.sight.update();
        canvas.lighting.update();
    }

    static createTimers() {
        AdvancedLighting.danceTimerTick = game.settings.get(AdvancedLighting.Constants.moduleName, "clientSpeed") || 80;
        AdvancedLighting.onTick();
        AdvancedLighting.timer = setInterval(AdvancedLighting.onTick, AdvancedLighting.danceTimerTick);
    }
    /* Timer Management End */

    /* Light Config Update */
    static async syncLightConfigs(scene, light, updateExtended, updateGranular) {
        if (!game.user.isGM) {
            return
        }
        ui.notifications.notify(`Updating all lights in the scene, do not refresh!`);
        let lightId = light.id;
        const lights = scene.data.lights;
        lights.forEach((updateLight) => {
            if (updateLight._id !== lightId) {
                mergeObject(updateLight.flags.AdvancedLightingToolkit, light.flags.AdvancedLightingToolkit, true, true)
                if (updateExtended) {
                    let lightData = {};
                    updateGranular.t ? lightData.t = light.t : '';
                    updateGranular.x ? lightData.x = light.x : '';
                    updateGranular.y ? lightData.y = light.y : '';
                    updateGranular.rotation ? lightData.rotation = light.rotation : '';
                    updateGranular.dim ? lightData.dim = light.dim : '';
                    updateGranular.bright ? lightData.bright = light.bright : '';
                    updateGranular.angle ? lightData.angle = light.angle : '';
                    updateGranular.tintColor ? lightData.tintColor = light.tintColor : '';
                    updateGranular.tintAlpha ? lightData.tintAlpha = light.tintAlpha : '';
                    updateGranular.darknessThreshold ? lightData.darknessThreshold = light.darknessThreshold : '';

                    mergeObject(updateLight, lightData, true, true);
                }
            }
        });
        let results = await canvas.lighting.updateMany(lights, {
            diff: false,
            skipAdvancedLighting: true
        });
        ui.notifications.notify(`All lights updated.`);
        return results;
    }

    static async onPreCreateAmbientLight(scene, light) {
        if (!game.user.isGM) {
            return
        }
        if (!light.flags) {
            light.flags = {};
        }
        if (!light.flags.world) {
            light.flags.world = {};
        }
        if (!light.flags.AdvancedLightingToolkit && game.settings.get(AdvancedLighting.Constants.moduleName, "defaultAmbientLight") != {}) {
            light.flags.AdvancedLightingToolkit = game.settings.get(AdvancedLighting.Constants.moduleName, "defaultAmbientLight");
        }
    }

    /* beautify ignore:start */
    static onPreUpdateAmbientLight(scene, light, changes, diff, sceneID) {

        if (diff.skipAdvancedLighting) {
            return;
        }
        if (changes?.flags?.AdvancedLightingToolkit) {
            if (changes.flags.AdvancedLightingToolkit.makeDefault) {
                changes.flags.AdvancedLightingToolkit.makeDefault = false;
                if (changes.flags.AdvancedLightingToolkit.enabled == false || light?.flags?.AdvancedLightingToolkit?.enabled == false) {
                    game.settings.set(AdvancedLighting.Constants.moduleName, "defaultAmbientLight", {});
                } else {
                    game.settings.set(AdvancedLighting.Constants.moduleName, "defaultAmbientLight", mergeObject(light.flags.AdvancedLightingToolkit, changes.flags.AdvancedLightingToolkit));
                }
            }
            // if (light.flags.AdvancedLightingToolkit.masterFire) {
            //     if (!game.scenes.viewed.data.flags) {
            //         game.scenes.viewed.data.flags = {};
            //     }
            //     if (!game.scenes.viewed.data.flags.world) {
            //         game.scenes.viewed.data.flags.world = {};
            //     }
            //     if (!game.scenes.viewed.data.flags.AdvancedLightingToolkit) {
            //         game.scenes.viewed.data.flags.AdvancedLightingToolkit = {};
            //     }
            //     game.scenes.viewed.data.flags.AdvancedLightingToolkit.masterFireID = light.id;
            // }

            if (changes.flags.AdvancedLightingToolkit.updateAll) {
                changes.flags.AdvancedLightingToolkit.updateAll = false;
                let updateExtended = changes.flags.AdvancedLightingToolkit.updateExtended;
                let updateGranular = mergeObject(light.flags.AdvancedLightingToolkit.updateGranular, changes.flags.AdvancedLightingToolkit.updateGranular);
                changes.flags.AdvancedLightingToolkit.updateExtended = false;
                (async () => {
                    await AdvancedLighting.syncLightConfigs(scene, mergeObject(light, changes), updateExtended, updateGranular);
                })();
            }
        }
    }

    /* beautify ignore:end */
    /* beautify ignore:start */
    static onUpdateAmbientLight(scene, light, changes, diff, sceneID) {
        if (changes?.flags?.AdvancedLightingToolkit) {
            AdvancedLighting.destroyAllTimers();
            AdvancedLighting.createTimers();
        }
    }
    /* beautify ignore:end */

    /* Light Config Update End */

    /* Token Config */
    static onPreCreateToken(scene, token) {
        if (!game.user.isGM) {
            return
        }
        if (!token.flags) {
            token.flags = {};
        }
        if (!token.flags.world) {
            token.flags.world = {};
        }
        if (!token.flags.AdvancedLightingToolkit && game.settings.get(AdvancedLighting.Constants.moduleName, "defaultTokenLight") != {}) {
            token.flags.AdvancedLightingToolkit = game.settings.get(AdvancedLighting.Constants.moduleName, "defaultTokenLight");
        }
    }

    /* beautify ignore:start */
    static onPreUpdateToken(scene, token, changes, diff, sceneID) {
        if(diff.skipAdvancedLighting){
            return;
        }
        if (!changes?.flags?.AdvancedLightingToolkit) {
            // return if flag data was not changed in token. Prevents refreshing on token move for example.
            return;
        }

        if (changes.flags.AdvancedLightingToolkit.makeDefault) {
            changes.flags.AdvancedLightingToolkit.makeDefault = false;
            if (changes.flags.AdvancedLightingToolkit.enabled == false || token?.flags?.AdvancedLightingToolkit?.enabled == false) {
                game.settings.set(AdvancedLighting.Constants.moduleName, "defaultTokenLight", {});
            } else {
                game.settings.set(AdvancedLighting.Constants.moduleName, "defaultTokenLight", mergeObject(token.flags.AdvancedLightingToolkit, changes.flags.AdvancedLightingToolkit));
            }
        }
    }
    /* beautify ignore:end */


    /* beautify ignore:start */
    static onUpdateToken(scene, token, changes, diff, sceneID) {
        if (!changes?.flags?.AdvancedLightingToolkit) {
            // return if flag data was not changed in token. Prevents refreshing on token move for example.
            return;
        }
        AdvancedLighting.forceReinit();
        AdvancedLighting.forceLayersUpdate();
    }
    /* beautify ignore:end */

    /* Token Config End */

    /* Multiselect Start */
    static addLightingSelect(controls) {
        let lightingControl = controls.find(control => control.name === "lighting")
        if (!lightingControl.tools.find(tool => tool.name === "select")) {
            lightingControl.tools.unshift({
                name: "select",
                title: "Select Lights",
                icon: "fas fa-expand"
            })
        }
    }

    static ambientLightSelected(ambientLight, selected) {
        ambientLight.controlIcon.border.visible = selected
    }

    static ambientLightHovered(ambientLight, hovered) {
        if (ambientLight._controlled) {
            ambientLight.controlIcon.border.visible = true
        }
    }
    /* Multiselect End */

    static onTick() {
        if (canvas.sight.visible) {
            const c = canvas.lighting.lighting.lights;
            try {
                c.clear();
            } catch (e) {}
        }
        if (canvas.sight.light.bright.children.length > 0) {
            AdvancedLighting.drawLighting(true);
        }
    };

    static drawLighting(advanceFrame) {
        for (let k of canvas.sight.sources.lights.keys()) {
            let s = canvas.sight.sources.lights.get(k);

            let childLight = canvas.lighting.get(k.split('.')[1]) || canvas.tokens.get(k.split('.')[1]);

            if (childLight) {

                if (!childLight.data.flags.world) {
                    childLight.data.flags.world = {};
                }
                if (!childLight.data.flags.AdvancedLightingToolkit) {
                    childLight.data.flags.AdvancedLightingToolkit = {};
                }
                if (childLight.data.flags.AdvancedLightingToolkit.enabled && !childLight.data.flags.AdvancedLightingToolkit.hidden) {
                    let brightChild = canvas.sight.light.bright.getChildByName(k);
                    let dimChild = canvas.sight.light.dim.getChildByName(k);
                    try {
                        if (advanceFrame) {
                            let newAlpha;
                            // let fireSyncedSuccess = false;
                            // try {
                            //     if (childLight.data.flags.AdvancedLightingToolkit.type === 'fire' && childLight.data.flags.AdvancedLightingToolkit.sync && masterFireID && childLight.id != game.scenes.viewed.data.flags.AdvancedLightingToolkit.masterFireID) {
                            //         newAlpha = canvas.lighting.get(masterFireID).alpha;
                            //         fireSyncedSuccess = true;
                            //     }
                            // } catch (e) {
                            //     //Ignore
                            // }

                            if (!newAlpha) {
                                newAlpha = AdvancedLighting.getAnimationFrame(childLight.id, childLight.data.flags.AdvancedLightingToolkit.type, childLight.data.flags.AdvancedLightingToolkit.minFade, childLight.data.flags.AdvancedLightingToolkit.maxFade, childLight.data.flags.AdvancedLightingToolkit.speed || 1, childLight.data.flags.AdvancedLightingToolkit.sync || false, {
                                    blinkColorOnly: childLight.data.flags.AdvancedLightingToolkit.blinkColorOnly
                                });
                            }
                            if (brightChild) {
                                brightChild.alpha = newAlpha;
                            }
                            if (dimChild && childLight.data.flags.AdvancedLightingToolkit.dimFade) {
                                dimChild.alpha = newAlpha;
                            }
                            // Keeping in case we want to add this. Almost looks good.
                            // canvas.sight.light.bright.children[AdvancedLighting.brightPairs[childLight.id]].filters[1].direction = Math.random() * 360;
                            // canvas.sight.light.bright.children[AdvancedLighting.brightPairs[childLight.id]].filters[1].refresh();
                            if (childLight.data.flags.AdvancedLightingToolkit.type === 'fire' || childLight.data.flags.AdvancedLightingToolkit.type === 'legacyfire') {
                                // Move the fire animation
                                if (brightChild) {
                                    brightChild.light.transform.position.x = ((Math.random() - 0.5) * (childLight.id, childLight.data.flags.AdvancedLightingToolkit.fireMovement || 5));
                                    brightChild.light.transform.position.y = ((Math.random() - 0.5) * (childLight.data.flags.AdvancedLightingToolkit.fireMovement || 5));
                                }
                                if (dimChild && childLight.data.flags.AdvancedLightingToolkit.dimMovement) {
                                    dimChild.light.transform.position.x = ((Math.random() - 0.5) * (childLight.id, childLight.data.flags.AdvancedLightingToolkit.fireMovement || 5));
                                    dimChild.light.transform.position.y = ((Math.random() - 0.5) * (childLight.data.flags.AdvancedLightingToolkit.fireMovement || 5));
                                }
                                // Not ready to give up on skew/scale. Scale could be done by clearing and redrawing, but for now we'll stick with the position shift.
                                // canvas.sight.light.bright.children[AdvancedLighting.brightPairs[childLight.id]].light.transform.skew.x = ((Math.random() - 0.5) / 50);
                                // canvas.sight.light.bright.children[AdvancedLighting.brightPairs[childLight.id]].light.transform.skew.y = ((Math.random() - 0.5) / 50);
                            }
                            if (brightChild) {
                                AdvancedLighting.lastAlpha[childLight.id] = brightChild.alpha;
                                if (AdvancedLighting.lastAlpha[childLight.id] === 0) {
                                    AdvancedLighting.lastAlpha[childLight.id] = 0.001;
                                }
                            } else if (dimChild && childLight.data.flags.AdvancedLightingToolkit.dimFade) {
                                AdvancedLighting.lastAlpha[childLight.id] = dimChild.alpha;
                                if (AdvancedLighting.lastAlpha[childLight.id] === 0) {
                                    AdvancedLighting.lastAlpha[childLight.id] = 0.001;
                                }
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }


                }
            }

            if (s.darknessThreshold <= canvas.lighting._darkness) {
                if (childLight && childLight.data.flags.AdvancedLightingToolkit && childLight.data.flags.AdvancedLightingToolkit.enabled && !childLight.data.flags.AdvancedLightingToolkit.hidden) {
                    let advancedLightingOptions = childLight.data.flags.AdvancedLightingToolkit;
                    let childID = childLight.id;

                    // Cookie options
                    let texture;
                    let matrix;
                    if (advancedLightingOptions.cookieEnabled && advancedLightingOptions.cookiePath) {
                        texture = PIXI.Texture.from(advancedLightingOptions.cookiePath);
                        texture.baseTexture.source.loop = true
                        let isToken = k.split('.')[0] === 'Token';
                        if (advancedLightingOptions.scaleCookie === undefined || advancedLightingOptions.scaleCookie) {
                            let xScale = Math.max(isToken ? childLight.dimLightRadius : childLight.dimRadius, isToken ? childLight.brightLightRadius : childLight.brightRadius) * 2 / texture.width; //+ (Math.random() * 1.01);
                            let yScale = Math.max(isToken ? childLight.dimLightRadius : childLight.dimRadius, isToken ? childLight.brightLightRadius : childLight.brightRadius) * 2 / texture.height;
                            let newXScale = advancedLightingOptions.cookieScaleValue || 1;
                            let newYScale = advancedLightingOptions.cookieScaleValue || 1;
                            if (isToken) {
                                matrix = new PIXI.Matrix().scale(xScale, yScale)
                                    .scale(newXScale, newYScale)
                                    .translate(
                                        childLight.getSightOrigin().x - Math.max(childLight.dimLightRadius, childLight.brightLightRadius),
                                        childLight.getSightOrigin().y - Math.max(childLight.dimLightRadius, childLight.brightLightRadius))
                                    .translate(-Math.max(childLight.dimLightRadius, childLight.brightLightRadius) * (newXScale - 1), -Math.max(childLight.dimLightRadius, childLight.brightLightRadius) * (newYScale - 1));
                            } else {
                                matrix = new PIXI.Matrix().scale(xScale, yScale)
                                    .scale(newXScale, newYScale)
                                    .translate(childLight.x - Math.max(childLight.dimRadius, childLight.brightRadius),
                                        childLight.y - Math.max(childLight.dimRadius, childLight.brightRadius))
                                    .translate(-Math.max(childLight.dimRadius, childLight.brightRadius) * (newXScale - 1), -Math.max(childLight.dimRadius, childLight.brightRadius) * (newYScale - 1));;
                            }
                        } else {
                            if (isToken) {
                                matrix = new PIXI.Matrix().translate(childLight.getSightOrigin().x - Math.max(childLight.dimLightRadius, childLight.brightLightRadius), childLight.getSightOrigin().y - Math.max(childLight.dimLightRadius, childLight.brightLightRadius));
                            } else {
                                matrix = new PIXI.Matrix().translate(childLight.x - Math.max(childLight.dimRadius, childLight.brightRadius), childLight.y - Math.max(childLight.dimRadius, childLight.brightRadius));
                            }
                        }
                    }
                    if (advancedLightingOptions.type === 'fire' || advancedLightingOptions.type === 'legacyfire') {
                        if (advancedLightingOptions.cookieEnabled && advancedLightingOptions.cookiePath) {
                            canvas.lighting.lighting.lights.beginTextureFill(texture, AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.startColor || AdvancedLighting.Constants.defaultFireColor, advancedLightingOptions.endColor || AdvancedLighting.Constants.defaultFireColor], advancedLightingOptions.minFade, advancedLightingOptions.maxFade), advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha, matrix).drawPolygon(s.fov).endFill();
                        } else {
                            canvas.lighting.lighting.lights.beginFill(AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.startColor || AdvancedLighting.Constants.defaultFireColor, advancedLightingOptions.endColor || AdvancedLighting.Constants.defaultFireColor], advancedLightingOptions.minFade, advancedLightingOptions.maxFade), advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha).drawPolygon(s.fov).endFill();
                        }
                    } else if (advancedLightingOptions.type === 'fade' && advancedLightingOptions.blinkFadeColorEnabled !== 'none') {
                        if (advancedLightingOptions.blinkFadeColorEnabled == 'two') {
                            if (advancedLightingOptions.cookieEnabled && advancedLightingOptions.cookiePath) {
                                canvas.lighting.lighting.lights.beginTextureFill(texture, AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00'], advancedLightingOptions.minFade, advancedLightingOptions.maxFade), advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha, matrix).drawPolygon(s.fov).endFill();
                            } else {
                                canvas.lighting.lighting.lights.beginFill(AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00'], advancedLightingOptions.minFade, advancedLightingOptions.maxFade), advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha).drawPolygon(s.fov).endFill();
                            }
                        } else if (advancedLightingOptions.blinkFadeColorEnabled == 'three') {
                            if (advancedLightingOptions.cookieEnabled && advancedLightingOptions.cookiePath) {
                                canvas.lighting.lighting.lights.beginTextureFill(texture, AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00', advancedLightingOptions.blinkFadeColor3 || '#0000ff'], advancedLightingOptions.minFade, advancedLightingOptions.maxFade), advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha, matrix).drawPolygon(s.fov).endFill();
                            } else {
                                canvas.lighting.lighting.lights.beginFill(AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00', advancedLightingOptions.blinkFadeColor3 || '#0000ff'], advancedLightingOptions.minFade, advancedLightingOptions.maxFade), advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha).drawPolygon(s.fov).endFill();
                            }
                        }
                    } else if (advancedLightingOptions.type === 'blink' && advancedLightingOptions.blinkFadeColorEnabled !== 'none') {
                        if (advancedLightingOptions.blinkFadeColorEnabled == 'two') {
                            if (advancedLightingOptions.blinkColorOnly) {
                                if (advancedLightingOptions.cookieEnabled && advancedLightingOptions.cookiePath) {
                                    canvas.lighting.lighting.lights.beginTextureFill(texture, AdvancedLighting.getBlinkColor(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00']) || s.color, advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha, matrix).drawPolygon(s.fov).endFill();
                                } else {
                                    canvas.lighting.lighting.lights.beginFill(AdvancedLighting.getBlinkColor(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00']) || s.color, advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha).drawPolygon(s.fov).endFill();
                                }
                            } else {
                                if (advancedLightingOptions.cookieEnabled && advancedLightingOptions.cookiePath) {
                                    canvas.lighting.lighting.lights.beginTextureFill(texture, AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00'], advancedLightingOptions.minFade, advancedLightingOptions.maxFade) || s.color, advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha, matrix).drawPolygon(s.fov).endFill();
                                } else {
                                    canvas.lighting.lighting.lights.beginFill(AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00'], advancedLightingOptions.minFade, advancedLightingOptions.maxFade) || s.color, advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha).drawPolygon(s.fov).endFill();
                                }
                            }
                        } else if (advancedLightingOptions.blinkFadeColorEnabled == 'three') {
                            if (advancedLightingOptions.cookieEnabled && advancedLightingOptions.cookiePath) {
                                canvas.lighting.lighting.lights.beginTextureFill(texture, AdvancedLighting.getBlinkColor(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00', advancedLightingOptions.blinkFadeColor3 || '#0000ff']) || s.color, advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha, matrix).drawPolygon(s.fov).endFill();
                            } else {
                                canvas.lighting.lighting.lights.beginFill(AdvancedLighting.getBlinkColor(childID, [advancedLightingOptions.blinkFadeColor1 || '#ff0000', advancedLightingOptions.blinkFadeColor2 || '#00ff00', advancedLightingOptions.blinkFadeColor3 || '#0000ff']) || s.color, advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha).drawPolygon(s.fov).endFill();
                            }
                        }
                    } else {
                        if (advancedLightingOptions.cookieEnabled && advancedLightingOptions.cookiePath) {
                            canvas.lighting.lighting.lights.beginTextureFill(texture, s.color, advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha, matrix).drawPolygon(s.fov).endFill();
                        } else {
                            canvas.lighting.lighting.lights.beginFill(s.color, advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha).drawPolygon(s.fov).endFill();
                        }
                    }
                } else if (childLight && childLight.data.flags.AdvancedLightingToolkit.hidden) {
                    let hiddenFov = {
                        "points": [0, 0],
                        "type": 0,
                        "closeStroke": true
                    }
                    canvas.lighting.lighting.lights.beginFill(s.color, 0).drawPolygon(hiddenFov).endFill();
                } else {
                    canvas.lighting.lighting.lights.beginFill(s.color, s.alpha).drawPolygon(s.fov).endFill();
                }
            }
        }
        /* Fix for Pathfinder 1 'DarkVision' dimness in scenes with dark overlay set */
        if (game.system.id === 'pf1') {
            if (canvas.sight.hasDarkvision) {
                canvas.lighting.updateDarkvision();
            }
        }
        /* PF1e fix end */
    }

    static onInit() {
        let baseDrawControlIcon = AmbientLight.prototype._drawControlIcon;
        AmbientLight.prototype._drawControlIcon = function (base) {
            return function () {
                /* beautify ignore:start */
            if (this?.data?.flags?.AdvancedLightingToolkit?.hidden) {
                const size = Math.max(Math.round((canvas.dimensions.size * 0.5) / 20) * 20, 40);
                let icon = new ControlIcon({
                    texture: "modules/AdvancedLightingToolkit/icons/fire-off.svg",
                    size: size
                });
                icon.x -= (size * 0.5);
                icon.y -= (size * 0.5);
                return icon;
            } else {
                return base();
            }  
            /* beautify ignore:end */
            };
        }(baseDrawControlIcon);

        game.settings.register(AdvancedLighting.Constants.moduleName, "enabledForClient", {
            name: "Enable Advanced Lighting (Per client)",
            hint: "My PC can handle it! If a player is having trouble with Advanced Lighting Toolkit, but you don't want everyone else to miss out, ask them to disable this checkbox",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: value => {
                window.location.reload();
            }
        })

        game.settings.register(AdvancedLighting.Constants.moduleName, "useLibColorSettings", {
            name: "Use lib - Color Settings",
            hint: "Use the Color Settings library for color pickers. Note that this lib must be installed and enabled as a module. https://github.com/ardittristan/VTTColorSettings",
            scope: "world",
            config: true,
            default: false,
            type: Boolean
        })

        game.settings.register(AdvancedLighting.Constants.moduleName, "dimBrightVision", {
            name: "Dim token Bright Vision (Per client)",
            hint: "Changing this will refresh your page! Disable this to revert bright vision circles back to default. Note that you will not see some Advanced Lighting effects properly while they are within your bright vision radius.",
            scope: "client",
            config: true,
            default: true,
            type: Boolean,
            onChange: value => {
                window.location.reload();
            }
        })
        game.settings.register(AdvancedLighting.Constants.moduleName, "dimBrightVisionAmount", {
            name: "Dim token Bright Vision alpha (Per client)",
            hint: "Changing this will refresh your page! Tweak how dim the Bright Vision radius is. This can help to still see the lights inside a characters bright vision. 0.1 is very dim, 1 is fully bright",
            scope: "client",
            config: true,
            type: Number,
            range: { // If range is specified, the resulting setting will be a range slider
                min: 0.1,
                max: 1,
                step: 0.05
            },
            default: 0.9,
            onChange: value => {
                window.location.reload();
            }
        })
        game.settings.register(AdvancedLighting.Constants.moduleName, "clientSpeed", {
            name: "Client Interval",
            hint: "Change the tickrate of AdvancedLightingToolkit, in ms. Lower is faster, and more resource intensive. The module was designed with an interval of 80 in mind, but you can try increasing this a little if a player is having performance issues. Note that their animations will run slower as a result. ~100ms should still be relatively smooth, while reducing CPU load.",
            scope: "client",
            config: true,
            type: Number,
            range: { // If range is specified, the resulting setting will be a range slider
                min: 10,
                max: 400,
                step: 1
            },
            default: 80,
            onChange: value => {
                canvas.draw();
                // window.location.reload();
            }
        })
        game.settings.register(AdvancedLighting.Constants.moduleName, "updateMask", {
            name: "Prevent Light Bleed - EXPERIMENTAL",
            hint: "World setting. The GM can enable this to update the light mask to try and prevent 'light bleeding' when a blurred light hits a wall. Testing so far indicates this is safe, but if you see any weird stuff happening with lights, try disabling this - and contact me on Discord if enabling this causes issues @Blitz#6797",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            onChange: value => {
                window.location.reload();
            }
        })
        game.settings.register(AdvancedLighting.Constants.moduleName, "defaultAmbientLight", {
            name: "Default Ambient Light Settings",
            scope: "world",
            config: false,
            default: {}
        })
        game.settings.register(AdvancedLighting.Constants.moduleName, "defaultTokenLight", {
            name: "Default Token Light Settings",
            scope: "world",
            config: false,
            default: {}
        })
        game.settings.register(AdvancedLighting.Constants.moduleName, "savedLightSettings", {
            name: "Default Token Light Settings",
            scope: "world",
            config: false,
            default: {}
        })

        if (game.settings.get(AdvancedLighting.Constants.moduleName, "enabledForClient")) {
            Hooks.on("renderLightConfig", AdvancedLighting.onRenderLightConfig);
            Hooks.on("renderTokenConfig", AdvancedLighting.onRenderTokenConfig);
            Hooks.on("preUpdateAmbientLight", AdvancedLighting.onPreUpdateAmbientLight);
            Hooks.on("updateAmbientLight", AdvancedLighting.onUpdateAmbientLight);
            Hooks.on("preCreateAmbientLight", AdvancedLighting.onPreCreateAmbientLight);
            Hooks.on("createAmbientLight", () => {
                AdvancedLighting.forceReinit();
                AdvancedLighting.forceLayersUpdate();
            });
            Hooks.on("preCreateToken", AdvancedLighting.onPreCreateToken);
            Hooks.on("createToken", () => {
                AdvancedLighting.forceReinit();
                AdvancedLighting.forceLayersUpdate();
            })
            Hooks.on("preUpdateToken", AdvancedLighting.onPreUpdateToken);
            Hooks.on("updateToken", AdvancedLighting.onUpdateToken);
            Hooks.on("controlToken", AdvancedLighting.forceReinit);
            Hooks.once("canvasReady", AdvancedLighting.patchLighting);
            Hooks.once("canvasReady", () => AmbientLight.layer.options.controllableObjects = true);
            Hooks.on("canvasReady", AdvancedLighting.forceReinit);
            Hooks.on('getSceneControlButtons', AdvancedLighting.addLightingSelect);
            Hooks.on('controlAmbientLight', AdvancedLighting.ambientLightSelected);
            Hooks.on('hoverAmbientLight', AdvancedLighting.ambientLightHovered);
            Hooks.once('ready', () => {
                if (game.settings.get(AdvancedLighting.Constants.moduleName, "useLibColorSettings")) {
                    try {
                        window.Ardittristan.ColorSetting.tester
                    } catch {
                        ui.notifications.notify('You have "lib - ColorSettings" enabled for Advanced Lighting Toolkit, but do not appear to have the lib module enabled. Please make sure you have the "lib - ColorSettings" module installed, or disable the lib in Advanced Lighting Toolkit settings', "error", {
                            permanent: true
                        });
                    }
                }
            });
            if (game.system.id === 'pf1') {
                Hooks.on("renderTokenConfigPF", AdvancedLighting.onRenderTokenConfig);
            }
        }
    }

    static patchLighting() {
        // Forgive me -- This will probably break with some Foundry updates
        // TODO: Add version checks with custom patches - This works with at least 0.6.2 -> 0.6.4

        // ? -> 0.6.2 -> 0.6.5
        /*
  _drawSource(hex, {x, y, radius, fov}={}) {
    let source = new PIXI.Container();
    source.light = source.addChild(new PIXI.Graphics());
    source.light.beginFill(hex, 1.0).drawCircle(x, y, radius).endFill();
    source.fov = source.addChild(new PIXI.Graphics());
    source.fov.beginFill(0xFFFFFF, 1.0).drawPolygon(fov).endFill();
    source.light.mask = source.fov;
    return source;
  }
    */
        let baseSightDrawSource = SightLayer.prototype._drawSource;
        SightLayer.prototype._drawSource = function (base) {
            return function (hex, {
                x,
                y,
                radius,
                fov
            } = {}, keys) {

                /* Monkeypatch block */
                let advancedLightingOptions;
                let [type, id] = keys.k.split('.');
                let channel = keys.c;
                let layer = keys.layerKey;
                if (layer != 'vision' && (channel === 'bright' || channel === 'dim')) {
                    let child;
                    if (type === 'Light') {
                        child = canvas.lighting.get(id);
                    } else if (type === 'Token') {
                        child = canvas.tokens.get(id);
                    }
                    if (child && child.data.flags && child.data.flags.world && child.data.flags.AdvancedLightingToolkit) {
                        advancedLightingOptions = child.data.flags.AdvancedLightingToolkit;
                    }
                    /* beautify ignore:start */
                    if (advancedLightingOptions?.hidden) {
                        radius = 0;
                        fov = {
                            "points": [0, 0],
                            "type": 0,
                            "closeStroke": true
                        };
                    }
                    /* beautify ignore:end */
                }
                /* Monkeypatch block end */

                // Calling original fn here
                let source = base(arguments[0], arguments[1]);

                /* Monkeypatch block */

                if (layer === 'vision' && game.settings.get(AdvancedLighting.Constants.moduleName, "dimBrightVision")) {
                    source.alpha = game.settings.get(AdvancedLighting.Constants.moduleName, "dimBrightVisionAmount") || 0.5;
                }

                /* beautify ignore:start */
                if (layer != 'vision' && !advancedLightingOptions?.hidden) {
                    if (channel === 'bright') {
                        source.name = `${type}.${id}`;
                        if (advancedLightingOptions && advancedLightingOptions.enabled) {
                            if (advancedLightingOptions.blurEnabled) {
                                if (advancedLightingOptions.blurAmount == 0) {
                                    source.light.filters = [];
                                } else {
                                    source.light.filters = [new PIXI.filters.BlurFilter(advancedLightingOptions.blurAmount)]
                                }
                                // Keeping in case we want to add this. Almost looks good.
                                // source.filters.push(new PIXI.filters.GlitchFilter({slices:30, offset: 5, direction: 45, average: true}));
                            }
                            source.alpha = AdvancedLighting.lastAlpha[id]
                            if (advancedLightingOptions.type === 'fire' || advancedLightingOptions.type === 'legacyfire') {
                                try {
                                    source.light.transform.position.x = ((Math.random() - 0.5) * (advancedLightingOptions.fireMovement || 5));
                                    source.light.transform.position.y = ((Math.random() - 0.5) * (advancedLightingOptions.fireMovement || 5));
                                    // canvas.sight.light.bright.children[AdvancedLighting.brightPairs[child.id]].light.transform.skew.x = ((Math.random() - 0.5) / 50);
                                    // canvas.sight.light.bright.children[AdvancedLighting.brightPairs[child.id]].light.transform.skew.y = ((Math.random() - 0.5) / 50);
                                } catch (e) {}
                            }
                        }
                    } else if (channel === 'dim') {
                        source.name = `${type}.${id}`;
                        if (advancedLightingOptions && advancedLightingOptions.enabled) {
                            if (advancedLightingOptions.dimBlurEnabled) {
                                if (advancedLightingOptions.dimBlurAmount == 0) {
                                    source.light.filters = [];
                                } else {
                                    source.light.filters = [new PIXI.filters.BlurFilter(advancedLightingOptions.dimBlurAmount)]
                                }
                            }
                            if (advancedLightingOptions.dimFade) {
                                source.alpha = AdvancedLighting.lastAlpha[id]
                            }
                            if ((advancedLightingOptions.type === 'fire' || advancedLightingOptions.type === 'legacyfire') && advancedLightingOptions.dimMovement) {
                                try {
                                    source.light.transform.position.x = ((Math.random() - 0.5) * (advancedLightingOptions.fireMovement || 5));
                                    source.light.transform.position.y = ((Math.random() - 0.5) * (advancedLightingOptions.fireMovement || 5));
                                } catch (e) {}
                            }
                        }
                    }
                }
                /* beautify ignore:end */
                if (game.settings.get(AdvancedLighting.Constants.moduleName, "updateMask") === true) {
                    source.mask = source.fov;
                }
                /* Monkeypatch block end */
                return source;
            };
        }(baseSightDrawSource);

        // ? -> 0.6.2 -> 0.6.5
        /*
update() {
    if ( !this._initialized ) return;
    const light = this.light;
    const fog = this.fog.update;
    const channels = this._channels;
    const pNow = CONFIG.debug.sight ? performance.now() : null;

    // Clear currently rendered sources
    for ( let channel of light.children ) {
      channel.removeChildren().forEach(c => c.destroy({children: true, texture: true, baseTexture: true}));
    }
    light.los.clear();

    // If token vision is not used or no vision sources exist
    if ( !this.tokenVision || !this.sources.vision.size ) {
      this.visible = this.tokenVision && !game.user.isGM;
      return this.restrictVisibility();
    }
    this.visible = true;

    // Iterate over all sources and render them
    for ( let sources of Object.values(this.sources) ) {
      for ( let s of sources.values() ) {

        // Draw line of sight polygons
        if ( s.los ) {
          light.los.beginFill(0xFFFFFF, 1.0).drawPolygon(s.los).endFill();
          if ( this._fogUpdates ) fog.los.beginFill(0xFFFFFF, 1.0).drawPolygon(s.los).endFill();
        }

        // Draw fog exploration polygons
        if ( this._fogUpdates && ((s.channels.dim + s.channels.bright) > 0) ) {
          fog.fov.beginFill(channels.explored.hex, 1.0).drawPolygon(s.fov).endFill();
        }

        // Draw the source for each vision channel
        for ( let [c, r] of Object.entries(s.channels)) {
          if ( (r !== 0) && s.darknessThreshold <= canvas.lighting._darkness ) {
            let channel = light[c];
            channel.addChild(this._drawSource(channels[c].hex, {x: s.x, y: s.y, radius: r, fov: s.fov}));
          }
        }
      }
    }

    // Draw fog exploration every 10 positions
    if ( this._fogUpdates >= 10 ) this._commitFogUpdate();

    // Restrict visibility of objects
    this.restrictVisibility();

    // Log debug status
    if ( CONFIG.debug.sight ) {
      let ns = performance.now() - pNow;
      console.log(`Rendered Sight Layer update in ${ns}ms`);
    }
  }
        */

        let baseSightUpdate = SightLayer.prototype.update;
        SightLayer.prototype.update = function (base) {
            return function () {
                if (!this._initialized) return;
                const light = this.light;
                const fog = this.fog.update;
                const channels = this._channels;
                const pNow = CONFIG.debug.sight ? performance.now() : null;

                // Clear currently rendered sources
                for (let channel of light.children) {
                    channel.removeChildren().forEach(c => c.destroy({
                        children: true,
                        texture: true,
                        baseTexture: true
                    }));
                }
                light.los.clear();

                // If token vision is not used or no vision sources exist
                if (!this.tokenVision || !this.sources.vision.size) {
                    this.visible = this.tokenVision && !game.user.isGM;
                    return this.restrictVisibility();
                }
                this.visible = true;

                // Iterate over all sources and render them

                /* Patch start */
                let tempIndex = 0;
                for (let sources of Object.values(this.sources)) {
                    let layerKey = Object.keys(this.sources)[tempIndex++];
                    // for ( let s of sources.values() ) {
                    // for (let sourceKey of Object.keys(this.sources)) {
                    //     let sources = this.sources[sourceKey];
                    // TODO for 0.7.1+, set the fov outside the update method and try to use the default version
                    for (let k of sources.keys()) {
                        let isHidden;
                        if (layerKey === "lights") {
                            let [type, id] = k.split('.');
                            /* beautify ignore:start */
                            if (type === "Light") {
                                isHidden = canvas.lighting.get(id)?.data?.flags?.AdvancedLightingToolkit?.hidden;
                            } else if (type === "Token") {
                                isHidden = canvas.tokens.get(id)?.data?.flags?.AdvancedLightingToolkit?.hidden;
                            }
                            /* beautify ignore:end */
                        }
                        let s = sources.get(k);
                        if (isHidden) {
                            s.fov = {
                                "points": [0, 0],
                                "type": 0,
                                "closeStroke": true
                            };
                        }

                        /* Patch end */

                        // Draw line of sight polygons
                        if (s.los) {
                            light.los.beginFill(0xFFFFFF, 1.0).drawPolygon(s.los).endFill();
                            if (this._fogUpdates) fog.los.beginFill(0xFFFFFF, 1.0).drawPolygon(s.los).endFill();
                        }

                        // Draw fog exploration polygons
                        if (this._fogUpdates && ((s.channels.dim + s.channels.bright) > 0)) {
                            fog.fov.beginFill(channels.explored.hex, 1.0).drawPolygon(s.fov).endFill();
                        }

                        // Draw the source for each vision channel
                        /* Patch start */
                        for (let [c, r] of Object.entries(s.channels)) {
                            if ((r !== 0) && s.darknessThreshold <= canvas.lighting._darkness) {
                                let channel = light[c];
                                channel.addChild(this._drawSource(channels[c].hex, {
                                    x: s.x,
                                    y: s.y,
                                    radius: r,
                                    fov: s.fov
                                }, {
                                    layerKey,
                                    k,
                                    c
                                }));
                            }
                        }
                        /* Patch end */
                    }
                }

                // Draw fog exploration every 10 positions
                if (this._fogUpdates >= 10) this._commitFogUpdate();

                // Restrict visibility of objects
                this.restrictVisibility();

                // Log debug status
                if (CONFIG.debug.sight) {
                    let ns = performance.now() - pNow;
                    console.log(`Rendered Sight Layer update in ${ns}ms`);
                }

                // DarkerVision support
                try {
                    DarkerVisionFor5e.betterDimVision(this.sources);
                } catch (e) {}
            }
        }(baseSightUpdate);


        // ? -> 0.6.2 -> 0.6.5
        /*
         update(alpha=null) {
             const d = canvas.dimensions;
             const c = this.lighting;

             // Draw darkness layer
             this._darkness = alpha !== null ? alpha : canvas.scene.data.darkness;
             c.darkness.clear();
             const darknessPenalty = 0.8;
             let darknessColor = canvas.scene.getFlag("core", "darknessColor") || CONFIG.Canvas.darknessColor;
             if ( typeof darknessColor === "string" ) darknessColor = colorStringToHex(darknessColor);
             c.darkness.beginFill(darknessColor, this._darkness * darknessPenalty)
               .drawRect(0, 0, d.width, d.height)
               .endFill();

             // Draw lighting atop the darkness
             c.lights.clear();
             for ( let s of canvas.sight.sources.lights.values() ) {
               if ( s.darknessThreshold <= this._darkness ) {
                 c.lights.beginFill(s.color, s.alpha).drawPolygon(s.fov).endFill();
               }
             }
           }
        */
        let baseLightingUpdate = LightingLayer.prototype.update;
        LightingLayer.prototype.update = function (base) {
            return function (alpha = null) {
                const d = canvas.dimensions;
                const c = this.lighting;

                // Draw darkness layer
                this._darkness = alpha !== null ? alpha : canvas.scene.data.darkness;
                c.darkness.clear();
                const darknessPenalty = 0.8;
                let darknessColor = canvas.scene.getFlag("core", "darknessColor") || CONFIG.Canvas.darknessColor;
                if (typeof darknessColor === "string") darknessColor = colorStringToHex(darknessColor);
                c.darkness.beginFill(darknessColor, this._darkness * darknessPenalty)
                    .drawRect(0, 0, d.width, d.height)
                    .endFill();

                // Draw lighting atop the darkness
                c.lights.clear();

                /* Patch start */
                AdvancedLighting.drawLighting(false);
                /* Patch end */
            }
        }(baseLightingUpdate);

        // Force refreshed players with token vision to apply blur
        AdvancedLighting.forceLayersUpdate();
    }
}


Hooks.on("init", AdvancedLighting.onInit);