import React from "react"

Sizing.defaultProps = {
    callback: (dimensions) => null
}

export default function Sizing (props) {
    const ref = React.useRef();

    function updateSize () {
        if ( ref.current ) {
            const dimensions = {
                x: ref.current.offsetLeft,
                y: ref.current.offsetTop,
                width: ref.current.offsetWidth,
                height: ref.current.offsetHeight,
            };
            props.callback(dimensions);
        }
    }

    React.useEffect(() => {
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return <div ref={ref} className={"sizing"} style={{position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: -10}} />;
}
