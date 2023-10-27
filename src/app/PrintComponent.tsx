// This file exist to enable downloading as PDF

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
