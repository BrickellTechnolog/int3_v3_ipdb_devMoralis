import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";


function Ramper() {
  const [ramper, setRamper] = useState();
  const { Moralis } = useMoralis();
  useEffect(() => {
    if (!Moralis?.["Plugins"]?.["fiat"]) return null;
    async function initPlugin() {
      Moralis.Plugins.fiat
        .buy({}, { disableTriggers: true })
        .then((data) => setRamper(data.data));
    }
    initPlugin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Moralis.Plugins]);

  return (
    <iframe
      src={ramper}
      title="ramper"
      frameBorder="yes"
      allow="accelerometer; autoplay; camera; gyroscope; payment;"
      style={{
        width: "420px",
        height: "625px",
        border: "1px solid #F500D0",
        borderRadius: "1rem",
        backgroundColor: "#000",
      }}
    />
  );
}

export default Ramper;
