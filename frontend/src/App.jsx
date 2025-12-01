import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import axios from "axios";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import toast, { Toaster } from "react-hot-toast";

import "highlight.js/styles/github-dark.css";

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  java: java(),
  cpp: cpp(),
  c: cpp(),
};

function App() {
  const [code, setCode] = useState(`function sum() { return 1 + 1; }`);
  const [review, setReview] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);

  async function reviewCode() {
    try {
      setLoading(true);
      setReview("");

      const response = await axios.post("http://localhost:3000/ai/get-review", {
        code,
        language,
      });

      setReview(response.data);
      toast.success("Code reviewed successfully!");
    } catch (err) {
      toast.error("Failed to get review.");
    } finally {
      setLoading(false);
    }
  }

  function copyCode(content) {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  }

  return (
    <main className="h-screen w-full p-4 flex gap-4 bg-neutral-900 text-white">
      <Toaster position="top-right" />

      {/* LEFT PANEL */}
      <section className="w-[55%] rounded-lg bg-black p-4 flex flex-col">
        {/* Dropdown */}
        <div className="flex justify-end mb-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1 bg-neutral-800 border border-neutral-600 rounded-md"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-auto rounded-md border border-neutral-700">
          <CodeMirror
            value={code}
            height="100%"
            width="100%"
            theme={oneDark}
            extensions={[languageExtensions[language]]}
            onChange={(value) => setCode(value)}
            style={{ fontFamily: '"Fira Code", monospace', fontSize: 13 }}
          />
        </div>

        {/* Review Button */}
        <button
          onClick={reviewCode}
          disabled={loading}
          className="mt-4 w-fit self-end bg-cyan-400 text-black px-6 py-2 rounded-md font-semibold hover:bg-cyan-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {loading ? "Reviewing..." : "Review"}
        </button>
      </section>

      {/* RIGHT PANEL */}
      <aside className="w-[45%] rounded-lg bg-neutral-800 p-6 overflow-auto">
        {/* Loading Animation */}
        {loading && (
          <div className="text-center py-10 animate-pulse text-gray-400 text-lg">
            Reviewing your code...
          </div>
        )}

        {/* AI REVIEW OUTPUT */}
        {!loading && review && (
          <div className="prose prose-invert max-w-none">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-cyan-400 mt-6 mb-3">
                    {children}
                  </h3>
                ),

                ul: ({ children }) => (
                  <ul className="space-y-2 ml-4">{children}</ul>
                ),

                li: ({ children, node }) => {
                  // Detect section
                  const line = node.position.start.line;
                  const sectionHeading = review
                    .split("\n")
                    .slice(0, line)
                    .reverse()
                    .find((l) => l.startsWith("###"));

                  let icon = "•"; // default bullet

                  if (sectionHeading?.includes("1.")) {
                    icon = "❌"; // Errors Found
                  } else if (sectionHeading?.includes("2.")) {
                    icon = "🔧"; // Recommended Fixes
                  } else if (sectionHeading?.includes("3.")) {
                    icon = "⚡"; // Impact of Fixes
                  }

                  return (
                    <li className="flex items-start gap-2 text-neutral-200 leading-relaxed">
                      <span className="text-lg">{icon}</span>
                      <span>{children}</span>
                    </li>
                  );
                },

                code({ node, inline, children, ...props }) {
                  const codeText = String(children);

                  if (inline) return <code {...props}>{children}</code>;

                  // Identify final corrected code block
                  const allBlocks = [];
                  const lines = review.split("\n");
                  let temp = [];
                  let inBlock = false;

                  for (let line of lines) {
                    if (line.trim().startsWith("```")) {
                      inBlock = !inBlock;
                      if (!inBlock && temp.length) {
                        allBlocks.push(temp.join("\n"));
                        temp = [];
                      }
                      continue;
                    }
                    if (inBlock) temp.push(line);
                  }

                  const currentBlock = codeText.trim();
                  const isFinal =
                    currentBlock === allBlocks[allBlocks.length - 1]?.trim();

                  return (
                    <div className="relative group">
                      {isFinal && (
                        <button
                          onClick={() => copyCode(codeText)}
                          className="absolute right-2 top-2 bg-neutral-700 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          Copy
                        </button>
                      )}

                      <pre className="rounded-lg bg-neutral-900 p-3 overflow-auto border border-neutral-700">
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                },
              }}
            >
              {review}
            </Markdown>
          </div>
        )}
      </aside>
    </main>
  );
}

export default App;
