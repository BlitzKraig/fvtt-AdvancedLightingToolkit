class ALTMonkeyPatcher {
    static runPatch() {
        var baseSightDrawSource = SightLayer.prototype._drawSource;
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

                if (layer === 'vision' && game.settings.get(ALTConstants.moduleName, "dimBrightVision")) {
                    source.alpha = game.settings.get(ALTConstants.moduleName, "dimBrightVisionAmount") || 0.5;
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
                if (game.settings.get(ALTConstants.moduleName, "updateMask") === true) {
                    source.mask = source.fov;
                }
                /* Monkeypatch block end */
                return source;
            };
        }(baseSightDrawSource);

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
                ALTDrawLighting.drawLighting(false);
                /* Patch end */
            }
        }(baseLightingUpdate);

        // Force refreshed players with token vision to apply blur
        AdvancedLighting.forceLayersUpdate();
    }
}