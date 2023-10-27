// This file exist to enable downloading as PDF it's main purpose is to pass a forwardRef

import { forwardRef } from "react";

const PrintableContent = forwardRef<HTMLDivElement, { text: string }>(
  ({ text }, ref) => {
    return (
      <div
        ref={ref}
        className="h-full w-full overflow-clip whitespace-pre-wrap rounded-xl bg-white p-6"
      >
        {text}
      </div>
    );
  },
);

PrintableContent.displayName = "PrintableContent";

export default PrintableContent;
