import React, {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import * as Bokeh from '@bokeh/bokehjs'; //nedded for the eval function

const GraphInternal = forwardRef(({ graph }, ref) => {
    const [div, setDiv] = useState(null);

    const updateScript = (newScript) => {
        if (!newScript) return;

        const filtered_script = newScript.replace("<script type=\"text/javascript\">", "").replace("</script>", "");
        const old_script = document.getElementById("bokeh-script");

        if (!old_script) {
            const script = document.createElement("script");
            script.id = "bokeh-script";
            script.type = 'text/javascript';
            script.src = "https://cdn.bokeh.org/bokeh/release/bokeh-3.4.1.min.js";
            script.onload = () => eval(filtered_script);
            document.body.appendChild(script);
        } else {
            old_script.onload = () => eval(filtered_script);
        }
    };

    useEffect(() => {
        if (graph) {
            updateScript(graph.script);
            setDiv(graph.div);
        }
    }, [graph]);

    useImperativeHandle(ref, () => ({
        updateDiv
    }));

    const updateDiv = (newData) => {
        console.log("here")
        setDiv(newData.div);
        updateScript(newData.script);
    };

    return <div dangerouslySetInnerHTML={{ __html: div }} />;
});

export default GraphInternal;
