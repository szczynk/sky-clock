import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useCallback } from "react";
import BlueStar from "./bluestar.png";

import "./particles.css";

export default function Render() {
  const particlesInit = useCallback(async (engine) => {
    console.log("init: ", engine);
    //* you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    //* this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    //* starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log("loaded: ", container);
  }, []);

  return (
    <div className="particles-js">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fpsLimit: 60,
          particles: {
            number: {
              value: 25,
              density: {
                enable: true,
                area: 800,
              },
            },
            color: {
              value: "#ffffff",
            },
            shape: {
              type: "image",
              stroke: {
                width: 0,
                color: "#000000",
              },
              polygon: {
                sides: 4,
              },
              image: {
                src: BlueStar,
                width: 100,
                height: 100,
              },
            },
            opacity: {
              value: 0.6,
              random: false,
              animation: {
                enable: false,
                speed: 1,
                minimumValue: 0.1,
                sync: false,
              },
            },
            size: {
              value: 14,
              random: {
                enable: true,
                minimumValue: 4,
              },
              animation: {
                enable: false,
                speed: 40,
                minimumValue: 0.1,
                sync: false,
              },
            },
            move: {
              enable: true,
              speed: 0.4,
              direction: "none",
              random: false,
              straight: false,
              outModes: {
                default: "out",
              },
              attract: {
                enable: false,
                rotate: {
                  x: 600,
                  y: 1200,
                },
              },
            },
          },
          interactivity: {
            detectsOn: "window",
            events: {
              onHover: {
                enable: true,
                mode: "bubble",
              },
              onClick: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              bubble: {
                distance: 200,
                size: 30,
                duration: 1,
                opacity: 0.9,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}
