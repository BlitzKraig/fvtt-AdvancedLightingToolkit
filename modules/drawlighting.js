class ALTDrawLighting {
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
                            canvas.lighting.lighting.lights.beginTextureFill(texture, AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.startColor || ALTConstants.defaultFireColor, advancedLightingOptions.endColor || ALTConstants.defaultFireColor], advancedLightingOptions.minFade, advancedLightingOptions.maxFade), advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha, matrix).drawPolygon(s.fov).endFill();
                        } else {
                            canvas.lighting.lighting.lights.beginFill(AdvancedLighting.getColorFromAlpha(childID, [advancedLightingOptions.startColor || ALTConstants.defaultFireColor, advancedLightingOptions.endColor || ALTConstants.defaultFireColor], advancedLightingOptions.minFade, advancedLightingOptions.maxFade), advancedLightingOptions.animateDimAlpha ? AdvancedLighting.lastAlpha[childID] || s.alpha : s.alpha).drawPolygon(s.fov).endFill();
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

}