import React from "react";
import Sizing from "./sizing";
import { random, distance } from "../utilities"
import createKDTree from "static-kdtree"
import "./firefly-sync.css"


const defaultOptions = {
    population: {
        n: 0,
        density: 0.00027,
    },
    excitement: {
        radius: 150,
        threshold: 1,
        charge_rate: 0.005,
        drain_rate: 0.025,
        interaction: 0.1,
    },
    velocity: {
        max: 1.1
    },
    debug: false,
    display: {
        flySize: 10,
    },
}


Firefly.defaultProps = {
    f: [],
    debug: false,
    size: 10,
}

function Firefly(props) {
    const {f} = props;
    return <div className={"f"} style={{left: f[0], bottom: f[1], backgroundColor: `rgba(162, 255, 0, ${0.1+f[3]}`, height: props.size, width: props.size}}>
        { props.debug && <div className={"c"} style={{height: `calc(12px * ${f[2]})`}} />}
    </div>
}

FireflySync.defaultProps = {options: defaultOptions};


export default function FireflySync (props) {
    const [options, setOptions] = React.useState({...defaultOptions, ...props.options});
    const [dimensions, setDimensions] = React.useState({width: 0, height: 0});
    const [fireflies, setFireflies] = React.useState([]);
    const [play, setPlay] = React.useState(false);

    function randomPopulation () {
        const new_fireflies = [];
        for (let i=0; i<options.population.n; i++) {
            new_fireflies.push([
                random(0, dimensions.width),
                random(0, dimensions.height),
                random(0, 1, 100),
                0,
                random(-options.velocity.max, options.velocity.max, 100),
                random(-options.velocity.max, options.velocity.max, 100)
            ]);
        }
        setFireflies(new_fireflies);
    }

    function nextFrame () {
        setFireflies(prev => {
            const tree = createKDTree(prev.map((f) => [f[0], f[1]]));
            const new_fireflies = prev.map((f, fi) => {
                const nf = f.slice();
                if (nf[3] > 0) {
                    nf[3] -= options.excitement.drain_rate;
                } else {
                    nf[3] = 0;
                    nf[2] += options.excitement.charge_rate;
                    if (nf[2] >= options.excitement.threshold) {
                        nf[2] = 0;
                        nf[3] = 1;
                    }
                    tree.rnn(nf.slice(0,2), options.excitement.radius, (ni) => {
                        if ( fi !== ni ) {
                            let n = prev[ni];
                            if (n[3] >= 1) nf[2] += options.excitement.interaction;
                        }
                    });
                }

                nf[0] += nf[4];
                if(nf[0] < 0) nf[4] += 2;
                if(nf[0] > dimensions.width) nf[4] -= 2;

                nf[4] += random(-0.5, 0.5, 100);
                nf[4] = Math.min(Math.max(-options.velocity.max, nf[4]), options.velocity.max);

                nf[1] += nf[5];
                if(nf[1] < 0) nf[5] += 2;
                if(nf[1] > dimensions.height) nf[5] -= 2;
                nf[5] += random(-0.5, 0.5, 100);
                nf[5] = Math.min(Math.max(-options.velocity.max, nf[5]), options.velocity.max);
                return nf;
            });
            return new_fireflies;
        });
    }


    React.useEffect(() => {
        if ( dimensions ) {
            console.log("dimensions");
            if ( !options.population.n ) {
                const area = dimensions.width * dimensions.height;
                const n = Math.floor(area * options.population.density);
                setOptions({...options, population: {density: options.population.density, n: n}});
            }
        }
    }, [dimensions])

    React.useEffect(() => {
        console.log(options);
        if ( dimensions.width && options.population.n && !fireflies.length ) {
            console.log("options");
            randomPopulation();
            setPlay(true);
        }
    }, [dimensions, options])

    React.useEffect(() => {
        if ( play ) {
            console.log("play");
            const interval = setInterval(() => {
                console.log("interval");
                nextFrame();
            }, 50);
            return () => clearInterval(interval);
        }
    }, [play])

    function renderDebug() {
        return (
            <div className={"debug"}>
                <pre>
                    {JSON.stringify(dimensions)}<br/>
                    {JSON.stringify(options.population)}<br/>
                    {fireflies.map((f) => `${f}\n`)}
                </pre>
            </div>
        );
    }

    return (<div className={"firefly-sync"}>
        <Sizing callback={(d) => setDimensions(d)} />
        <div className={"inputs"}>
            <label htmlFor={"debug"}>DEBUG</label>
            <input type={"checkbox"} id={"debug"} name="debug" style={{zIndex: 1}} onChange={(e) => setOptions({...options, debug: e.target.checked})} />
            <br/>
            <label htmlFor={"flySize"}>Fly Size</label>
            <input type={"number"} id={"flySize"} value={options.display.flySize} min={0} onChange={(e) => setOptions({...options, display: {...options.display, flySize: parseInt(e.target.value)}})} />
        </div>
        { options.debug && renderDebug() }
        {fireflies.map((f, fi) => <Firefly key={fi} f={f} debug={options.debug} size={options.display.flySize} />)}
    </div> );
}
