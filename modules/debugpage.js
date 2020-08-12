class ALTDebugGenerator {
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
        let tag = this.HTMLTag;
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

}