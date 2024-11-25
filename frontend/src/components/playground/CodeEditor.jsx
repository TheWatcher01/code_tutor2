// File path: code_tutor2/frontend/src/components/playground/CodeEditor.jsx

import { useState } from "react";
import PropTypes from "prop-types";
import Editor from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CodeEditor = ({ onChange }) => {
  const [language, setLanguage] = useState("javascript");

  const handleEditorChange = (value) => {
    onChange?.(value);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-2">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="css">CSS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

CodeEditor.propTypes = {
  onChange: PropTypes.func,
};

export default CodeEditor;
