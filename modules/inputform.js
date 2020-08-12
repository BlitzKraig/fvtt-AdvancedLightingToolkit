class ALTInputFormGenerator {
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
            if (game.settings.get(ALTConstants.moduleName, "useLibColorSettings")) {
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
        ALTInputFormGenerator.addConfig(lightConfig.element, lightConfig, false);
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
        ALTInputFormGenerator.addConfig(element, tokenConfig, true);
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
        let lightHidden = ALTInputFormGenerator.getFormElement("Turn Light Off", "Turn off this light. 'Enable Advanced Lighting' does not need to be checked to use ALTInputFormGenerator. Check the compendiums for a macro.", "checkbox", "hidden", objectConfig.object.data.flags.AdvancedLightingToolkit.hidden || false, "Boolean");
        let advancedLightingEnabled = ALTInputFormGenerator.getFormElement("Enable Advanced Lighting", "Enable/disable effects on this light", "checkbox", "enabled", objectConfig.object.data.flags.AdvancedLightingToolkit.enabled || false, "Boolean", {
            onClick: 'ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.checked, "advancedLightingOptions");'
        });
        let blurEnabled = ALTInputFormGenerator.getFormElement("Enable Blur", "", "checkbox", "blurEnabled", objectConfig.object.data.flags.AdvancedLightingToolkit.blurEnabled || false, "Boolean", {
            onClick: 'ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.checked, "blurOptions");'
        });
        /* beautify ignore:start */
        let blurAmount = ALTInputFormGenerator.getFormElement("Blur Amount", "Adds a blur to the bright radius", "range", "blurAmount", objectConfig.object.data.flags.AdvancedLightingToolkit.blurAmount ?? 10, "Number", {
            min: 0,
            max: 100,
            step: 1
        });
        /* beautify ignore:end */
        let dimBlurEnabled = ALTInputFormGenerator.getFormElement("Enable Dim Blur", "Adds a blur to the dim radius", "checkbox", "dimBlurEnabled", objectConfig.object.data.flags.AdvancedLightingToolkit.dimBlurEnabled || false, "Boolean", {
            onClick: 'ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.checked, "dimBlurOptions");'
        });
        /* beautify ignore:start */
        let dimBlurAmount = ALTInputFormGenerator.getFormElement("Dim Blur Amount", "", "range", "dimBlurAmount", objectConfig.object.data.flags.AdvancedLightingToolkit.dimBlurAmount ?? 10, "Number", {
            min: 0,
            max: 100,
            step: 1
        });
        /* beautify ignore:end */
        let danceType = ALTInputFormGenerator.getFormElement("Advanced Lighting Type", "Select 'none' to disable the animations (if you just want the blur for example)", "select", "type", objectConfig.object.data.flags.AdvancedLightingToolkit.type || "none", "String", {
            values: ["fire", "legacyfire", "blink", "fade", "electricfault", "lightning", "none"],
            onChange: `ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.value !== "none", "typeOptions"); ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.value == "fire" || ALTInputFormGenerator.value == "legacyfire", "fireOptions"); ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.value == "blink" || ALTInputFormGenerator.value == "fade", "blinkFadeOptions"); ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.value == "blink", "blinkOptions");`
        });
        let minFade = ALTInputFormGenerator.getFormElement("Minimum Fade", "The minimum opacity of the light. This should be lower than Maximum Fade, or will be reverted to 0.4. The default value is set to work well with Fire.", "range", "minFade", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.minFade !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.minFade : 0.4, "Number", {
            min: 0,
            max: 1,
            step: 0.05
        });
        let maxFade = ALTInputFormGenerator.getFormElement("Maximum Fade", "The maximum opacity of the light. This should be higher than Minimum Fade, or will be reverted to 1. The default value is set to work well with Fire.", "range", "maxFade", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.maxFade !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.maxFade : 1, "Number", {
            min: 0,
            max: 1,
            step: 0.05
        });
        let dimFade = ALTInputFormGenerator.getFormElement("Enable Dim Radius Fading", "The Dim light radius will fade with the bright. Note that 'Enable Dim/Color Animation' will also need to be enabled for a light to disappear when it reaches 0 opacity/fade", "checkbox", "dimFade", objectConfig.object.data.flags.AdvancedLightingToolkit.dimFade || false, "Boolean");
        let sync = ALTInputFormGenerator.getFormElement("Enable Sync", "Synchronize animations. Lights with the same animation type & speed with this checked will animate together. Note that the new fire animation does not yet support ALTInputFormGenerator.", "checkbox", "sync", objectConfig.object.data.flags.AdvancedLightingToolkit.sync || false, "Boolean");
        let masterFire = ALTInputFormGenerator.getFormElement("Set As Master Fire", "All 'fire' type lights with 'Enable Sync' will be synchronised to this light. Note that this checkbox will disable itself once the light has updated, but the fire will be set as master. Deleting this light, or changing its type, will lose the sync.", "checkbox", "masterFire", false, "Boolean");

        // Bad name, but keeping so as not to break previous lighting for users
        let animateDim = ALTInputFormGenerator.getFormElement("Enable Dim/Color Animation", "Dim the lighting color along with the light. Particularly useful for having a blinking light 'turn off' when used with 'Enable Dim Radius Fading' and 'Minimum Fade' set to 0. This overrides the 'Light Opacity' in the default light settings. Disable this to keep the opacity as set.", "checkbox", "animateDimAlpha", objectConfig.object.data.flags.AdvancedLightingToolkit.animateDimAlpha || false, "Boolean"); //animateDimAlpha
        let startColor = ALTInputFormGenerator.getFormElement("Fire Color Dim", "The light color when the fire is at its dimmest", "color", "startColor", objectConfig.object.data.flags.AdvancedLightingToolkit.startColor || ALTInputFormGenerator.Constants.defaultFireColor, "String");
        let endColor = ALTInputFormGenerator.getFormElement("Fire Color Bright", "The light color when the fire is at its brightest", "color", "endColor", objectConfig.object.data.flags.AdvancedLightingToolkit.endColor || ALTInputFormGenerator.Constants.defaultFireColor, "String");
        let blinkColorOnly = ALTInputFormGenerator.getFormElement("Blink Color Only", "Do not change the alpha of the Blink light, only switch between colors. Useful for 'disco lights'", "checkbox", "blinkColorOnly", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkColorOnly || false, "Boolean");
        let blinkFadeColorEnabled = ALTInputFormGenerator.getFormElement("Enable Blink/Fade Colors", "'none' uses to normal Light Opacity, other values animate between colors", "select", "blinkFadeColorEnabled", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled || "none", "String", {
            values: ["none", "two", "three"],
            onChange: `ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.value !== "none", "blinkFadeColorOptions"); ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.value == "three", "blinkFadeColorOptionsExtended");`
        });
        let blinkFadeColor1 = ALTInputFormGenerator.getFormElement("Color 1", "", "color", "blinkFadeColor1", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColor1 || "#ff0000", "String");
        let blinkFadeColor2 = ALTInputFormGenerator.getFormElement("Color 2", "", "color", "blinkFadeColor2", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColor2 || "#00ff00", "String");
        let blinkFadeColor3 = ALTInputFormGenerator.getFormElement("Color 3", "", "color", "blinkFadeColor3", objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColor3 || "#0000ff", "String");
        let movementAmount = ALTInputFormGenerator.getFormElement("Fire Movement Amount", "How much the fire position flickers", "range", "fireMovement", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.fireMovement !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.fireMovement : 5, "Number", {
            min: 1,
            max: 40,
            step: 1
        });
        let dimMovement = ALTInputFormGenerator.getFormElement("Enable Dim Radius Movement", "The dim light radius will also move around based on 'Fire Movement Amount'", "checkbox", "dimMovement", objectConfig.object.data.flags.AdvancedLightingToolkit.dimMovement || false, "Boolean");
        let speed = ALTInputFormGenerator.getFormElement("Speed", "The speed of the 'animations'. Lower is faster. Note that the movement of the 'fire' is not affected by this, only the alpha changes. The 'electricfault' and 'lightning' types trigger more often with higher numbers here.", "range", "speed", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.speed !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.speed : 1, "Number", {
            min: 1,
            max: 10,
            step: 1
        });
        let cookieEnabled = ALTInputFormGenerator.getFormElement("Enable Light Image (EXPERIMENTAL)", "Apply an image to the light", "checkbox", "cookieEnabled", objectConfig.object.data.flags.AdvancedLightingToolkit.cookieEnabled || false, "Boolean", {
            onClick: 'ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.checked, "cookieOptions");'
        });
        let cookiePath = ALTInputFormGenerator.getFormElement("Light Image", "The image to apply to the light. Note that white pixels will show the light color, colored pixels will show that color channel & transparent pixels will show as transparent (white light). PNG, JPG and WEBM supported (WEBMs will animate!)", "image", "cookiePath", objectConfig.object.data.flags.AdvancedLightingToolkit.cookiePath || "modules/AdvancedLightingToolkit/ColorTest.png", "String");
        /* beautify ignore:start */
        let scaleCookie = ALTInputFormGenerator.getFormElement("Scale Light Image", "Stretch the image to fit the light", "checkbox", "scaleCookie", objectConfig.object.data.flags.AdvancedLightingToolkit.scaleCookie ?? true, "Boolean");
        /* beautify ignore:end */
        let cookieScaleValue = ALTInputFormGenerator.getFormElement("Set Stretched Image Over/Underscale", "Increase/decrease the size of the stretched image. Useful if an image has too much whitespace surrounding it.", "range", "cookieScaleValue", typeof objectConfig.object.data.flags.AdvancedLightingToolkit.cookieScaleValue !== 'undefined' ? objectConfig.object.data.flags.AdvancedLightingToolkit.cookieScaleValue : 1, "Number", {
            min: 0.1,
            max: 3,
            step: 0.1
        });
        let makeDefault = ALTInputFormGenerator.getFormElement("Set As Default", "Spawn all future lights with these Advanced Lighting settings. Tokens and Ambient Lights will have separate defaults. To revert the default to the normal light, uncheck 'Enable Advanced Lighting' and check ALTInputFormGenerator. Note that this will 'uncheck' itself after you save the light, and must be re-checked if you want to update the defaults.", "checkbox", "makeDefault", false, "Boolean");
        let updateAll = ALTInputFormGenerator.getFormElement("Update All Lights", "IMPORTANT: This can take some time. Do not refresh your page until it is completed, or you risk losing data. Check this to automatically update all of the lights in the scene to match this one. This only updates the DancingLight options", "checkbox", "updateAll", false, "Boolean", {
            onClick: 'ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.checked, "updateExtendedOptions");'
        });
        let updateExtended = ALTInputFormGenerator.getFormElement("Include Standard Config", "When checked along with 'Update All Lights', every light in the scene will also inherit this lights normal light properties. Disable the checkboxes that appear below to disable syncing specific properties. Note that X & Y position are disabled by default.", "checkbox", "updateExtended", false, "Boolean", {
            onClick: 'ALTInputFormGenerator.displayExtendedOptions(ALTInputFormGenerator.checked, "granularExtendedOptions");'
        })

        let updateExtendedHeader = `<h2>Standard options to sync</h2>`;
        let t = ALTInputFormGenerator.getFormElement("Light Type", "", "checkbox", "updateGranular.t", true, "Boolean");
        let x = ALTInputFormGenerator.getFormElement("X-Position", "", "checkbox", "updateGranular.x", false, "Boolean");
        let y = ALTInputFormGenerator.getFormElement("Y-Position", "", "checkbox", "updateGranular.y", false, "Boolean");
        let dim = ALTInputFormGenerator.getFormElement("Dim Radius", "", "checkbox", "updateGranular.dim", true, "Boolean");
        let bright = ALTInputFormGenerator.getFormElement("Bright Radius", "", "checkbox", "updateGranular.bright", true, "Boolean");
        let angle = ALTInputFormGenerator.getFormElement("Emission Angle", "", "checkbox", "updateGranular.angle", true, "Boolean");
        let rotation = ALTInputFormGenerator.getFormElement("Rotation", "", "checkbox", "updateGranular.rotation", true, "Boolean");
        let tintColor = ALTInputFormGenerator.getFormElement("Light Color", "", "checkbox", "updateGranular.tintColor", true, "Boolean");
        let tintAlpha = ALTInputFormGenerator.getFormElement("Light Opacity", "", "checkbox", "updateGranular.tintAlpha", true, "Boolean");
        let darknessThreshold = ALTInputFormGenerator.getFormElement("Darkness Threshold", "", "checkbox", "updateGranular.darknessThreshold", true, "Boolean");

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

        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.enabled || false, "advancedLightingOptions");
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.blurEnabled || false, "blurOptions");
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.dimBlurEnabled || false, "dimBlurOptions");
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.type && objectConfig.object.data.flags.AdvancedLightingToolkit.type !== 'none', 'typeOptions');
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'fire' || objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'legacyfire', 'fireOptions');
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'blink', "blinkOptions");
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'blink' || objectConfig.object.data.flags.AdvancedLightingToolkit.type == 'fade', "blinkFadeOptions");
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled && objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled !== 'none', "blinkFadeColorOptions");
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled && objectConfig.object.data.flags.AdvancedLightingToolkit.blinkFadeColorEnabled == 'three', "blinkFadeColorOptionsExtended");
        ALTInputFormGenerator.displayExtendedOptions(objectConfig.object.data.flags.AdvancedLightingToolkit.cookieEnabled || false, "cookieOptions");
        ALTInputFormGenerator.displayExtendedOptions(false, 'updateExtendedOptions');
        ALTInputFormGenerator.displayExtendedOptions(false, 'granularExtendedOptions');
    }
    /* Input form end */
}