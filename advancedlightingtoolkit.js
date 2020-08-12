/**
 * Advanced Lighting Toolkit by Blitz
 * The successor to Dancing Lights, for FVTT 0.7.1+
 */

//TODO: Improve class structure...
class AdvancedLighting {
    
    static Macros = new ALTMacros();

    static danceTimerTick = 80;
    static brightPairs = {};
    static lastAlpha = {};
    static timer;
    static animationFrame = {};
    static syncedFireFrame;

    //TODO
    // static syncedFireData = {};

    // static getSyncedFireFrame() {
    //     // Get fireframe between 0 and 1, map it to min&max
    // }

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

        let newValue = ALTUtilities.randRange(eMin, eMax);

        newValue = Math.min(newValue, max);
        newValue = Math.max(newValue, min);

        return newValue
    }

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
                        AdvancedLighting.animationFrame[id].frame = Math.floor(Math.random() * ALTConstants.fireAnim.length);
                    }
                    AdvancedLighting.animationFrame[id].alreadyPlaying = true;
                }
                AdvancedLighting.animationFrame[id].timesShown++;
                if (AdvancedLighting.animationFrame[id].timesShown >= speed) {
                    AdvancedLighting.animationFrame[id].timesShown = 0;
                    AdvancedLighting.animationFrame[id].frame++;
                }
                if (AdvancedLighting.animationFrame[id].frame >= ALTConstants.fireAnim.length) {
                    AdvancedLighting.animationFrame[id].frame = 0;
                }
                return ALTConstants.fireAnim[AdvancedLighting.animationFrame[id].frame];

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

                return ALTUtilities.scale(alpha, 0, 1, minFade, maxFade);
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
        AdvancedLighting.danceTimerTick = game.settings.get(ALTConstants.moduleName, "clientSpeed") || 80;
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
        if (!light.flags.AdvancedLightingToolkit && game.settings.get(ALTConstants.moduleName, "defaultAmbientLight") != {}) {
            light.flags.AdvancedLightingToolkit = game.settings.get(ALTConstants.moduleName, "defaultAmbientLight");
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
                    game.settings.set(ALTConstants.moduleName, "defaultAmbientLight", {});
                } else {
                    game.settings.set(ALTConstants.moduleName, "defaultAmbientLight", mergeObject(light.flags.AdvancedLightingToolkit, changes.flags.AdvancedLightingToolkit));
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
        if (!token.flags.AdvancedLightingToolkit && game.settings.get(ALTConstants.moduleName, "defaultTokenLight") != {}) {
            token.flags.AdvancedLightingToolkit = game.settings.get(ALTConstants.moduleName, "defaultTokenLight");
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
                game.settings.set(ALTConstants.moduleName, "defaultTokenLight", {});
            } else {
                game.settings.set(ALTConstants.moduleName, "defaultTokenLight", mergeObject(token.flags.AdvancedLightingToolkit, changes.flags.AdvancedLightingToolkit));
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
            ALTDrawLighting.drawLighting(true);
        }
    };

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

        game.settings.register(ALTConstants.moduleName, "enabledForClient", {
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

        game.settings.register(ALTConstants.moduleName, "useLibColorSettings", {
            name: "Use lib - Color Settings",
            hint: "Use the Color Settings library for color pickers. Note that this lib must be installed and enabled as a module. https://github.com/ardittristan/VTTColorSettings",
            scope: "world",
            config: true,
            default: false,
            type: Boolean
        })

        game.settings.register(ALTConstants.moduleName, "dimBrightVision", {
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
        game.settings.register(ALTConstants.moduleName, "dimBrightVisionAmount", {
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
        game.settings.register(ALTConstants.moduleName, "clientSpeed", {
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
        game.settings.register(ALTConstants.moduleName, "updateMask", {
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
        game.settings.register(ALTConstants.moduleName, "defaultAmbientLight", {
            name: "Default Ambient Light Settings",
            scope: "world",
            config: false,
            default: {}
        })
        game.settings.register(ALTConstants.moduleName, "defaultTokenLight", {
            name: "Default Token Light Settings",
            scope: "world",
            config: false,
            default: {}
        })
        game.settings.register(ALTConstants.moduleName, "savedLightSettings", {
            name: "Default Token Light Settings",
            scope: "world",
            config: false,
            default: {}
        })

        if (game.settings.get(ALTConstants.moduleName, "enabledForClient")) {
            Hooks.on("renderLightConfig", ALTInputFormGenerator.onRenderLightConfig);
            Hooks.on("renderTokenConfig", ALTInputFormGenerator.onRenderTokenConfig);
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
            Hooks.once("canvasReady", ALTMonkeyPatcher.runPatch);
            Hooks.once("canvasReady", () => AmbientLight.layer.options.controllableObjects = true);
            Hooks.on("canvasReady", AdvancedLighting.forceReinit);
            Hooks.on('getSceneControlButtons', AdvancedLighting.addLightingSelect);
            Hooks.on('controlAmbientLight', AdvancedLighting.ambientLightSelected);
            Hooks.on('hoverAmbientLight', AdvancedLighting.ambientLightHovered);
            Hooks.once('ready', () => {
                if (game.settings.get(ALTConstants.moduleName, "useLibColorSettings")) {
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
                Hooks.on("renderTokenConfigPF", ALTInputFormGenerator.onRenderTokenConfig);
            }
        }
    }
}


Hooks.on("init", AdvancedLighting.onInit);