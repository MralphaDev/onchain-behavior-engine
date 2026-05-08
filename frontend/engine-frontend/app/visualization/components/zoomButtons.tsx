import React from "react";

type ZoomControlsProps = {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
};

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomIn,
  zoomOut,
  zoomFit,
}) => {
  const controls = [
    { label: "+", fn: zoomIn },
    { label: "−", fn: zoomOut },
    { label: "⊡", fn: zoomFit },
  ];

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
      {controls.map(({ label, fn }) => (
        <button
          key={label}
          onClick={fn}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-sm
                     bg-[rgba(15,20,40,0.85)] border border-[rgba(99,130,255,0.25)]
                     text-[#8899cc] hover:text-[#c0d0ff]
                     hover:bg-[rgba(56,100,255,0.2)] hover:border-[rgba(99,130,255,0.5)]
                     backdrop-blur transition-all duration-150"
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ZoomControls;