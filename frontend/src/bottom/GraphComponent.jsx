import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import * as Bokeh from '@bokeh/bokehjs';


const GraphComponent = forwardRef((props, ref) => {
    const [div, setDiv] = useState(null);

    const updateScript = (newScript) => {
        const new_script_text = newScript;

        const old_script = document.getElementById("bokeh-script");

        const filtered_script = new_script_text.replace("<script type=\"text/javascript\">", "").replace("</script>", "");

        if (old_script == null || old_script == undefined) {
            const script = document.createElement("script");
            script.setAttribute("id", "bokeh-script");

            script.type = 'text/javascript';
            script.src = "https://cdn.bokeh.org/bokeh/release/bokeh-3.4.1.min.js";

            script.onload = eval(filtered_script);

            document.body.appendChild(script);
        } else {
            old_script.onload = eval(filtered_script);
        }
    }

    useEffect(() => {
        updateScript(props.script);
        setDiv(props.div);
    }, []);


    const updateDiv = (newData) => {
        setDiv(newData.div);
        updateScript(newData.script);
    }

    useImperativeHandle(ref, () => {
        return {
            updateDiv: updateDiv
        }
    });


    return (
        <div>
            <div id='testPlot' dangerouslySetInnerHTML={{ __html: div }}></div>
        </div>
    );
});

export default GraphComponent;