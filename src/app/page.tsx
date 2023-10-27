"use client";

import { useRef, useState } from "react";
import ReactToPrint from "react-to-print";
import PrintableContent from "./PrintComponent";

const toolDescription = `This is a tool that allows you to redact PII from a text or a pdf document! \n
Our PII tool should be seen as a helper, while we try to remove all instances of PII it is still important to double check. Importantly this PII tool does not save nor allow anyone but you to see the redacted or cleaned text.`;

export default function HomePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [files, setFiles] = useState<FileList>();
  const [loading, setLoading] = useState(false);
  const printableRef = useRef(null);

  async function removePII() {
    setLoading(true);
    setOutput("");
    const formData = new FormData();
    if (files?.[0]) {
      formData.append("file", files[0]);
    }
    formData.append("text", input);

    setInput("");
    setFiles(undefined);
    const response = await fetch("/api/pii", {
      method: "POST",
      body: formData,
      headers: undefined,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { redacted } = await response.json();

    setOutput(redacted as string);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-auto bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <PrintableContent text={output} ref={printableRef} />
        </div>
      </dialog>
      <div className="flex h-screen w-full flex-col items-center justify-evenly gap-4 bg-background p-8 text-white">
        <div className="flex items-center gap-2">
          <h1 className=" text-4xl font-semibold">PII Removal Tool</h1>
          <div
            className="tooltip tooltip-bottom whitespace-pre-wrap"
            data-tip={toolDescription}
          >
            <p className="text-button underline">What is this?</p>
          </div>
        </div>
        <div className="flex h-full max-h-96 w-full items-center lg:w-2/3">
          <textarea
            className="h-full w-full resize-none whitespace-pre-wrap rounded-xl border border-white/10 bg-toolbar p-3"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="divider divider-horizontal before:bg-white/20 after:bg-white/20">
            OR
          </div>
          <div className="flex w-full flex-col">
            <input
              type="file"
              className="file-input file-input-bordered w-full max-w-xs bg-toolbar"
              onChange={(e) => {
                console.log(e.target.files);
                setFiles(e.target.files ?? undefined);
              }}
            />
            <p className="mt-1 px-1 text-sm font-light text-subtext"></p>
          </div>
        </div>
        <button
          className="btn btn-primary px-12 disabled:bg-primary"
          onClick={() => void removePII()}
          disabled={loading || (input == "" && files?.length == 0)}
        >
          Remove PII{" "}
          {loading && <span className="loading loading-spinner loading-xs" />}
        </button>
        <div className=" divider before:bg-white/20 after:bg-white/20"></div>
        <div className="flex h-full max-h-96 w-full flex-col gap-4 lg:w-3/5">
          <h2>Output</h2>
          <div className="flex h-full w-full gap-6">
            <textarea
              className="h-full w-full resize-none whitespace-pre-wrap rounded-xl bg-toolbar p-3 outline-none"
              value={output}
              onChange={(e) => void setOutput(e.target.value)}
            />
            {/* <PrintableContent text={output} ref={printableRef} /> */}
            <div className="flex flex-col justify-center gap-3">
              <button
                className="btn btn-primary btn-outline"
                onClick={() => navigator.clipboard.writeText(output)}
              >
                Copy
              </button>
              <ReactToPrint
                trigger={() => (
                  <button className="btn btn-primary btn-outline">
                    Download As PDF
                  </button>
                )}
                content={() => printableRef.current}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
